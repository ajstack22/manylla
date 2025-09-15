#!/bin/bash

# Manylla Deployment Script with Android Testing
# Enhanced version that includes Android testing before web deployment
# Usage: ./scripts/deploy-qual-with-android.sh [--skip-android]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Manylla Deployment with Android Testing${NC}"
echo "================================================"

# Parse arguments
SKIP_ANDROID=false
for arg in "$@"; do
    case $arg in
        --skip-android)
            SKIP_ANDROID=true
            ;;
    esac
done

# Check git status
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ ERROR: Uncommitted changes detected${NC}"
    echo "Please commit your changes before deploying"
    echo ""
    echo "Uncommitted files:"
    git status --short
    exit 1
fi

# Get current version
CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo -e "Current version: ${YELLOW}$CURRENT_VERSION${NC}"

# Calculate next version (increment patch)
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
YEAR="${VERSION_PARTS[0]}"
MONTH="${VERSION_PARTS[1]}"
DAY="${VERSION_PARTS[2]}"
PATCH="${VERSION_PARTS[3]}"
NEXT_PATCH=$((PATCH + 1))
NEXT_VERSION="$YEAR.$MONTH.$DAY.$NEXT_PATCH"
echo -e "Next version: ${GREEN}$NEXT_VERSION${NC}"

# Check release notes for next version
echo ""
echo -e "${YELLOW}Checking release notes...${NC}"
if ! grep -q "## Version $NEXT_VERSION" docs/RELEASE_NOTES.md; then
    echo -e "${RED}❌ ERROR: Release notes missing for version $NEXT_VERSION${NC}"
    echo "Please add release notes to docs/RELEASE_NOTES.md before deploying"
    exit 1
fi
echo -e "${GREEN}✅ Release notes found for $NEXT_VERSION${NC}"

# Run pre-deployment validations
echo ""
echo -e "${YELLOW}Running pre-deployment validations...${NC}"

# Check for TypeScript files
TS_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | wc -l)
if [ "$TS_COUNT" -gt "0" ]; then
    echo -e "${RED}❌ ERROR: TypeScript files found (count: $TS_COUNT)${NC}"
    echo "This is a JavaScript-only project"
    exit 1
fi
echo -e "${GREEN}✅ No TypeScript files${NC}"

# Check for platform-specific files
PLATFORM_FILES=$(find src -name "*.native.*" -o -name "*.web.*" | wc -l)
if [ "$PLATFORM_FILES" -gt "0" ]; then
    echo -e "${RED}❌ ERROR: Platform-specific files found (count: $PLATFORM_FILES)${NC}"
    echo "Use Platform.select() instead"
    exit 1
fi
echo -e "${GREEN}✅ No platform-specific files${NC}"

# Check console.log count
CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.js" | grep -v "^//" | wc -l)
if [ "$CONSOLE_COUNT" -gt "5" ]; then
    echo -e "${RED}❌ ERROR: Too many console.logs (found: $CONSOLE_COUNT, max: 5)${NC}"
    echo "Remove console.logs from production code"
    exit 1
fi
echo -e "${GREEN}✅ Console.log count OK ($CONSOLE_COUNT/5)${NC}"

# Check for unwrapped console.errors
CONSOLE_ERROR_COUNT=$(grep -r "console\.error" src/ --include="*.js" | grep -v "NODE_ENV" | wc -l)
if [ "$CONSOLE_ERROR_COUNT" -gt "0" ]; then
    echo -e "${RED}❌ ERROR: Unwrapped console.errors found (count: $CONSOLE_ERROR_COUNT)${NC}"
    echo "Wrap console.errors with NODE_ENV check"
    exit 1
fi
echo -e "${GREEN}✅ No unwrapped console.errors${NC}"

# Check TODO count
TODO_COUNT=$(grep -r "TODO" src/ | wc -l)
if [ "$TODO_COUNT" -gt "20" ]; then
    echo -e "${RED}❌ ERROR: Too many TODOs (found: $TODO_COUNT, max: 20)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ TODO count OK ($TODO_COUNT/20)${NC}"

# Run ESLint
echo ""
echo -e "${YELLOW}Running ESLint...${NC}"
if ! npx eslint src/ --ext .js,.jsx --max-warnings 50; then
    echo -e "${RED}❌ ERROR: ESLint failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ ESLint passed${NC}"

# Run Prettier check
echo ""
echo -e "${YELLOW}Checking code formatting...${NC}"
if ! npx prettier --check 'src/**/*.js'; then
    echo -e "${RED}❌ ERROR: Code not formatted${NC}"
    echo "Run: npx prettier --write 'src/**/*.js'"
    exit 1
fi
echo -e "${GREEN}✅ Code formatting OK${NC}"

# Android Testing Section
if [ "$SKIP_ANDROID" = false ]; then
    echo ""
    echo -e "${BLUE}🤖 Android Testing Phase${NC}"
    echo "----------------------------------------"
    
    # Check if emulator is running
    EMULATOR_RUNNING=$(adb devices | grep -c emulator || true)
    if [ "$EMULATOR_RUNNING" -eq "0" ]; then
        echo -e "${YELLOW}⚠️  No Android emulator running${NC}"
        echo "Skipping Android tests (emulator required)"
    else
        # Clean Android build
        echo -e "${YELLOW}Cleaning Android build...${NC}"
        if [ -f "./scripts/android/clean-android.sh" ]; then
            ./scripts/android/clean-android.sh
        fi
        
        # Run Android tests
        echo -e "${YELLOW}Running Android tests...${NC}"
        if [ -f "./scripts/android/test-android.sh" ]; then
            if ./scripts/android/test-android.sh; then
                echo -e "${GREEN}✅ Android tests passed${NC}"
            else
                echo -e "${YELLOW}⚠️  Android tests failed (non-blocking)${NC}"
            fi
        fi
        
        # Check memory usage
        if [ -f "./scripts/android/debug-android.sh" ]; then
            echo -e "${YELLOW}Checking Android memory usage...${NC}"
            ./scripts/android/debug-android.sh memory | head -10
        fi
        
        # Run Jest tests for Android
        echo -e "${YELLOW}Running Android Jest tests...${NC}"
        if npm test -- __tests__/android/ --passWithNoTests; then
            echo -e "${GREEN}✅ Android Jest tests passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Android Jest tests failed (non-blocking)${NC}"
        fi
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  Android testing skipped (--skip-android flag)${NC}"
fi

# Build web bundle
echo -e "${BLUE}📦 Building Web Bundle${NC}"
echo "----------------------------------------"
if [ -n "$NODE_OPTIONS" ]; then
    echo "Using existing NODE_OPTIONS: $NODE_OPTIONS"
else
    export NODE_OPTIONS=--max-old-space-size=8192
    echo "Set NODE_OPTIONS=--max-old-space-size=8192"
fi

echo -e "${YELLOW}Running build...${NC}"
if ! npm run build:web; then
    echo -e "${RED}❌ ERROR: Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Check build output
if [ ! -d "web/build" ]; then
    echo -e "${RED}❌ ERROR: Build directory web/build not found${NC}"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh web/build | cut -f1)
echo -e "Build size: ${YELLOW}$BUILD_SIZE${NC}"

# Deploy to qual
echo ""
echo -e "${BLUE}🚀 Deploying to Qual${NC}"
echo "----------------------------------------"

# Copy correct .htaccess file
echo -e "${YELLOW}Setting up .htaccess...${NC}"
cp public/.htaccess.manylla-qual web/build/.htaccess
echo -e "${GREEN}✅ .htaccess configured${NC}"

# Deploy using rsync
echo -e "${YELLOW}Syncing files to server...${NC}"
if ! rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='*.map' \
    web/build/ stackmap-cpanel:~/public_html/manylla/qual/; then
    echo -e "${RED}❌ ERROR: Deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Files deployed${NC}"

# Verify deployment
echo ""
echo -e "${YELLOW}Verifying deployment...${NC}"
HEALTH_CHECK=$(curl -s https://manylla.com/qual/api/sync_health.php || echo "API not responding")
if [[ "$HEALTH_CHECK" == *"healthy"* ]]; then
    echo -e "${GREEN}✅ API health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed (may not be configured)${NC}"
fi

# Push to GitHub (creates rollback point)
echo ""
echo -e "${YELLOW}Pushing to GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  GitHub push failed (non-critical)${NC}"
fi

# Summary
echo ""
echo "================================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================================"
echo -e "Version: ${GREEN}$NEXT_VERSION${NC}"
echo -e "URL: ${BLUE}https://manylla.com/qual/${NC}"
echo ""
echo "Android Testing Summary:"
if [ "$SKIP_ANDROID" = false ] && [ "$EMULATOR_RUNNING" -gt "0" ]; then
    echo -e "  ${GREEN}✅ Android tests executed${NC}"
else
    echo -e "  ${YELLOW}⚠️  Android tests skipped${NC}"
fi
echo ""
echo "Next steps:"
echo "  1. Test at https://manylla.com/qual/"
echo "  2. Check mobile app if Android changes were made"
echo "  3. Monitor error logs if needed"
echo ""

# Play completion sound if available
if [ -f "/Users/adamstack/manylla/scripts/play-completion-sound.sh" ]; then
    /Users/adamstack/manylla/scripts/play-completion-sound.sh
fi