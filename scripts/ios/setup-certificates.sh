#!/bin/bash

# Manylla iOS Certificate Setup Script
# Manages certificates and provisioning profiles
# Created: 2025-01-14

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Setting up iOS Code Signing${NC}"
echo "================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ ERROR: iOS code signing only available on macOS${NC}"
    exit 1
fi

# Verify security command is available
if ! command -v security &> /dev/null; then
    echo -e "${RED}❌ ERROR: security command not found${NC}"
    echo "This script requires macOS Security framework"
    exit 1
fi

echo -e "${YELLOW}🔍 Checking current signing certificates...${NC}"
echo ""

# Check for existing signing identities
echo "Current signing certificates:"
SIGNING_CERTS=$(security find-identity -v -p codesigning 2>/dev/null | grep "iPhone" || echo "None found")
echo "$SIGNING_CERTS"
echo ""

# Count certificates
CERT_COUNT=$(security find-identity -v -p codesigning 2>/dev/null | grep -c "iPhone" || echo "0")
# Ensure CERT_COUNT is a number
CERT_COUNT=${CERT_COUNT//[^0-9]/}
[ -z "$CERT_COUNT" ] && CERT_COUNT=0

if [ "$CERT_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No iPhone signing certificates found${NC}"
    echo ""
    echo "You need to set up Apple Developer certificates:"
    echo ""
    echo "1. Join Apple Developer Program:"
    echo "   https://developer.apple.com/programs/"
    echo ""
    echo "2. Create certificates in Apple Developer Console:"
    echo "   a) Go to: https://developer.apple.com/account/resources/certificates/list"
    echo "   b) Click '+' to create new certificate"
    echo "   c) Choose 'iOS Development' or 'iOS Distribution'"
    echo "   d) Follow the Certificate Signing Request (CSR) process"
    echo ""
    echo "3. Download and install certificates:"
    echo "   a) Download .cer file from Apple Developer"
    echo "   b) Double-click to install in Keychain Access"
    echo "   c) Make sure private key is also in keychain"
    echo ""
    echo "4. Re-run this script after installing certificates"
    echo ""
else
    echo -e "${GREEN}✅ Found $CERT_COUNT signing certificate(s)${NC}"
    echo ""
fi

# Check provisioning profiles
echo -e "${YELLOW}📱 Checking provisioning profiles...${NC}"
echo ""

PROFILES_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PROFILES_DIR" ]; then
    PROFILE_COUNT=$(ls "$PROFILES_DIR"/*.mobileprovision 2>/dev/null | wc -l || echo "0")
    echo "Provisioning profiles directory: $PROFILES_DIR"
    echo "Profile count: $PROFILE_COUNT"

    if [ "$PROFILE_COUNT" -gt 0 ]; then
        echo ""
        echo "Recent profiles:"
        ls -lt "$PROFILES_DIR"/*.mobileprovision 2>/dev/null | head -5 | while read -r line; do
            # Extract filename and date
            filename=$(echo "$line" | awk '{print $NF}' | xargs basename)
            modified=$(echo "$line" | awk '{print $6, $7, $8}')
            echo "  • $filename (modified: $modified)"
        done
        echo ""
        echo -e "${GREEN}✅ Provisioning profiles found${NC}"
    else
        echo -e "${YELLOW}⚠️  No provisioning profiles found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Provisioning profiles directory doesn't exist${NC}"
fi

echo ""
echo -e "${YELLOW}🛠️  Configuring Xcode project signing...${NC}"
echo ""

cd ios

# Check current bundle identifier
CURRENT_BUNDLE_ID=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep -E "^\s*PRODUCT_BUNDLE_IDENTIFIER" | head -1 | cut -d= -f2 | xargs)
echo "Current bundle ID: $CURRENT_BUNDLE_ID"

# Check if we need to update bundle ID
TARGET_BUNDLE_ID="com.manylla.mobile"
if [ "$CURRENT_BUNDLE_ID" != "$TARGET_BUNDLE_ID" ]; then
    echo -e "${YELLOW}⚠️  Bundle ID needs updating from '$CURRENT_BUNDLE_ID' to '$TARGET_BUNDLE_ID'${NC}"
    echo "This will be handled in project configuration phase"
else
    echo -e "${GREEN}✅ Bundle ID already correct: $TARGET_BUNDLE_ID${NC}"
fi

# Check current signing configuration
echo ""
echo "Current signing settings:"
SIGNING_STYLE=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CODE_SIGN_STYLE | head -1 | cut -d= -f2 | xargs)
DEVELOPMENT_TEAM=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep DEVELOPMENT_TEAM | head -1 | cut -d= -f2 | xargs)

echo "  Code signing style: $SIGNING_STYLE"
echo "  Development team: ${DEVELOPMENT_TEAM:-'Not set'}"

cd ..

echo ""
echo -e "${YELLOW}🔧 Recommendations:${NC}"
echo ""

if [ "$CERT_COUNT" -eq 0 ]; then
    echo -e "${RED}REQUIRED: Install Apple Developer certificates${NC}"
    echo "  1. Join Apple Developer Program"
    echo "  2. Create and download certificates"
    echo "  3. Install certificates in Keychain Access"
    echo ""
fi

if [ "$SIGNING_STYLE" != "Automatic" ]; then
    echo -e "${YELLOW}RECOMMENDED: Use automatic code signing${NC}"
    echo "  • Easier to manage"
    echo "  • Handles provisioning profiles automatically"
    echo "  • Better for team development"
    echo ""
fi

if [ -z "$DEVELOPMENT_TEAM" ] || [ "$DEVELOPMENT_TEAM" = "Not set" ]; then
    echo -e "${YELLOW}REQUIRED: Set development team ID${NC}"
    echo "  • Find your Team ID in Apple Developer Console"
    echo "  • Update Xcode project with Team ID"
    echo "  • Enables automatic provisioning"
    echo ""
fi

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""

if [ "$CERT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Certificates available - ready for development builds${NC}"
    echo ""
    echo "For distribution builds, you'll also need:"
    echo "  • Apple Distribution certificate"
    echo "  • App Store provisioning profile"
    echo ""
    echo "Commands to test signing:"
    echo "  1. Build debug: ./scripts/ios/build-ios.sh debug"
    echo "  2. Test on simulator: ./scripts/ios/run-ios.sh"
    echo "  3. Build release: ./scripts/ios/build-ios.sh release"
else
    echo -e "${RED}❌ Certificates required before building${NC}"
    echo ""
    echo "Setup process:"
    echo "  1. Complete Apple Developer Program enrollment"
    echo "  2. Create development certificates"
    echo "  3. Re-run: ./scripts/ios/setup-certificates.sh"
    echo "  4. Update Xcode project: ./scripts/ios/configure-project.sh"
fi

echo ""
echo -e "${BLUE}📚 Useful Resources:${NC}"
echo "• Apple Developer: https://developer.apple.com/"
echo "• Certificate Guide: https://developer.apple.com/help/account/create-certificates/"
echo "• Code Signing Guide: https://developer.apple.com/documentation/xcode/setting-up-your-xcode-project-for-distribution"
echo "• Provisioning Profiles: https://developer.apple.com/help/account/manage-profiles/"

echo ""
echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo "• Use 'Automatically manage signing' in Xcode for easier setup"
echo "• Keep certificates backed up in Keychain Access"
echo "• Development certificates expire after 1 year"
echo "• Distribution certificates expire after 2 years"
echo "• You can have multiple certificates for different purposes"

echo ""
echo "Certificate setup review completed."