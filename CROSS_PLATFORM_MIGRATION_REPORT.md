# Manylla Cross-Platform Migration Report

## Executive Summary
The Manylla app is currently in a partially migrated state from separate platform files to a unified cross-platform codebase. The app freezes on iOS due to component import resolution issues. This report documents every file, its current state, and required changes to achieve 95% code sharing following StackMap's patterns.

## Current Status
- **Code Sharing:** ~70% unified
- **Blocker:** iOS app freezes at splash screen due to OnboardingWizard import failure
- **Architecture:** Service layer properly unified, component layer needs fixes

## Critical Issues to Fix

### 1. IMMEDIATE BLOCKER - OnboardingWizard Import Resolution
**File:** `/src/components/Onboarding/index.tsx`
```typescript
// CURRENT - Always exports native version
export { OnboardingWizard } from './OnboardingWizard.native';

// REQUIRED FIX
import { Platform } from 'react-native';
export const OnboardingWizard = Platform.OS === 'web' 
  ? require('./OnboardingWizard.web').OnboardingWizard
  : require('./OnboardingWizard.native').OnboardingWizard;
```

### 2. App Entry Point Conflict
- **App.tsx** - Has broken imports, should be removed
- **App.js** - Correctly structured, should be the only entry point
- **Action:** Delete App.tsx, ensure index.js imports App.js

### 3. Theme Context Unification
**Files to merge:**
- `/src/context/ThemeContext.tsx` (web with Material-UI)
- `/src/context/ThemeContext.native.tsx` (mobile without Material-UI)
- `/src/context/ThemeContext.js` (attempted unified version)

**Solution:** Single ThemeContext.js with Platform.OS checks for Material-UI

## File-by-File Analysis

### Root Level Files

#### `/index.js`
- **Purpose:** React Native entry point
- **Status:** ✅ Cross-platform ready
- **Changes:** Should import App.js (not App.tsx)

#### `/App.js` 
- **Purpose:** Main unified app component
- **Status:** ✅ Correctly structured
- **Platform Handling:** Uses Platform.OS and dynamic requires
- **Keep:** This is the correct implementation

#### `/App.tsx`
- **Purpose:** Legacy TypeScript version
- **Status:** ❌ Has broken imports
- **Action:** DELETE - conflicts with App.js

#### `/App.simple.js`, `/App.minimal.js`, `/App.test.js`
- **Purpose:** Debug test files
- **Action:** DELETE after fixing main app

### Component Layer

#### Profile Components
**Files:**
- `/src/components/Profile/ProfileOverview.tsx` (web)
- `/src/components/Profile/ProfileOverview.native.js` (mobile)
- `/src/components/Profile/ProfileCard.native.tsx` (mobile only)

**Required Changes:**
1. Create unified ProfileOverview.js with Platform.OS checks
2. Share 90% of logic, only vary styling approach
3. Use StyleSheet for mobile, sx/css for web

#### Onboarding Components
**Critical Files:**
- `/src/components/Onboarding/index.tsx` ❌ BROKEN
- `/src/components/Onboarding/OnboardingWizard.tsx` (web)
- `/src/components/Onboarding/OnboardingWizard.native.js` (mobile)
- `/src/components/Onboarding/OnboardingWizard.js` (attempted unified)

**Fix Priority:** HIGH - This is blocking iOS launch

#### Dialog Components
**Status:** ⚠️ Web-only with Material-UI dependencies
**Files:** All in `/src/components/Dialogs/`
**Required:** Create .native.js versions or add Platform checks

#### Settings Components
**Status:** ⚠️ Web-only
**Required:** Platform-specific UI while sharing logic

### Service Layer

#### Storage Service
**File:** `/src/services/storage/storageService.js`
**Status:** ✅ Properly unified
**Implementation:** Correctly uses AsyncStorage for mobile, localStorage for web

#### Sync Services
**Files:**
- `/src/services/sync/manyllaEncryptionService.js` ✅ 
- `/src/services/sync/manyllaMinimalSyncService.js` ✅
**Status:** Properly cross-platform with Platform.OS checks

### Context Providers

#### SyncContext
**Files:** 
- `/src/context/SyncContext.tsx` ❌ Has localStorage references
- `/src/context/SyncContext.js` ✅ Correct unified version
**Action:** Delete .tsx version, use .js

#### ThemeContext
**Multiple versions exist - needs consolidation**

### iOS Native Files

#### `/ios/ManyllaMobile/AppDelegate.swift`
- **Status:** ✅ Correctly configured
- **Module Name:** "ManyllaMobile" matches app.json

#### `/ios/ManyllaMobile/Info.plist`
- **Status:** ✅ Has proper localhost exceptions for Metro

### Dependencies Analysis

#### Cross-Platform Ready
- react-native-async-storage ✅
- react-native-safe-area-context ✅
- react-native-gesture-handler ✅
- tweetnacl ✅

#### Platform-Specific Handling Needed
- @mui/material - Web only, needs abstraction
- @emotion/react - Web only
- react-markdown - Needs react-native-markdown for mobile

## Migration Roadmap

### Phase 1: Fix iOS Launch Blocker (IMMEDIATE)
1. Fix `/src/components/Onboarding/index.tsx` export
2. Delete App.tsx, use only App.js
3. Ensure all imports in App.js are resolvable

### Phase 2: Component Unification (1-2 days)
1. Merge ThemeContext versions
2. Create unified ProfileOverview
3. Add Platform checks to Dialog components
4. Unify Settings components

### Phase 3: Full Platform Parity (3-4 days)
1. Abstract Material-UI dependencies
2. Create shared component library
3. Implement platform-specific navigators
4. Add missing mobile features

## Success Metrics
- [ ] iOS app launches without freezing
- [ ] Single codebase with 95% shared code
- [ ] Identical UI on web mobile and native
- [ ] All features work on all platforms
- [ ] No duplicate .tsx/.native.tsx file pairs

## Code Patterns to Follow

### Component Structure
```javascript
// Unified component pattern
import { Platform, View, Text } from 'react-native';

// Platform-specific imports
let MaterialButton;
if (Platform.OS === 'web') {
  MaterialButton = require('@mui/material').Button;
}

export function MyComponent() {
  // Shared logic (95%)
  const [state, setState] = useState();
  
  // Platform-specific rendering (5%)
  if (Platform.OS === 'web') {
    return <MaterialButton>{state}</MaterialButton>;
  }
  
  return (
    <TouchableOpacity>
      <Text>{state}</Text>
    </TouchableOpacity>
  );
}
```

### Service Pattern
```javascript
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = Platform.OS === 'web' ? localStorage : AsyncStorage;
```

## Testing Strategy
1. Test on iOS Simulator (iPhone 16 Pro Max)
2. Test on web mobile view
3. Verify identical UI and functionality
4. Check bundle size optimization

## Conclusion
The codebase is well-architected at the service layer but needs component-layer fixes to achieve full cross-platform compatibility. The primary blocker is the OnboardingWizard import resolution. Once fixed, the remaining work is straightforward component unification following established patterns.