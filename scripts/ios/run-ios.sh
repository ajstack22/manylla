#!/bin/bash

# Manylla iOS Run Script
# Runs iOS app on simulator or device
# Created: 2025-01-14

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Running Manylla on iOS${NC}"
echo "=========================="

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Default device
DEFAULT_DEVICE="iPhone 15"
DEVICE=${1:-$DEFAULT_DEVICE}

echo "Project root: $PROJECT_ROOT"
echo "Target device: $DEVICE"
echo ""

# Force Xcode environment
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"

# Verify Xcode installation
if [ ! -d "$DEVELOPER_DIR" ]; then
    echo -e "${RED}❌ ERROR: Xcode not found at $DEVELOPER_DIR${NC}"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Check if device is "device" (physical device)
if [ "$DEVICE" = "device" ]; then
    echo -e "${YELLOW}📱 Running on connected iOS device...${NC}"
    echo ""

    # Check for connected devices
    DEVICES=$(xcrun xctrace list devices 2>/dev/null | grep -E "^[0-9A-F-]+ " | head -5)
    if [ -n "$DEVICES" ]; then
        echo "Available physical devices:"
        echo "$DEVICES"
        echo ""
    else
        echo -e "${YELLOW}⚠️  No physical devices detected${NC}"
        echo "Make sure your device is:"
        echo "  1. Connected via USB"
        echo "  2. Unlocked and trusted"
        echo "  3. In Developer Mode (iOS 16+)"
        echo ""
    fi

    # Use React Native CLI for device deployment
    echo "Building and deploying to device..."
    npx react-native run-ios --device

elif [ "$DEVICE" = "list" ]; then
    echo -e "${BLUE}📱 Available iOS Simulators:${NC}"
    echo ""

    # List available simulators
    xcrun simctl list devices available | grep -E "iPhone|iPad" | grep -v "unavailable" | head -20

    echo ""
    echo "Usage examples:"
    echo "  $0 'iPhone 15'           # Default"
    echo "  $0 'iPhone 15 Pro'       # Specific model"
    echo "  $0 'iPad Pro (12.9-inch)'# iPad"
    echo "  $0 device                # Physical device"

else
    echo -e "${YELLOW}📱 Running on iOS Simulator: $DEVICE${NC}"
    echo ""

    # Check if the simulator exists
    SIMULATOR_ID=$(xcrun simctl list devices available | grep "$DEVICE" | head -1 | grep -o -E '\([A-Z0-9-]+\)' | tr -d '()')

    if [ -z "$SIMULATOR_ID" ]; then
        echo -e "${RED}❌ ERROR: Simulator '$DEVICE' not found${NC}"
        echo ""
        echo "Available simulators:"
        xcrun simctl list devices available | grep -E "iPhone|iPad" | grep -v "unavailable" | head -10
        echo ""
        echo "Run with 'list' to see all available simulators:"
        echo "  $0 list"
        exit 1
    fi

    echo "Simulator ID: $SIMULATOR_ID"
    echo ""

    # Boot the simulator if not already booted
    SIMULATOR_STATE=$(xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -o -E "(Booted|Shutdown)")
    if [ "$SIMULATOR_STATE" != "Booted" ]; then
        echo "Booting simulator..."
        xcrun simctl boot "$SIMULATOR_ID"
        sleep 3
    else
        echo "Simulator already booted"
    fi

    # Open Simulator app
    open -a Simulator

    # Check if Metro bundler is running
    if ! lsof -i :8081 >/dev/null 2>&1; then
        echo ""
        echo -e "${YELLOW}⚠️  Metro bundler not detected on port 8081${NC}"
        echo "Starting Metro bundler..."

        # Start Metro in background
        npx react-native start --reset-cache >/dev/null 2>&1 &
        METRO_PID=$!

        echo "Metro started (PID: $METRO_PID)"
        echo "Waiting for Metro to initialize..."
        sleep 5

        # Function to cleanup Metro on exit
        cleanup() {
            if [ -n "$METRO_PID" ]; then
                echo ""
                echo "Stopping Metro bundler..."
                kill $METRO_PID 2>/dev/null || true
            fi
        }
        trap cleanup EXIT
    else
        echo "Metro bundler already running on port 8081"
    fi

    echo ""
    echo "Building and installing app..."

    # Use React Native CLI to build and install
    npx react-native run-ios --simulator="$DEVICE"

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ App launched successfully on $DEVICE${NC}"
        echo ""
        echo "Debug options:"
        echo "  • Shake device/simulator for developer menu"
        echo "  • Cmd+D (simulator) for developer menu"
        echo "  • Cmd+R (simulator) to reload"
        echo ""
        echo "Logs:"
        echo "  • Metro bundler: Check terminal output"
        echo "  • Device logs: npx react-native log-ios"
        echo "  • Xcode console: Cmd+Shift+2 in Xcode"
    else
        echo -e "${RED}❌ Failed to launch app${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "  1. Clean build: ./scripts/ios/clean-ios.sh"
        echo "  2. Reinstall pods: cd ios && pod install && cd .."
        echo "  3. Check Xcode: Open ios/ManyllaMobile.xcworkspace"
        echo "  4. Validate environment: ./scripts/ios/validate-environment.sh"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📊 Run Summary${NC}"
echo "==============="
echo "Target: $DEVICE"
echo "Project: ManyllaMobile"

if [ "$DEVICE" != "device" ] && [ "$DEVICE" != "list" ]; then
    echo "Simulator ID: $SIMULATOR_ID"
fi

echo ""
echo "Development commands:"
echo "  • Reload app: Cmd+R (simulator) or Shake (device)"
echo "  • Stop Metro: Ctrl+C in Metro terminal"
echo "  • View logs: npx react-native log-ios"