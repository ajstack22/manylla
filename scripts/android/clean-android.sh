#!/bin/bash

# Android Clean Script - Handles CMake errors gracefully
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Cleaning Android build artifacts...${NC}"

# Force Java 17 if available
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
  export PATH=$JAVA_HOME/bin:$PATH
fi

# Try gradle clean but don't fail if CMake has issues
cd android
if ./gradlew clean 2>/dev/null; then
  echo -e "${GREEN}✓ Gradle clean successful${NC}"
else
  echo -e "${YELLOW}⚠️  Gradle clean failed (likely CMake), doing manual cleanup...${NC}"
fi
cd ..

# Manual cleanup of build directories
echo "Removing build directories..."

# Android build directories
rm -rf android/app/.cxx 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
rm -rf android/.gradle 2>/dev/null || true
rm -rf android/build 2>/dev/null || true

# Node module caches that can cause issues
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf node_modules/.tmp 2>/dev/null || true

# React Native caches
rm -rf $HOME/.gradle/caches/transforms-3 2>/dev/null || true
rm -rf $HOME/.gradle/caches/modules-2/files-2.1/com.facebook.react 2>/dev/null || true

# Clean native module artifacts
echo "Cleaning native module build artifacts..."
for module in \
    "@react-native-async-storage/async-storage" \
    "@react-native-community/datetimepicker" \
    "react-native-gesture-handler" \
    "react-native-image-picker" \
    "react-native-reanimated" \
    "react-native-safe-area-context" \
    "react-native-screens" \
    "react-native-vector-icons" \
    "react-native-webview"
do
    if [ -d "node_modules/$module/android/build" ]; then
        echo "  Cleaning $module..."
        rm -rf "node_modules/$module/android/build"
    fi
done

# Clean any compiled native files
echo "Cleaning native artifacts..."
find android -name "*.so" -type f -delete 2>/dev/null || true
find android -name "CMakeCache.txt" -type f -delete 2>/dev/null || true
find android -name "cmake_install.cmake" -type f -delete 2>/dev/null || true
find android -name "Makefile" -type f -delete 2>/dev/null || true

# Clean any APK files in the output directory
rm -rf android/app/build/outputs/apk 2>/dev/null || true

# Clean temp files
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Clear watchman if installed
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null || true
    echo "✓ Watchman cleared"
fi

echo -e "${GREEN}✅ Android clean complete${NC}"

# Show disk space recovered
if command -v du &> /dev/null; then
  echo ""
  echo "Disk space summary:"
  echo "Android directory: $(du -sh android 2>/dev/null | cut -f1 || echo 'N/A')"
  echo "Node modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'N/A')"
fi

echo ""
echo "Next steps:"
echo "  1. cd android && ./gradlew assembleDebug && cd .."
echo "  2. ./scripts/android/test-android.sh"