#!/bin/bash

# Manylla iOS Project Configuration Script
# Configures automatic code signing and build number management
# Created: 2025-01-14

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}⚙️  Configuring iOS Project Settings${NC}"
echo "==================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ ERROR: iOS project configuration only available on macOS${NC}"
    exit 1
fi

cd ios

echo -e "${YELLOW}🔧 Configuring Xcode project settings...${NC}"
echo ""

# Get current settings
echo "Current project settings:"
CURRENT_SIGNING=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CODE_SIGN_STYLE | head -1 | cut -d= -f2 | xargs || echo "Unknown")
CURRENT_TEAM=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep DEVELOPMENT_TEAM | head -1 | cut -d= -f2 | xargs || echo "Not set")
CURRENT_BUNDLE=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep PRODUCT_BUNDLE_IDENTIFIER | head -1 | cut -d= -f2 | xargs || echo "Unknown")

echo "  • Code Sign Style: $CURRENT_SIGNING"
echo "  • Development Team: ${CURRENT_TEAM:-'Not set'}"
echo "  • Bundle ID: $CURRENT_BUNDLE"
echo ""

# Check if we need to configure automatic signing
if [ "$CURRENT_SIGNING" != "Automatic" ]; then
    echo -e "${YELLOW}⚠️  Code signing style is not set to Automatic${NC}"
    echo ""
    echo "Benefits of Automatic signing:"
    echo "  • Xcode manages certificates and provisioning profiles"
    echo "  • Easier team development"
    echo "  • Automatic renewal of profiles"
    echo "  • Less manual certificate management"
    echo ""

    # Check if user has signing certificates
    CERT_COUNT=$(security find-identity -v -p codesigning 2>/dev/null | grep -c "iPhone" || echo "0")

    if [ "$CERT_COUNT" -eq 0 ]; then
        echo -e "${RED}❌ No iPhone signing certificates found${NC}"
        echo ""
        echo "To enable automatic signing, you need:"
        echo "1. Join Apple Developer Program"
        echo "2. Run: ./scripts/ios/setup-certificates.sh"
        echo "3. Re-run this script"
        echo ""
        echo "Skipping automatic signing configuration for now."
    else
        echo -e "${GREEN}✓ Found $CERT_COUNT signing certificate(s)${NC}"
        echo ""

        read -p "Configure automatic signing? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # For automatic signing, we need the development team ID
            if [ -z "$CURRENT_TEAM" ] || [ "$CURRENT_TEAM" = "Not set" ]; then
                echo ""
                echo -e "${YELLOW}Development Team ID required for automatic signing${NC}"
                echo ""
                echo "Find your Team ID:"
                echo "1. Go to https://developer.apple.com/account/#!/membership/"
                echo "2. Your Team ID is shown next to your name"
                echo "3. It looks like: ABC123DEFG"
                echo ""
                read -p "Enter your Development Team ID (or skip): " TEAM_ID

                if [ -n "$TEAM_ID" ]; then
                    echo ""
                    echo "Would configure automatic signing with Team ID: $TEAM_ID"
                    echo ""
                    echo -e "${YELLOW}⚠️  IMPORTANT: Manual Xcode configuration recommended${NC}"
                    echo ""
                    echo "To enable automatic signing manually:"
                    echo "1. Open ios/ManyllaMobile.xcodeproj in Xcode"
                    echo "2. Select ManyllaMobile target"
                    echo "3. Go to 'Signing & Capabilities' tab"
                    echo "4. Check 'Automatically manage signing'"
                    echo "5. Select your development team"
                    echo "6. Xcode will handle certificates and profiles"
                    echo ""
                else
                    echo "Skipping automatic signing configuration"
                fi
            else
                echo -e "${GREEN}✓ Development team already set: $CURRENT_TEAM${NC}"
                echo "Automatic signing should work with current settings"
            fi
        fi
    fi
else
    echo -e "${GREEN}✓ Automatic code signing already configured${NC}"
fi

echo ""
echo -e "${YELLOW}🔢 Configuring build number management...${NC}"
echo ""

# Check current version settings
CURRENT_VERSION=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep MARKETING_VERSION | head -1 | cut -d= -f2 | xargs || echo "Unknown")
CURRENT_BUILD=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CURRENT_PROJECT_VERSION | head -1 | cut -d= -f2 | xargs || echo "Unknown")

echo "Current version settings:"
echo "  • Marketing Version: $CURRENT_VERSION"
echo "  • Build Number: $CURRENT_BUILD"
echo ""

# Create a script for incrementing build numbers
BUILD_SCRIPT="scripts/ios/increment-build-number.sh"
cd ..

if [ ! -f "$BUILD_SCRIPT" ]; then
    echo "Creating build number increment script..."
    cat > "$BUILD_SCRIPT" << 'EOF'
#!/bin/bash

# Increment iOS Build Number
# Automatically increments CURRENT_PROJECT_VERSION in Xcode project

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT/ios"

echo "🔢 Incrementing iOS build number..."

# Get current build number
CURRENT_BUILD=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CURRENT_PROJECT_VERSION | head -1 | cut -d= -f2 | xargs || echo "1")

# Calculate new build number
if [[ "$CURRENT_BUILD" =~ ^[0-9]+$ ]]; then
    NEW_BUILD=$((CURRENT_BUILD + 1))
else
    # If not a number, use date-based
    NEW_BUILD=$(date +%Y%m%d%H%M)
fi

echo "Current build: $CURRENT_BUILD"
echo "New build: $NEW_BUILD"

# Update project file
sed -i '' "s/CURRENT_PROJECT_VERSION = $CURRENT_BUILD;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" ManyllaMobile.xcodeproj/project.pbxproj

echo "✅ Build number updated to $NEW_BUILD"
EOF

    chmod +x "$BUILD_SCRIPT"
    echo -e "${GREEN}✓ Created build increment script: $BUILD_SCRIPT${NC}"
else
    echo -e "${GREEN}✓ Build increment script already exists${NC}"
fi

echo ""

# Create version sync script
SYNC_SCRIPT="scripts/ios/sync-version-with-android.sh"
if [ ! -f "$SYNC_SCRIPT" ]; then
    echo "Creating version sync script..."
    cat > "$SYNC_SCRIPT" << 'EOF'
#!/bin/bash

# Sync iOS Version with Android
# Ensures version numbers match across platforms

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔄 Syncing iOS version with Android..."

# Get Android version
ANDROID_VERSION=$(grep 'versionName' android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/' || echo "1.0.0")
ANDROID_BUILD=$(grep 'versionCode' android/app/build.gradle | sed 's/.*versionCode \([0-9]*\).*/\1/' || echo "1")

echo "Android version: $ANDROID_VERSION ($ANDROID_BUILD)"

# Update iOS project
cd ios
CURRENT_IOS_VERSION=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep MARKETING_VERSION | head -1 | cut -d= -f2 | xargs || echo "1.0")

if [ "$CURRENT_IOS_VERSION" != "$ANDROID_VERSION" ]; then
    echo "Updating iOS version from $CURRENT_IOS_VERSION to $ANDROID_VERSION"
    sed -i '' "s/MARKETING_VERSION = $CURRENT_IOS_VERSION;/MARKETING_VERSION = $ANDROID_VERSION;/g" ManyllaMobile.xcodeproj/project.pbxproj
    echo "✅ iOS version updated"
else
    echo "✅ iOS version already in sync"
fi

# Optionally sync build numbers
read -p "Sync build numbers too? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CURRENT_IOS_BUILD=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CURRENT_PROJECT_VERSION | head -1 | cut -d= -f2 | xargs || echo "1")
    if [ "$CURRENT_IOS_BUILD" != "$ANDROID_BUILD" ]; then
        sed -i '' "s/CURRENT_PROJECT_VERSION = $CURRENT_IOS_BUILD;/CURRENT_PROJECT_VERSION = $ANDROID_BUILD;/g" ManyllaMobile.xcodeproj/project.pbxproj
        echo "✅ iOS build number synced: $ANDROID_BUILD"
    else
        echo "✅ Build numbers already in sync"
    fi
fi

echo "🎉 Version sync complete!"
EOF

    chmod +x "$SYNC_SCRIPT"
    echo -e "${GREEN}✓ Created version sync script: $SYNC_SCRIPT${NC}"
else
    echo -e "${GREEN}✓ Version sync script already exists${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Creating pre-build hook for automatic version management...${NC}"

# Create a pre-build script that can be integrated into CI/CD
PREBUILD_SCRIPT="scripts/ios/pre-build.sh"
if [ ! -f "$PREBUILD_SCRIPT" ]; then
    cat > "$PREBUILD_SCRIPT" << 'EOF'
#!/bin/bash

# iOS Pre-Build Script
# Runs before each build to ensure version consistency

set -e

echo "🔄 Running iOS pre-build checks..."

# Sync versions with Android
./scripts/ios/sync-version-with-android.sh

# For release builds, increment build number
BUILD_TYPE=${1:-debug}
if [ "$BUILD_TYPE" = "release" ]; then
    echo "🔢 Incrementing build number for release..."
    ./scripts/ios/increment-build-number.sh
fi

echo "✅ Pre-build complete"
EOF

    chmod +x "$PREBUILD_SCRIPT"
    echo -e "${GREEN}✓ Created pre-build script: $PREBUILD_SCRIPT${NC}"
else
    echo -e "${GREEN}✓ Pre-build script already exists${NC}"
fi

echo ""
echo -e "${BLUE}📋 Project Configuration Summary${NC}"
echo "=================================="

cd ios
FINAL_SIGNING=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CODE_SIGN_STYLE | head -1 | cut -d= -f2 | xargs || echo "Unknown")
FINAL_TEAM=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep DEVELOPMENT_TEAM | head -1 | cut -d= -f2 | xargs || echo "Not set")
FINAL_BUNDLE=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep PRODUCT_BUNDLE_IDENTIFIER | head -1 | cut -d= -f2 | xargs || echo "Unknown")
FINAL_VERSION=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep MARKETING_VERSION | head -1 | cut -d= -f2 | xargs || echo "Unknown")
FINAL_BUILD=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CURRENT_PROJECT_VERSION | head -1 | cut -d= -f2 | xargs || echo "Unknown")

echo "Final configuration:"
echo "  • Bundle ID: $FINAL_BUNDLE"
echo "  • Code Sign Style: $FINAL_SIGNING"
echo "  • Development Team: ${FINAL_TEAM:-'Not set'}"
echo "  • Version: $FINAL_VERSION"
echo "  • Build: $FINAL_BUILD"
echo ""

cd ..

echo -e "${GREEN}🛠️  Available scripts:${NC}"
echo "  • ./scripts/ios/increment-build-number.sh"
echo "  • ./scripts/ios/sync-version-with-android.sh"
echo "  • ./scripts/ios/pre-build.sh [debug|release]"
echo ""

echo -e "${BLUE}💡 Next Steps:${NC}"
if [ "$FINAL_SIGNING" != "Automatic" ]; then
    echo "1. Set up automatic signing in Xcode (recommended)"
    echo "   • Open ios/ManyllaMobile.xcodeproj"
    echo "   • Select target → Signing & Capabilities"
    echo "   • Enable 'Automatically manage signing'"
    echo ""
fi

echo "2. Test the build process:"
echo "   • ./scripts/ios/validate-environment.sh"
echo "   • ./scripts/ios/build-ios.sh debug"
echo ""
echo "3. For releases:"
echo "   • ./scripts/ios/pre-build.sh release  # Auto-increment"
echo "   • ./scripts/ios/build-ios.sh release"
echo ""

echo -e "${GREEN}✅ iOS project configuration complete!${NC}"