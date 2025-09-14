#!/bin/bash

# Manylla iOS Build Script
# Creates debug/release IPA files
# Created: 2025-01-14

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Building Manylla for iOS${NC}"
echo "================================"

# Force Xcode environment
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"

BUILD_TYPE=${1:-debug}
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "Build type: $BUILD_TYPE"
echo "Project root: $PROJECT_ROOT"
echo ""

# Verify Xcode installation
if [ ! -d "$DEVELOPER_DIR" ]; then
    echo -e "${RED}❌ ERROR: Xcode not found at $DEVELOPER_DIR${NC}"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Show Xcode version
XCODE_VERSION=$(xcodebuild -version | head -1)
echo "Using: $XCODE_VERSION"
echo ""

cd "$PROJECT_ROOT/ios" || exit 1

# Ensure pods are installed
if [ ! -d "Pods" ] || [ ! -f "Podfile.lock" ]; then
    echo -e "${YELLOW}⚠️  CocoaPods not installed, installing...${NC}"
    pod install
    echo ""
fi

if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${YELLOW}📦 Building release IPA...${NC}"

    # Clean first for release builds
    xcodebuild clean \
        -workspace ManyllaMobile.xcworkspace \
        -scheme ManyllaMobile \
        -configuration Release

    echo ""
    echo "Creating archive..."

    # Create archive
    xcodebuild archive \
        -workspace ManyllaMobile.xcworkspace \
        -scheme ManyllaMobile \
        -configuration Release \
        -destination generic/platform=iOS \
        -archivePath build/ManyllaMobile.xcarchive \
        SKIP_INSTALL=NO \
        BUILD_LIBRARY_FOR_DISTRIBUTION=YES

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Archive created successfully!${NC}"
        echo "📍 Location: ios/build/ManyllaMobile.xcarchive"

        # Check if we have export options plist
        if [ ! -f "ExportOptions.plist" ]; then
            echo ""
            echo -e "${YELLOW}Creating ExportOptions.plist...${NC}"
            cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>manageAppVersionAndBuildNumber</key>
    <true/>
    <key>destination</key>
    <string>export</string>
    <key>stripSwiftSymbols</key>
    <true/>
</dict>
</plist>
EOF
        fi

        echo ""
        echo "Exporting IPA..."

        # Export IPA
        xcodebuild -exportArchive \
            -archivePath build/ManyllaMobile.xcarchive \
            -exportPath build/ \
            -exportOptionsPlist ExportOptions.plist

        if [ $? -eq 0 ]; then
            # Check if IPA was created
            if [ -f "build/ManyllaMobile.ipa" ]; then
                IPA_SIZE=$(du -h build/ManyllaMobile.ipa | cut -f1)
                echo ""
                echo -e "${GREEN}✅ Release IPA built successfully!${NC}"
                echo -e "📍 Location: ios/build/ManyllaMobile.ipa"
                echo -e "📊 IPA Size: $IPA_SIZE"

                # Validate the IPA
                echo ""
                echo "Validating IPA signature..."
                codesign -dv --verbose=4 build/ManyllaMobile.ipa 2>/dev/null | grep "Authority" || echo "No signature info available"

                echo ""
                echo -e "${GREEN}🎉 Release build complete!${NC}"
                echo ""
                echo "Next steps:"
                echo "  1. Test IPA: ./scripts/ios/prepare-appstore.sh"
                echo "  2. Upload to TestFlight: ./scripts/ios/deploy-testflight.sh"
                echo "  3. Install Transporter app for App Store uploads"
            else
                echo -e "${RED}❌ IPA file not found after export${NC}"
                echo "Check build/ManyllaMobile.ipa directory:"
                ls -la build/ || echo "Build directory not found"
                exit 1
            fi
        else
            echo -e "${RED}❌ IPA export failed${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Archive creation failed${NC}"
        exit 1
    fi

elif [ "$BUILD_TYPE" = "debug" ]; then
    echo -e "${YELLOW}🔨 Building debug archive...${NC}"

    # Build debug archive (for testing)
    xcodebuild archive \
        -workspace ManyllaMobile.xcworkspace \
        -scheme ManyllaMobile \
        -configuration Debug \
        -destination generic/platform=iOS \
        -archivePath build/ManyllaMobile-Debug.xcarchive \
        SKIP_INSTALL=NO

    if [ $? -eq 0 ]; then
        # Also create a debug build for simulator testing
        echo ""
        echo -e "${YELLOW}🔨 Building for simulator...${NC}"

        xcodebuild build \
            -workspace ManyllaMobile.xcworkspace \
            -scheme ManyllaMobile \
            -configuration Debug \
            -destination "platform=iOS Simulator,name=iPhone 15"

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Debug builds completed successfully!${NC}"
            echo -e "📍 Archive: ios/build/ManyllaMobile-Debug.xcarchive"

            # Show build products location
            BUILD_DIR=$(xcodebuild -workspace ManyllaMobile.xcworkspace -scheme ManyllaMobile -configuration Debug -showBuildSettings | grep "BUILT_PRODUCTS_DIR" | head -1 | cut -d= -f2 | xargs)
            if [ -n "$BUILD_DIR" ] && [ -d "$BUILD_DIR" ]; then
                APP_SIZE=$(du -sh "$BUILD_DIR/ManyllaMobile.app" 2>/dev/null | cut -f1 || echo "N/A")
                echo -e "📍 Simulator app: $BUILD_DIR/ManyllaMobile.app ($APP_SIZE)"
            fi

            echo ""
            echo -e "${GREEN}🎉 Debug build complete!${NC}"
            echo ""
            echo "Next steps:"
            echo "  1. Run on simulator: ./scripts/ios/run-ios.sh"
            echo "  2. Test on device: Open Xcode and build to device"
            echo "  3. Build release: ./scripts/ios/build-ios.sh release"
        else
            echo -e "${RED}❌ Simulator build failed${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Debug archive failed${NC}"
        exit 1
    fi

else
    echo -e "${RED}❌ Invalid build type: $BUILD_TYPE${NC}"
    echo "Usage: $0 [debug|release]"
    echo ""
    echo "Examples:"
    echo "  $0 debug    # Build debug version"
    echo "  $0 release  # Build release IPA for App Store"
    exit 1
fi

cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}📊 Build Summary${NC}"
echo "=================="
echo "Build type: $BUILD_TYPE"
echo "Xcode version: $XCODE_VERSION"
if [ "$BUILD_TYPE" = "release" ] && [ -f "ios/build/ManyllaMobile.ipa" ]; then
    echo "IPA size: $(du -h ios/build/ManyllaMobile.ipa | cut -f1)"
fi
echo "Build directory: ios/build/"
echo ""