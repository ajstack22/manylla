#!/bin/bash

# Manylla Google Play Store Preparation Script
# Generates all required assets and metadata for Play Store submission

set -e

echo "🏪 Preparing Manylla for Google Play Store..."

# Change to project root
cd "$(dirname "$0")/../.."

# Create Play Store assets directory
mkdir -p android/play-store-assets/screenshots
mkdir -p android/play-store-assets/graphics

echo "📋 Play Store Preparation Checklist"
echo "================================="
echo ""

# Check app configuration
echo "✅ App Configuration:"
APP_ID=$(grep 'applicationId' android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/')
VERSION_CODE=$(grep 'versionCode' android/app/build.gradle | sed 's/.*versionCode \([0-9]*\).*/\1/')
VERSION_NAME=$(grep 'versionName' android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/')

echo "   • App ID: $APP_ID"
echo "   • Version Code: $VERSION_CODE"
echo "   • Version Name: $VERSION_NAME"
echo ""

# Check keystore
echo "🔐 Release Signing:"
if [ -f "android/app/keystores/manylla-release-key.keystore" ]; then
    echo "   ✅ Release keystore exists"

    # Show keystore info
    keytool -list -v -keystore android/app/keystores/manylla-release-key.keystore -storepass manylla2025release | grep -A 5 "Alias name"
else
    echo "   ❌ Release keystore missing!"
    exit 1
fi
echo ""

# Check app icons
echo "📱 App Icons:"
ICON_SIZES=("mdpi" "hdpi" "xhdpi" "xxhdpi" "xxxhdpi")
for size in "${ICON_SIZES[@]}"; do
    if [ -f "android/app/src/main/res/mipmap-$size/ic_launcher.png" ]; then
        echo "   ✅ $size icon exists"
    else
        echo "   ❌ $size icon missing"
    fi
done
echo ""

# Check required Play Store assets
echo "🎨 Play Store Graphics (Required):"
echo "   📁 Location: android/play-store-assets/graphics/"
echo "   ⚠️  TODO: Create feature graphic (1024 x 500 px)"
echo "   ⚠️  TODO: Create app icon (512 x 512 px)"
echo ""

echo "📸 Screenshots (Required):"
echo "   📁 Location: android/play-store-assets/screenshots/"
echo "   ⚠️  TODO: Add phone screenshots (min 2, max 8)"
echo "   ⚠️  TODO: Add tablet screenshots (optional but recommended)"
echo ""

echo "📝 Store Listing Information (TODO):"
echo "   ⚠️  App title (max 50 characters)"
echo "   ⚠️  Short description (max 80 characters)"
echo "   ⚠️  Full description (max 4000 characters)"
echo "   ⚠️  App category"
echo "   ⚠️  Content rating"
echo "   ⚠️  Privacy policy URL"
echo "   ⚠️  App website (optional)"
echo ""

echo "🛡️  Content Compliance:"
echo "   ⚠️  Privacy policy (required for apps handling personal data)"
echo "   ⚠️  Target audience and content rating"
echo "   ⚠️  Data safety section"
echo "   ⚠️  App permissions justification"
echo ""

echo "🔧 Build Verification:"
if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    aab_size=$(ls -lh android/app/build/outputs/bundle/release/app-release.aab | awk '{print $5}')
    echo "   ✅ Release AAB ready ($aab_size)"
else
    echo "   ⚠️  Release AAB not built yet"
    echo "      Run: ./scripts/android/build-release.sh"
fi
echo ""

echo "📋 Next Steps:"
echo "1. Build release AAB: ./scripts/android/build-release.sh"
echo "2. Create Play Store graphics and screenshots"
echo "3. Set up Google Play Console account"
echo "4. Create app listing with metadata"
echo "5. Upload AAB file to Play Console"
echo "6. Complete store listing and content rating"
echo "7. Submit for review"
echo ""

echo "📚 References:"
echo "• Play Console: https://play.google.com/console/"
echo "• Asset requirements: https://support.google.com/googleplay/android-developer/answer/9866151"
echo "• Content policy: https://play.google.com/about/developer-content-policy/"