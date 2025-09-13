# Android Platform Expert Role & Implementation Guide

## Core Responsibility
Ensure optimal Android performance, native integration, platform compliance, and seamless user experience across all Android devices and versions.

## Critical Commands & Metrics
```bash
# Build validation (MUST PASS)
cd android && ./gradlew assembleDebug                    # Must succeed
java -version | grep "17"                                # Must show Java 17

# APK verification
ls -la android/app/build/outputs/apk/debug/*.apk        # Must exist
adb shell pm list packages | grep manyllamobile          # Must show com.manyllamobile

# Performance baselines
adb shell dumpsys gfxinfo com.manyllamobile | grep "Total frames"  # < 16ms per frame
```

## Decision Authority
**CAN**: Gradle configs, ProGuard rules, native modules, Android-specific optimizations
**CANNOT**: Change package name, modify architecture, add platform-specific files

## Critical Android Knowledge

### Package Configuration (IMMUTABLE)
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
package="com.manyllamobile"  <!-- NOT com.manylla -->
```

### Build Configuration
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 35
    buildToolsVersion "35.0.0"
    
    defaultConfig {
        applicationId "com.manyllamobile"
        minSdkVersion 24       // Android 7.0 minimum
        targetSdkVersion 35    // Android 15 target
        versionCode 1
        versionName "1.0"
        
        // Architecture splits for smaller APKs
        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a"
        }
    }
    
    // ProGuard for release builds
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Java Version Requirement
```bash
# MUST use Java 17 (not 11, not 21)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
java -version  # Must show: openjdk version "17.x.x"
```

## Performance Optimization

### Cold Start Optimization
```java
// MainActivity.java - Optimize cold start
@Override
protected void onCreate(Bundle savedInstanceState) {
    // Set theme before super.onCreate to avoid flash
    setTheme(R.style.AppTheme);
    super.onCreate(savedInstanceState);
    
    // Defer heavy operations
    new Handler(Looper.getMainLooper()).postDelayed(() -> {
        // Initialize analytics, etc.
    }, 1000);
}
```

**Target Metrics:**
- Cold start: < 1000ms (current: 782ms on Pixel 9)
- Warm start: < 500ms
- Hot start: < 250ms

### Memory Management
```javascript
// src/utils/androidMemory.js
import { DeviceEventEmitter, NativeModules } from 'react-native';

export const androidMemoryManager = {
  // Monitor memory pressure
  setupMemoryWarnings() {
    DeviceEventEmitter.addListener('memoryWarning', () => {
      // Clear image cache
      Image.clearMemoryCache();
      
      // Clear unnecessary data
      this.trimMemory();
    });
  },
  
  // Aggressive cleanup for low memory
  trimMemory() {
    // Clear non-visible screens
    // Reduce cache sizes
    // Cancel pending operations
  },
  
  // Target: < 100MB native heap usage
  getMemoryInfo() {
    return NativeModules.MemoryModule?.getMemoryInfo();
  }
};
```

### ProGuard Rules
```pro
# android/app/proguard-rules.pro
# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.manyllamobile.** { *; }

# Keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Hermes
-keep class com.facebook.hermes.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
```

## Device & Version Support

### Minimum Requirements
```javascript
// Platform-specific handling
const androidVersion = Platform.Version;  // API level

// API 24+ (Android 7.0+)
if (androidVersion < 24) {
  Alert.alert('Unsupported', 'Android 7.0 or higher required');
}

// Tablet detection
const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  return Math.min(width, height) >= 600 && aspectRatio < 1.6;
};
```

### Device-Specific Optimizations
```javascript
// Samsung-specific fixes
if (DeviceInfo.getBrand() === 'samsung') {
  // Samsung keyboard workarounds
  androidKeyboardHandling.applySamsungFixes();
}

// Xiaomi/MIUI optimizations
if (DeviceInfo.getBrand() === 'xiaomi') {
  // MIUI permission handling
  androidPermissions.requestMIUIPermissions();
}
```

## Storage & Permissions

### AsyncStorage Implementation
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android-specific storage limits
const ANDROID_STORAGE_LIMIT = 6 * 1024 * 1024; // 6MB default

// Check storage before saving
const checkStorageLimit = async (data) => {
  const size = new Blob([JSON.stringify(data)]).size;
  if (size > ANDROID_STORAGE_LIMIT) {
    throw new Error('Data exceeds Android storage limit');
  }
};
```

### Permission Handling
```javascript
import { PermissionsAndroid } from 'react-native';

// Camera permission for profile photos
const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Manylla needs camera access for profile photos',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
```

## Testing & Debugging

### ADB Commands Cheatsheet
```bash
# Install and run
adb install -r android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk
adb shell am start -n com.manyllamobile/com.manyllamobile.MainActivity

# Debugging
adb logcat | grep -E "(ReactNative|Manylla|manyllamobile)"  # App logs
adb shell dumpsys meminfo com.manyllamobile                 # Memory usage
adb shell dumpsys gfxinfo com.manyllamobile                 # Performance

# Clear app data
adb shell pm clear com.manyllamobile

# Screenshots
adb exec-out screencap -p > screenshot.png

# Performance profiling
adb shell am start -W -n com.manyllamobile/.MainActivity    # Measure startup
```

### Emulator Configuration
```bash
# Recommended emulators
$ANDROID_HOME/emulator/emulator -list-avds

# Launch with optimal settings
$ANDROID_HOME/emulator/emulator \
  -avd Pixel_9 \
  -gpu host \           # Hardware acceleration
  -memory 2048 \        # 2GB RAM
  -no-snapshot-load \   # Fresh start
  -no-boot-anim        # Faster boot
```

### CMake Error Workaround
```bash
#!/bin/bash
# scripts/android/clean-android.sh
# Handle CMake errors that block gradle clean

cd android
./gradlew clean 2>/dev/null || {
  echo "Gradle clean failed, manual cleanup..."
  rm -rf app/.cxx
  rm -rf app/build
  rm -rf .gradle
}
cd ..
```

## Common Android Issues & Solutions

### Issue 1: Build Failures
```bash
# Wrong Java version
java -version  # Check for Java 17

# Fix:
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

### Issue 2: App Crashes on Launch
```javascript
// Check for missing permissions in AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Issue 3: Keyboard Covering Input
```javascript
// android/app/src/main/AndroidManifest.xml
<activity
  android:windowSoftInputMode="adjustResize"  // Not adjustPan
/>

// In component
import { KeyboardAvoidingView } from 'react-native';
<KeyboardAvoidingView behavior="padding" enabled>
```

### Issue 4: Images Not Loading
```javascript
// Android requires explicit dimensions or flex
<Image 
  source={profilePhoto}
  style={{ width: 100, height: 100 }}  // Required on Android
  resizeMode="cover"
/>
```

### Issue 5: Slow Performance
```javascript
// Enable Hermes
// android/app/build.gradle
hermesEnabled: true

// Remove console.logs in production
if (!__DEV__) {
  console.log = () => {};
}
```

## Release Build Process

### 1. Generate Signed APK
```bash
# Generate keystore (one time)
keytool -genkey -v -keystore manylla.keystore -alias manylla -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
cd android
./gradlew assembleRelease
```

### 2. APK Optimization
```gradle
// Split APKs by architecture
splits {
    abi {
        enable true
        reset()
        include "armeabi-v7a", "arm64-v8a"
        universalApk false
    }
}
```

**Expected APK Sizes:**
- Debug: arm64 ~51MB, arm32 ~35MB  
- Release: arm64 ~30MB, arm32 ~25MB (with ProGuard)

### 3. Play Store Preparation
```xml
<!-- Version code formula -->
versionCode = (majorVersion * 10000) + (minorVersion * 100) + patch

<!-- Example: v1.2.3 = 10203 -->
```

## Platform-Specific Code Patterns

### Android-Only Features
```javascript
import { Platform, ToastAndroid } from 'react-native';

// Android toast
if (Platform.OS === 'android') {
  ToastAndroid.show('Profile saved', ToastAndroid.SHORT);
}

// Android back button
import { BackHandler } from 'react-native';

useEffect(() => {
  if (Platform.OS === 'android') {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (modalVisible) {
        setModalVisible(false);
        return true; // Handled
      }
      return false; // Let default behavior happen
    });
    return () => backHandler.remove();
  }
}, [modalVisible]);
```

### Material Design Compliance
```javascript
// Elevation for shadows (Android)
const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      android: {
        elevation: 4,  // Material Design shadow
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    })
  }
});

// Ripple effect (Android 5.0+)
<TouchableNativeFeedback
  background={TouchableNativeFeedback.Ripple('#A08670', false)}
>
  <View style={styles.button}>
    <Text>Press Me</Text>
  </View>
</TouchableNativeFeedback>
```

## Testing Matrix

### Required Device Tests
| Device | Type | API | Resolution | Priority |
|--------|------|-----|------------|----------|
| Pixel 9 | Phone | 36 | 1080x2400 | Critical |
| Pixel Tablet | Tablet | 34 | 2560x1600 | Critical |
| Pixel 4a | Budget | 30 | 1080x2340 | High |
| Samsung Galaxy | Phone | 33 | Variable | High |
| OnePlus | Phone | 31 | 1080x2400 | Medium |

### Automated Testing Script
```bash
#!/bin/bash
# scripts/android/test-all-devices.sh

DEVICES=("Pixel_9" "Pixel_Tablet" "Pixel_4a")

for DEVICE in "${DEVICES[@]}"; do
  echo "Testing on $DEVICE..."
  
  # Start emulator
  $ANDROID_HOME/emulator/emulator -avd $DEVICE -no-snapshot-load &
  EMULATOR_PID=$!
  
  # Wait for boot
  adb wait-for-device
  while [ "$(adb shell getprop sys.boot_completed)" != "1" ]; do
    sleep 2
  done
  
  # Install and test
  adb install -r android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk
  npm test -- __tests__/android/
  
  # Cleanup
  kill $EMULATOR_PID
done
```

## Quality Checklist

### Before Any Android Change
- [ ] Java 17 verified
- [ ] Gradle build passes
- [ ] Package name is com.manyllamobile
- [ ] No TypeScript files
- [ ] No .android.js files
- [ ] Cold start < 1000ms
- [ ] Memory usage < 100MB
- [ ] No crashes in logcat
- [ ] Works on API 24-36
- [ ] APK size reasonable

## Emergency Fixes

### Reset Android Build
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npx react-native run-android
```

### Force Rebuild
```bash
cd android
./gradlew assembleDebug --rerun-tasks
```

### Clear Everything
```bash
watchman watch-del-all
rm -rf node_modules
rm -rf android/app/build
rm -rf android/.gradle
npm cache clean --force
npm install
```

---
*Last Updated: 2025.09.11*
*Platform: Android 7.0+ (API 24+)*
*Package: com.manyllamobile*