#!/bin/bash

# Manylla App Store Preparation Script
# Validates all App Store requirements and generates submission checklist
# Created: 2025-01-14

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏪 Preparing Manylla for App Store...${NC}"
echo "====================================="

# Change to project root
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"
echo ""

# Create App Store assets directory
mkdir -p ios/app-store-assets/screenshots
mkdir -p ios/app-store-assets/graphics
mkdir -p ios/app-store-assets/metadata

echo -e "${YELLOW}📋 App Store Preparation Checklist${NC}"
echo "======================================"
echo ""

# Check app configuration
echo -e "${BLUE}✅ App Configuration:${NC}"
cd ios

# Get app information from Xcode project
BUNDLE_ID=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep -E "^\s*PRODUCT_BUNDLE_IDENTIFIER" | head -1 | cut -d= -f2 | xargs || echo "Unknown")
VERSION=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep MARKETING_VERSION | head -1 | cut -d= -f2 | xargs || echo "Unknown")
BUILD_NUM=$(xcodebuild -showBuildSettings -project ManyllaMobile.xcodeproj 2>/dev/null | grep CURRENT_PROJECT_VERSION | head -1 | cut -d= -f2 | xargs || echo "Unknown")

echo "   • Bundle ID: $BUNDLE_ID"
echo "   • Version: $VERSION"
echo "   • Build Number: $BUILD_NUM"

# Validate bundle ID
if [ "$BUNDLE_ID" = "com.manylla.mobile" ]; then
    echo -e "   ${GREEN}✓ Bundle ID correctly set for Manylla${NC}"
else
    echo -e "   ${RED}✗ Bundle ID incorrect (expected: com.manylla.mobile)${NC}"
fi

# Validate version sync with Android
ANDROID_VERSION=$(grep 'versionName' ../android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/' || echo "Unknown")
if [ "$VERSION" = "$ANDROID_VERSION" ]; then
    echo -e "   ${GREEN}✓ Version synced with Android ($ANDROID_VERSION)${NC}"
else
    echo -e "   ${YELLOW}⚠ Version mismatch - iOS: $VERSION, Android: $ANDROID_VERSION${NC}"
fi

echo ""

# Check app icons
echo -e "${BLUE}🎨 App Icons:${NC}"
ICON_FOUND=false

# Check for app icon in Images.xcassets
if [ -d "ManyllaMobile/Images.xcassets/AppIcon.appiconset" ]; then
    ICON_COUNT=$(ls ManyllaMobile/Images.xcassets/AppIcon.appiconset/*.png 2>/dev/null | wc -l || echo "0")
    if [ "$ICON_COUNT" -gt 0 ]; then
        echo -e "   ${GREEN}✓ Found $ICON_COUNT app icon files in xcassets${NC}"
        ICON_FOUND=true

        # Check for required icon sizes
        REQUIRED_SIZES=("20x20" "29x29" "40x40" "60x60" "76x76" "83.5x83.5" "1024x1024")
        for size in "${REQUIRED_SIZES[@]}"; do
            if ls ManyllaMobile/Images.xcassets/AppIcon.appiconset/*"$size"* >/dev/null 2>&1; then
                echo -e "   ${GREEN}✓ $size icon found${NC}"
            else
                echo -e "   ${YELLOW}⚠ $size icon missing${NC}"
            fi
        done
    else
        echo -e "   ${YELLOW}⚠ AppIcon.appiconset exists but no PNG files found${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠ AppIcon.appiconset not found in Images.xcassets${NC}"
fi

if [ "$ICON_FOUND" = false ]; then
    echo -e "   ${RED}✗ App icons need to be created${NC}"
    echo "   📁 Location: ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset/"
fi

echo ""

# Check privacy and compliance
echo -e "${BLUE}🛡️ Privacy & Compliance:${NC}"

# Check privacy manifest
if [ -f "ManyllaMobile/PrivacyInfo.xcprivacy" ]; then
    echo -e "   ${GREEN}✓ Privacy manifest exists${NC}"

    # Validate privacy manifest format
    if plutil -lint ManyllaMobile/PrivacyInfo.xcprivacy >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Privacy manifest format valid${NC}"
    else
        echo -e "   ${RED}✗ Privacy manifest format invalid${NC}"
    fi

    # Check for health data disclosure
    if grep -q "NSPrivacyCollectedDataTypeHealthAndFitness" ManyllaMobile/PrivacyInfo.xcprivacy; then
        echo -e "   ${GREEN}✓ Health data collection disclosed${NC}"
    else
        echo -e "   ${YELLOW}⚠ Health data collection not disclosed${NC}"
    fi
else
    echo -e "   ${RED}✗ Privacy manifest missing${NC}"
fi

# Check Info.plist compliance
if [ -f "ManyllaMobile/Info.plist" ]; then
    echo -e "   ${GREEN}✓ Info.plist exists${NC}"

    # Check app category
    if /usr/libexec/PlistBuddy -c "Print :LSApplicationCategoryType" ManyllaMobile/Info.plist >/dev/null 2>&1; then
        CATEGORY=$(/usr/libexec/PlistBuddy -c "Print :LSApplicationCategoryType" ManyllaMobile/Info.plist)
        echo -e "   ${GREEN}✓ App category set: $CATEGORY${NC}"
    else
        echo -e "   ${YELLOW}⚠ App category not set${NC}"
    fi

    # Check encryption declaration
    if /usr/libexec/PlistBuddy -c "Print :ITSAppUsesNonExemptEncryption" ManyllaMobile/Info.plist >/dev/null 2>&1; then
        ENCRYPTION=$(/usr/libexec/PlistBuddy -c "Print :ITSAppUsesNonExemptEncryption" ManyllaMobile/Info.plist)
        echo -e "   ${GREEN}✓ Encryption declaration: $ENCRYPTION${NC}"
    else
        echo -e "   ${YELLOW}⚠ Encryption declaration missing${NC}"
    fi

    # Check usage descriptions
    CAMERA_DESC=$(/usr/libexec/PlistBuddy -c "Print :NSCameraUsageDescription" ManyllaMobile/Info.plist 2>/dev/null || echo "")
    PHOTO_DESC=$(/usr/libexec/PlistBuddy -c "Print :NSPhotoLibraryUsageDescription" ManyllaMobile/Info.plist 2>/dev/null || echo "")

    if [ -n "$CAMERA_DESC" ]; then
        echo -e "   ${GREEN}✓ Camera usage description provided${NC}"
    else
        echo -e "   ${RED}✗ Camera usage description missing${NC}"
    fi

    if [ -n "$PHOTO_DESC" ]; then
        echo -e "   ${GREEN}✓ Photo library usage description provided${NC}"
    else
        echo -e "   ${RED}✗ Photo library usage description missing${NC}"
    fi
fi

echo ""

# Check build artifacts
echo -e "${BLUE}🔧 Build Verification:${NC}"

# Check for release IPA
if [ -f "build/ManyllaMobile.ipa" ]; then
    IPA_SIZE=$(ls -lh build/ManyllaMobile.ipa | awk '{print $5}')
    echo -e "   ${GREEN}✓ Release IPA ready ($IPA_SIZE)${NC}"
    echo "   📍 Location: ios/build/ManyllaMobile.ipa"

    # Validate IPA signing
    echo "   🔐 Validating IPA signature..."
    if codesign -dv --verbose=4 build/ManyllaMobile.ipa 2>/dev/null | grep -q "Authority"; then
        AUTHORITY=$(codesign -dv --verbose=4 build/ManyllaMobile.ipa 2>&1 | grep "Authority" | head -1)
        echo -e "   ${GREEN}✓ IPA properly signed${NC}"
        echo "   🏷️  $AUTHORITY"
    else
        echo -e "   ${YELLOW}⚠ Unable to verify IPA signature${NC}"
    fi

    # Check IPA size limits (App Store limit is 4GB, but recommend < 200MB)
    IPA_SIZE_MB=$(du -m build/ManyllaMobile.ipa | cut -f1)
    if [ "$IPA_SIZE_MB" -lt 200 ]; then
        echo -e "   ${GREEN}✓ IPA size acceptable ($IPA_SIZE_MB MB)${NC}"
    elif [ "$IPA_SIZE_MB" -lt 500 ]; then
        echo -e "   ${YELLOW}⚠ IPA size large ($IPA_SIZE_MB MB) - consider optimization${NC}"
    else
        echo -e "   ${RED}✗ IPA size too large ($IPA_SIZE_MB MB)${NC}"
    fi
else
    echo -e "   ${RED}✗ Release IPA not built${NC}"
    echo "   📝 Run: ./scripts/ios/build-ios.sh release"
fi

cd ..

echo ""

# Check App Store assets
echo -e "${BLUE}🎨 App Store Assets Required:${NC}"
echo "   📁 Location: ios/app-store-assets/"
echo ""

# Screenshots
echo "📸 Screenshots (Required):"
if [ -d "ios/app-store-assets/screenshots" ]; then
    SCREENSHOT_COUNT=$(ls ios/app-store-assets/screenshots/*.png 2>/dev/null | wc -l || echo "0")
    if [ "$SCREENSHOT_COUNT" -gt 0 ]; then
        echo -e "   ${GREEN}✓ Found $SCREENSHOT_COUNT screenshot(s)${NC}"
    else
        echo -e "   ${YELLOW}⚠ No screenshots found${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠ Screenshots directory missing${NC}"
fi

echo "   📱 iPhone screenshots needed:"
echo "      • 6.7\" (iPhone 15 Pro Max): 1290x2796"
echo "      • 6.5\" (iPhone 14 Plus): 1242x2688"
echo "      • 5.5\" (iPhone 8 Plus): 1242x2208"
echo "   📱 iPad screenshots (recommended):"
echo "      • 12.9\" (iPad Pro): 2048x2732"
echo "      • 11\" (iPad Pro): 1668x2388"

echo ""

# Graphics
echo "🎨 Graphics (Required):"
echo -e "   ${YELLOW}⚠ TODO: App Store graphics${NC}"
echo "      • App icon: 1024x1024 (PNG, no transparency)"
echo "      • No feature graphic required (unlike Google Play)"

echo ""

# Metadata
echo -e "${BLUE}📝 App Store Metadata:${NC}"
echo ""

# Generate sample metadata
METADATA_FILE="ios/app-store-assets/metadata/app-store-listing.txt"
if [ ! -f "$METADATA_FILE" ]; then
    echo "Creating sample metadata file..."
    cat > "$METADATA_FILE" << 'EOF'
# Manylla App Store Listing

## App Name (max 30 characters)
Manylla

## Subtitle (max 30 characters)
Special Needs Medical Info

## Keywords (max 100 characters, comma-separated)
special needs,medical,autism,ADHD,therapy,IEP,504 plan,medical records,healthcare,family

## Description (max 4000 characters)
Manylla is a secure, zero-knowledge encrypted app designed specifically for families managing special needs medical information. Keep track of medical history, therapy progress, IEP/504 plans, and important medical documents all in one place.

Key Features:
• Zero-knowledge encryption - your data stays completely private
• Medical history tracking for appointments and treatments
• Therapy session notes and progress documentation
• IEP and 504 plan management with easy access
• Secure photo storage for medical documents and forms
• Multi-device sync using encrypted recovery phrases
• Print-friendly reports for medical appointments
• No cloud storage - all data encrypted locally on your device

Perfect for parents and caregivers of children with autism spectrum disorders, ADHD, learning disabilities, developmental delays, and other special needs conditions.

Privacy First: Manylla uses military-grade encryption to protect your family's sensitive medical information. Your data never leaves your device unencrypted, and we never have access to your personal information.

## Privacy Policy URL
https://manylla.com/privacy

## Support URL
https://manylla.com/support

## Marketing URL (optional)
https://manylla.com

## Category
Medical

## Content Rating
4+ (Ages 4 and up)

## What's New in This Version
Initial release of Manylla for iOS. Includes full medical information management with zero-knowledge encryption, photo storage, and cross-device sync capabilities.
EOF

    echo -e "   ${GREEN}✓ Created sample metadata: $METADATA_FILE${NC}"
else
    echo -e "   ${GREEN}✓ Metadata file exists: $METADATA_FILE${NC}"
fi

echo ""
echo -e "   ${YELLOW}📝 Review and customize the metadata file before submission${NC}"

echo ""
echo -e "${BLUE}📋 App Store Connect Setup:${NC}"
echo ""
echo "1. Create app in App Store Connect:"
echo "   • https://appstoreconnect.apple.com"
echo "   • Bundle ID: com.manylla.mobile"
echo "   • App Name: Manylla"
echo "   • Category: Medical"
echo ""
echo "2. Upload build:"
echo "   • Use Xcode Organizer or Transporter app"
echo "   • Upload ios/build/ManyllaMobile.ipa"
echo "   • Wait for processing (can take hours)"
echo ""
echo "3. Complete app information:"
echo "   • Copy metadata from $METADATA_FILE"
echo "   • Upload screenshots and app icon"
echo "   • Set age rating (4+)"
echo "   • Configure privacy settings"
echo ""

echo -e "${BLUE}📋 Next Steps Summary:${NC}"
echo "=========================="

READY_COUNT=0
TOTAL_ITEMS=8

echo -n "1. Bundle ID configured: "
[ "$BUNDLE_ID" = "com.manylla.mobile" ] && echo -e "${GREEN}✓${NC}" && ((READY_COUNT++)) || echo -e "${RED}✗${NC}"

echo -n "2. Version numbers synced: "
[ "$VERSION" = "$ANDROID_VERSION" ] && echo -e "${GREEN}✓${NC}" && ((READY_COUNT++)) || echo -e "${YELLOW}△${NC}"

echo -n "3. App icons created: "
[ "$ICON_FOUND" = true ] && echo -e "${GREEN}✓${NC}" && ((READY_COUNT++)) || echo -e "${RED}✗${NC}"

echo -n "4. Privacy manifest complete: "
[ -f "ios/ManyllaMobile/PrivacyInfo.xcprivacy" ] && echo -e "${GREEN}✓${NC}" && ((READY_COUNT++)) || echo -e "${RED}✗${NC}"

echo -n "5. Release IPA built: "
[ -f "ios/build/ManyllaMobile.ipa" ] && echo -e "${GREEN}✓${NC}" && ((READY_COUNT++)) || echo -e "${RED}✗${NC}"

echo -n "6. Screenshots captured: "
[ "$SCREENSHOT_COUNT" -gt 0 ] && echo -e "${GREEN}✓${NC}" && ((READY_COUNT++)) || echo -e "${RED}✗${NC}"

echo -n "7. App Store graphics: "
echo -e "${YELLOW}TODO${NC}"

echo -n "8. Metadata prepared: "
[ -f "$METADATA_FILE" ] && echo -e "${GREEN}✓${NC}" && ((READY_COUNT++)) || echo -e "${RED}✗${NC}"

echo ""
echo -e "${BLUE}Readiness: $READY_COUNT/$TOTAL_ITEMS items complete${NC}"

if [ "$READY_COUNT" -eq "$TOTAL_ITEMS" ]; then
    echo -e "${GREEN}🎉 Ready for App Store submission!${NC}"
elif [ "$READY_COUNT" -ge 5 ]; then
    echo -e "${YELLOW}⚠️  Almost ready - complete remaining items${NC}"
else
    echo -e "${RED}❌ More preparation needed before submission${NC}"
fi

echo ""
echo -e "${BLUE}📚 Helpful Resources:${NC}"
echo "• App Store Connect: https://appstoreconnect.apple.com"
echo "• Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/"
echo "• App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/"
echo "• App Store Screenshot Specifications: https://help.apple.com/app-store-connect/#/devd274dd925"