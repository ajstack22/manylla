# iOS Platform Expert Role & Implementation Guide

## Core Responsibility
Ensure optimal iOS performance, App Store compliance, native iOS features integration, and exceptional user experience across all Apple devices.

## Critical Commands & Metrics
```bash
# Build validation (MUST PASS)
cd ios && pod install && cd ..                          # CocoaPods sync
npx react-native run-ios --simulator="iPhone 16"        # Must succeed

# Bundle verification  
ls -la ios/build/Build/Products/Debug-iphonesimulator/  # App bundle exists
xcrun simctl list | grep Booted                         # Simulator running

# Performance baselines
instruments -s devices                                   # List devices for profiling
```

## Decision Authority
**CAN**: Xcode settings, Info.plist, pod dependencies, iOS-specific optimizations
**CANNOT**: Change bundle ID, modify architecture, add .ios.js files

## Critical iOS Knowledge

### Bundle Configuration (IMMUTABLE)
```xml
<!-- ios/manyllamobile/Info.plist -->
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
<!-- Bundle ID: com.manyllamobile -->
```

### Build Settings
```ruby
# ios/Podfile
platform :ios, '14.0'  # Minimum iOS 14

# Flipper disabled for production stability
# flipper_configuration => FlipperConfiguration.disabled

# New Architecture enabled
ENV['RCT_NEW_ARCH_ENABLED'] = '1'

target 'manyllamobile' do
  config = use_native_modules!
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,  # Hermes for performance
    :fabric_enabled => true,   # New Architecture
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
end
```

### Xcode Configuration
```bash
# Required Xcode version
xcodebuild -version  # Xcode 16.0+ required

# Build settings
IPHONEOS_DEPLOYMENT_TARGET = 14.0
SWIFT_VERSION = 5.0
ENABLE_BITCODE = NO
```

## Performance Optimization

### Launch Screen Optimization
```xml
<!-- ios/manyllamobile/LaunchScreen.storyboard -->
<!-- Minimize launch screen complexity -->
<!-- Use static images, no animations -->
<!-- Match app's initial screen to reduce perceived load time -->
```

**Target Metrics:**
- Cold start: < 800ms (iPhone 16)
- Warm start: < 400ms  
- Memory: < 100MB
- Battery: < 2% per hour active use

### Memory Management
```objective-c
// ios/manyllamobile/AppDelegate.mm
- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
  // Clear image caches
  [[SDImageCache sharedImageCache] clearMemory];
  
  // Notify React Native
  [[NSNotificationCenter defaultCenter] 
    postNotificationName:@"MemoryWarning" 
    object:nil];
}
```

```javascript
// src/utils/iosMemory.js
import { NativeEventEmitter, NativeModules } from 'react-native';

const iosMemoryManager = {
  setupMemoryWarnings() {
    const emitter = new NativeEventEmitter(NativeModules.MemoryWarningModule);
    emitter.addListener('MemoryWarning', () => {
      // Clear caches
      Image.clearMemoryCache();
      // Reduce memory footprint
      this.performLowMemoryCleanup();
    });
  }
};
```

## iOS-Specific Features

### Safe Area Handling
```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      paddingTop: insets.top,      // Status bar
      paddingBottom: insets.bottom, // Home indicator
      paddingLeft: insets.left,     // Landscape notch
      paddingRight: insets.right,   // Landscape notch
    }}>
      {/* Content */}
    </View>
  );
};
```

### Haptic Feedback
```javascript
import { HapticFeedback } from 'react-native';

// iOS-specific haptic types
const provideHapticFeedback = (type = 'selection') => {
  if (Platform.OS === 'ios') {
    // Types: selection, impactLight, impactMedium, impactHeavy, soft, rigid
    HapticFeedback.trigger(type);
  }
};

// Use for important actions
<TouchableOpacity 
  onPress={() => {
    provideHapticFeedback('impactMedium');
    saveProfile();
  }}
>
```

### iOS Photo Handling (CRITICAL FIX APPLIED)
```javascript
// Recent fix for iOS photo display (v2025.09.11.10)
const getPhotoSource = (photo) => {
  if (!photo || photo === 'null' || photo === 'default') {
    return null;
  }
  
  // iOS requires proper URI format
  if (Platform.OS === 'ios' && typeof photo === 'string') {
    // Handle both file:// and ph:// protocols
    if (photo.startsWith('file://') || photo.startsWith('ph://')) {
      return { uri: photo };
    }
    // Add file:// if missing
    return { uri: `file://${photo}` };
  }
  
  return photo;
};
```

### Keyboard Management
```javascript
import { 
  KeyboardAvoidingView, 
  Keyboard,
  Platform 
} from 'react-native';

// iOS-specific keyboard handling
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
>
  {/* Form content */}
</KeyboardAvoidingView>

// Dismiss keyboard on scroll (iOS gesture)
<ScrollView
  keyboardDismissMode="interactive"  // iOS only
  keyboardShouldPersistTaps="handled"
>
```

## Device Support Matrix

### Required Testing Devices
| Device | Screen | OS | Priority | Notes |
|--------|--------|-----|----------|-------|
| iPhone 16 Pro | 6.3" | iOS 18 | Critical | Latest flagship |
| iPhone 14 | 6.1" | iOS 17 | Critical | Common device |
| iPhone SE 3 | 4.7" | iOS 16 | High | Small screen |
| iPad Pro 13" | 13" | iPadOS 18 | High | Tablet layout |
| iPad mini | 8.3" | iPadOS 17 | Medium | Compact tablet |
| iPhone 12 mini | 5.4" | iOS 16 | Medium | Compact phone |

### Simulator Commands
```bash
# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 16 Pro"

# Launch app on simulator
npx react-native run-ios --simulator="iPhone 16 Pro"

# Reset simulator
xcrun simctl erase "iPhone 16 Pro"

# Take screenshot
xcrun simctl io booted screenshot screenshot.png

# Record video
xcrun simctl io booted recordVideo video.mp4
```

## App Store Preparation

### Required Assets
```bash
# App Icons (AppIcon.appiconset)
1024x1024  # App Store
180x180    # iPhone @3x
120x120    # iPhone @2x
152x152    # iPad @2x
167x167    # iPad Pro

# Launch Images
1290x2796  # iPhone 16 Pro Max
1179x2556  # iPhone 16 Pro/15 Pro
1170x2532  # iPhone 14/13/12
828x1792   # iPhone 11
```

### Info.plist Requirements
```xml
<!-- Privacy descriptions (REQUIRED) -->
<key>NSCameraUsageDescription</key>
<string>Manylla needs camera access to take profile photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Manylla needs photo library access to select profile photos</string>

<!-- iPad support -->
<key>UISupportedInterfaceOrientations~ipad</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
  <string>UIInterfaceOrientationLandscapeLeft</string>
  <string>UIInterfaceOrientationLandscapeRight</string>
</array>

<!-- Appearance -->
<key>UIUserInterfaceStyle</key>
<string>Light</string>  <!-- or Automatic for dark mode -->
```

### Build for App Store
```bash
# Archive for App Store
npx react-native run-ios --configuration Release

# Or via Xcode
1. Open ios/manyllamobile.xcworkspace
2. Select Generic iOS Device
3. Product → Archive
4. Distribute App → App Store Connect
```

## Common iOS Issues & Solutions

### Issue 1: Pod Install Failures
```bash
# Clear pods
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install --repo-update
cd ..
```

### Issue 2: Build Failures After Update
```bash
# Clear all caches
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf build/
pod install
cd ..
npx react-native run-ios
```

### Issue 3: Images Not Displaying
```javascript
// iOS requires explicit image dimensions or container flex
<Image 
  source={{ uri: photoUri }}
  style={{ width: '100%', aspectRatio: 1 }}  // iOS needs dimensions
  defaultSource={require('./placeholder.png')}  // iOS fallback
/>
```

### Issue 4: Status Bar Issues
```javascript
import { StatusBar } from 'react-native';

// iOS-specific status bar
<StatusBar 
  barStyle="dark-content"  // or "light-content"
  backgroundColor="transparent"
  translucent={false}
/>
```

### Issue 5: Gesture Conflicts
```javascript
// Swipe gestures on iOS
import { Swipeable } from 'react-native-gesture-handler';

// iOS swipe threshold is more sensitive
const SWIPE_THRESHOLD = Platform.OS === 'ios' ? 50 : 100;
```

## Testing & Debugging

### Xcode Debugging
```bash
# View logs in Console.app
# Filter by process: manyllamobile

# Debug JavaScript
# Cmd+D in simulator → Debug with Chrome

# Network debugging  
# Cmd+D → Network Inspector

# Performance profiling
# Xcode → Product → Profile → Time Profiler
```

### TestFlight Distribution
```bash
# Requirements:
1. Apple Developer account ($99/year)
2. App Store Connect access
3. Valid provisioning profiles

# Process:
1. Archive in Xcode
2. Upload to App Store Connect
3. Add external testers
4. Submit for review (24-48 hours)
```

### Crash Reporting
```javascript
// Crashlytics integration
import crashlytics from '@react-native-firebase/crashlytics';

// Log custom events
crashlytics().log('Profile saved');

// Record errors
crashlytics().recordError(error);

// Set user properties
crashlytics().setUserId(deviceId);
crashlytics().setAttribute('theme', currentTheme);
```

## Platform-Specific Patterns

### iOS-Only Features
```javascript
// iOS action sheet
import { ActionSheetIOS } from 'react-native';

if (Platform.OS === 'ios') {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['Cancel', 'Delete'],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
    (buttonIndex) => {
      if (buttonIndex === 1) deleteProfile();
    }
  );
}

// iOS-style switches
<Switch
  trackColor={{ false: '#767577', true: '#A08670' }}
  thumbColor='#FFFFFF'  // Always white on iOS
  ios_backgroundColor='#3e3e3e'
/>
```

### iOS Design Patterns
```javascript
// Navigation bar (iOS style)
const styles = StyleSheet.create({
  header: {
    height: Platform.OS === 'ios' ? 44 : 56,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    ...Platform.select({
      ios: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E0E0',
      },
      android: {
        elevation: 4,
      }
    })
  },
  
  // iOS-style back button
  backButton: {
    ...Platform.select({
      ios: {
        paddingHorizontal: 15,
        paddingVertical: 10,
      },
      android: {
        padding: 16,
      }
    })
  }
});
```

## Quality Checklist

### Before Any iOS Change
- [ ] Xcode 16+ installed
- [ ] Pods installed successfully
- [ ] Bundle ID is com.manyllamobile
- [ ] No TypeScript files
- [ ] No .ios.js files
- [ ] Safe areas handled
- [ ] Keyboard avoiding configured
- [ ] Images display correctly
- [ ] Works on iOS 14+
- [ ] No memory leaks

### App Store Checklist
- [ ] All icon sizes included
- [ ] Privacy descriptions added
- [ ] Version/build numbers updated
- [ ] Archive builds successfully
- [ ] No deprecated APIs
- [ ] Crash-free for 24 hours
- [ ] Screenshots for all devices
- [ ] App description ready
- [ ] TestFlight tested
- [ ] Accessibility tested

## Emergency Fixes

### Reset iOS Build
```bash
cd ios
rm -rf Pods Podfile.lock build
pod cache clean --all
pod install
cd ..
npx react-native run-ios
```

### Clear All Caches
```bash
watchman watch-del-all
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData
npm install
cd ios && pod install && cd ..
```

### Fix Signing Issues
```bash
# In Xcode:
1. Select project
2. Signing & Capabilities
3. Uncheck "Automatically manage signing"
4. Check it again
5. Select your team
```

## Performance Monitoring

### Key Metrics
```javascript
// Monitor in production
const performanceMonitor = {
  trackLaunchTime() {
    const launchTime = Date.now() - global.appStartTime;
    analytics.track('app_launch', { 
      duration_ms: launchTime,
      platform: 'ios',
      device: DeviceInfo.getModel()
    });
  },
  
  trackMemoryUsage() {
    // Requires native module
    const memory = NativeModules.MemoryModule?.getCurrentUsage();
    if (memory > 100 * 1024 * 1024) {  // 100MB
      console.warn('High memory usage:', memory);
    }
  }
};
```

---
*Last Updated: 2025.09.11*
*Platform: iOS 14.0+*
*Bundle ID: com.manyllamobile*
*Xcode: 16.0+*