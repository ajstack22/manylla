#!/bin/bash

# Manylla Android Debug Build Script
# Creates a debug APK for testing purposes

set -e

echo "🤖 Starting Manylla Android Debug Build..."

# Change to project root
cd "$(dirname "$0")/../.."

# Verify we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    echo "❌ Error: Not in Manylla project root directory"
    exit 1
fi

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
cd android
./gradlew clean

# Generate debug APK
echo "🔨 Building debug APK..."
./gradlew assembleDebug

# Check if build was successful
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ Debug build successful!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"

    # Show APK info
    apk_size=$(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
    echo "📊 APK size: $apk_size"
else
    echo "❌ Debug build failed!"
    exit 1
fi

echo "🎉 Debug build completed successfully!"