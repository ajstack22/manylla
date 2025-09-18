# Fix MUI Icon System for Android Compatibility

## 1. User Persona

**As a** Mobile App Developer

## 2. The "What"

**I want to** replace all MUI (@mui/icons-material) and emotion/styled dependencies with React Native compatible icon solutions

**So that** the Manylla app runs without crashes on Android devices and all navigation flows work correctly

## 3. The "Why"

The current implementation uses Material-UI icons which depend on @emotion/styled - a web-only CSS-in-JS library that's incompatible with React Native. This causes immediate crashes on Android with "View config getter callback for component 'style' must be a function" errors, making the app completely unusable on Android devices.

## 4. Success Metrics

- App launches successfully on Android without any emotion/styled errors
- All icons render correctly using fallback emojis or react-native-vector-icons
- Demo mode and all navigation flows work without crashes
- Zero MUI/emotion packages in dependencies
- Metro bundler runs without ENOENT errors for missing MUI files

## 5. Acceptance Criteria

**Scenario 1: App Launch on Android**
- **Given** the app is installed on an Android device
- **When** the user launches the app
- **Then** the welcome screen should display without errors
- **And** all icons should render (either as emojis or vector icons)
- **And** no emotion/styled errors should appear in logs

**Scenario 2: Navigate to Demo Mode**
- **Given** the app is running on Android
- **When** the user taps "Try Demo Mode"
- **Then** demo mode should load successfully
- **And** no MUI/emotion reference errors should occur
- **And** the app should remain functional

**Scenario 3: Complete Navigation Flow**
- **Given** the app is in demo mode on Android
- **When** the user navigates through different screens
- **Then** all screens should load without crashes
- **And** all UI elements should be visible and functional

## 6. Evidence and Data Requirements

- [x] Screenshot of app running on Android welcome screen
- [x] Screenshot showing successful demo mode entry
- [ ] Metro bundler logs showing no MUI/emotion file errors
- [ ] Package.json showing no MUI or emotion dependencies
- [ ] Test results from all navigation flows
- [ ] Performance metrics showing no degradation

## 7. Implementation Plan

### Phase 1: Remove MUI Dependencies
1. Uninstall @mui/icons-material, @mui/material, @emotion/react, @emotion/styled
2. Update package.json and package-lock.json

### Phase 2: Update Icon System
1. Modify IconProvider.js to use only:
   - react-native-vector-icons for mobile (if available)
   - Emoji/text fallbacks for all platforms
2. Create platform-specific implementations:
   - IconProvider.web.js (can use MUI if needed for web only)
   - IconProvider.js (mobile-safe implementation)

### Phase 3: Clean and Rebuild
1. Clear all Metro caches: `rm -rf $TMPDIR/metro-*`
2. Clean Android build: `cd android && ./gradlew clean`
3. Delete node_modules cache: `rm -rf node_modules/.cache`
4. Reinstall and rebuild the app

### Phase 4: Testing
1. Test app launch on Android emulator
2. Test demo mode navigation
3. Test all major user flows
4. Verify no console errors related to MUI/emotion

## 8. Current Status

### Completed:
- ✅ Identified root cause: MUI icons incompatible with React Native
- ✅ Removed MUI imports from IconProvider.js
- ✅ Created emoji fallbacks for all icons
- ✅ Uninstalled MUI and emotion packages
- ✅ App launches successfully on Android

### Issues Remaining:
- ❌ Demo mode still references cached MUI bundles
- ❌ Metro bundler has stale references to removed packages
- ❌ Need complete cache clear and rebuild

## 9. Formal Review and Sign-off

- **Product Manager:** Adam Stack
- **Lead Developer:** Claude (AI Assistant)
- **QA Engineer:** To be assigned

---

**Created:** 2025-09-17
**Bug Reference:** B011
**Priority:** P0 (Critical - App unusable on Android)
**Estimated Effort:** 4-8 hours