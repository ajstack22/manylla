# Android Platform Initial Setup and Configuration

## 🟡 SEVERITY: HIGH - PLATFORM ENABLEMENT

**Issue**: Set up Android development environment and configure React Native for Android platform support

## ⚠️ CRITICAL DISCOVERY
**Current Java Version**: Java 24 (INCOMPATIBLE)
**Required Java Version**: Java 17 (for Android/Gradle compatibility)
**Android Directory**: Exists but unconfigured
**Scripts Directory**: Missing (needs creation)

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

The Manylla app currently runs on web and iOS but needs Android platform support. This requires:
- Setting up the Android development environment
- Configuring React Native 0.80.1 for Android
- Implementing Java 17 (NOT Java 24) configuration
- Setting up Gradle 8.8 build system
- Configuring Android emulators for testing
- Implementing Android-specific scripts for development

## Required Changes

### Change 1: Android Build Configuration
**Location**: `android/build.gradle`

**Required Configuration**:
```gradle
buildscript {
    ext {
        buildToolsVersion = "35.0.0"
        minSdkVersion = 24  // Android 7.0 Nougat
        compileSdkVersion = 35  // Android 15
        targetSdkVersion = 35
        kotlinVersion = "2.1.20"  // Updated for React Native 0.80
        ndkVersion = "27.3.12077973"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.9.2")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}
```

### Change 2: Gradle Properties Configuration
**Location**: `android/gradle.properties`

**Required Properties**:
```properties
# React Native New Architecture (enable for performance)
newArchEnabled=true
hermesEnabled=true

# Android 16 KB page size compliance
android.experimental.enable16KPageSizes=true

# Build optimizations
org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.caching=true

# React Native specific
reactNativeArchitectures=arm64-v8a,armeabi-v7a
```

### Change 3: Java 17 Build Scripts
**Location**: `scripts/android/`

**Create run-android.sh**:
```bash
#!/bin/bash
# Force Java 17 for Android builds
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "Using Java version:"
java -version 2>&1 | head -1

if ! java -version 2>&1 | grep -q "version \"17"; then
    echo "❌ ERROR: Java 17 is required. Found:"
    java -version
    exit 1
fi

npx react-native run-android "$@"
```

### Change 4: Android Manifest Permissions
**Location**: `android/app/src/main/AndroidManifest.xml`

**Required Permissions**:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Add to application tag for orientation support -->
<activity
    android:name=".MainActivity"
    android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
    android:launchMode="singleTask"
    android:windowSoftInputMode="adjustResize">
```

## Implementation Steps

1. **Step 1**: ⚠️ CRITICAL - Switch from Java 24 to Java 17
   ```bash
   # Current version (INCOMPATIBLE):
   # openjdk version "24.0.1" 2025-04-15
   
   # Install Java 17 (REQUIRED)
   brew install openjdk@17
   
   # Set JAVA_HOME permanently in ~/.zshrc or ~/.bash_profile
   echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
   echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc
   
   # Verify Java 17 is active
   java -version  # Should show: openjdk version "17.x.x"
   ```

2. **Step 2**: Install Android Development Tools
   ```bash
   # Install Android Studio or command line tools
   # Set ANDROID_HOME
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   
   # Install required Android SDK components
   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   sdkmanager "ndk;27.3.12077973" "cmake;3.22.1"
   ```

3. **Step 3**: Configure Android Build Files
   - Update `android/build.gradle` with new configurations
   - Update `android/gradle.properties` with optimization settings
   - Update `android/app/build.gradle` with SDK versions
   - Update `android/gradle/wrapper/gradle-wrapper.properties` to use Gradle 8.8

4. **Step 4**: Create Android Emulators
   ```bash
   # Create phone emulator
   avdmanager create avd -n Pixel_8_Pro_API_34 -k "system-images;android-34;google_apis;arm64-v8a" -d "pixel_8_pro"
   
   # Create tablet emulator  
   avdmanager create avd -n Pixel_Tablet_API_34 -k "system-images;android-34;google_apis;arm64-v8a" -d "pixel_tablet"
   ```

5. **Step 5**: Create Helper Scripts (REQUIRED - Directory Missing)
   ```bash
   # Create scripts directory first
   mkdir -p scripts/android
   ```
   - Create `scripts/android/run-android.sh` with Java 17 enforcement
   - Create `scripts/android/build-android.sh` for builds
   - Create `scripts/android/clean-android.sh` for cleanup
   - Make scripts executable: `chmod +x scripts/android/*.sh`

6. **Step 6**: Initial Build Test
   ```bash
   # Clean any existing builds
   cd android && ./gradlew clean && cd ..
   
   # Start Metro bundler
   npx react-native start --reset-cache
   
   # Run on Android (new terminal)
   ./scripts/android/run-android.sh
   ```

## Pre-Implementation Checklist

### Environment Verification
- [ ] ⚠️ Java 17 installed and active (NOT Java 24)
- [ ] ANDROID_HOME environment variable set
- [ ] Android SDK installed (API 34+)
- [ ] Android Studio or Command Line Tools installed
- [ ] Gradle 8.8 available

### Project Status
- [x] Android directory exists (needs configuration)
- [ ] Scripts directory needs creation
- [ ] Build files need updating
- [ ] Emulators need creation

## Testing Requirements

### Pre-Deploy Validation
```bash
# ALL must pass:
find src -name "*.tsx" -o -name "*.ts" | wc -l          # Must be 0
find src -name "*.native.*" -o -name "*.web.*" | wc -l  # Must be 0
npm run build:web                                        # Must succeed
npx prettier --check 'src/**/*.js'                      # Must pass
```

### Functional Testing
- [ ] Java 17 is correctly installed and set as default
- [ ] Android emulators launch successfully
- [ ] App builds without errors using `./scripts/android/run-android.sh`
- [ ] Metro bundler connects to Android emulator
- [ ] App runs on Pixel 8 Pro emulator (phone)
- [ ] App runs on Pixel Tablet emulator (tablet)
- [ ] Gradle clean build succeeds
- [ ] All permissions are properly configured

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
2-3 hours for initial setup and configuration

## Priority
HIGH - Android platform support is critical for mobile app deployment

## Common Issues & Solutions

### Java Version Errors
```bash
# Error: "Unsupported class file major version 68"
# Solution: Java 24 is active instead of Java 17

# Fix:
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
java -version  # Verify shows 17.x.x
```

### Gradle Build Failures
```bash
# Error: "Could not determine java version from '24.0.1'"
# Solution: Gradle doesn't support Java 24

# Fix in android/gradle.properties:
org.gradle.java.home=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

### SDK Version Mismatches
```bash
# Error: "Failed to find target with hash string 'android-35'"
# Solution: Install missing SDK

sdkmanager "platforms;android-35" "build-tools;35.0.0"
```

## Risk Assessment
- **Risk**: Java version conflicts (CURRENT ISSUE - Java 24 instead of Java 17)
  - **Mitigation**: Enforce Java 17 in all build scripts, provide clear error messages
- **Risk**: Build failures due to incorrect SDK versions
  - **Mitigation**: Document exact versions, use lockfiles where possible
- **Risk**: Emulator performance issues on development machines
  - **Mitigation**: Provide both emulator and physical device testing options

## Rollback Plan
If Android setup causes issues:
1. Continue web and iOS development while resolving Android issues
2. Keep Android changes isolated in android/ directory
3. Use feature flags if needed to disable Android-specific code
4. Document any blockers for escalation

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
