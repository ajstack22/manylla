#!/bin/bash

# Manylla Android Clean Script
# Cleans build artifacts and caches
# Created: 2025-09-11

echo "🧹 Cleaning Android build artifacts"
echo "===================================="

# Force Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo ""
echo "Cleaning Gradle build cache..."
cd android && ./gradlew clean && cd ..

echo ""
echo "Removing build directories..."
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle

echo ""
echo "Clearing React Native caches..."
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

echo ""
echo "Clearing watchman (if installed)..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null
    echo "✅ Watchman cleared"
else
    echo "⏭️  Watchman not installed (skipping)"
fi

echo ""
echo "Resetting Metro bundler cache..."
npx react-native start --reset-cache --max-workers=1 &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null

echo ""
echo "✅ Android build cleaned successfully!"
echo ""
echo "Next steps:"
echo "  1. npm install (if you deleted node_modules)"
echo "  2. ./scripts/android/run-android.sh"