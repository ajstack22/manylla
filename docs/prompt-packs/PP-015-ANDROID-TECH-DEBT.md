# PP-015: Android Platform Technical Debt

## 🎯 Purpose
Address remaining Android platform issues after initial setup, focusing on the CMake clean task failure and runtime testing requirements.

## 📋 Context
Android platform support was implemented with Java 17 enforcement and library compatibility fixes. While APK generation works (BUILD SUCCESSFUL for assembleDebug), several technical debt items remain that need resolution for production readiness.

## 🔴 Priority Level: HIGH
These issues affect development workflow and production deployment readiness.

---

## Issue 1: Gradle Clean Task Failure

### Current State
```bash
cd android && ./gradlew clean
# BUILD FAILED in 1s
# Error: Execution failed for task ':app:externalNativeBuildCleanDebug'
# CMake/ninja errors during clean operation
```

### Impact
- Cannot fully clean build artifacts
- Potential for stale cache issues
- Inconsistent build state between developers

### Investigation Required
1. Check CMake configuration in `android/app/build.gradle`
2. Verify native module configurations
3. Test if disabling externalNativeBuild fixes clean
4. Determine if react-native-reanimated or react-native-screens causing issue

### Acceptance Criteria
- [ ] `./gradlew clean` completes without errors
- [ ] All build artifacts properly removed
- [ ] No impact on assembleDebug functionality
- [ ] Document root cause and fix

### Suggested Approach
```gradle
// Potential fix in android/app/build.gradle
android {
    ...
    if (project.hasProperty("disableNativeClean")) {
        externalNativeBuild {
            cmake {
                cleanEnabled = false
            }
        }
    }
}
```

---

## Issue 2: Android Runtime Testing

### Current State
- APK builds successfully (75MB)
- No runtime testing performed
- Emulator started but app not launched
- Physical device testing pending

### Required Testing Matrix

#### Emulator Testing
| Device | API Level | Test Focus |
|--------|-----------|------------|
| Pixel 9 | 34 | Basic functionality |
| Pixel Tablet | 34 | Tablet layout |
| Pixel 4a | 30 | Low-end performance |

#### Functional Tests
- [ ] App launches without crash
- [ ] Data persistence works
- [ ] Theme switching (light/dark)
- [ ] Safe area insets display correctly
- [ ] Keyboard interaction
- [ ] Navigation gestures
- [ ] Memory usage under 200MB

#### Performance Tests
- [ ] Cold start time < 3 seconds
- [ ] List scrolling at 60fps
- [ ] No memory leaks after 5 min use
- [ ] Background/foreground transitions

### Test Script
```bash
# 1. Start emulator
$ANDROID_HOME/emulator/emulator -avd Pixel_9 &

# 2. Wait for boot
adb wait-for-device

# 3. Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 4. Launch app
adb shell am start -n com.manyllamobile/.MainActivity

# 5. Check for crashes
adb logcat | grep -E "FATAL|AndroidRuntime"
```

---

## Issue 3: Build Script Enhancements

### Current State
Scripts exist but lack error handling and validation

### Required Improvements

#### run-android.sh
```bash
# Add:
- Device selection (--device flag)
- Port configuration (--port flag)
- Auto-start emulator if none running
- Better error messages
```

#### build-android.sh
```bash
# Add:
- APK size validation
- Automatic version incrementing
- Build artifact archiving
- Upload to device after build
```

#### clean-android.sh
```bash
# Add:
- Workaround for CMake clean issue
- Selective cleaning options
- Cache preservation option
```

---

## Issue 4: Missing Android-Specific Features

### Platform Parity Checklist
- [ ] Push notifications setup
- [ ] Deep linking configuration
- [ ] App icons and splash screen
- [ ] ProGuard rules for release
- [ ] Signing configuration
- [ ] Play Store metadata

### AndroidManifest.xml Updates
```xml
<!-- Add for deep linking -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="manylla" />
</intent-filter>
```

---

## Issue 5: Build Optimization

### Current State
- Debug APK: 75MB (too large)
- No ProGuard/R8 optimization
- All architectures included

### Optimization Tasks
1. **Enable ProGuard**
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
       }
   }
   ```

2. **Split APKs by ABI**
   ```gradle
   splits {
       abi {
           enable true
           reset()
           include 'armeabi-v7a', 'arm64-v8a'
           universalApk false
       }
   }
   ```

3. **Optimize Images**
   - Convert PNGs to WebP
   - Remove unused resources
   - Use vector drawables

### Target Metrics
- Release APK < 30MB
- Cold start < 2 seconds
- Memory usage < 150MB

---

## Issue 6: CI/CD Integration

### Requirements
- Automated Android builds on commit
- APK artifact storage
- Automated testing on device farm
- Release build generation

### GitHub Actions Workflow
```yaml
name: Android Build
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '17'
          distribution: 'adopt'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build Android
        run: |
          cd android
          ./gradlew assembleDebug
      
      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎬 Implementation Order

### Phase 1: Critical Fixes (Week 1)
1. Fix gradle clean task
2. Complete runtime testing on emulator
3. Document any crashes or issues

### Phase 2: Optimization (Week 2)
1. Implement ProGuard
2. Reduce APK size
3. Add platform-specific features

### Phase 3: Automation (Week 3)
1. Enhance build scripts
2. Set up CI/CD
3. Automate testing

---

## 📊 Success Metrics

### Must Have
- [ ] Clean task works without errors
- [ ] App runs on Android without crashes
- [ ] APK size reduced by 50%
- [ ] All tests passing

### Should Have
- [ ] CI/CD pipeline operational
- [ ] Automated device testing
- [ ] Performance metrics collected

### Could Have
- [ ] Play Store release ready
- [ ] Crash reporting integrated
- [ ] Analytics implemented

---

## 🔧 Testing Commands

### Quick Validation
```bash
# Verify setup
./scripts/android/run-android.sh --version

# Clean and build
cd android
./gradlew clean || echo "Clean failed - continuing"
./gradlew assembleDebug

# Check APK
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

### Full Test Suite
```bash
# 1. Unit tests
npm test

# 2. Build tests
./gradlew test

# 3. Lint checks
./gradlew lint

# 4. Install and run
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.manyllamobile/.MainActivity
```

---

## 📚 References

### Documentation
- [React Native Android Guide](https://reactnative.dev/docs/android-setup)
- [Gradle Build Guide](https://developer.android.com/build)
- [ProGuard Rules](https://www.guardsquare.com/manual/configuration/usage)

### Similar Issues
- [CMake Clean Issue](https://github.com/facebook/react-native/issues/35935)
- [Safe Area Context v5 Migration](https://github.com/th3rdwave/react-native-safe-area-context/releases/tag/v5.0.0)

### Internal Docs
- `/ANDROID_SETUP_ACTUAL_STATUS.md` - Current state
- `/ANDROID_LIBRARY_FIX.md` - Compatibility fix
- `/scripts/android/` - Build scripts

---

## ⚠️ Known Blockers

### CMake Clean Failure
- **Status**: Active issue
- **Workaround**: Delete build folders manually
- **Impact**: Minor - doesn't affect builds

### Emulator Performance
- **Status**: Requires high-end machine
- **Workaround**: Use physical device
- **Impact**: Slows testing

---

## 🎯 Definition of Done

### For Each Issue
1. Root cause identified
2. Fix implemented and tested
3. Documentation updated
4. No regression in existing functionality
5. Code reviewed and approved

### For Complete Pack
1. All critical issues resolved
2. Android platform stable
3. APK optimized for production
4. CI/CD pipeline operational
5. Testing automated

---

## 💡 Quick Wins

1. **Document the clean workaround**
   ```bash
   # Add to clean-android.sh
   rm -rf android/app/.cxx android/app/build
   rm -rf android/build android/.gradle
   ```

2. **Add device check to run script**
   ```bash
   if ! adb devices | grep -q "device$"; then
     echo "No device found. Starting emulator..."
     $ANDROID_HOME/emulator/emulator -avd Pixel_9 &
   fi
   ```

3. **Create test checklist**
   - Simple markdown file
   - Manual verification steps
   - Track what's been tested

---

## 🚀 Next Steps

1. **Assign to Developer Role**
   - Fix CMake clean issue
   - Run emulator tests
   - Optimize APK size

2. **Assign to Admin Role**
   - Set up CI/CD
   - Configure build automation
   - Monitor performance

3. **Assign to PM Role**
   - Prioritize remaining work
   - Track testing progress
   - Plan production release

---

**Priority**: HIGH  
**Effort**: 2-3 weeks  
**Risk**: Medium (mostly optimization work)  
**Value**: Enables Android production deployment

---

*Last Updated: 2025-09-11*  
*Status: Ready for Implementation*