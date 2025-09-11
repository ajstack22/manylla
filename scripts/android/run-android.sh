#!/bin/bash

# Manylla Android Development Script
# Ensures Java 17 is used for Android builds (NOT Java 24)
# Created: 2025-09-11

echo "🤖 Starting Manylla Android Development"
echo "======================================="

# Force Java 17 for Android builds
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Set Android environment
export ANDROID_HOME=/Users/adamstack/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

echo "Using Java version:"
java -version 2>&1 | head -1

# Verify Java 17 is active
if ! java -version 2>&1 | grep -q "version \"17"; then
    echo "❌ ERROR: Java 17 is required for Android builds"
    echo "Found Java version:"
    java -version
    echo ""
    echo "To install Java 17:"
    echo "  brew install openjdk@17"
    echo ""
    echo "To set Java 17 in your shell:"
    echo "  export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
    echo "  export PATH=\$JAVA_HOME/bin:\$PATH"
    exit 1
fi

echo "✅ Java 17 verified"
echo ""

# Check if Metro is already running
METRO_PID=$(lsof -ti:8081 2>/dev/null)
if [ ! -z "$METRO_PID" ]; then
    echo "⚠️  Metro bundler already running on port 8081 (PID: $METRO_PID)"
else
    echo "Starting Metro bundler in background..."
    npx react-native start --reset-cache &
    sleep 3
fi

echo ""
echo "📱 Launching Android app..."
echo ""

# Run React Native Android with all arguments passed through
npx react-native run-android "$@"

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Android app launched successfully!"
    echo ""
    echo "Available commands:"
    echo "  r - Reload the app"
    echo "  d - Open developer menu"
    echo "  Cmd+M - Open developer menu (in emulator)"
else
    echo ""
    echo "❌ Failed to launch Android app (exit code: $EXIT_CODE)"
    echo ""
    echo "Common fixes:"
    echo "  1. Make sure an Android emulator is running"
    echo "  2. Check that ANDROID_HOME is set correctly"
    echo "  3. Run: cd android && ./gradlew clean && cd .."
    echo "  4. Check logs above for specific errors"
fi

exit $EXIT_CODE