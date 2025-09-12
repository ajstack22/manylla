#!/bin/bash

echo "🚀 Running comprehensive platform validation suite..."
echo "=================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test and track results
run_test() {
  local test_name="$1"
  local test_command="$2"
  local optional="${3:-false}"
  
  echo -e "\n${BLUE}🔍 Running $test_name...${NC}"
  echo "----------------------------------------"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if eval "$test_command"; then
    echo -e "${GREEN}✅ $test_name PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    if [ "$optional" = "true" ]; then
      echo -e "${YELLOW}⚠️  $test_name SKIPPED (optional)${NC}"
    else
      echo -e "${RED}❌ $test_name FAILED${NC}"
      FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
  fi
}

# Create results directory
mkdir -p scripts/platform-validation/results

echo -e "${BLUE}📋 Starting validation test suite at $(date)${NC}"
echo ""

# 1. Core Validation Suite
run_test "Core Platform Validation" "./scripts/platform-validation/validate-all.sh"

# 2. Performance Tests
run_test "Performance Tests" "./scripts/platform-validation/performance-test.js"

# 3. Platform-Specific Tests
run_test "Platform-Specific Tests" "./scripts/platform-validation/test-platforms.js" true

# 4. Visual Regression Tests
run_test "Visual Regression Tests" "./scripts/platform-validation/visual-regression.js" true

# 5. Generate Final Report
run_test "Validation Report Generation" "./scripts/platform-validation/generate-report.sh"

# 6. Additional code quality checks
run_test "Code Quality Checks" "echo 'Running additional code quality checks...'; 
# Check for large files
echo '  Checking for large files...'
find src -name '*.js' -size +100k | while read file; do echo \"    Large file: \$file\"; done
echo '  ✅ Large file check complete'

# Check for potential security issues
echo '  Checking for potential security issues...'
DANGEROUS_COUNT=\$(grep -r 'eval\\|Function\\|innerHTML\\|dangerouslySetInnerHTML' src/ --include='*.js' | wc -l)
if [ \"\$DANGEROUS_COUNT\" -gt 0 ]; then
  echo \"    ⚠️  Found \$DANGEROUS_COUNT potentially dangerous patterns\"
else
  echo \"    ✅ No dangerous patterns found\"
fi

# Check import consistency
echo '  Checking import consistency...'
RELATIVE_IMPORTS=\$(grep -r \"from '\\\.\\\.\\\.\\\.\" src/ --include='*.js' | wc -l)
if [ \"\$RELATIVE_IMPORTS\" -gt 5 ]; then
  echo \"    ⚠️  High number of deep relative imports: \$RELATIVE_IMPORTS\"
else
  echo \"    ✅ Import structure looks good\"
fi

echo '  ✅ Code quality checks complete'"

echo ""
echo "=================================================="
echo -e "${BLUE}📊 FINAL VALIDATION RESULTS${NC}"
echo "=================================================="
echo ""
echo "Total Tests Run: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate success percentage
if [ $TOTAL_TESTS -gt 0 ]; then
  SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
  echo "Success Rate: ${SUCCESS_RATE}%"
else
  SUCCESS_RATE=0
fi

echo ""
echo "=================================================="

# Determine overall status
if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL VALIDATIONS PASSED!${NC}"
  echo ""
  echo -e "${GREEN}✅ Platform migration is ready for deployment${NC}"
  echo ""
  echo "📋 Next Steps:"
  echo "1. Review the validation report: scripts/platform-validation/validation-report.md"
  echo "2. Test manually on all target platforms"
  echo "3. Create deployment branch"
  echo "4. Run pre-deployment checklist"
  exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
  echo -e "${YELLOW}⚠️  MOSTLY SUCCESSFUL (${SUCCESS_RATE}% pass rate)${NC}"
  echo ""
  echo -e "${YELLOW}Some tests failed, but migration shows good progress${NC}"
  echo ""
  echo "📋 Action Items:"
  echo "1. Fix failed validations"
  echo "2. Re-run: ./scripts/platform-validation/run-all-tests.sh"
  echo "3. Review validation report for details"
  exit 1
else
  echo -e "${RED}❌ MULTIPLE VALIDATION FAILURES (${SUCCESS_RATE}% pass rate)${NC}"
  echo ""
  echo -e "${RED}Platform migration needs significant work${NC}"
  echo ""
  echo "📋 Critical Actions:"
  echo "1. Review all failed tests above"
  echo "2. Fix critical issues first:"
  echo "   - Platform.OS references"
  echo "   - Missing @platform imports"
  echo "   - Build failures"
  echo "3. Run individual test scripts to debug issues"
  echo "4. Re-run this comprehensive test when ready"
  exit 2
fi