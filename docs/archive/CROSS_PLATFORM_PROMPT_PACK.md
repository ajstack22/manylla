# Manylla Cross-Platform Migration - LLM Prompt Pack

## Context Injection Prompt

You are tasked with completing a cross-platform React Native migration for the Manylla app. The app is currently frozen on iOS due to component import issues from a partial migration. Your goal is to achieve 95% code sharing between iOS, Android, and web platforms following StackMap's proven patterns.

## Project Overview

**Manylla** is a special needs information management app with:
- Zero-knowledge encryption using TweetNaCl
- Manila envelope-inspired design (#F4E4C1 cream, #8B7355 brown)
- Single profile architecture (unlike StackMap's multi-profile)
- Material Design UI that must look identical on all platforms
- Cloud sync with 32-character hex recovery phrases

**Current State:**
- 70% unified codebase
- iOS app freezes at splash screen
- Service layer properly unified
- Component layer needs fixing

## Critical Issue #1: iOS App Frozen

The app freezes because `/src/components/Onboarding/index.tsx` always exports the native version, breaking the import chain.

**Immediate Fix Required:**
```javascript
// File: /src/components/Onboarding/index.tsx
// BROKEN - Always returns native
export { OnboardingWizard } from './OnboardingWizard.native';

// FIX TO:
import { Platform } from 'react-native';
export const OnboardingWizard = Platform.OS === 'web' 
  ? require('./OnboardingWizard.web').OnboardingWizard
  : require('./OnboardingWizard.native').OnboardingWizard;
```

## File Structure & Issues

### Entry Points
- ✅ `/index.js` - React Native entry, correct
- ✅ `/App.js` - Unified app component, keep this
- ❌ `/App.tsx` - Legacy with broken imports, DELETE
- 🗑️ `/App.simple.js`, `/App.minimal.js`, `/App.test.js` - Debug files, DELETE

### Component Files Needing Unification

#### Profile Components
- `/src/components/Profile/ProfileOverview.tsx` (web with Material-UI)
- `/src/components/Profile/ProfileOverview.native.js` (mobile with React Native)
Need to merge into single `ProfileOverview.js` with Platform.OS checks

#### Theme Context (Multiple Versions)
- `/src/context/ThemeContext.tsx` (web)
- `/src/context/ThemeContext.native.tsx` (mobile)  
- `/src/context/ThemeContext.js` (attempted unified)
Keep only the .js version with proper Platform checks

#### Sync Context
- ❌ `/src/context/SyncContext.tsx` - Has localStorage refs
- ✅ `/src/context/SyncContext.js` - Correct unified version
Delete .tsx, use .js

## StackMap Patterns to Follow

### Pattern 1: Dynamic Component Loading
```javascript
// From StackMap's App.js
let ProfileOverview;
if (Platform.OS === 'web') {
  try {
    ProfileOverview = require('./ProfileOverview.web').ProfileOverview;
  } catch {
    ProfileOverview = require('./ProfileOverview.native').ProfileOverview;
  }
} else {
  ProfileOverview = require('./ProfileOverview.native').ProfileOverview;
}
```

### Pattern 2: Platform-Specific Imports
```javascript
// Top of file
let GestureHandlerRootView = View; // Default
let SafeAreaProvider = ({ children }) => children; // Default

if (Platform.OS !== 'web') {
  try {
    const GH = require('react-native-gesture-handler');
    GestureHandlerRootView = GH.GestureHandlerRootView || View;
  } catch (e) {
    console.log('Gesture handler not available');
  }
}
```

### Pattern 3: Storage Abstraction
```javascript
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = Platform.OS === 'web' 
  ? {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key))
    }
  : AsyncStorage;
```

## Material-UI Handling

Web uses Material-UI v7, mobile needs native equivalents:

| Web Component | Mobile Component |
|--------------|------------------|
| `<Button>` from MUI | `<TouchableOpacity>` + `<Text>` |
| `<Card>` from MUI | `<View>` with shadow styles |
| `<TextField>` from MUI | `<TextInput>` with custom styles |
| `<Dialog>` from MUI | `<Modal>` from React Native |

## Style Patterns

### Web (Material-UI)
```javascript
<Box sx={{ bgcolor: '#F4E4C1', p: 2, borderRadius: 2 }}>
```

### Mobile (StyleSheet)
```javascript
const styles = StyleSheet.create({
  box: {
    backgroundColor: '#F4E4C1',
    padding: 16,
    borderRadius: 8
  }
});
```

### Unified Approach
```javascript
const containerStyle = Platform.OS === 'web' 
  ? { sx: { bgcolor: '#F4E4C1', p: 2 } }
  : { style: styles.container };

return <View {...containerStyle}>
```

## Testing Commands

```bash
# iOS
npx react-native run-ios --simulator="iPhone 16 Pro Max"

# Web
npm start  # http://localhost:3000

# Metro bundler
npx react-native start --reset-cache

# Clean rebuild
cd ios && pod install && cd ..
npm run ios
```

## Success Criteria

1. ✅ iOS app launches without freezing
2. ✅ Same UI on web mobile and React Native
3. ✅ 95% shared code (only 5% platform-specific)
4. ✅ All components properly resolve imports
5. ✅ No duplicate .tsx/.native.tsx pairs

## Implementation Steps

### Step 1: Fix Immediate Blocker (5 minutes)
1. Fix `/src/components/Onboarding/index.tsx` export
2. Delete `App.tsx`
3. Ensure `index.js` imports `App.js`
4. Test iOS launch

### Step 2: Clean Up Contexts (10 minutes)
1. Delete `SyncContext.tsx`, keep `SyncContext.js`
2. Consolidate ThemeContext into single `.js` file
3. Remove all localStorage direct references

### Step 3: Unify Components (30 minutes)
1. Merge ProfileOverview versions
2. Add Platform checks to Dialogs
3. Create native versions of Settings components

### Step 4: Validate (10 minutes)
1. Test on iOS simulator
2. Test on web mobile view
3. Verify identical UI
4. Check console for errors

## Key Files to Review First

1. `/Users/adamstack/manylla/App.js` - Main app logic
2. `/Users/adamstack/manylla/src/components/Onboarding/index.tsx` - BROKEN import
3. `/Users/adamstack/manylla/src/components/Profile/ProfileOverview.native.js` - Mobile UI
4. `/Users/adamstack/manylla/src/services/storage/storageService.js` - Good pattern example

## Common Pitfalls to Avoid

1. ❌ Don't use dynamic imports with template literals - React Native can't resolve them
2. ❌ Don't reference `document` or `window` without Platform checks  
3. ❌ Don't import Material-UI in mobile code
4. ❌ Don't use .tsx extensions for cross-platform files (use .js)
5. ❌ Don't assume AsyncStorage has synchronous methods

## Architecture Context

The app follows this structure:
- **Entry**: index.js → App.js
- **Providers**: ThemeProvider → SyncProvider → AppContent
- **State**: React Context API (no Redux)
- **Storage**: AsyncStorage (mobile) / localStorage (web)
- **Encryption**: TweetNaCl with 100,000 hash iterations
- **Sync**: 60-second pull interval, immediate push on changes

## Manila Theme Colors

Primary palette:
- Background: `#F4E4C1` (cream)
- Primary: `#8B7355` (brown)
- Surface: `#FFFFFF`
- Text: `#333333`
- Secondary: `#D4A574`

## Final Notes

The codebase is well-architected but stuck in a half-migrated state. The service layer is properly unified, but the component layer has import resolution issues. Focus on fixing the OnboardingWizard import first - this will unblock the iOS app. Then systematically unify the remaining components using Platform.OS checks rather than separate files where possible.

Remember: The goal is ONE codebase that works everywhere, not three codebases that happen to share some files. Follow StackMap's pattern of ~95% shared code with only minimal platform-specific UI adaptations.