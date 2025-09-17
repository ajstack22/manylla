# Current Deployment Status - Unified Architecture

## Overview

This document outlines the current deployment setup for Manylla's unified cross-platform architecture, including web deployment to qual, iOS development setup, and Android development configuration.

## Production Environment

### Web Deployment
- **Live URL**: https://manylla.com/qual/
- **Status**: ✅ Active - Phase 3 Complete
- **Backend**: PHP/MySQL with zero-knowledge encryption
- **Database**: `stachblx_manylla_sync_qual`

### Current Version
- **Latest**: v2025.09.07.2 
- **Release**: React Native migration Phase 1 - Core CRUD components
- **Features**: Unified web and mobile codebase with 95% code sharing

## Deployment Process

### Mandatory Deployment Method
**THE ONLY APPROVED WAY TO DEPLOY TO QUAL:**
```bash
./scripts/deploy-qual.sh
```

This hardened deployment script enforces:
- ✅ All changes committed to git
- ✅ Release notes updated in `docs/RELEASE_NOTES.md`
- ✅ All validation checks pass (lint, TypeScript, security)
- ✅ Maximum 20 TODOs and 5 console.logs in src/
- ✅ Build succeeds with no errors
- ✅ Automatic version increment and git commit
- ✅ Health check post-deployment

### Build Configuration

#### Web Build Process
```json
{
  "scripts": {
    "web": "webpack serve --mode development",
    "build:web": "NODE_ENV=production webpack --mode production"
  }
}
```

The deployment script:
1. Updates `package.json` homepage to `/qual` for subdirectory deployment
2. Runs production build with increased memory: `NODE_OPTIONS=--max-old-space-size=8192`
3. Deploys to `~/public_html/manylla/qual/` via rsync
4. Restores original package.json configuration

#### Build Output Structure
```
build/
├── static/
│   ├── css/           # Compiled stylesheets
│   ├── js/            # Bundled JavaScript
│   └── media/         # Assets (fonts, images)
├── index.html         # Main entry point
├── manifest.json      # PWA manifest
└── asset-manifest.json # Build artifacts
```

## Platform-Specific Development

### Web Development
```bash
# Development server (port 3000)
npm run web

# Production build
npm run build:web

# Linting and type checking
npm run lint
npm run typecheck
```

**Local Development URL**: http://localhost:3000

### iOS Development
```bash
# Start Metro bundler
npm run start

# Run on iOS simulator
npm run ios

# Clean iOS build
cd ios && rm -rf build && cd ..

# Install iOS dependencies
npm run pod-install
```

**Requirements**:
- Xcode 14+
- CocoaPods installed
- iOS Simulator or physical device
- React Native CLI

**Project Structure**:
```
ios/
├── ManyllaMobile.xcodeproj/    # Xcode project
├── ManyllaMobile/              # iOS app source
│   ├── AppDelegate.mm          # App delegate
│   ├── Info.plist             # App configuration
│   └── Fonts/                 # Custom fonts
├── Podfile                    # CocoaPods dependencies
└── Podfile.lock              # Locked dependencies
```

### Android Development
```bash
# Run on Android emulator/device
npm run android

# Clean Android build
npm run clean
```

**Requirements**:
- Android Studio
- Android SDK 31+
- Java 11+
- Android emulator or physical device

**Project Structure**:
```
android/
├── app/
│   ├── src/main/
│   │   ├── java/           # Java/Kotlin source
│   │   ├── assets/         # React Native bundle
│   │   └── res/           # Android resources
│   └── build.gradle       # App build configuration
├── build.gradle          # Project build configuration
└── gradle.properties     # Gradle properties
```

## Unified Codebase Architecture

### Single Entry Point
- **Main File**: `/App.js` (1,111 lines)
- **Approach**: StackMap-style unified architecture
- **Code Sharing**: 95% shared between platforms
- **Platform Detection**: `Platform.OS` conditional logic

### Build Targets
```bash
# Web build - Webpack
npm run build:web
→ Outputs to build/ directory
→ Deployed to manylla.com/qual/

# iOS build - Xcode
npm run ios
→ Builds iOS app bundle
→ Runs on simulator/device

# Android build - Gradle  
npm run android
→ Builds Android APK/Bundle
→ Runs on emulator/device
```

### Platform-Specific Optimizations

#### Web Optimizations
- **Bundle Splitting**: Webpack code splitting
- **Service Worker**: PWA capabilities
- **Responsive Design**: CSS Grid and Flexbox
- **SEO**: Meta tags and structured data

#### Mobile Optimizations
- **Native Modules**: Gesture handling, safe area
- **Performance**: Hermes JavaScript engine
- **Native UI**: Platform-specific components
- **Device APIs**: Camera, storage, notifications

## Environment Configuration

### Development Environments
```bash
# Local development
NODE_ENV=development npm run web
NODE_ENV=development npm run ios

# Staging build (qual deployment)
NODE_ENV=production npm run build:web
```

### Environment Variables
```bash
# Web development
REACT_APP_API_BASE_URL=https://manylla.com/qual/api/
REACT_APP_ENVIRONMENT=development

# Production (qual)
REACT_APP_API_BASE_URL=https://manylla.com/qual/api/
REACT_APP_ENVIRONMENT=production
```

## API Integration

### Backend Endpoints
All platforms use the same API endpoints:
- `/api/sync_health.php` - Health check endpoint
- `/api/sync_push.php` - Push encrypted sync data
- `/api/sync_pull.php` - Pull encrypted sync data  
- `/api/share_create.php` - Create temporary encrypted share
- `/api/share_access.php` - Access encrypted share

### Configuration
- **Database**: MySQL with encrypted blob storage
- **Security**: Zero-knowledge encryption with TweetNaCl
- **Sync**: 60-second pull interval, immediate push on changes

## Quality Assurance

### Pre-Deployment Checks
The deploy script enforces these quality gates:
1. **Git Status**: No uncommitted changes
2. **Release Notes**: Must contain version entry
3. **Linting**: All ESLint rules must pass
4. **TypeScript**: No compilation errors
5. **Security**: No critical vulnerabilities
6. **Code Quality**: Max 20 TODOs, max 5 console.logs
7. **Build**: Must complete successfully
8. **Health Check**: Post-deployment verification

### Testing Strategy
```bash
# Run tests
npm test

# Web-specific tests  
npm run test:web

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Monitoring and Maintenance

### Health Monitoring
- **Web**: https://manylla.com/qual/ (HTTP 200 check)
- **API**: https://manylla.com/qual/api/sync_health.php
- **Database**: Connection and query performance
- **Sync**: End-to-end encryption/decryption

### Log Management
- **Server Logs**: `/home/stachblx/logs/`
- **Application Logs**: Browser DevTools, Xcode Console, Android Studio
- **Sync Logs**: Database audit trail

### Backup Strategy
- **Database**: Daily automated backups via cPanel
- **Code**: Git repository with GitHub backup
- **Build Artifacts**: Versioned deployment history

## Deployment Checklist

### Pre-Deployment
- [ ] All changes committed and pushed to GitHub
- [ ] Release notes updated with version and changes
- [ ] No critical security vulnerabilities
- [ ] All tests passing
- [ ] Build completes successfully

### Deployment
- [ ] Run `./scripts/deploy-qual.sh` (only approved method)
- [ ] Verify health check passes
- [ ] Test critical user flows
- [ ] Monitor error logs for 30 minutes

### Post-Deployment
- [ ] Smoke test all major features
- [ ] Check API endpoints responding
- [ ] Verify sync functionality working
- [ ] Monitor user feedback and error reports

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React Native cache
npm run start:reset

# Clear iOS build cache
cd ios && rm -rf build && pod install && cd ..
```

#### Deployment Issues
```bash
# Check SSH configuration
cat ~/.ssh/config

# Test server connection
ssh stackmap-cpanel "ls -la ~/public_html/manylla/"

# Check disk space
ssh stackmap-cpanel "df -h"
```

#### Platform-Specific Issues
```bash
# iOS simulator reset
xcrun simctl erase all

# Android emulator cleanup
cd ~/.android/avd/ && rm -rf *

# Web browser cache
# Clear localhost:3000 from browser storage
```

## Future Roadmap

### Planned Enhancements
1. **iOS App Store**: Prepare for App Store submission
2. **Android Play Store**: Google Play Store deployment
3. **Desktop App**: Electron wrapper for desktop platforms
4. **Enhanced PWA**: Advanced offline capabilities

### Infrastructure Improvements
1. **CI/CD Pipeline**: Automated testing and deployment
2. **Staging Environment**: Separate staging server
3. **Performance Monitoring**: Real-time performance metrics
4. **Error Tracking**: Centralized error reporting

This deployment setup provides a robust, scalable foundation for Manylla's continued growth while maintaining the benefits of the unified architecture approach.