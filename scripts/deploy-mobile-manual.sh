#!/bin/bash
# Manual Mobile Deployment Script for Manylla
# This script handles mobile app deployment to iOS simulators and Android emulators
# Use this when mobile deployment needs to be done separately from web deployment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    MANYLLA MANUAL MOBILE DEPLOYMENT                    ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

# Function to show warnings
show_warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Function to show errors
show_error() {
    echo -e "${RED}❌ Error: $1${NC}"
}

# Function to show success
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Change to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo -e "${BLUE}Project Root: $PROJECT_ROOT${NC}"
echo

# ============================================================================
# iOS DEPLOYMENT
# ============================================================================

echo -e "${CYAN}iOS Simulator Deployment${NC}"
echo "─────────────────────────"

# Check for running iOS simulators
IOS_SIMULATORS=$(xcrun simctl list devices 2>/dev/null | grep "Booted" || echo "")

if [ -z "$IOS_SIMULATORS" ]; then
    show_warning "No iOS simulators running. Please start a simulator first."
    echo "To start a simulator: Open Xcode > Window > Devices and Simulators"
else
    echo "Found running iOS simulators:"
    echo "$IOS_SIMULATORS"
    echo

    # Check if Metro is running
    METRO_PID=$(lsof -ti :8082 2>/dev/null || echo "")
    if [ -z "$METRO_PID" ]; then
        echo -e "${YELLOW}Starting Metro bundler...${NC}"
        npx react-native start --port 8082 > /tmp/metro-bundler.log 2>&1 &
        METRO_PID=$!
        sleep 5
        show_success "Metro bundler started (PID: $METRO_PID)"
    else
        show_success "Metro bundler already running (PID: $METRO_PID)"
    fi

    # Extract simulator details
    if echo "$IOS_SIMULATORS" | grep -q "iPhone"; then
        IPHONE_NAME=$(echo "$IOS_SIMULATORS" | grep "iPhone" | head -1 | sed 's/(.*//g' | xargs)
        IPHONE_ID=$(echo "$IOS_SIMULATORS" | grep "iPhone" | head -1 | grep -o '[A-F0-9-]\{36\}')

        echo -e "${YELLOW}📱 Deploying to $IPHONE_NAME...${NC}"

        # Try direct deployment with QUAL scheme
        npx react-native run-ios \
            --simulator="$IPHONE_NAME" \
            --scheme="ManyllaMobile QUAL" \
            --no-packager 2>&1 | tee /tmp/ios-deploy.log

        # Check if app was installed
        if xcrun simctl listapps "$IPHONE_ID" 2>/dev/null | grep -q "com.manylla"; then
            show_success "App installed on iPhone simulator"

            # Launch the app
            xcrun simctl launch "$IPHONE_ID" com.manylla 2>/dev/null || true
        else
            show_error "App installation failed on iPhone"
            echo "Check /tmp/ios-deploy.log for details"
        fi
    fi

    if echo "$IOS_SIMULATORS" | grep -q "iPad"; then
        IPAD_NAME=$(echo "$IOS_SIMULATORS" | grep "iPad" | head -1 | sed 's/(.*//g' | xargs)
        IPAD_ID=$(echo "$IOS_SIMULATORS" | grep "iPad" | head -1 | grep -o '[A-F0-9-]\{36\}')

        echo -e "${YELLOW}📱 Deploying to $IPAD_NAME...${NC}"

        # Try direct deployment with QUAL scheme
        npx react-native run-ios \
            --simulator="$IPAD_NAME" \
            --scheme="ManyllaMobile QUAL" \
            --no-packager 2>&1 | tee /tmp/ios-deploy-ipad.log

        # Check if app was installed
        if xcrun simctl listapps "$IPAD_ID" 2>/dev/null | grep -q "com.manylla"; then
            show_success "App installed on iPad simulator"

            # Launch the app
            xcrun simctl launch "$IPAD_ID" com.manylla 2>/dev/null || true
        else
            show_error "App installation failed on iPad"
            echo "Check /tmp/ios-deploy-ipad.log for details"
        fi
    fi
fi

echo

# ============================================================================
# ANDROID DEPLOYMENT
# ============================================================================

echo -e "${CYAN}Android Emulator Deployment${NC}"
echo "────────────────────────────"

# Check for connected Android devices
ANDROID_DEVICES=$(adb devices 2>/dev/null | grep -v "List of devices" | grep -E "device$|emulator" || echo "")

if [ -z "$ANDROID_DEVICES" ]; then
    show_warning "No Android emulators running. Please start an emulator first."
    echo "To start an emulator: Android Studio > AVD Manager"
else
    echo "Found connected Android devices:"
    echo "$ANDROID_DEVICES"
    echo

    # Check if Metro is running
    METRO_PID=$(lsof -ti :8082 2>/dev/null || echo "")
    if [ -z "$METRO_PID" ]; then
        echo -e "${YELLOW}Starting Metro bundler...${NC}"
        npx react-native start --port 8082 > /tmp/metro-bundler.log 2>&1 &
        METRO_PID=$!
        sleep 5
        show_success "Metro bundler started (PID: $METRO_PID)"
    else
        show_success "Metro bundler already running (PID: $METRO_PID)"
    fi

    # Try to run Android app directly
    echo -e "${YELLOW}🤖 Building and deploying Android app...${NC}"

    # Run with react-native (handles build and install)
    npx react-native run-android --no-packager 2>&1 | tee /tmp/android-deploy.log

    # Check if app was installed
    FIRST_DEVICE=$(echo "$ANDROID_DEVICES" | head -1 | awk '{print $1}')
    if [ -n "$FIRST_DEVICE" ]; then
        if adb -s "$FIRST_DEVICE" shell pm list packages 2>/dev/null | grep -q "com.manylla"; then
            show_success "App installed on Android emulator"
        else
            show_error "App installation may have failed"
            echo "Check /tmp/android-deploy.log for details"
        fi
    fi
fi

echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    Mobile Deployment Complete                          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

echo "Notes:"
echo "- iOS: Uses 'ManyllaMobile QUAL' scheme"
echo "- Android: Uses default debug build"
echo "- Metro bundler runs on port 8082"
echo "- Logs available in /tmp/*-deploy.log"
echo
echo "If deployment failed, check:"
echo "1. Simulators/emulators are running"
echo "2. Metro bundler is accessible (port 8082)"
echo "3. Dependencies are installed (pod install, gradle sync)"
echo "4. Build logs in /tmp/ directory"