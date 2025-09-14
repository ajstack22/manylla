#!/bin/bash

# Manylla iOS Clean Script - Comprehensive cleanup
# Removes build artifacts, caches, and derived data
# Created: 2025-01-14

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Cleaning iOS build artifacts...${NC}"
echo "==================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"
echo ""

# Force Xcode environment
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"

# Clean Xcode build first (if possible)
echo -e "${YELLOW}Cleaning Xcode builds...${NC}"
cd ios

if [ -f "ManyllaMobile.xcworkspace" ]; then
    echo "Using workspace for clean..."
    if xcodebuild clean -workspace ManyllaMobile.xcworkspace -scheme ManyllaMobile 2>/dev/null; then
        echo -e "${GREEN}✓ Xcode workspace clean successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Xcode clean failed, continuing with manual cleanup...${NC}"
    fi
elif [ -f "ManyllaMobile.xcodeproj" ]; then
    echo "Using project for clean..."
    if xcodebuild clean -project ManyllaMobile.xcodeproj -scheme ManyllaMobile 2>/dev/null; then
        echo -e "${GREEN}✓ Xcode project clean successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Xcode clean failed, continuing with manual cleanup...${NC}"
    fi
fi

echo ""

# Manual cleanup of iOS build directories
echo -e "${YELLOW}Removing iOS build directories...${NC}"

# iOS-specific build artifacts
rm -rf build 2>/dev/null && echo "  ✓ Removed ios/build/" || echo "  - ios/build/ not found"
rm -rf DerivedData 2>/dev/null && echo "  ✓ Removed ios/DerivedData/" || echo "  - ios/DerivedData/ not found"
rm -rf ModuleCache 2>/dev/null && echo "  ✓ Removed ios/ModuleCache/" || echo "  - ios/ModuleCache/ not found"

# Xcode user data and schemes (safe to remove)
rm -rf ManyllaMobile.xcodeproj/xcuserdata 2>/dev/null && echo "  ✓ Removed xcuserdata/" || echo "  - xcuserdata/ not found"
rm -rf ManyllaMobile.xcworkspace/xcuserdata 2>/dev/null && echo "  ✓ Removed workspace xcuserdata/" || echo "  - workspace xcuserdata/ not found"

# Clean Pods if they exist (but keep Podfile.lock)
if [ -d "Pods" ]; then
    echo -e "${YELLOW}Cleaning CocoaPods...${NC}"
    rm -rf Pods 2>/dev/null && echo "  ✓ Removed Pods/" || echo "  - Failed to remove Pods/"
    echo "  ✓ Preserved Podfile.lock for consistency"
fi

cd ..

# Clean system-wide caches
echo ""
echo -e "${YELLOW}Cleaning system caches...${NC}"

# Xcode DerivedData (global)
if [ -d "$HOME/Library/Developer/Xcode/DerivedData" ]; then
    DERIVED_SIZE=$(du -sh "$HOME/Library/Developer/Xcode/DerivedData" 2>/dev/null | cut -f1 || echo "Unknown")
    echo "  Found DerivedData ($DERIVED_SIZE), cleaning Manylla-specific data..."

    # Only remove Manylla-related derived data
    find "$HOME/Library/Developer/Xcode/DerivedData" -name "*ManyllaMobile*" -type d -exec rm -rf {} + 2>/dev/null || true
    echo "  ✓ Cleaned Manylla-specific DerivedData"
else
    echo "  - No global DerivedData found"
fi

# Xcode Archives (only Manylla-related)
if [ -d "$HOME/Library/Developer/Xcode/Archives" ]; then
    find "$HOME/Library/Developer/Xcode/Archives" -name "*ManyllaMobile*" -type d -exec rm -rf {} + 2>/dev/null || true
    echo "  ✓ Cleaned Manylla archives"
fi

# iOS Simulator caches
if [ -d "$HOME/Library/Developer/CoreSimulator/Caches" ]; then
    rm -rf "$HOME/Library/Developer/CoreSimulator/Caches"/* 2>/dev/null || true
    echo "  ✓ Cleaned iOS Simulator caches"
fi

# Module cache
rm -rf "$HOME/Library/Developer/Xcode/DerivedData/ModuleCache.noindex" 2>/dev/null && echo "  ✓ Cleaned module cache" || echo "  - Module cache not found"

# React Native caches that affect iOS
echo ""
echo -e "${YELLOW}Cleaning React Native caches...${NC}"

# Metro bundler cache
rm -rf "$TMPDIR/metro-*" 2>/dev/null && echo "  ✓ Cleaned Metro cache" || echo "  - No Metro cache found"
rm -rf "$TMPDIR/haste-*" 2>/dev/null && echo "  ✓ Cleaned Haste cache" || echo "  - No Haste cache found"
rm -rf "$TMPDIR/react-*" 2>/dev/null && echo "  ✓ Cleaned React Native cache" || echo "  - No RN cache found"

# React Native CLI cache
rm -rf "$HOME/.rncache" 2>/dev/null && echo "  ✓ Cleaned RN CLI cache" || echo "  - No RN CLI cache found"

# Node modules iOS-specific build artifacts
if [ -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}Cleaning native module build artifacts...${NC}"

    # Common React Native modules with iOS builds
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
        if [ -d "node_modules/$module/ios" ]; then
            # Clean iOS build products in native modules
            find "node_modules/$module/ios" -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
            find "node_modules/$module/ios" -name "DerivedData" -type d -exec rm -rf {} + 2>/dev/null || true
            find "node_modules/$module/ios" -name "*.xcarchive" -exec rm -rf {} + 2>/dev/null || true
            echo "  ✓ Cleaned $module iOS artifacts"
        fi
    done
fi

# Clear watchman cache if installed
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null && echo "  ✓ Cleared Watchman cache" || echo "  - Watchman cache clear failed"
fi

# Clean iOS deployment artifacts
echo ""
echo -e "${YELLOW}Cleaning deployment artifacts...${NC}"

# Remove any IPA files from previous builds
find . -name "*.ipa" -type f -delete 2>/dev/null && echo "  ✓ Removed IPA files" || echo "  - No IPA files found"

# Remove dSYM files (debug symbols)
find . -name "*.dSYM" -type d -exec rm -rf {} + 2>/dev/null && echo "  ✓ Removed dSYM files" || echo "  - No dSYM files found"

# Remove export options plists
find ios -name "ExportOptions*.plist" -type f -delete 2>/dev/null && echo "  ✓ Removed export options" || echo "  - No export options found"

echo ""
echo -e "${GREEN}✅ iOS clean complete${NC}"

# Show disk space summary
echo ""
echo -e "${BLUE}📊 Disk space summary:${NC}"
echo "========================"

if command -v du &> /dev/null; then
    echo "iOS directory: $(du -sh ios 2>/dev/null | cut -f1 || echo 'N/A')"
    echo "Node modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'N/A')"

    # Show global cache sizes
    if [ -d "$HOME/Library/Developer/Xcode/DerivedData" ]; then
        DERIVED_SIZE=$(du -sh "$HOME/Library/Developer/Xcode/DerivedData" 2>/dev/null | cut -f1 || echo 'N/A')
        echo "Global DerivedData: $DERIVED_SIZE"
    fi
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Reinstall pods: cd ios && pod install && cd .."
echo "  2. Test build: ./scripts/ios/build-ios.sh debug"
echo "  3. Run app: ./scripts/ios/run-ios.sh"

# Check if we need to reinstall pods
if [ ! -d "ios/Pods" ] && [ -f "ios/Podfile" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  CocoaPods need reinstalling after cleanup${NC}"
    echo "Run: cd ios && pod install && cd .."
fi