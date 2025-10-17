#!/bin/bash

# Manylla Mobile QUAL Deployment Script
# Purpose: Build local testing versions (iOS Simulator + Android APK)
# No version management, no git operations, fast local builds

set -e  # Exit on error

echo "🚀 Manylla Mobile QUAL Deployment"
echo "=================================="
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
    echo -e "${RED}❌ ERROR: $1${NC}"
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
# VALIDATION
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    VALIDATION                                        ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

# Validate platform argument
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "both" ]]; then
    handle_error "Invalid platform: $PLATFORM" \
        "Usage: $0 [ios|android|both]"
fi

echo -e "${BLUE}Platform: ${PLATFORM}${NC}"
echo

# Check git status (warning only, not blocking)
echo -e "${BLUE}Git Status Check (Non-Blocking)${NC}"
echo "─────────────────────────────────"
if [[ -n $(git status --porcelain) ]]; then
    show_warning "Uncommitted changes detected - continuing anyway"
    git status --short | head -5
else
    echo -e "${GREEN}✅ Working directory clean${NC}"
fi
echo

# Check required tools
echo -e "${BLUE}Tool Check${NC}"
echo "──────────"

# Fastlane
if ! command -v fastlane &> /dev/null; then
    handle_error "Fastlane not installed" \
        "Install: sudo gem install fastlane"
fi
echo -e "${GREEN}✅ Fastlane installed${NC}"

# Platform-specific tools
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

# ============================================================================
# iOS BUILD
# ============================================================================

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}    iOS QUAL BUILD                                     ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo

    echo -e "${YELLOW}📱 Building iOS Simulator app...${NC}"

    cd ios
    fastlane ios qual
    IOS_EXIT_CODE=$?
    cd ..

    if [ $IOS_EXIT_CODE -ne 0 ]; then
        handle_error "iOS build failed" \
            "Check Fastlane output above for details"
    fi

    echo -e "${GREEN}✅ iOS build complete${NC}"
    echo
fi

# ============================================================================
# ANDROID BUILD
# ============================================================================

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}    ANDROID QUAL BUILD                                 ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo

    echo -e "${YELLOW}📱 Building Android APK...${NC}"

    cd android
    fastlane android qual
    ANDROID_EXIT_CODE=$?
    cd ..

    if [ $ANDROID_EXIT_CODE -ne 0 ]; then
        handle_error "Android build failed" \
            "Check Fastlane output above for details"
    fi

    echo -e "${GREEN}✅ Android build complete${NC}"
    echo
fi

# ============================================================================
# SUCCESS SUMMARY
# ============================================================================

echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    🎉 QUAL BUILDS COMPLETE!                          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
    echo -e "${GREEN}iOS Simulator App:${NC}"
    echo "  📂 Location: ios/build/qual/ or ios/DerivedData/Build/Products/Debug-iphonesimulator/"
    echo "  📲 Install: xcrun simctl install booted <path-to-app>"
    echo "  🚀 Launch: Open app from iOS Simulator home screen"
    echo
fi

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    echo -e "${GREEN}Android APK:${NC}"
    echo "  📂 Location: android/app/build/outputs/apk/qual/debug/app-qual-debug.apk"
    echo "  📲 Install: adb install -r android/app/build/outputs/apk/qual/debug/app-qual-debug.apk"
    echo "  🚀 Launch: adb shell monkey -p com.manylla.qual -c android.intent.category.LAUNCHER 1"
    echo
fi

echo "Next Steps:"
echo "──────────"
echo "1. Test QUAL builds on simulators/emulators"
echo "2. Verify BUILD_TYPE detection works correctly"
echo "3. When ready for internal testing, run: ./scripts/deploy-mobile-stage.sh"
echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
