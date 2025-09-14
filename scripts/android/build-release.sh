#!/bin/bash

# Manylla Android Release Build Script
# Creates a signed release APK/AAB for Google Play Store

set -e

echo "🚀 Starting Manylla Android Release Build..."

# Change to project root
cd "$(dirname "$0")/../.."

# Verify we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    echo "❌ Error: Not in Manylla project root directory"
    exit 1
fi

# SECURITY: Verify release keystore exists
if [ ! -f "android/app/keystores/manylla-release-key.keystore" ]; then
    echo "❌ SECURITY ERROR: Release keystore not found!"
    echo "Expected location: android/app/keystores/manylla-release-key.keystore"
    echo "Refer to ANDROID_SECURITY.md for setup instructions"
    exit 1
fi

# SECURITY: Verify secure passwords are configured
if [ ! -f "$HOME/.gradle/gradle.properties" ]; then
    echo "❌ SECURITY ERROR: Secure gradle.properties not found!"
    echo "Expected location: ~/.gradle/gradle.properties"
    echo "This file must contain MANYLLA_RELEASE_STORE_PASSWORD and MANYLLA_RELEASE_KEY_PASSWORD"
    echo "Refer to ANDROID_SECURITY.md for secure credential setup"
    exit 1
fi

# SECURITY: Verify passwords are not the old weak ones
if grep -q "manylla2025release" "$HOME/.gradle/gradle.properties" 2>/dev/null; then
    echo "❌ SECURITY ERROR: Weak passwords detected!"
    echo "The old weak password 'manylla2025release' is still in use"
    echo "Generate cryptographically strong passwords as per ANDROID_SECURITY.md"
    exit 1
fi

echo "✅ Security checks passed - using secure keystore credentials"

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Run linting and type checks
echo "🔍 Running code quality checks..."
npm run lint --silent || echo "⚠️ Linting warnings found"

# Clean previous build
echo "🧹 Cleaning previous build..."
cd android
./gradlew clean

# Generate release APK
echo "🔨 Building release APK..."
./gradlew assembleRelease

# Generate release AAB (App Bundle) - disable ABI splits for bundle
echo "📦 Building release AAB (App Bundle)..."
./gradlew -PdisableAbiSplit=true bundleRelease

# Verify builds
echo "✅ Verifying build outputs..."

APK_PATH="app/build/outputs/apk/release"
AAB_PATH="app/build/outputs/bundle/release"

# Check APK files (split by ABI)
if [ -f "$APK_PATH/app-arm64-v8a-release.apk" ] && [ -f "$APK_PATH/app-armeabi-v7a-release.apk" ]; then
    echo "📱 Release APKs created successfully:"

    arm64_size=$(ls -lh $APK_PATH/app-arm64-v8a-release.apk | awk '{print $5}')
    armv7_size=$(ls -lh $APK_PATH/app-armeabi-v7a-release.apk | awk '{print $5}')

    echo "   • ARM64 APK: $arm64_size"
    echo "   • ARMv7 APK: $armv7_size"
else
    echo "❌ Release APK build failed!"
    exit 1
fi

# Check AAB
if [ -f "$AAB_PATH/app-release.aab" ]; then
    aab_size=$(ls -lh $AAB_PATH/app-release.aab | awk '{print $5}')
    echo "📦 Release AAB created successfully: $aab_size"
else
    echo "❌ Release AAB build failed!"
    exit 1
fi

# Show final summary
echo ""
echo "🎉 Release build completed successfully!"
echo "📁 Build outputs:"
echo "   • APKs: android/$APK_PATH/"
echo "   • AAB:  android/$AAB_PATH/app-release.aab"
echo ""
echo "📋 Next steps for Google Play Store:"
echo "   1. Upload android/$AAB_PATH/app-release.aab to Play Console"
echo "   2. Complete store listing with screenshots and descriptions"
echo "   3. Submit for review"