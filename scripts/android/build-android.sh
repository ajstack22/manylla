#!/bin/bash

# Manylla Android Build Script
# Creates production APK/AAB files
# Created: 2025-09-11

echo "🏗️  Building Manylla for Android"
echo "================================"

# Force Java 17 for Android builds
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Set Android environment
export ANDROID_HOME=/Users/adamstack/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "Using Java version:"
java -version 2>&1 | head -1

# Verify Java 17
if ! java -version 2>&1 | grep -q "version \"17"; then
    echo "❌ ERROR: Java 17 is required"
    exit 1
fi

BUILD_TYPE=${1:-debug}

echo ""
echo "Build type: $BUILD_TYPE"
echo ""

cd android || exit 1

if [ "$BUILD_TYPE" = "release" ]; then
    echo "📦 Building release APK..."
    ./gradlew assembleRelease
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Release APK built successfully!"
        echo "📍 Location: android/app/build/outputs/apk/release/app-release.apk"
        
        # Show APK size
        APK_SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
        echo "📊 APK Size: $APK_SIZE"
    else
        echo "❌ Release build failed"
        exit 1
    fi
    
    echo ""
    echo "📦 Building release Bundle (AAB)..."
    ./gradlew bundleRelease
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Release Bundle built successfully!"
        echo "📍 Location: android/app/build/outputs/bundle/release/app-release.aab"
        
        # Show AAB size
        AAB_SIZE=$(du -h app/build/outputs/bundle/release/app-release.aab | cut -f1)
        echo "📊 AAB Size: $AAB_SIZE"
    fi
else
    echo "🔨 Building debug APK..."
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Debug APK built successfully!"
        echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
        
        # Show APK size
        APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
        echo "📊 APK Size: $APK_SIZE"
        
        echo ""
        echo "To install on a connected device/emulator:"
        echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
    else
        echo "❌ Debug build failed"
        exit 1
    fi
fi

cd ..

echo ""
echo "🎉 Build complete!"