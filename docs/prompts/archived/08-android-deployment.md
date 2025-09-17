# Android Deployment Preparation and Play Store Setup

## 🟡 SEVERITY: HIGH - DEPLOYMENT READINESS

**Issue**: Prepare Android app for production deployment and Google Play Store submission

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

Prepare the Android app for production deployment:
- Configure release signing with keystore
- Set up version management system
- Create deployment automation scripts
- Configure ProGuard/R8 for production
- Optimize APK/AAB size
- Implement Play Store metadata
- Set up crash reporting for production
- Configure staged rollout strategy
- Implement app update mechanisms
- Prepare for Android 16 KB page size requirement (Nov 2025)

## Required Changes

### Change 1: Release Signing Configuration
**Location**: `android/app/build.gradle`

**Implementation**:
```gradle
android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MANYLLA_RELEASE_STORE_FILE')) {
                storeFile file(MANYLLA_RELEASE_STORE_FILE)
                storePassword MANYLLA_RELEASE_STORE_PASSWORD
                keyAlias MANYLLA_RELEASE_KEY_ALIAS
                keyPassword MANYLLA_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            // Split APKs by ABI for smaller downloads
            splits {
                abi {
                    enable true
                    reset()
                    include 'arm64-v8a', 'armeabi-v7a'
                    universalApk false
                }
            }
        }
    }
}

// Version code generation based on date
def generateVersionCode() {
    def date = new Date()
    def formattedDate = date.format('yyyyMMdd')
    def buildNumber = project.hasProperty('buildNumber') ? buildNumber : '01'
    return Integer.parseInt(formattedDate + buildNumber)
}

android {
    defaultConfig {
        versionCode generateVersionCode()
        versionName "1.0.0"
    }
}
```

### Change 2: Keystore Generation Script
**Location**: `scripts/android/generate-keystore.sh`

**Implementation**:
```bash
#!/bin/bash

# Generate Android Release Keystore
set -e

KEYSTORE_PATH="android/app/manylla-release.keystore"
KEY_ALIAS="manylla"

if [ -f "$KEYSTORE_PATH" ]; then
    echo "⚠️ Keystore already exists at $KEYSTORE_PATH"
    exit 1
fi

echo "Generating Android release keystore..."
keytool -genkeypair -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_PATH" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Manylla, OU=Mobile, O=Manylla, L=City, ST=State, C=US"

echo "✅ Keystore generated successfully"
echo ""
echo "Add these to ~/.gradle/gradle.properties:"
echo "MANYLLA_RELEASE_STORE_FILE=manylla-release.keystore"
echo "MANYLLA_RELEASE_KEY_ALIAS=$KEY_ALIAS"
echo "MANYLLA_RELEASE_STORE_PASSWORD=[your-store-password]"
echo "MANYLLA_RELEASE_KEY_PASSWORD=[your-key-password]"
echo ""
echo "🔒 Store this keystore file securely - it cannot be regenerated!"
```

### Change 3: Deployment Script
**Location**: `scripts/android/deploy-android.sh`

**Implementation**:
```bash
#!/bin/bash

# Android Deployment Script
set -e

# Configuration
APP_NAME="Manylla"
BUILD_TYPE="${1:-release}" # release or debug
DEPLOY_TARGET="${2:-local}" # local, internal, production

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting Android Deployment${NC}"
echo "Build Type: $BUILD_TYPE"
echo "Deploy Target: $DEPLOY_TARGET"

# Pre-deployment checks
echo -e "${YELLOW}Running pre-deployment checks...${NC}"

# Check Java version
if ! java -version 2>&1 | grep -q "version \"17"; then
    echo -e "${RED}Error: Java 17 required${NC}"
    exit 1
fi

# Check keystore for release builds
if [ "$BUILD_TYPE" = "release" ]; then
    if [ ! -f "android/app/manylla-release.keystore" ]; then
        echo -e "${RED}Error: Release keystore not found${NC}"
        echo "Run: ./scripts/android/generate-keystore.sh"
        exit 1
    fi
fi

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
cd android
./gradlew clean
cd ..

# Increment version
if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${YELLOW}Incrementing version...${NC}"
    # Read current version from package.json
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo "Current version: $CURRENT_VERSION"
    
    # Auto-increment patch version
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
    
    # Update package.json
    npm version $NEW_VERSION --no-git-tag-version
    echo "New version: $NEW_VERSION"
fi

# Build
echo -e "${YELLOW}Building Android app...${NC}"
cd android

if [ "$BUILD_TYPE" = "release" ]; then
    # Build AAB for Play Store
    ./gradlew bundleRelease
    
    # Also build APKs for testing
    ./gradlew assembleRelease
    
    echo -e "${GREEN}Build complete!${NC}"
    echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
    echo "APKs: android/app/build/outputs/apk/release/"
else
    ./gradlew assembleDebug
    echo -e "${GREEN}Build complete!${NC}"
    echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

# Deploy based on target
case $DEPLOY_TARGET in
    local)
        echo -e "${YELLOW}Installing to connected device...${NC}"
        if [ "$BUILD_TYPE" = "release" ]; then
            adb install -r android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
        else
            adb install -r android/app/build/outputs/apk/debug/app-debug.apk
        fi
        echo -e "${GREEN}Installed successfully${NC}"
        ;;
    
    internal)
        echo -e "${YELLOW}Uploading to Play Console Internal Testing...${NC}"
        # Use Google Play Publisher API or fastlane
        # fastlane supply --aab android/app/build/outputs/bundle/release/app-release.aab --track internal
        echo "Manual upload required: android/app/build/outputs/bundle/release/app-release.aab"
        ;;
    
    production)
        echo -e "${RED}Production deployment requires manual approval${NC}"
        echo "AAB ready for upload: android/app/build/outputs/bundle/release/app-release.aab"
        echo "Follow staged rollout: 10% -> 50% -> 100%"
        ;;
esac

echo -e "${GREEN}Deployment process complete!${NC}"
```

### Change 4: Play Store Metadata
**Location**: `android/fastlane/metadata/android/en-US/`

**Create metadata structure**:
```bash
# Directory structure
android/fastlane/metadata/android/en-US/
├── title.txt                 # App name (30 chars)
├── short_description.txt      # Short desc (80 chars)
├── full_description.txt       # Full desc (4000 chars)
├── video.txt                  # YouTube video URL
├── images/
│   ├── phoneScreenshots/      # Phone screenshots
│   ├── tabletScreenshots/     # Tablet screenshots
│   ├── icon.png              # 512x512 icon
│   └── featureGraphic.png    # 1024x500 feature graphic
└── changelogs/
    └── 1.txt                  # Version 1 changelog
```

**title.txt**:
```
Manylla - Special Needs Info
```

**short_description.txt**:
```
Securely manage and share special needs information with caregivers
```

**full_description.txt**:
```
Manylla helps parents and caregivers organize and share important information about individuals with special needs.

Features:
• Secure, encrypted storage of medical and care information
• Easy sharing with teachers, therapists, and caregivers
• Zero-knowledge encryption - your data stays private
• Works offline with cloud backup
• Multi-device sync with recovery phrases
• Print-friendly care summaries
• No account required

Perfect for:
• Parents of children with special needs
• Care coordinators
• School IEP teams
• Therapy providers
• Respite caregivers

Your data is encrypted on your device before any sync or backup. We never have access to your information.
```

### Change 5: Production ProGuard Rules
**Location**: `android/app/proguard-rules.pro`

**Implementation**:
```proguard
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }

# Manylla
-keep class com.manylla.** { *; }

# TweetNaCl encryption - CRITICAL
-keep class com.tweetnacl.** { *; }
-keep class org.libsodium.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Navigation
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.** { *; }

# JSI
-keep class **.facebook.jni.** { *; }
-keepclassmembers class **.facebook.jni.** { *; }

# Crashlytics
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Remove logging in production
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
```

## Implementation Steps

1. **Step 1**: Generate Release Keystore
   ```bash
   # Create keystore (ONE TIME ONLY)
   ./scripts/android/generate-keystore.sh
   
   # Configure gradle properties
   echo "MANYLLA_RELEASE_STORE_FILE=manylla-release.keystore" >> ~/.gradle/gradle.properties
   echo "MANYLLA_RELEASE_KEY_ALIAS=manylla" >> ~/.gradle/gradle.properties
   echo "MANYLLA_RELEASE_STORE_PASSWORD=your-secure-password" >> ~/.gradle/gradle.properties
   echo "MANYLLA_RELEASE_KEY_PASSWORD=your-secure-password" >> ~/.gradle/gradle.properties
   
   # Backup keystore securely!
   cp android/app/manylla-release.keystore ~/secure-backup/
   ```

2. **Step 2**: Test Release Build
   ```bash
   # Clean build
   cd android && ./gradlew clean && cd ..
   
   # Build release APK
   cd android && ./gradlew assembleRelease
   
   # Test on device
   adb install android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
   ```

3. **Step 3**: Prepare Play Store Assets
   ```bash
   # Create metadata structure
   mkdir -p android/fastlane/metadata/android/en-US/images/phoneScreenshots
   mkdir -p android/fastlane/metadata/android/en-US/images/tabletScreenshots
   mkdir -p android/fastlane/metadata/android/en-US/changelogs
   
   # Generate screenshots
   ./scripts/android/generate-screenshots.sh
   
   # Create app icon (512x512)
   # Create feature graphic (1024x500)
   ```

4. **Step 4**: Build Production AAB
   ```bash
   # Build Android App Bundle
   ./scripts/android/deploy-android.sh release local
   
   # Verify AAB
   bundletool build-apks \
     --bundle=android/app/build/outputs/bundle/release/app-release.aab \
     --output=test.apks \
     --mode=universal
   ```

5. **Step 5**: Play Console Setup
   - Create app in Google Play Console
   - Upload AAB to internal testing
   - Configure app details and content rating
   - Set up pricing and distribution
   - Configure staged rollout plan

6. **Step 6**: Monitor Production
   ```bash
   # Set up crash reporting
   npm install @react-native-firebase/crashlytics
   
   # Configure performance monitoring
   npm install @react-native-firebase/perf
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

### Functional Testing
- [ ] Release keystore generated and backed up
- [ ] Release APK builds successfully
- [ ] Release AAB builds successfully
- [ ] APK size < 20MB per architecture
- [ ] ProGuard/R8 minification working
- [ ] No crashes on release build
- [ ] Version code/name updating correctly
- [ ] Play Store metadata prepared
- [ ] Screenshots for phone and tablet ready
- [ ] App installs and runs on test devices
- [ ] Encryption still works in release build
- [ ] 16KB page size compliance verified

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
3-4 hours for initial setup, 1 hour per deployment

## Priority
HIGH - Required for app store distribution and production deployment

## Risk Assessment
- **Risk**: Lost keystore prevents future updates
  - **Mitigation**: Multiple secure backups, document passwords
- **Risk**: ProGuard breaking functionality
  - **Mitigation**: Thorough testing, keep rules for critical libraries
- **Risk**: Large APK size
  - **Mitigation**: Split APKs by ABI, use AAB format
- **Risk**: Rejection from Play Store
  - **Mitigation**: Follow all guidelines, test thoroughly

## Rollback Plan
If issues arise after deployment:
1. Revert to previous version if critical issues found
2. Use staged rollout to limit impact
3. Have hotfix process ready
4. Monitor crash reports closely after deployment
5. Keep previous AAB for emergency rollback

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
