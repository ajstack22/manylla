#!/bin/bash

echo "🔍 Running complete platform validation suite..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check test results
check_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
    ERRORS=$((ERRORS + 1))
  fi
}

# Function to warn
warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# 1. Check for remaining Platform.OS
echo "1️⃣  Checking for Platform.OS references..."
PLATFORM_OS=$(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" --exclude="*/__tests__/*" | wc -l)
check_result $([ "$PLATFORM_OS" -eq 0 ]; echo $?) "No Platform.OS references found ($PLATFORM_OS)"

# 2. Check for old Platform.select
echo "2️⃣  Checking for old Platform.select..."
OLD_SELECT=$(grep -r "Platform\.select" src/ --include="*.js" | grep -v "platform\.select" | wc -l)
check_result $([ "$OLD_SELECT" -eq 0 ]; echo $?) "No old Platform.select found ($OLD_SELECT)"

# 3. Check all files import platform correctly
echo "3️⃣  Checking platform imports..."
FILES_WITH_PLATFORM=$(grep -r "platform\." src/ --include="*.js" --exclude="*/platform.js" -l | wc -l)
FILES_WITH_IMPORT=$(grep -r "import.*platform.*from.*@platform" src/ --include="*.js" -l | wc -l)

if [ "$FILES_WITH_PLATFORM" -ne "$FILES_WITH_IMPORT" ]; then
  warn "Files using platform without import: $((FILES_WITH_PLATFORM - FILES_WITH_IMPORT))"
fi

# 4. Check for .native.js or .web.js files
echo "4️⃣  Checking for platform-specific files..."
NATIVE_FILES=$(find src -name "*.native.js" -o -name "*.web.js" | wc -l)
check_result $([ "$NATIVE_FILES" -eq 0 ]; echo $?) "No .native.js or .web.js files ($NATIVE_FILES)"

# 5. Check for TypeScript files
echo "5️⃣  Checking for TypeScript files..."
TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
check_result $([ "$TS_FILES" -eq 0 ]; echo $?) "No TypeScript files ($TS_FILES)"

# 6. Build validation
echo "6️⃣  Validating web build..."
npm run build:web > /dev/null 2>&1
check_result $? "Web build successful"

# 7. Test suite
echo "7️⃣  Running test suite..."
npm test -- --watchAll=false > /dev/null 2>&1
check_result $? "All tests passing"

# 8. Bundle size check
echo "8️⃣  Checking bundle size..."
if [ -f "scripts/platform-migration/reports/baseline-size.txt" ]; then
  BASELINE=$(cat scripts/platform-migration/reports/baseline-size.txt | awk '{print $1}' | sed 's/M//')
  if [ -d "web/build" ]; then
    CURRENT=$(du -sh web/build | awk '{print $1}' | sed 's/M//')
    
    # Calculate percentage increase using awk for better compatibility
    if command -v awk &> /dev/null; then
      INCREASE=$(awk "BEGIN {printf \"%.2f\", (($CURRENT - $BASELINE) / $BASELINE) * 100}")
      if awk "BEGIN {exit !($INCREASE > 5)}"; then
        warn "Bundle size increased by ${INCREASE}% (baseline: ${BASELINE}M, current: ${CURRENT}M)"
      else
        echo -e "${GREEN}✅ Bundle size acceptable (${INCREASE}% change)${NC}"
      fi
    fi
  fi
else
  # Create baseline if it doesn't exist
  if [ -d "web/build" ]; then
    mkdir -p scripts/platform-migration/reports
    du -sh web/build > scripts/platform-migration/reports/baseline-size.txt
    echo -e "${GREEN}✅ Bundle size baseline created${NC}"
  fi
fi

# 9. Check for proper platform utility usage
echo "9️⃣  Checking platform utility usage..."
# Check for direct React Native imports that should use platform utils
RN_IMPORTS=$(grep -r "import.*from 'react-native'" src/ --include="*.js" | grep -E "(Dimensions|Platform|PixelRatio)" | wc -l)
if [ "$RN_IMPORTS" -gt 0 ]; then
  warn "Direct React Native utility imports found ($RN_IMPORTS), consider using platform utils"
fi

# 10. Verify platform.js structure
echo "🔟  Verifying platform.js structure..."
if [ -f "src/utils/platform.js" ]; then
  # Check for required exports
  REQUIRED_EXPORTS=("isWeb" "isIOS" "isAndroid" "select" "shadow" "font" "apiBaseUrl")
  for export in "${REQUIRED_EXPORTS[@]}"; do
    if ! grep -q "export.*$export" src/utils/platform.js; then
      warn "Missing export: $export in platform.js"
    fi
  done
  echo -e "${GREEN}✅ Platform.js structure verified${NC}"
else
  echo -e "${RED}❌ Platform.js file missing${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "📊 Validation Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Platform validation PASSED${NC}"
  exit 0
else
  echo -e "${RED}❌ Platform validation FAILED${NC}"
  exit 1
fi