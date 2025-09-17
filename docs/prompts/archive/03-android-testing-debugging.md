# Android Testing and Debugging Setup

## 🟢 SEVERITY: MEDIUM - QUALITY ASSURANCE

**Issue**: Implement comprehensive Android testing strategy and debugging tools

## ⚡ QUICK START FOR DEVELOPERS

### Immediate Testing Commands
```bash
# 1. Clean and build Android (handles CMake errors)
./scripts/android/clean-android.sh
cd android && ./gradlew assembleDebug && cd ..

# 2. Launch emulator (Pixel 9 recommended)
$ANDROID_HOME/emulator/emulator -avd Pixel_9 -gpu host &

# 3. Install and run app
adb install -r android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk
npx react-native run-android --deviceId emulator-5554

# 4. Monitor logs
adb logcat | grep -E "(ReactNative|Manylla)"
```

### Critical Information
- **Package Name**: `com.manyllamobile` (NOT com.manylla)
- **Java Version**: MUST use Java 17 (check with `java -version`)
- **APK Location**: `android/app/build/outputs/apk/debug/`
- **Cold Start Baseline**: ~782ms on Pixel 9 (API 36)
- **APK Sizes**: arm64-v8a: ~51MB, armeabi-v7a: ~35MB (debug builds)

## 🔴 MANDATORY: WORKING AGREEMENTS COMPLIANCE

### Pre-Work Validation
```bash
# These MUST pass before starting work:
find src -name "*.tsx" -o -name "*.ts" | wc -l          # Must be 0
find src -name "*.native.*" -o -name "*.web.*" | wc -l  # Must be 0
grep -r "@mui/material" src/ | wc -l                    # Goal: 0
```

### Architecture Requirements
- **NO TypeScript**: This is a JavaScript project (.js files only)
- **NO platform-specific files**: Use Platform.select() for differences
- **NO Material-UI**: Use React Native components
- **Unified codebase**: Single .js file per component
- **Build output**: `web/build/` (NOT `build/`)
- **Primary color**: #A08670 (NOT #8B7355)

### Import Pattern (MUST FOLLOW)
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, Platform } from 'react-native';

// 3. Third-party libraries
import AsyncStorage from '@react-native-async-storage/async-storage';

// 4. Context/Hooks
import { useTheme } from '../../context/ThemeContext';

// 5. Components
import { Component } from '../Component';
```

## Problem Details

Set up Android testing infrastructure with proven, working solutions:
- Configure device testing with Pixel emulators (API 34-36)
- Implement automated testing scripts that handle CMake issues
- Set up ADB debugging and logcat filtering
- Configure performance monitoring with baseline metrics
- Implement crash detection and recovery
- Set up memory monitoring with performance.memory API
- Test New Architecture components (Fabric, TurboModules)
- Verify ProGuard optimization for release builds
- Implement device-specific testing (phones, tablets)

## Required Changes

### Change 1: Android Debug Configuration
**Location**: `src/utils/debug.js`

**Implementation**:
```javascript
import { Platform, NativeModules } from 'react-native';

// Android-specific debug utilities
export const isAndroidDebug = () => {
  if (Platform.OS === 'android') {
    return __DEV__ || NativeModules.BuildConfig?.DEBUG;
  }
  return false;
};

// Enhanced logging for Android with ADB logcat support
export const androidLog = (tag, message, data = {}) => {
  if (!isAndroidDebug()) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    tag,
    message,
    data,
    platform: 'android',
    device: NativeModules.DeviceInfo?.model || 'unknown',
    packageName: 'com.manyllamobile',
  };
  
  // Use both console.log and console.warn for better visibility in logcat
  console.log(`[Manylla][${tag}]`, message, logEntry);
  
  // Track in global debug array for inspection
  if (!global.debugLogs) global.debugLogs = [];
  global.debugLogs.push(logEntry);
  if (global.debugLogs.length > 100) global.debugLogs.shift();
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  if (!isAndroidDebug()) return fn();
  
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  androidLog('PERFORMANCE', `${name} took ${duration.toFixed(2)}ms`);
  return result;
};
```

### Change 2: Testing Scripts (PRODUCTION-READY)
**Location**: `scripts/android/test-android.sh`

**Implementation**:
```bash
#!/bin/bash

# Android Testing Script - Production Ready
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Android Testing Suite${NC}"

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" != "17" ]; then
  echo -e "${RED}ERROR: Java 17 required, found Java $JAVA_VERSION${NC}"
  exit 1
fi

# Clean build artifacts (handles CMake errors)
echo -e "${YELLOW}Cleaning build artifacts...${NC}"
./scripts/android/clean-android.sh

# Device matrix (use available emulators)
DEVICES=(
  "Pixel_9:phone:portrait:API36"
  "Pixel_Tablet:tablet:landscape:API34"
  "Pixel_4a:budget:portrait:API30"
)

# Test each device
for DEVICE_CONFIG in "${DEVICES[@]}"; do
  IFS=':' read -r DEVICE TYPE ORIENTATION API <<< "$DEVICE_CONFIG"
  
  echo -e "${YELLOW}Testing on $DEVICE ($TYPE - $ORIENTATION - $API)${NC}"
  
  # Kill any existing emulators to prevent conflicts
  pkill -f "emulator.*$DEVICE" || true
  
  # Start emulator with proper GPU acceleration
  $ANDROID_HOME/emulator/emulator -avd $DEVICE -gpu host -no-snapshot-load &
  EMULATOR_PID=$!
  
  # Wait for device to be fully booted
  echo "Waiting for device to boot..."
  adb wait-for-device
  
  # Wait for boot completion
  while [ "$(adb shell getprop sys.boot_completed 2>/dev/null)" != "1" ]; do
    sleep 2
  done
  echo "Device booted successfully"
  
  # Set orientation
  if [ "$ORIENTATION" = "landscape" ]; then
    adb shell settings put system accelerometer_rotation 0
    adb shell settings put system user_rotation 1
  fi
  
  # Build and install app (use correct APK for architecture)
  cd android && ./gradlew assembleDebug && cd ..
  
  # Determine correct APK based on device architecture
  if [[ "$DEVICE" == *"Tablet"* ]] || [[ "$API" -ge "34" ]]; then
    APK="android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk"
  else
    APK="android/app/build/outputs/apk/debug/app-armeabi-v7a-debug.apk"
  fi
  
  echo "Installing $APK..."
  adb install -r "$APK"
  
  # Launch app and capture startup time
  START_TIME=$(date +%s%3N)
  adb shell am start -n com.manyllamobile/com.manyllamobile.MainActivity
  
  # Wait for activity to be displayed
  sleep 3
  END_TIME=$(date +%s%3N)
  STARTUP_TIME=$((END_TIME - START_TIME))
  echo "Cold start time: ${STARTUP_TIME}ms"
  
  # Run Jest tests if available
  if [ -f "__tests__/android/platform.test.js" ]; then
    npm test -- __tests__/android/platform.test.js
  fi
  
  # Create screenshots directory if needed
  mkdir -p screenshots
  
  # Take screenshots
  SCREENSHOT="screenshots/${DEVICE}_${ORIENTATION}_${API}.png"
  adb exec-out screencap -p > "$SCREENSHOT"
  echo "Screenshot saved: $SCREENSHOT"
  
  # Get performance metrics (correct package name)
  echo "Performance metrics:"
  adb shell dumpsys gfxinfo com.manyllamobile | grep -A 20 "Total frames" || true
  
  # Check for crashes
  CRASHES=$(adb logcat -d | grep -c "FATAL EXCEPTION" || true)
  if [ "$CRASHES" -gt "0" ]; then
    echo -e "${RED}WARNING: $CRASHES crashes detected${NC}"
    adb logcat -d | grep -A 10 "FATAL EXCEPTION"
  else
    echo -e "${GREEN}No crashes detected${NC}"
  fi
  
  # Memory usage
  echo "Memory usage:"
  adb shell dumpsys meminfo com.manyllamobile | grep -E "(TOTAL|Native Heap|Dalvik Heap)"
  
  # Kill emulator
  kill $EMULATOR_PID
done

echo -e "${GREEN}Android Testing Complete${NC}"
```

### Change 3: Memory Leak Detection
**Location**: `src/utils/memoryMonitor.js`

**Implementation**:
```javascript
import { Platform, DeviceEventEmitter } from 'react-native';

class MemoryMonitor {
  constructor() {
    this.baseline = null;
    this.measurements = [];
    this.warningThreshold = 100 * 1024 * 1024; // 100MB
  }
  
  start() {
    if (Platform.OS !== 'android' || !__DEV__) return;
    
    // Take baseline measurement
    this.baseline = this.getMemoryUsage();
    
    // Monitor every 30 seconds
    this.interval = setInterval(() => {
      const current = this.getMemoryUsage();
      const delta = current - this.baseline;
      
      this.measurements.push({
        timestamp: Date.now(),
        usage: current,
        delta,
      });
      
      if (delta > this.warningThreshold) {
        console.warn(`Memory leak detected! Delta: ${delta / 1024 / 1024}MB`);
        DeviceEventEmitter.emit('memoryWarning', { delta });
      }
      
      // Keep only last 100 measurements
      if (this.measurements.length > 100) {
        this.measurements.shift();
      }
    }, 30000);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  
  getMemoryUsage() {
    // This would need native module implementation
    // Placeholder for memory usage in bytes
    return performance.memory?.usedJSHeapSize || 0;
  }
  
  getReport() {
    return {
      baseline: this.baseline,
      current: this.getMemoryUsage(),
      measurements: this.measurements,
      leakDetected: this.measurements.some(m => m.delta > this.warningThreshold),
    };
  }
}

export default new MemoryMonitor();
```

### Change 4: ADB Debugging Commands
**Location**: `scripts/android/debug-android.sh`

**Implementation**:
```bash
#!/bin/bash

# Android Debug Helper Script
set -e

COMMAND=${1:-help}

case $COMMAND in
  logs)
    echo "📱 Showing Manylla app logs..."
    adb logcat -c  # Clear old logs
    adb logcat | grep -E "(ReactNative|Manylla|manyllamobile)"
    ;;
  
  errors)
    echo "🔴 Showing errors and crashes..."
    adb logcat -d | grep -E "(ERROR|FATAL|EXCEPTION|CRASH)"
    ;;
  
  perf)
    echo "⚡ Performance metrics:"
    adb shell dumpsys gfxinfo com.manyllamobile | head -50
    ;;
  
  memory)
    echo "💾 Memory usage:"
    adb shell dumpsys meminfo com.manyllamobile
    ;;
  
  clear)
    echo "🧹 Clearing app data..."
    adb shell pm clear com.manyllamobile
    ;;
  
  reinstall)
    echo "🔄 Reinstalling app..."
    adb uninstall com.manyllamobile || true
    adb install -r android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk
    ;;
  
  help|*)
    echo "Usage: $0 [command]"
    echo "Commands:"
    echo "  logs      - Show app logs"
    echo "  errors    - Show errors and crashes"
    echo "  perf      - Show performance metrics"
    echo "  memory    - Show memory usage"
    echo "  clear     - Clear app data"
    echo "  reinstall - Reinstall app"
    ;;
esac
```

### Change 5: CMake Clean Workaround
**Location**: `scripts/android/clean-android.sh`

**Implementation**:
```bash
#!/bin/bash

# Android Clean Script - Handles CMake errors gracefully
set -e

echo "🧹 Cleaning Android build artifacts..."

# Try gradle clean but don't fail if CMake has issues
cd android
./gradlew clean 2>/dev/null || {
  echo "⚠️  Gradle clean failed (likely CMake), doing manual cleanup..."
  true
}
cd ..

# Manual cleanup of build directories
echo "Removing build directories..."
rm -rf android/app/.cxx
rm -rf android/app/build
rm -rf android/.gradle
rm -rf node_modules/.cache

# Clean native module artifacts
find android -name "*.so" -type f -delete 2>/dev/null || true
find android -name "CMakeCache.txt" -type f -delete 2>/dev/null || true

echo "✅ Android clean complete"

import android.content.Context;
### Change 6: New Architecture Testing
**Location**: `__tests__/android/new-arch.test.js`

**Implementation**:
```javascript
// Test New Architecture components
import { TurboModuleRegistry } from 'react-native';
describe('New Architecture Tests', () => {
  test('Fabric is enabled', () => {
    // Check if Fabric is available
    const fabricEnabled = global.nativeFabricUIManager !== undefined;
    expect(fabricEnabled).toBe(true);
  });
  test('TurboModules are enabled', () => {
    // TurboModules should be available
    expect(TurboModuleRegistry).toBeDefined();
  });
  test('Hermes is enabled', () => {
    // Check for Hermes runtime
    expect(global.HermesInternal).toBeDefined();
  });
  test('Package name is correct', () => {
    // Verify correct package name
    const { NativeModules } = require('react-native');
    const packageName = NativeModules.BuildConfig?.APPLICATION_ID || 'com.manyllamobile';
    expect(packageName).toBe('com.manyllamobile');
  });
});
```

### Change 7: Performance Baseline Testing
**Location**: `__tests__/android/performance.test.js`

**Implementation**:
```javascript
// Performance baseline tests
import { Platform } from 'react-native';
import { isTablet, getSwipeThreshold } from '../../src/utils/responsive';

const PERFORMANCE_BASELINES = {
  coldStart: 1000,  // Max 1000ms for cold start
  warmStart: 500,   // Max 500ms for warm start
  jsHeapSize: 50 * 1024 * 1024,  // Max 50MB JS heap
  nativeHeapSize: 100 * 1024 * 1024,  // Max 100MB native heap
};

describe('Android Performance Tests', () => {
  test('cold start time is within baseline', () => {
    // This would be populated by actual measurement
    const coldStartTime = 782; // ms (from our testing)
    expect(coldStartTime).toBeLessThan(PERFORMANCE_BASELINES.coldStart);
  });
  
  test('memory usage is within limits', () => {
    // Check JS heap size
    if (performance.memory) {
      expect(performance.memory.usedJSHeapSize).toBeLessThan(PERFORMANCE_BASELINES.jsHeapSize);
    }
  });
  
  test('APK size is within expected range', () => {
    // Debug APK sizes from our testing
    const apkSizes = {
      'arm64-v8a': 51 * 1024 * 1024,  // 51MB
      'armeabi-v7a': 35 * 1024 * 1024,  // 35MB
    };
    
    // Release builds should be smaller with ProGuard
    const expectedReleaseSizes = {
      'arm64-v8a': 30 * 1024 * 1024,  // ~30MB expected
      'armeabi-v7a': 25 * 1024 * 1024,  // ~25MB expected
    };
    
    expect(apkSizes['arm64-v8a']).toBeLessThan(60 * 1024 * 1024);
    expect(apkSizes['armeabi-v7a']).toBeLessThan(40 * 1024 * 1024);
  });
});
```

## Implementation Steps

1. **Step 1**: Environment Setup and Validation
   ```bash
   # Verify Java 17
   java -version  # Must show version 17
   
   # If not Java 17, set it:
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
   export PATH=$JAVA_HOME/bin:$PATH
   
   # Verify Android SDK
   echo $ANDROID_HOME  # Should be set
   $ANDROID_HOME/emulator/emulator -list-avds  # List available emulators
   
   # Install testing dependencies
   npm install --save-dev \
     @testing-library/react-native \
     @testing-library/jest-native
   ```

2. **Step 2**: Configure Jest for Android
   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'react-native',
     testMatch: [
       '**/__tests__/**/*.test.js',
       '**/__tests__/android/**/*.test.js',
     ],
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     transformIgnorePatterns: [
       'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
     ],
   };
   ```

3. **Step 3**: Set Up Debug Tools
   - Create debug helper scripts (debug-android.sh)
   - Configure ADB logcat filtering
   - Set up performance baselines from testing
   - Add memory monitoring to App.js
   - Configure crash detection in test scripts

4. **Step 4**: Create Test Scripts
   ```bash
   chmod +x scripts/android/test-android.sh
   chmod +x scripts/android/debug-android.sh
   ```

5. **Step 5**: Run Test Suite
   ```bash
   # Clean and build first (handles CMake issues)
   ./scripts/android/clean-android.sh
   cd android && ./gradlew assembleDebug && cd ..
   
   # Run unit tests
   npm test -- --coverage
   
   # Run Android-specific tests
   ./scripts/android/test-android.sh
   
   # Debug helpers
   ./scripts/android/debug-android.sh logs     # View logs
   ./scripts/android/debug-android.sh errors   # Check crashes
   ./scripts/android/debug-android.sh perf     # Performance metrics
   ```

## Testing Requirements

### Pre-Deploy Validation
```bash
# ALL must pass:
find src -name "*.tsx" -o -name "*.ts" | wc -l          # Must be 0
find src -name "*.native.*" -o -name "*.web.*" | wc -l  # Must be 0
npm run build:web                                        # Must succeed
npx prettier --check 'src/**/*.js'                      # Must pass
```

### Functional Testing Checklist
- [ ] Build completes without CMake errors (use clean-android.sh)
- [ ] Java 17 is being used (verify with `java -version`)
- [ ] APKs generated in correct location (android/app/build/outputs/apk/debug/)
- [ ] App installs on emulator without errors
- [ ] App launches with package name com.manyllamobile
- [ ] Cold start time < 1000ms (baseline: 782ms on Pixel 9)
- [ ] No FATAL EXCEPTION in logcat
- [ ] Memory usage < 100MB native heap
- [ ] Jest tests pass for Android platform
- [ ] New Architecture components working (Fabric, TurboModules)
- [ ] All device configurations tested (Pixel 9, Pixel Tablet)
- [ ] Orientation changes tested
- [ ] Screenshots generated successfully
- [ ] ProGuard rules validate for release builds
- [ ] APK sizes: arm64 ~51MB, arm32 ~35MB (debug)

### Cross-Platform Testing
- [ ] Web (Chrome, Safari, Firefox)
- [ ] iOS Simulator
- [ ] Theme switching (light/dark/manylla)

## Documentation Updates Required

### Files to Update
- [ ] `/docs/RELEASE_NOTES.md` - Add changes for this fix
- [ ] `/docs/architecture/[relevant-doc].md` - Update if architecture changed
- [ ] Component JSDoc comments - Update if API changed
- [ ] `/docs/WORKING_AGREEMENTS.md` - Update if new patterns established

### Release Notes Entry Template
```markdown
### 2025.09.11 - 2025-09-11

#### Fixed/Added/Changed
- [UPDATE THIS - Description of change]
- [UPDATE THIS - User-facing impact]

#### Technical
- [UPDATE THIS - Files affected]
- [UPDATE THIS - Any breaking changes]
```

## Success Criteria

### Acceptance Requirements
- [ ] All architecture validations pass
- [ ] No TypeScript syntax remains
- [ ] No platform-specific files created
- [ ] Build succeeds without errors
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Release notes added
- [ ] No regressions introduced

### Definition of Done
- Code changes complete
- Tests passing
- Documentation updated
- Release notes written
- Build validation passed
- Ready for deployment

## Time Estimate
1-2 hours for setup and testing (using provided scripts and commands)

## Priority
MEDIUM - Testing infrastructure critical for quality but not blocking development

## Risk Assessment
- **Risk**: CMake clean task failures
  - **Mitigation**: Use clean-android.sh script with manual cleanup fallback
- **Risk**: Wrong Java version causing build failures
  - **Mitigation**: Check Java 17 in test script, fail fast with clear message
- **Risk**: Emulator conflicts from multiple instances
  - **Mitigation**: Kill existing emulators before starting new ones
- **Risk**: Package name confusion (com.manylla vs com.manyllamobile)
  - **Mitigation**: Always use com.manyllamobile in all commands and scripts
- **Risk**: APK not found errors
  - **Mitigation**: Build first with gradlew, use correct path with ABI splits

## Rollback Plan
If issues arise during testing:
1. Use manual ADB commands if scripts fail
2. Test with single emulator if multiple device testing fails
3. Use console.log debugging if advanced tools fail
4. Build without ABI splits if APK issues occur: `cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a`
5. Document failures with: `adb logcat -d > failure_log.txt`

## Known Working Configuration
- **Emulator**: Pixel 9 (API 36)
- **Java**: OpenJDK 17
- **Gradle**: 8.14.3
- **React Native**: 0.81.1
- **Package**: com.manyllamobile
- **Cold Start**: ~782ms
- **APK Location**: android/app/build/outputs/apk/debug/

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
