#!/bin/bash

# Android Debug Helper Script
set -e

COMMAND=${1:-help}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

case $COMMAND in
  logs)
    echo -e "${GREEN}📱 Showing Manylla app logs...${NC}"
    adb logcat -c  # Clear old logs
    adb logcat | grep -E "(ReactNative|Manylla|manyllamobile)"
    ;;
  
  errors)
    echo -e "${RED}🔴 Showing errors and crashes...${NC}"
    adb logcat -d | grep -E "(ERROR|FATAL|EXCEPTION|CRASH|AndroidRuntime:E)"
    ;;
  
  perf)
    echo -e "${YELLOW}⚡ Performance metrics:${NC}"
    adb shell dumpsys gfxinfo com.manyllamobile | head -50
    ;;
  
  memory)
    echo -e "${YELLOW}💾 Memory usage:${NC}"
    adb shell dumpsys meminfo com.manyllamobile | grep -E "(TOTAL|Native Heap|Dalvik Heap|SUMMARY)" | head -20
    ;;
  
  clear)
    echo -e "${YELLOW}🧹 Clearing app data...${NC}"
    adb shell pm clear com.manyllamobile
    echo -e "${GREEN}App data cleared${NC}"
    ;;
  
  reinstall)
    echo -e "${YELLOW}🔄 Reinstalling app...${NC}"
    adb uninstall com.manyllamobile 2>/dev/null || echo "App not installed, skipping uninstall"
    
    # Find the APK
    APK=""
    if [ -f "android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk" ]; then
      APK="android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk"
    elif [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
      APK="android/app/build/outputs/apk/debug/app-debug.apk"
    fi
    
    if [ -n "$APK" ]; then
      adb install -r "$APK"
      echo -e "${GREEN}App reinstalled successfully${NC}"
    else
      echo -e "${RED}No APK found. Build the app first.${NC}"
    fi
    ;;
  
  screenshot)
    echo -e "${YELLOW}📸 Taking screenshot...${NC}"
    mkdir -p screenshots
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    adb exec-out screencap -p > "screenshots/android_${TIMESTAMP}.png"
    echo -e "${GREEN}Screenshot saved: screenshots/android_${TIMESTAMP}.png${NC}"
    ;;
  
  info)
    echo -e "${GREEN}📱 Device Information:${NC}"
    echo "Connected devices:"
    adb devices
    echo ""
    echo "Device details:"
    adb shell getprop ro.product.model
    adb shell getprop ro.build.version.release
    adb shell getprop ro.build.version.sdk
    echo ""
    echo "App info (if installed):"
    adb shell pm list packages | grep manyllamobile || echo "App not installed"
    ;;
  
  launch)
    echo -e "${YELLOW}🚀 Launching app...${NC}"
    adb shell am start -n com.manyllamobile/com.manyllamobile.MainActivity
    echo -e "${GREEN}App launched${NC}"
    ;;
  
  stop)
    echo -e "${YELLOW}⏹ Stopping app...${NC}"
    adb shell am force-stop com.manyllamobile
    echo -e "${GREEN}App stopped${NC}"
    ;;
  
  help|*)
    echo -e "${GREEN}Android Debug Helper${NC}"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  logs       - Show app logs (filtered)"
    echo "  errors     - Show errors and crashes"
    echo "  perf       - Show performance metrics"
    echo "  memory     - Show memory usage"
    echo "  clear      - Clear app data"
    echo "  reinstall  - Reinstall app"
    echo "  screenshot - Take device screenshot"
    echo "  info       - Show device and app info"
    echo "  launch     - Launch the app"
    echo "  stop       - Force stop the app"
    echo "  help       - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 logs       # Watch live logs"
    echo "  $0 errors     # Check for crashes"
    echo "  $0 memory     # Monitor memory usage"
    ;;
esac