# Android Testing & Deployment Integration

## Overview
The Android testing infrastructure has been integrated into the Manylla deployment pipeline to ensure quality before web deployments.

## Key Changes

### 1. Enhanced deploy-qual.sh
The main deployment script now includes:
- Android device/emulator detection
- Automatic clean build process
- APK installation with correct package name (`com.manyllamobile`)
- Jest test execution for Android tests
- Memory and performance checks

### 2. New Testing Scripts
- `scripts/android/test-android.sh` - Comprehensive Android testing
- `scripts/android/debug-android.sh` - Debug utilities and helpers
- `scripts/android/clean-android.sh` - CMake-aware clean script

### 3. Testing Infrastructure
- `src/utils/debug.js` - Android-specific debug utilities
- `src/utils/memoryMonitor.js` - Memory leak detection
- `__tests__/android/` - Android-specific Jest tests

## Deployment Options

### Standard Deployment (with Android testing)
```bash
./scripts/deploy-qual.sh
```
This will:
1. Run all pre-deployment validations
2. If Android devices/emulators are connected:
   - Clean and build Android APK
   - Install on connected devices
   - Run Android Jest tests
3. Build and deploy web to qual
4. Push to GitHub

### Alternative: Dedicated Android Testing Deployment
```bash
./scripts/deploy-qual-with-android.sh
```
This enhanced script provides:
- More detailed Android testing output
- Memory usage monitoring
- Performance metrics collection
- Option to skip Android with `--skip-android` flag

## Android Testing Requirements

### Prerequisites
- Java 17 (set automatically in scripts)
- Android emulator or device connected
- Package name: `com.manyllamobile`

### Quick Commands
```bash
# Check connected devices
adb devices

# Start emulator
$ANDROID_HOME/emulator/emulator -avd Pixel_9 -gpu host &

# Run Android tests only
./scripts/android/test-android.sh

# Debug commands
./scripts/android/debug-android.sh help
```

## Testing Coverage

### Automated Tests (12 tests)
- New Architecture validation (Fabric, TurboModules, Hermes)
- Performance baselines (cold start < 1000ms)
- Memory usage limits
- Package name verification
- API level requirements

### Manual Testing Points
- Cold start time measurement
- Memory leak detection
- Screenshot capture
- Crash detection in logcat

## Integration with CI/CD

The deployment script now:
1. Validates code quality (ESLint, Prettier)
2. Checks for TypeScript/platform-specific files
3. Runs Android tests if devices available
4. Deploys to web qual
5. Creates GitHub rollback point

## Troubleshooting

### CMake Errors
The clean script handles CMake errors gracefully:
```bash
./scripts/android/clean-android.sh
```

### Java Version Issues
Scripts automatically set Java 17:
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

### APK Not Found
Build with specific architecture:
```bash
cd android && ./gradlew assembleDebug && cd ..
```

## Best Practices

1. **Always run with emulator**: Android tests provide valuable feedback
2. **Check memory usage**: Monitor for leaks with debug script
3. **Verify package name**: Must be `com.manyllamobile`
4. **Clean builds**: Use clean script when switching branches

## Future Enhancements

Consider adding:
- Automated performance regression detection
- Bundle size tracking for Android APKs
- Integration with Firebase Test Lab
- Automated screenshot comparison
- Network request monitoring

## Notes for StackMap

This implementation could be adapted for StackMap with:
- Different package name (`com.stackmap`)
- Additional device matrix testing
- Integration with existing StackMap CI/CD
- Performance baseline comparisons between platforms

The modular design allows easy adoption of individual components or the full testing suite.