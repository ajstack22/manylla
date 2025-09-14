# Story S008: Privacy Policy Modal and Infrastructure

## Overview
Implement a Privacy Policy modal that's accessible during onboarding and throughout the app, meeting App Store requirements for privacy disclosure before data collection.

## Status
- **Priority**: P1 (High)
- **Status**: READY
- **Created**: 2025-09-12
- **Type**: Compliance/Feature
- **Assigned**: Unassigned

## Background
App Store requires privacy policy to be accessible before any data collection, including during onboarding. Based on StackMap's implementation, this needs to be available via URL parameter (`?privacy`), during onboarding, and from settings.

## Requirements

### Core Architecture
1. **Component Location**: `src/components/Modals/PrivacyModal/PrivacyModal.js`
2. **State Management**: Local state in App.js (not in context/stores)
3. **URL Parameter**: `?privacy` triggers automatic display
4. **Dual Availability**: Accessible during onboarding AND normal app flow

### URL Parameter Flow
1. **Early Capture** (App.js):
   - Parse URL parameters before React initialization
   - Store `window.urlOpenPrivacy = true` globally
   - Survives React re-renders

2. **Delayed Execution**:
   - Wait for app hydration/initialization
   - 1-second delay ensures full mount
   - Display modal and clear flag

### Import & Initialization Order
1. URL parsing happens first (captures parameters)
2. PrivacyModal imported early with other modals
3. Wait for data/state hydration
4. Modal can display after hydration

### Platform-Specific Handling
- **Android**: FlatList + force layout updates + StatusBar handling
- **iOS/Web**: ScrollView + native scrolling
- **Web-only**: Support/coffee button section (skip for Manylla)

## Implementation Details

### Files to Create
1. `src/components/Modals/PrivacyModal/PrivacyModal.js` - Main modal component
2. `src/components/Modals/PrivacyModal/styles.js` - Platform-specific styles
3. `src/components/Modals/PrivacyModal/index.js` - Export

### Files to Modify
1. **App.js**:
   - Add URL parameter parsing
   - Add privacy modal state
   - Add delayed execution effect
   - Render PrivacyModal component
   - Pass to OnboardingScreen

2. **OnboardingScreen.js**:
   - Add footer link for privacy
   - Accept onShowPrivacy prop
   - Display link before completion

3. **Settings Components**:
   - Add privacy policy link
   - Trigger modal from preferences

### Privacy Policy Content (Adapted for Manylla)
```
Privacy Policy
Last updated: September 12, 2025

Overview
Manylla is designed with privacy as a core principle. We believe families managing special needs information deserve tools that respect their privacy and give them control over their data.

Data Collection
We collect NO personal data by default. Manylla works entirely offline on your device.

Data Storage
• All profile data is stored locally on your device by default
• No data is sent to our servers unless you enable sync
• Your profiles, entries, and settings stay on your device

Zero-Knowledge Sync (Optional)
If you choose to enable sync between devices:
• Zero-knowledge architecture: Your data is encrypted on your device before syncing
• We cannot read your data: Only you have the decryption key
• Your sync key is your only access: If lost, data cannot be recovered
• Automatic cleanup: Inactive sync data is deleted after 6 months
• No accounts required: Sync works with just your recovery phrase

Children's Privacy
Manylla is designed for managing information about children:
• We don't collect any information from children
• No accounts or sign-ups required
• No social features or communication between users
• No behavioral tracking or analytics

Third-Party Services
Manylla uses minimal third-party services:
• No analytics - We don't track usage
• No advertising - We don't show ads
• No external APIs - Everything runs locally except optional sync
• Sync servers (optional) - Only store encrypted data we cannot decrypt

Your Rights
You have complete control:
• Export your data anytime
• Delete your data anytime (local or synced)
• Use the app without any account or sync
• Sync is always optional and can be disabled
• Request deletion of synced data via the app

Contact
Questions about privacy? Email: privacy@manylla.com

Manylla respects your family's privacy and gives you complete control over your data.
```

## Success Metrics
```bash
# Verification commands
grep -r "PrivacyModal" src/                    # Component imported
grep "urlOpenPrivacy" App.js                   # URL parameter handling
npm run web                                    # Test ?privacy parameter
# Manual: Privacy link appears in onboarding
# Manual: Privacy accessible from settings
```

## Acceptance Criteria
- [ ] Privacy modal component created
- [ ] URL parameter `?privacy` displays modal
- [ ] Accessible during onboarding via footer link
- [ ] Accessible from settings/preferences
- [ ] Platform-specific scroll handling works
- [ ] Modal displays over onboarding (doesn't close it)
- [ ] 1-second delay for URL parameter (hydration)
- [ ] Works on all platforms (web, iOS, Android)

## Technical Details

### Modal Component Structure
```javascript
const PrivacyModal = ({ visible, onClose, insets }) => {
  // Platform-specific scroll handling
  // StatusBar handling for Android
  // SafeAreaView for iOS
  // Content rendering with proper styles
}
```

### App.js Integration
```javascript
// Early URL capture
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('privacy')) {
  window.urlOpenPrivacy = true;
}

// Delayed execution after hydration
useEffect(() => {
  if (!isHydrated) return;
  setTimeout(() => {
    if (window.urlOpenPrivacy) {
      setShowPrivacyModal(true);
      window.urlOpenPrivacy = false;
    }
  }, 1000);
}, [isHydrated]);
```

## Dependencies
- React Native Modal
- Platform-specific scroll components
- SafeAreaView for iOS
- StatusBar for Android

## Estimated Effort
- Research: 1 hour (reference implementation review)
- Implementation: 4 hours (modal, integration, styling)
- Testing: 2 hours (all platforms, URL parameter)
- **Total**: S (Small - 7 hours)

## Notes
- Based on StackMap's proven implementation pattern
- No store dependency keeps it simple and always available
- Global flag pattern ensures URL parameter survives React lifecycle
- Must be accessible before any data entry (App Store requirement)

---
*Story ID: S008*
*Created: 2025-09-12*
*Status: READY*