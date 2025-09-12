#!/bin/bash

echo "📄 Generating validation report..."

REPORT_FILE="scripts/platform-validation/validation-report.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Helper function to get status icon
get_status_icon() {
  if [ $1 -eq 0 ]; then
    echo "✅ PASS"
  else
    echo "❌ FAIL"
  fi
}

# Helper function to count files
count_with_default() {
  local count=$1
  if [ -z "$count" ] || [ "$count" = "0" ]; then
    echo "0"
  else
    echo "$count"
  fi
}

cat > $REPORT_FILE << EOF
# Platform Migration Validation Report
Generated: $TIMESTAMP

## Executive Summary
This report provides comprehensive validation results for the platform consolidation migration.

## Code Analysis

### Platform Usage Cleanup
- **Platform.OS references**: $(count_with_default $(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" 2>/dev/null | wc -l))
- **Platform.select (old style)**: $(count_with_default $(grep -r "Platform\.select" src/ --include="*.js" 2>/dev/null | grep -v "platform\.select" | wc -l))
- **Files using platform utilities**: $(count_with_default $(grep -r "platform\." src/ --include="*.js" --exclude="*/platform.js" -l 2>/dev/null | wc -l))
- **Correct platform imports (relative)**: $(count_with_default $(grep -r "import.*platform.*from.*['\"]\.\..*platform" src/ --include="*.js" -l 2>/dev/null | wc -l))

### File Structure Compliance
- **Platform-specific files (.native.js)**: $(count_with_default $(find src -name "*.native.js" 2>/dev/null | wc -l))
- **Platform-specific files (.web.js)**: $(count_with_default $(find src -name "*.web.js" 2>/dev/null | wc -l))
- **TypeScript files**: $(count_with_default $(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l))
- **JavaScript files**: $(count_with_default $(find src -name "*.js" 2>/dev/null | wc -l))

## Build Validation

### Web Build Status
EOF

# Test web build
echo "Testing web build..."
npm run build:web > /dev/null 2>&1
WEB_BUILD_STATUS=$?

cat >> $REPORT_FILE << EOF
- **Web build**: $(get_status_icon $WEB_BUILD_STATUS)
EOF

if [ $WEB_BUILD_STATUS -eq 0 ] && [ -d "web/build" ]; then
  BUNDLE_SIZE=$(du -sh web/build 2>/dev/null | awk '{print $1}' || echo "Unknown")
  cat >> $REPORT_FILE << EOF
- **Bundle size**: $BUNDLE_SIZE
EOF
else
  cat >> $REPORT_FILE << EOF
- **Bundle size**: Build failed - size unavailable
EOF
fi

cat >> $REPORT_FILE << EOF

### Test Results
EOF

# Run tests
echo "Running test suite..."
npm test -- --watchAll=false > /dev/null 2>&1
TEST_STATUS=$?

cat >> $REPORT_FILE << EOF
- **Unit tests**: $(get_status_icon $TEST_STATUS)
- **Integration tests**: $([ -f "src/utils/__tests__/platform-integration.test.js" ] && echo "✅ Available" || echo "❌ Missing")
EOF

# Check for performance results
if [ -f "scripts/platform-validation/performance-results.json" ]; then
  cat >> $REPORT_FILE << EOF
- **Performance tests**: ✅ Available

## Performance Metrics
\`\`\`json
$(cat scripts/platform-validation/performance-results.json)
\`\`\`
EOF
else
  cat >> $REPORT_FILE << EOF
- **Performance tests**: ❌ Not run

## Performance Metrics
Performance tests have not been executed. Run \`scripts/platform-validation/performance-test.js\` to generate metrics.
EOF
fi

cat >> $REPORT_FILE << EOF

## Platform-Specific Validation

### Feature Detection
- **Platform utilities file**: $([ -f "src/utils/platform.js" ] && echo "✅ Present" || echo "❌ Missing")
EOF

# Check platform.js exports
if [ -f "src/utils/platform.js" ]; then
  REQUIRED_EXPORTS=("isWeb" "isIOS" "isAndroid" "select" "shadow" "font" "apiBaseUrl")
  for export in "${REQUIRED_EXPORTS[@]}"; do
    if grep -q "export.*$export" src/utils/platform.js; then
      echo "- **$export export**: ✅ Present" >> $REPORT_FILE
    else
      echo "- **$export export**: ❌ Missing" >> $REPORT_FILE
    fi
  done
fi

cat >> $REPORT_FILE << EOF

### Import Resolution
- **Webpack platform migration**: $(grep -q "Platform-specific imports handled via relative paths" webpack.config.js && echo "✅ Completed" || echo "❌ Not completed")
- **Babel plugin installed**: $(grep -q "babel-plugin-module-resolver" package.json && echo "✅ Yes" || echo "❌ No")
- **Metro platform migration**: $(grep -q "Platform-specific imports handled via relative paths" metro.config.js && echo "✅ Completed" || echo "❌ Not completed")

## Security & Quality Checks

### Code Quality
EOF

# Check for console.logs and TODOs
CONSOLE_LOGS=$(grep -r "console\." src/ --include="*.js" 2>/dev/null | wc -l)
TODOS=$(grep -ri "todo\|fixme" src/ --include="*.js" 2>/dev/null | wc -l)

cat >> $REPORT_FILE << EOF
- **Console.log statements**: $(count_with_default $CONSOLE_LOGS)
- **TODO/FIXME comments**: $(count_with_default $TODOS)
EOF

# Check for potential security issues
DANGEROUS_FUNCTIONS=$(grep -r "eval\|Function\|setTimeout.*string\|setInterval.*string" src/ --include="*.js" 2>/dev/null | wc -l)

cat >> $REPORT_FILE << EOF
- **Potentially dangerous functions**: $(count_with_default $DANGEROUS_FUNCTIONS)

## Visual Regression
EOF

# Check for screenshots
SCREENSHOT_COUNT=$(ls scripts/platform-validation/screenshots/*.png 2>/dev/null | wc -l)
cat >> $REPORT_FILE << EOF
- **Screenshots captured**: $(count_with_default $SCREENSHOT_COUNT)
- **Baseline comparison**: $([ -d "scripts/platform-validation/screenshots/baseline" ] && echo "✅ Available" || echo "❌ No baseline")

## Validation Summary

### Critical Issues (Must Fix)
EOF

# Check for critical issues
CRITICAL_ISSUES=()

PLATFORM_OS_COUNT=$(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" 2>/dev/null | wc -l)
if [ "$PLATFORM_OS_COUNT" -gt 0 ]; then
  CRITICAL_ISSUES+=("$PLATFORM_OS_COUNT Platform.OS references found")
fi

OLD_SELECT_COUNT=$(grep -r "Platform\.select" src/ --include="*.js" 2>/dev/null | grep -v "platform\.select" | wc -l)
if [ "$OLD_SELECT_COUNT" -gt 0 ]; then
  CRITICAL_ISSUES+=("$OLD_SELECT_COUNT old Platform.select calls found")
fi

NATIVE_FILES=$(find src -name "*.native.js" -o -name "*.web.js" 2>/dev/null | wc -l)
if [ "$NATIVE_FILES" -gt 0 ]; then
  CRITICAL_ISSUES+=("$NATIVE_FILES platform-specific files found")
fi

TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
if [ "$TS_FILES" -gt 0 ]; then
  CRITICAL_ISSUES+=("$TS_FILES TypeScript files found")
fi

if [ ${#CRITICAL_ISSUES[@]} -eq 0 ]; then
  cat >> $REPORT_FILE << EOF
✅ **No critical issues found**
EOF
else
  for issue in "${CRITICAL_ISSUES[@]}"; do
    cat >> $REPORT_FILE << EOF
❌ $issue
EOF
  done
fi

cat >> $REPORT_FILE << EOF

### Warnings (Should Fix)
EOF

# Check for warnings
WARNINGS=()

if [ "$CONSOLE_LOGS" -gt 5 ]; then
  WARNINGS+=("High number of console.log statements ($CONSOLE_LOGS)")
fi

if [ "$TODOS" -gt 20 ]; then
  WARNINGS+=("High number of TODO comments ($TODOS)")
fi

FILES_WITH_PLATFORM=$(grep -r "platform\." src/ --include="*.js" --exclude="*/platform.js" -l 2>/dev/null | wc -l)
FILES_WITH_IMPORT=$(grep -r "import.*platform.*from.*['\"]\.\..*platform" src/ --include="*.js" -l 2>/dev/null | wc -l)
if [ "$FILES_WITH_PLATFORM" -ne "$FILES_WITH_IMPORT" ]; then
  WARNINGS+=("$((FILES_WITH_PLATFORM - FILES_WITH_IMPORT)) files use platform without proper import")
fi

if [ ${#WARNINGS[@]} -eq 0 ]; then
  cat >> $REPORT_FILE << EOF
✅ **No warnings found**
EOF
else
  for warning in "${WARNINGS[@]}"; do
    cat >> $REPORT_FILE << EOF
⚠️ $warning
EOF
  done
fi

cat >> $REPORT_FILE << EOF

## Recommendations

### Immediate Actions
1. Fix any critical issues listed above
2. Run platform validation suite: \`./scripts/platform-validation/validate-all.sh\`
3. Execute performance tests: \`./scripts/platform-validation/performance-test.js\`
4. Test on all target platforms: \`./scripts/platform-validation/test-platforms.js\`

### Before Deployment
1. Ensure all tests pass
2. Verify bundle size is acceptable
3. Test functionality on web, iOS, and Android
4. Review visual regression screenshots
5. Run security scans

### Monitoring
1. Set up bundle size monitoring
2. Track performance metrics over time
3. Monitor for new Platform.OS references
4. Regular validation runs

## Next Steps
$(if [ ${#CRITICAL_ISSUES[@]} -eq 0 ]; then
  echo "✅ **Ready for deployment** - All critical validations passed"
else
  echo "❌ **Not ready for deployment** - Fix critical issues first"
fi)

---
*Report generated by Platform Validation Suite v1.0*
*Location: \`$REPORT_FILE\`*
EOF

echo -e "${GREEN}✅ Report generated: $REPORT_FILE${NC}"

# Display summary to console
echo ""
echo "📊 Validation Summary:"
echo "  Critical Issues: ${#CRITICAL_ISSUES[@]}"
echo "  Warnings: ${#WARNINGS[@]}"
echo "  Web Build: $(get_status_icon $WEB_BUILD_STATUS)"
echo "  Tests: $(get_status_icon $TEST_STATUS)"

if [ ${#CRITICAL_ISSUES[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ Platform validation READY${NC}"
  exit 0
else
  echo -e "${RED}❌ Platform validation NEEDS WORK${NC}"
  exit 1
fi