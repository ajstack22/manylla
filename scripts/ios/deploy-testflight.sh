#!/bin/bash

# Manylla TestFlight Deployment Script
# Uploads IPA to TestFlight for beta testing
# Created: 2025-01-14

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Manylla to TestFlight${NC}"
echo "=================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ ERROR: TestFlight deployment only available on macOS${NC}"
    exit 1
fi

# Validate required environment variables or prompt for them
echo -e "${YELLOW}📋 Checking deployment credentials...${NC}"

# Check for App Store Connect credentials
if [ -z "$APP_STORE_USERNAME" ]; then
    echo -e "${YELLOW}⚠️  APP_STORE_USERNAME not set${NC}"
    echo "Set it with: export APP_STORE_USERNAME=\"your-apple-id@email.com\""
    echo ""
fi

if [ -z "$APP_STORE_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  APP_STORE_PASSWORD not set${NC}"
    echo "For security, use an App-Specific Password:"
    echo "1. Go to https://appleid.apple.com/account/manage"
    echo "2. Generate App-Specific Password for 'TestFlight Upload'"
    echo "3. Set it with: export APP_STORE_PASSWORD=\"app-specific-password\""
    echo ""
fi

# Check if we have App Store Connect API key (alternative to username/password)
API_KEY_PATH="$HOME/.appstoreconnect/private_keys"
API_KEY_ID=""
ISSUER_ID=""

if [ -d "$API_KEY_PATH" ]; then
    API_KEYS=$(ls "$API_KEY_PATH"/*.p8 2>/dev/null | wc -l || echo "0")
    if [ "$API_KEYS" -gt 0 ]; then
        echo -e "${GREEN}✓ Found $API_KEYS App Store Connect API key(s)${NC}"
        API_KEY_FILE=$(ls "$API_KEY_PATH"/*.p8 2>/dev/null | head -1)
        API_KEY_ID=$(basename "$API_KEY_FILE" .p8)
        echo "Using API Key: $API_KEY_ID"

        # For production use, you would set ISSUER_ID from your App Store Connect account
        if [ -n "$APP_STORE_CONNECT_ISSUER_ID" ]; then
            ISSUER_ID="$APP_STORE_CONNECT_ISSUER_ID"
        else
            echo -e "${YELLOW}⚠️  APP_STORE_CONNECT_ISSUER_ID not set${NC}"
            echo "Find it in App Store Connect > Users and Access > Keys > Issuer ID"
        fi
    else
        echo -e "${YELLOW}⚠️  No API keys found in $API_KEY_PATH${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  App Store Connect API keys directory not found${NC}"
fi

echo ""

# Validate IPA exists and is recent
echo -e "${YELLOW}📱 Validating release build...${NC}"

IPA_PATH="ios/build/ManyllaMobile.ipa"
if [ ! -f "$IPA_PATH" ]; then
    echo -e "${RED}❌ No IPA file found at $IPA_PATH${NC}"
    echo ""
    echo "Build the release IPA first:"
    echo "  ./scripts/ios/build-ios.sh release"
    echo ""
    exit 1
fi

# Check IPA age (warn if older than 1 day)
if [ -n "$(find "$IPA_PATH" -mtime +1 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠️  IPA is more than 1 day old${NC}"
    echo "Consider rebuilding for latest changes:"
    echo "  ./scripts/ios/build-ios.sh release"
    echo ""
    read -p "Continue with existing IPA? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

IPA_SIZE=$(ls -lh "$IPA_PATH" | awk '{print $5}')
echo -e "${GREEN}✓ IPA found: $IPA_SIZE${NC}"
echo "   📍 $IPA_PATH"

# Validate IPA signature
echo ""
echo -e "${YELLOW}🔐 Validating IPA signature...${NC}"

if codesign -dv --verbose=4 "$IPA_PATH" >/dev/null 2>&1; then
    SIGNING_INFO=$(codesign -dv --verbose=4 "$IPA_PATH" 2>&1)

    if echo "$SIGNING_INFO" | grep -q "Authority=Apple Distribution"; then
        echo -e "${GREEN}✓ IPA signed with Apple Distribution certificate${NC}"
        TEAM_ID=$(echo "$SIGNING_INFO" | grep "TeamIdentifier" | cut -d= -f2)
        [ -n "$TEAM_ID" ] && echo "   Team ID: $TEAM_ID"
    else
        echo -e "${YELLOW}⚠️  IPA not signed with Distribution certificate${NC}"
        echo "   This may be a development build"
        echo "   For TestFlight, you need a Distribution-signed IPA"
        echo ""
        echo "To fix:"
        echo "1. Ensure you have Apple Distribution certificate"
        echo "2. Set signing to 'Automatic' in Xcode"
        echo "3. Rebuild: ./scripts/ios/build-ios.sh release"
        echo ""
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo -e "${RED}❌ Unable to validate IPA signature${NC}"
    echo "IPA may be corrupted or invalid"
    exit 1
fi

# Get app information
echo ""
echo -e "${YELLOW}📋 App information:${NC}"

cd ios
BUNDLE_ID=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep PRODUCT_BUNDLE_IDENTIFIER | head -1 | cut -d= -f2 | xargs)
VERSION=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep MARKETING_VERSION | head -1 | cut -d= -f2 | xargs)
BUILD_NUM=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CURRENT_PROJECT_VERSION | head -1 | cut -d= -f2 | xargs)

echo "   • Bundle ID: $BUNDLE_ID"
echo "   • Version: $VERSION"
echo "   • Build: $BUILD_NUM"

cd ..

# Prompt for release notes
echo ""
echo -e "${YELLOW}📝 Release notes for TestFlight:${NC}"

RELEASE_NOTES_FILE="/tmp/manylla-testflight-notes.txt"
if [ ! -f "$RELEASE_NOTES_FILE" ]; then
    cat > "$RELEASE_NOTES_FILE" << EOF
Manylla iOS Beta - Version $VERSION

What's new in this build:
• iOS deployment and App Store setup complete
• All core features available: medical tracking, photo upload, sync
• Zero-knowledge encryption for medical data privacy
• Cross-device sync with recovery phrases
• Print-friendly reports for medical appointments

Test focus areas:
• Profile creation and medical information entry
• Photo upload and secure storage
• Sync functionality with recovery phrases
• Export and print features
• Overall app stability and performance

Known issues:
• None currently identified

Please report any bugs or feedback through TestFlight.
EOF
fi

echo "Release notes preview:"
echo "----------------------"
cat "$RELEASE_NOTES_FILE"
echo "----------------------"
echo ""

read -p "Edit release notes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} "$RELEASE_NOTES_FILE"
fi

# Choose upload method
echo ""
echo -e "${YELLOW}🚀 Choose upload method:${NC}"
echo "1. altool (command line - requires credentials)"
echo "2. Xcode Organizer (manual)"
echo "3. Transporter app (manual)"
echo ""

read -p "Select method (1-3): " -n 1 -r UPLOAD_METHOD
echo

case $UPLOAD_METHOD in
    1)
        echo -e "${BLUE}Using altool for automated upload...${NC}"
        echo ""

        # Check if we have credentials
        if [ -n "$API_KEY_ID" ] && [ -n "$ISSUER_ID" ]; then
            echo "Using App Store Connect API key authentication"
            UPLOAD_CMD="xcrun altool --upload-app --type ios --file \"$PROJECT_ROOT/$IPA_PATH\" --apiKey \"$API_KEY_ID\" --apiIssuer \"$ISSUER_ID\""
        elif [ -n "$APP_STORE_USERNAME" ] && [ -n "$APP_STORE_PASSWORD" ]; then
            echo "Using App Store Connect username/password authentication"
            UPLOAD_CMD="xcrun altool --upload-app --type ios --file \"$PROJECT_ROOT/$IPA_PATH\" --username \"$APP_STORE_USERNAME\" --password \"$APP_STORE_PASSWORD\""
        else
            echo -e "${RED}❌ Missing authentication credentials${NC}"
            echo ""
            echo "Set one of:"
            echo "• App Store Connect API key (recommended)"
            echo "• APP_STORE_USERNAME and APP_STORE_PASSWORD"
            echo ""
            exit 1
        fi

        echo "Upload command:"
        echo "$UPLOAD_CMD"
        echo ""

        read -p "Proceed with upload? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Uploading to App Store Connect...${NC}"
            echo "This may take several minutes..."
            echo ""

            if eval "$UPLOAD_CMD"; then
                echo ""
                echo -e "${GREEN}✅ Successfully uploaded to TestFlight!${NC}"
                echo ""
                echo "Next steps:"
                echo "1. Check App Store Connect for processing status"
                echo "2. Processing can take 15 minutes to several hours"
                echo "3. Add release notes in TestFlight tab"
                echo "4. Add beta testers and groups"
                echo "5. Submit for beta review (if required)"
                echo ""
                echo -e "${BLUE}📱 App Store Connect TestFlight:${NC}"
                echo "https://appstoreconnect.apple.com/apps/$BUNDLE_ID/testflight"
            else
                echo -e "${RED}❌ Upload failed${NC}"
                echo ""
                echo "Common issues:"
                echo "• Check internet connection"
                echo "• Verify credentials are correct"
                echo "• Ensure IPA is properly signed"
                echo "• Check if build number already exists"
                echo "• Try again after a few minutes"
                exit 1
            fi
        else
            echo "Upload cancelled"
            exit 0
        fi
        ;;

    2)
        echo -e "${BLUE}Using Xcode Organizer...${NC}"
        echo ""
        echo "Manual steps:"
        echo "1. Open Xcode"
        echo "2. Go to Window > Organizer"
        echo "3. Select 'Archives' tab"
        echo "4. Find ManyllaMobile archive"
        echo "5. Click 'Distribute App'"
        echo "6. Choose 'App Store Connect'"
        echo "7. Choose 'Upload'"
        echo "8. Follow the wizard"
        echo ""
        echo "Archive location: ios/build/ManyllaMobile.xcarchive"

        # Try to open Xcode Organizer
        if command -v xed >/dev/null 2>&1; then
            read -p "Open Xcode Organizer now? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                open -a Xcode
                # The organizer doesn't have a direct command, user needs to navigate
            fi
        fi
        ;;

    3)
        echo -e "${BLUE}Using Transporter app...${NC}"
        echo ""
        echo "Manual steps:"
        echo "1. Download Transporter from Mac App Store"
        echo "2. Sign in with your Apple ID"
        echo "3. Drag and drop IPA file: $IPA_PATH"
        echo "4. Click 'Deliver'"
        echo "5. Wait for upload completion"
        echo ""

        # Try to open Transporter
        if [ -d "/Applications/Transporter.app" ]; then
            read -p "Open Transporter app now? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                open -a Transporter
            fi
        else
            echo "Transporter app not found. Download from Mac App Store:"
            echo "https://apps.apple.com/app/transporter/id1450874784"
        fi
        ;;

    *)
        echo -e "${RED}❌ Invalid selection${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo "======================"
echo "App: $BUNDLE_ID"
echo "Version: $VERSION ($BUILD_NUM)"
echo "IPA: $IPA_PATH ($IPA_SIZE)"
echo "Method: $(case $UPLOAD_METHOD in 1) altool;; 2) Xcode;; 3) Transporter;; esac)"
echo ""
echo -e "${GREEN}🎉 TestFlight deployment process complete!${NC}"

# Cleanup
rm -f "$RELEASE_NOTES_FILE" 2>/dev/null || true

echo ""
echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo "• Add meaningful release notes for each build"
echo "• Create beta groups for different types of testers"
echo "• Use automatic distribution to save time"
echo "• Monitor crash reports and feedback"
echo "• TestFlight builds expire after 90 days"