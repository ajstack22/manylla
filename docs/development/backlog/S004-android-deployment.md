# Story S004: Android Deployment and Play Store Setup

## Overview
Prepare the Android app for production deployment and Google Play Store submission. This includes app signing, build configuration, Play Store assets, and deployment pipeline setup.

## Status
- **Priority**: P2 (Medium)
- **Status**: READY
- **Created**: 2025-09-12
- **Type**: Deployment Readiness
- **Assigned**: Unassigned

## Background
The Android app needs production configuration and Play Store setup before public release. This includes signing certificates, build optimization, store listing preparation, and deployment automation.

## Requirements

### 1. App Signing & Security
- Generate release keystore
- Configure signing in gradle
- Set up Google Play App Signing
- Implement certificate pinning
- Enable ProGuard/R8 minification

### 2. Build Configuration
- Configure production build flavors
- Optimize APK/AAB size
- Set version codes and names
- Configure build variants
- Enable bundle generation

### 3. Play Store Assets
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (min 2, max 8)
- App description (short & full)
- Privacy policy URL
- Terms of service URL

### 4. Technical Requirements
- Target API level 33+ (Android 13)
- Min SDK 21 (Android 5.0)
- Support both phones and tablets
- Handle runtime permissions
- Implement deep linking

## Success Metrics
```bash
# Build validation
cd android && ./gradlew assembleRelease  # Builds successfully
ls -la app/build/outputs/bundle/release/*.aab  # AAB exists

# Size optimization
stat -f%z app/build/outputs/bundle/release/*.aab  # < 20MB

# Signing verification
jarsigner -verify -verbose app/build/outputs/apk/release/*.apk

# Architecture compliance
find src -name "*.tsx" -o -name "*.ts" | wc -l  # Must be 0
grep -r "@mui/material" src/ | wc -l  # Must be 0

# Play Store readiness
./scripts/android/validate-release.sh  # All checks pass
```

## Implementation Guidelines

### Phase 1: Signing Setup
```bash
# Generate keystore
keytool -genkey -v -keystore manylla-release.keystore \
  -alias manylla -keyalg RSA -keysize 2048 -validity 10000

# Configure gradle
# android/app/build.gradle
signingConfigs {
    release {
        storeFile file('manylla-release.keystore')
        storePassword System.getenv('KEYSTORE_PASSWORD')
        keyAlias 'manylla'
        keyPassword System.getenv('KEY_PASSWORD')
    }
}
```

### Phase 2: Build Optimization
```gradle
// android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 
                         'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    
    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

### Phase 3: Store Listing
```yaml
# play-store/listing.yaml
title: Manylla - Special Needs Information Manager
shortDescription: Secure, private special needs information management
fullDescription: |
  Manylla helps families organize and share special needs information...
  
category: Medical
contentRating: Everyone
pricing: Free
```

## Acceptance Criteria
- [ ] Release keystore generated and secured
- [ ] Gradle signing configured
- [ ] ProGuard rules optimized
- [ ] AAB size < 20MB
- [ ] All Play Store assets created
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Deep linking configured
- [ ] Push notifications setup
- [ ] Crash reporting enabled
- [ ] Analytics configured
- [ ] CI/CD pipeline ready
- [ ] Rollout strategy defined
- [ ] Backup keystore secured

## Technical Details

### Required Files
```
android/
├── app/
│   ├── build.gradle (signing config)
│   ├── proguard-rules.pro (optimization)
│   └── src/main/
│       ├── AndroidManifest.xml (permissions)
│       └── res/ (icons, strings)
├── keystore/
│   ├── manylla-release.keystore
│   └── keystore.properties
└── gradle.properties (build config)

play-store/
├── assets/
│   ├── icon-512.png
│   ├── feature-graphic.png
│   └── screenshots/
├── listings/
│   └── en-US/
│       ├── title.txt
│       ├── short-description.txt
│       └── full-description.txt
└── release-notes/
    └── whatsnew.txt
```

### Environment Variables
```bash
export KEYSTORE_PASSWORD="secure-password"
export KEY_PASSWORD="secure-key-password"
export PLAY_STORE_KEY="path/to/api-key.json"
```

## Dependencies
- Google Play Console account ($25 one-time)
- Signing certificate (keep secure!)
- Play Store API key for automation
- Privacy policy hosting
- Crash reporting service (Firebase/Sentry)

## Estimated Effort
- Signing setup: 2 hours
- Build configuration: 4 hours
- Asset creation: 8 hours
- Store listing: 4 hours
- Testing & validation: 4 hours
- CI/CD setup: 4 hours
- **Total**: Medium (26 hours)

## Risk Mitigation
- **Keystore loss**: Backup in multiple secure locations
- **Build failures**: Test on multiple devices
- **Store rejection**: Review all policies carefully
- **Size issues**: Implement dynamic feature modules
- **Crash on launch**: Extensive device testing

## Deployment Checklist
- [ ] Architecture compliance verified
- [ ] No TypeScript files
- [ ] No platform-specific files
- [ ] Build succeeds for all variants
- [ ] APK/AAB signed correctly
- [ ] All permissions justified
- [ ] Privacy policy accessible
- [ ] COPPA compliance verified
- [ ] Accessibility features tested
- [ ] Offline mode works
- [ ] Update mechanism tested

## Notes
- Follow Material Design guidelines for Android
- Test on Android 5.0 through 14
- Consider staged rollout (1% → 10% → 50% → 100%)
- Monitor crash rates closely after launch
- Prepare customer support responses

---
*Story ID: S004*
*Created: 2025-09-12*
*Converted from: docs/prompts/active/08-android-deployment.md*