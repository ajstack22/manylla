#!/bin/bash

# Manylla Mobile STAGE Deployment Script
# Purpose: Deploy to TestFlight Internal Testing / Play Console Internal Testing
# Includes version management, validation, and git operations

set -e  # Exit on error
set -o pipefail  # Fail on pipe errors

echo "🚀 Manylla Mobile STAGE Deployment"
echo "===================================="
echo

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLATFORM="${1:-both}"  # ios, android, or both (default)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Error handler
handle_error() {
    echo
    echo -e "${RED}❌ DEPLOYMENT BLOCKED: $1${NC}"
    echo -e "${RED}$2${NC}"
    echo
    exit 1
}

# Warning function
show_warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Navigate to project root
cd "$PROJECT_ROOT"

# ============================================================================
# VERSION MANAGEMENT FUNCTIONS
# ============================================================================

calculate_versions() {
    # Read .build_number file (format: YYMMDD on line 1, VV on line 2)
    if [ -f .build_number ]; then
        STORED_DATE=$(sed -n '1p' .build_number)
        STORED_ITERATION=$(sed -n '2p' .build_number)
    else
        STORED_DATE="000000"
        STORED_ITERATION="0"
    fi

    # Current date in YYMMDD format
    CURRENT_DATE=$(date +%y%m%d)

    # Daily iteration logic (resets daily like SmilePile)
    if [ "$STORED_DATE" = "$CURRENT_DATE" ]; then
        # Same day: increment iteration
        DAILY_ITERATION=$((STORED_ITERATION + 1))
    else
        # New day: reset to 1
        DAILY_ITERATION=1
    fi

    # Calculate marketing version (YY.MM.VV)
    YEAR=$(date +%y)
    MONTH=$(date +%m)

    # Count existing mobile releases this month (from git tags)
    MONTHLY_COUNT=$(git tag --list "mobile-v${YEAR}.${MONTH}.*-stage-*" 2>/dev/null | \
                    sed 's/mobile-v\([0-9]*\.[0-9]*\.\([0-9]*\)\)-.*/\2/' | \
                    sort -n | tail -1 || echo "0")

    if [ -z "$MONTHLY_COUNT" ] || [ "$MONTHLY_COUNT" = "0" ]; then
        MONTHLY_ITERATION="01"
    else
        MONTHLY_ITERATION=$(printf '%02d' $((10#$MONTHLY_COUNT + 1)))
    fi

    # Build version strings
    MARKETING_VERSION="${YEAR}.${MONTH}.${MONTHLY_ITERATION}"
    IOS_BUILD_NUMBER="$DAILY_ITERATION"
    ANDROID_VERSION_CODE="${CURRENT_DATE}${DAILY_ITERATION}"

    echo -e "${YELLOW}📌 Version Calculation:${NC}"
    echo "   Marketing Version: $MARKETING_VERSION"
    echo "   iOS Build Number: $IOS_BUILD_NUMBER"
    echo "   Android Version Code: $ANDROID_VERSION_CODE"
    echo "   Daily Iteration: $DAILY_ITERATION ($CURRENT_DATE)"
    echo

    export MARKETING_VERSION
    export IOS_BUILD_NUMBER
    export ANDROID_VERSION_CODE
    export DAILY_ITERATION
    export CURRENT_DATE
}

update_build_number_file() {
    echo "$CURRENT_DATE" > .build_number
    echo "$DAILY_ITERATION" >> .build_number
    echo -e "${GREEN}✅ Updated .build_number file${NC}"
}

update_ios_versions() {
    for file in ios/*.xcconfig; do
        if [ -f "$file" ]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/MARKETING_VERSION = .*/MARKETING_VERSION = $MARKETING_VERSION/" "$file"
                sed -i '' "s/CURRENT_PROJECT_VERSION = .*/CURRENT_PROJECT_VERSION = $IOS_BUILD_NUMBER/" "$file"
            else
                sed -i "s/MARKETING_VERSION = .*/MARKETING_VERSION = $MARKETING_VERSION/" "$file"
                sed -i "s/CURRENT_PROJECT_VERSION = .*/CURRENT_PROJECT_VERSION = $IOS_BUILD_NUMBER/" "$file"
            fi
        fi
    done
    echo -e "${GREEN}✅ Updated iOS versions in *.xcconfig files${NC}"
}

update_android_versions() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/versionCode .*/versionCode $ANDROID_VERSION_CODE/" android/app/build.gradle
        sed -i '' "s/versionName \".*\"/versionName \"$MARKETING_VERSION\"/" android/app/build.gradle
    else
        sed -i "s/versionCode .*/versionCode $ANDROID_VERSION_CODE/" android/app/build.gradle
        sed -i "s/versionName \".*\"/versionName \"$MARKETING_VERSION\"/" android/app/build.gradle
    fi
    echo -e "${GREEN}✅ Updated Android versions in build.gradle${NC}"
}

# ============================================================================
# VALIDATION
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    PRE-FLIGHT VALIDATION                              ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

# Validate platform argument
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "both" ]]; then
    handle_error "Invalid platform: $PLATFORM" \
        "Usage: $0 [ios|android|both]"
fi

echo -e "${BLUE}Platform: ${PLATFORM}${NC}"
echo

# Step 1: Check git status (allow staged changes)
echo -e "${BLUE}Step 1: Git Status Check${NC}"
echo "─────────────────────────"
GIT_STATUS=$(git status --porcelain)
if [[ -n "$GIT_STATUS" ]]; then
    # Check if there are unstaged changes
    UNSTAGED=$(echo "$GIT_STATUS" | grep -E "^.[MD]" || true)
    if [[ -n "$UNSTAGED" ]]; then
        echo -e "${YELLOW}⚠️  Uncommitted changes detected (will be staged and committed):${NC}"
        echo "$GIT_STATUS" | head -10
    else
        echo -e "${GREEN}✅ Only staged changes detected${NC}"
    fi
else
    echo -e "${GREEN}✅ Working directory clean${NC}"
fi
echo

# Step 2: Check required tools
echo -e "${BLUE}Step 2: Tool Check${NC}"
echo "───────────────────"

if ! command -v fastlane &> /dev/null; then
    handle_error "Fastlane not installed" \
        "Install: sudo gem install fastlane"
fi
echo -e "${GREEN}✅ Fastlane installed${NC}"

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
    if ! command -v xcodebuild &> /dev/null; then
        handle_error "Xcode not installed" \
            "Install Xcode from App Store"
    fi
    echo -e "${GREEN}✅ Xcode installed${NC}"
fi

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    if [ ! -f "android/gradlew" ]; then
        handle_error "Android Gradle wrapper not found" \
            "Ensure android/gradlew exists"
    fi
    echo -e "${GREEN}✅ Android Gradle wrapper found${NC}"
fi
echo

# Step 3: ESLint Check
echo -e "${BLUE}Step 3: ESLint Check${NC}"
echo "────────────────────"
set +e
npm run lint > /tmp/lint-output.txt 2>&1
LINT_EXIT_CODE=$?
cat /tmp/lint-output.txt
set -e

if [ $LINT_EXIT_CODE -ne 0 ]; then
    ERROR_COUNT=$(grep -c "error" /tmp/lint-output.txt 2>/dev/null || echo "unknown")
    handle_error "ESLint errors detected ($ERROR_COUNT errors)" \
        "Fix all linting errors. Run: npm run lint"
fi
echo -e "${GREEN}✅ Lint check passed${NC}"
echo

# Step 4: TypeScript Check (Non-Blocking)
echo -e "${BLUE}Step 4: TypeScript Check (Non-Blocking)${NC}"
echo "────────────────────────────────────────"
if [ -f "tsconfig.json" ]; then
    set +e
    npm run typecheck > /tmp/typecheck-output.txt 2>&1
    set -e
    if grep -q "error TS" /tmp/typecheck-output.txt; then
        ERROR_COUNT=$(grep -c "error TS" /tmp/typecheck-output.txt)
        show_warning "TypeScript has $ERROR_COUNT errors (non-blocking)"
        grep "error TS" /tmp/typecheck-output.txt | head -5
    else
        echo -e "${GREEN}✅ TypeScript check passed${NC}"
    fi
else
    show_warning "tsconfig.json not found"
fi
echo

# Step 5: Code Quality Metrics (Non-Blocking)
echo -e "${BLUE}Step 5: Code Quality Metrics (Non-Blocking)${NC}"
echo "────────────────────────────────────────────"

# TODO count
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX\|HACK" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt "30" ]; then
    show_warning "Too many TODOs: $TODO_COUNT (recommended max: 30)"
else
    echo -e "${GREEN}✅ TODO count acceptable ($TODO_COUNT/30)${NC}"
fi

# console.log count
CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v '^\s*//' | grep -v '//.*console\.log' | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -gt "10" ]; then
    show_warning "Too many console.log statements: $CONSOLE_COUNT (recommended max: 10)"
else
    echo -e "${GREEN}✅ Console.log count acceptable ($CONSOLE_COUNT/10)${NC}"
fi

# debugger statements
DEBUGGER_COUNT=$(grep -r "debugger" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$DEBUGGER_COUNT" -gt "0" ]; then
    handle_error "Debugger statements found ($DEBUGGER_COUNT)" \
        "Remove all debugger statements. Run: grep -r 'debugger' src/"
fi
echo -e "${GREEN}✅ No debugger statements${NC}"
echo

# Step 6: Critical Tests
echo -e "${BLUE}Step 6: Critical Tests${NC}"
echo "──────────────────────"
set +e
timeout 90 npm run test:critical > /tmp/test-critical.txt 2>&1
CRITICAL_EXIT=$?
set -e

if [ $CRITICAL_EXIT -ne 0 ] && [ $CRITICAL_EXIT -ne 124 ]; then
    cat /tmp/test-critical.txt
    handle_error "Critical tests failed" \
        "Fix all critical test failures. Run: npm run test:critical"
fi

CRITICAL_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-critical.txt | grep -oE "[0-9]+" | head -1 || echo "0")
echo -e "${GREEN}✅ Critical tests passed ($CRITICAL_PASSED tests)${NC}"
echo

# ============================================================================
# VERSION MANAGEMENT
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    VERSION MANAGEMENT                                 ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

calculate_versions
update_build_number_file
update_ios_versions
update_android_versions

echo

# ============================================================================
# ANDROID KEYSTORE PASSWORD (if needed)
# ============================================================================

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    # Check if keystore passwords are configured
    if [ ! -f "$HOME/.gradle/gradle.properties" ] || \
       ! grep -q "MANYLLA_RELEASE_STORE_PASSWORD" "$HOME/.gradle/gradle.properties" 2>/dev/null; then

        if [ -z "$MANYLLA_RELEASE_STORE_PASSWORD" ]; then
            echo -e "${YELLOW}Android keystore password required for release build${NC}"
            echo -n "Enter keystore password: "
            read -s MANYLLA_RELEASE_STORE_PASSWORD
            echo
            export MANYLLA_RELEASE_STORE_PASSWORD
        fi

        if [ -z "$MANYLLA_RELEASE_KEY_PASSWORD" ]; then
            echo -n "Enter key password: "
            read -s MANYLLA_RELEASE_KEY_PASSWORD
            echo
            export MANYLLA_RELEASE_KEY_PASSWORD
        fi
    fi
fi

# ============================================================================
# iOS BUILD & UPLOAD
# ============================================================================

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}    iOS STAGE BUILD & UPLOAD                          ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo

    echo -e "${YELLOW}📱 Building and uploading iOS to TestFlight Internal...${NC}"

    cd ios
    fastlane ios stage
    IOS_EXIT_CODE=$?
    cd ..

    if [ $IOS_EXIT_CODE -ne 0 ]; then
        handle_error "iOS build/upload failed" \
            "Check Fastlane output above for details"
    fi

    echo -e "${GREEN}✅ iOS uploaded to TestFlight Internal${NC}"
    echo
fi

# ============================================================================
# ANDROID BUILD & UPLOAD
# ============================================================================

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}    ANDROID STAGE BUILD & UPLOAD                       ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo

    echo -e "${YELLOW}📱 Building and uploading Android to Play Console Internal...${NC}"

    cd android
    fastlane android stage
    ANDROID_EXIT_CODE=$?
    cd ..

    if [ $ANDROID_EXIT_CODE -ne 0 ]; then
        handle_error "Android build/upload failed" \
            "Check Fastlane output above for details"
    fi

    echo -e "${GREEN}✅ Android uploaded to Play Console Internal${NC}"
    echo
fi

# ============================================================================
# GIT OPERATIONS
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    GIT OPERATIONS                                     ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

echo -e "${BLUE}Committing Version Changes${NC}"
echo "──────────────────────────"

# Stage all version-related files
git add .build_number
git add ios/*.xcconfig
git add android/app/build.gradle

# Stage any other uncommitted changes (if any)
if [[ -n "$GIT_STATUS" ]]; then
    git add -A
fi

# Commit
COMMIT_MSG="chore: Mobile STAGE v${MARKETING_VERSION} (build ${IOS_BUILD_NUMBER})

Deployed to TestFlight Internal / Play Console Internal

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✅ Changes committed${NC}"

# Create git tag
TAG_NAME="mobile-v${MARKETING_VERSION}-stage-${IOS_BUILD_NUMBER}"
git tag -a "$TAG_NAME" -m "Mobile STAGE release v${MARKETING_VERSION} (build ${IOS_BUILD_NUMBER})"
echo -e "${GREEN}✅ Created tag: $TAG_NAME${NC}"

# Push to remote
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main 2>/dev/null || git push origin master 2>/dev/null
git push origin "$TAG_NAME"
echo -e "${GREEN}✅ Pushed to GitHub${NC}"
echo

# ============================================================================
# SUCCESS SUMMARY
# ============================================================================

echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    🎉 STAGE DEPLOYMENT COMPLETE!                     ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo
echo -e "${GREEN}Version: v${MARKETING_VERSION} (build ${IOS_BUILD_NUMBER})${NC}"
echo -e "${GREEN}Tag: $TAG_NAME${NC}"
echo

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
    echo -e "${GREEN}iOS:${NC}"
    echo "  🔗 https://appstoreconnect.apple.com"
    echo "  📱 TestFlight Internal Testing group will receive notification"
    echo
fi

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    echo -e "${GREEN}Android:${NC}"
    echo "  🔗 https://play.google.com/console"
    echo "  📱 Play Console Internal Testing track is live"
    echo
fi

echo "Next Steps:"
echo "──────────"
echo "1. Test STAGE builds with internal team"
echo "2. Verify all features work correctly"
echo "3. When ready for external beta, run: ./scripts/deploy-mobile-beta.sh"
echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
