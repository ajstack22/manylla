#!/bin/bash
# Automated validation after each Claude Code execution
# Replaces manual peer review step

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get step number from argument
STEP=${1:-1}

echo "🔍 Validating Platform Migration Step $STEP"
echo "==========================================="

# Function to check and report
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Track overall success
PASSED=true

case $STEP in
    1)
        echo "📌 Step 1: Import Resolution Validation"
        
        # Check webpack config
        grep -q "@platform.*path.resolve" webpack.config.js
        check $? "Webpack alias configured"
        
        # Check babel plugin installed
        grep -q "babel-plugin-module-resolver" package.json
        check $? "Babel module resolver installed"
        
        # Check metro config
        grep -q "@platform" metro.config.js
        check $? "Metro config updated"
        
        # Build test
        npm run build:web > /dev/null 2>&1
        check $? "Web build succeeds"
        ;;
        
    2)
        echo "📌 Step 2: Platform.js Validation"
        
        # Check file exists
        [ -f "src/utils/platform.js" ]
        check $? "platform.js exists"
        
        # Check key exports
        grep -q "export const isWeb" src/utils/platform.js
        check $? "Platform detection exports"
        
        grep -q "export const shadow" src/utils/platform.js
        check $? "Style helpers present"
        
        grep -q "export const apiBaseUrl" src/utils/platform.js
        check $? "API helpers present"
        
        # Test file exists
        [ -f "src/utils/__tests__/platform.test.js" ]
        check $? "Test file created"
        ;;
        
    3)
        echo "📌 Step 3: Migration Validation"
        
        # Count Platform.OS
        COUNT=$(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l)
        [ $COUNT -eq 0 ]
        check $? "Platform.OS removed (found: $COUNT)"
        
        # Count old Platform.select
        COUNT=$(grep -r "Platform\.select" src/ --include="*.js" | grep -v "platform\.select" | wc -l)
        [ $COUNT -eq 0 ]
        check $? "Old Platform.select removed (found: $COUNT)"
        
        # Check imports
        COUNT=$(grep -r "from.*@platform" src/ --include="*.js" | wc -l)
        [ $COUNT -gt 30 ]
        check $? "Platform imports added (found: $COUNT)"
        
        # Tests pass
        npm test > /dev/null 2>&1
        check $? "All tests passing"
        ;;
        
    4)
        echo "📌 Step 4: Validation Suite"
        
        # Check scripts exist
        [ -f "scripts/platform-validation/validate-all.sh" ]
        check $? "Validation script exists"
        
        [ -f "scripts/platform-validation/generate-report.sh" ]
        check $? "Report generator exists"
        
        # Run validation
        bash scripts/platform-validation/validate-all.sh > /dev/null 2>&1
        check $? "Validation suite passes"
        ;;
        
    5)
        echo "📌 Step 5: Final Validation"
        
        # Absolute zero checks
        COUNT=$(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l)
        [ $COUNT -eq 0 ]
        check $? "ZERO Platform.OS references"
        
        COUNT=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
        [ $COUNT -eq 0 ]
        check $? "ZERO TypeScript files"
        
        COUNT=$(find src -name "*.native.js" -o -name "*.web.js" | wc -l)
        [ $COUNT -eq 0 ]
        check $? "ZERO platform-specific files"
        
        # Final build
        npm run build:web > /dev/null 2>&1
        check $? "Final build successful"
        ;;
        
    *)
        echo "❌ Invalid step number. Use 1-5"
        exit 1
        ;;
esac

echo "==========================================="

# Auto-commit if passed
if [ "$PASSED" = true ]; then
    echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
    
    # Offer to auto-commit
    read -p "Auto-commit changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "refactor(platform): Complete step $STEP migration
        
- All validation checks passed
- $(git diff --cached --stat | tail -1)"
        echo "📦 Changes committed!"
    fi
    
    # Show next step
    if [ $STEP -lt 5 ]; then
        NEXT=$((STEP + 1))
        echo ""
        echo "📋 Next: Run prompt pack $(printf "%02d" $NEXT)-*.md"
    else
        echo ""
        echo "🎉 PLATFORM MIGRATION COMPLETE!"
        echo "📋 Next: Create PR for review"
    fi
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo ""
    echo "🔧 Fix the issues above and run again:"
    echo "  ./scripts/platform-migration/validate-step.sh $STEP"
    
    # Offer rollback
    read -p "Rollback changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git reset --hard HEAD
        echo "🔄 Changes rolled back"
    fi
fi