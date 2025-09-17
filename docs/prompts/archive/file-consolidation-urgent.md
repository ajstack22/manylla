# URGENT: File Consolidation - Unified Codebase Restoration

## 🔴 MANDATORY: READ WORKING AGREEMENTS FIRST
**CRITICAL**: Review `/docs/WORKING_AGREEMENTS.md` IN FULL before starting.
This document defines the ONLY acceptable patterns. ANY deviation = REJECTION.

## 🚨 CRITICAL ARCHITECTURE ISSUE - IMMEDIATE ACTION REQUIRED

### Severity: BLOCKING
The codebase has diverged from the StackMap unified architecture pattern. We have 40+ duplicate and platform-specific files that MUST be consolidated immediately. This is blocking all other development work including modal consistency updates.

### ⚠️ WORKING AGREEMENTS ENFORCEMENT ⚠️

#### FROM WORKING AGREEMENTS - ABSOLUTE REQUIREMENTS:
```javascript
// CORRECT PATTERN (THE ONLY ACCEPTABLE WAY):
// Single unified .js file with Platform.select()
const Component = () => {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // Web-specific rendering
      ) : (
        // Mobile rendering
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Platform.select({
      web: 20,
      default: 16
    })
  }
});

// WRONG PATTERNS (AUTOMATIC FAILURE):
❌ Component.tsx (NO TypeScript)
❌ Component.web.js (NO platform files)
❌ Component.native.js (NO platform files)
❌ Multiple versions of same component
```

### ⚠️ ADVERSARIAL REVIEW WARNING ⚠️

**Your implementation will undergo BRUTAL adversarial peer review per WORKING AGREEMENTS.**

**I WILL PERSONALLY VERIFY:**
1. **ZERO TypeScript files remain** - A single .tsx file = COMPLETE FAILURE
2. **ZERO platform-specific files** - Any .native.* or .web.* file = REJECTED
3. **EVERY Platform.select() is justified** - Unnecessary platform code = REWRITE
4. **ZERO duplicate components** - Any duplicate logic = START OVER
5. **ALL imports work** - One broken import = INCOMPLETE

**THE FURY OF REVIEW:**
- I will run `find src -name "*.tsx"` - This MUST return ZERO or you FAILED
- I will run `find src -name "*.native.*"` - This MUST return ZERO or you FAILED  
- I will check EVERY merged file for proper Platform.select() usage
- I will test EVERY modal on EVERY platform
- I will reject the ENTIRE submission if even ONE file is wrong

**CONSEQUENCES OF FAILURE:**
- ❌ ALL other development is BLOCKED
- ❌ Modal consistency work CANNOT proceed
- ❌ The app remains BROKEN and UNMAINTAINABLE
- ❌ You will REDO the entire consolidation from scratch
- ❌ Your work will be used as an example of what NOT to do

**THIS IS NOT A SUGGESTION - THIS IS A MANDATE**

The previous developers created this mess by ignoring the unified architecture. 
DO NOT ADD TO THE PROBLEM. FIX IT COMPLETELY OR DON'T SUBMIT.

## Your Mission
Convert this fragmented codebase back to a unified React Native Web architecture with ZERO TypeScript and ZERO platform-specific files.

### MANDATORY CODING STANDARDS (FROM WORKING AGREEMENTS)

#### Import Order (MUST follow exactly):
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, Platform } from 'react-native';

// 3. Third-party libraries
import AsyncStorage from '@react-native-async-storage/async-storage';

// 4. Local imports (absolute paths)
import { useTheme } from '../../context/ThemeContext';

// 5. Relative imports
import ProfileCard from './ProfileCard';
```

#### Colors (EXACT values required):
- Primary: `#A08670` (NOT #8B7355)
- Primary Light: `#B8A088`
- Primary Dark: `#8A7058`
- Manila background: `#F4E4C1`

#### Component Patterns:
- Functional components ONLY (no class components)
- React Hooks for state
- Platform.select() for ALL platform differences
- Single .js file per component

## Current State (BROKEN)
```bash
# Current mess:
- 30+ TypeScript (.tsx) files that shouldn't exist
- 20+ platform-specific files (.native.tsx, .web.tsx)
- 4 components with BOTH .js and .tsx versions
- Imports pointing to wrong files
- Build process confused about which files to use
```

## Required End State
```bash
# After your work:
- 0 TypeScript files (all .js)
- 0 platform-specific files
- 1 file per component using Platform.select()
- All imports working correctly
- Build succeeds on all platforms
```

## Phase 1: URGENT - Core Context Files (DO THESE FIRST OR THE APP IS BROKEN)

**⚠️ THE APP IS CURRENTLY BROKEN BECAUSE OF THESE DUPLICATE FILES ⚠️**

### Task 1.1: Fix SyncContext
**Current problem:**
- `src/context/SyncContext.js` (exists)
- `src/context/SyncContext.tsx` (duplicate - DELETE)
- `src/context/SyncContext.web.tsx` (platform-specific - DELETE)

**Action:**
1. Open all three files and identify unique logic
2. Merge ALL functionality into `SyncContext.js`
3. Use Platform.select() for any platform differences
4. Delete the .tsx files
5. Update ALL imports throughout the codebase

**Implementation pattern:**
```javascript
// SyncContext.js - FINAL UNIFIED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  // Merge logic from all three files here
  
  const syncInterval = Platform.select({
    web: 30000,  // 30 seconds on web
    default: 60000  // 60 seconds on mobile
  });
  
  // Platform-specific storage
  const saveData = async (key, value) => {
    if (Platform.OS === 'web') {
      // Web-specific logic from .web.tsx file
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      // Mobile logic from base file
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  };
  
  // Continue merging all functionality...
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
};
```

### Task 1.2: Fix ThemeContext
**Current problem:**
- `src/context/ThemeContext.js` (exists)
- `src/context/ThemeContext.tsx` (duplicate - DELETE)
- `src/context/ThemeContext.native.tsx` (platform-specific - DELETE)

**Action:**
1. Merge ALL theme logic into `ThemeContext.js`
2. Delete TypeScript versions
3. Ensure theme colors are EXACTLY:
   - Light primary: `#A08670`
   - Dark primary: `#A08C74`
   - Manylla primary: `#9D8B73`

### Task 1.3: Fix Common Components
**Current problem:**
- `src/components/Common/index.js` (exists)
- `src/components/Common/index.tsx` (duplicate - DELETE)

**Action:**
1. Ensure ALL icon exports are in the .js file
2. Delete the .tsx version
3. Fix all imports

### Task 1.4: Fix OnboardingWizard
**Current problem:**
- `src/components/Onboarding/OnboardingWizard.js` (exists)
- `src/components/Onboarding/OnboardingWizard.tsx` (duplicate - DELETE)

**Action:**
1. Merge any TypeScript-specific logic
2. Delete .tsx version
3. Test onboarding flow works

## Phase 2: Platform-Specific Components

### Task 2.1: Settings Components
**Files to consolidate:**
```bash
CategoryManager.tsx + CategoryManager.native.tsx → CategoryManager.js
UnifiedCategoryManager.tsx + UnifiedCategoryManager.native.tsx → UnifiedCategoryManager.js  
QuickInfoManager.tsx + QuickInfoManager.native.tsx → QuickInfoManager.js
```

**Consolidation pattern for EACH:**
```javascript
// CategoryManager.js - SINGLE FILE FOR ALL PLATFORMS
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const CategoryManager = ({ visible, onClose, categories, onUpdate }) => {
  const { colors } = useTheme();
  
  // ALL business logic here - SHARED across platforms
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.background.paper }]}>
          {/* Merge UI from both files */}
          {/* Use Platform.select() ONLY when absolutely necessary */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Platform.select({
      web: 600,
      default: '90%',
    }),
    maxHeight: Platform.select({
      web: '80vh',
      default: '80%',
    }),
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default CategoryManager;
```

### Task 2.2: Sharing Components
**Files to consolidate:**
```bash
ShareDialogOptimized.js + ShareDialogOptimized.native.tsx → ShareDialogOptimized.js
QRCodeModal.js + QRCodeModal.native.tsx → QRCodeModal.js
SharedProfileView.js + SharedProfileView.native.tsx → SharedProfileView.js
PrintPreview.js + PrintPreview.native.tsx → PrintPreview.js
SharedView.js + SharedView.native.tsx → SharedView.js
```

### Task 2.3: Form Components
**Files to consolidate:**
```bash
SmartTextInput.js + SmartTextInput.native.tsx → SmartTextInput.js
MarkdownField.js + MarkdownField.native.tsx → MarkdownField.js
EntryForm.js + EntryForm.native.tsx → EntryForm.js
```

### Task 2.4: Loading Component
**Files to consolidate:**
```bash
LoadingOverlay.js + LoadingOverlay.native.tsx → LoadingOverlay.js
```

## Phase 3: TypeScript Removal

### Task 3.1: Convert ALL remaining .tsx files to .js
```bash
src/index.tsx → src/index.js
src/context/index.tsx → src/context/index.js
src/context/ProfileContext.tsx → src/context/ProfileContext.js
src/context/ToastContext.tsx → src/context/ToastContext.js
src/App.test.tsx → src/App.test.js
src/navigation/RootNavigator.tsx → src/navigation/RootNavigator.js
src/navigation/MainTabNavigator.tsx → src/navigation/MainTabNavigator.js
src/screens/Onboarding/OnboardingScreen.tsx → src/screens/Onboarding/OnboardingScreen.js
src/components/Settings/index.tsx → src/components/Settings/index.js
src/components/Sharing/index.tsx → src/components/Sharing/index.js
```

**Conversion process for EACH file:**
1. Remove ALL TypeScript type annotations
2. Remove interface/type definitions
3. Convert to plain JavaScript
4. Ensure imports are correct

**Example conversion:**
```typescript
// BEFORE (TypeScript)
interface Props {
  visible: boolean;
  onClose: () => void;
  data?: ShareData;
}

const ShareDialog: React.FC<Props> = ({ visible, onClose, data }) => {
  const [loading, setLoading] = useState<boolean>(false);
```

```javascript
// AFTER (JavaScript)
const ShareDialog = ({ visible, onClose, data }) => {
  const [loading, setLoading] = useState(false);
```

## Phase 4: Import Updates

### Task 4.1: Fix ALL imports throughout codebase
After consolidation, search and replace:

```javascript
// WRONG - Old imports to remove
import { CategoryManager } from './CategoryManager.native';
import { CategoryManager } from './CategoryManager.web';
import { ThemeContext } from '../../context/ThemeContext.tsx';

// CORRECT - New imports
import { CategoryManager } from './CategoryManager';
import { ThemeContext } from '../../context/ThemeContext';
```

### Task 4.2: Update index.js barrel exports
Ensure all index.js files export from .js files only:
```javascript
// src/components/Settings/index.js
export { default as CategoryManager } from './CategoryManager';
export { default as QuickInfoManager } from './QuickInfoManager';
// NO .tsx, NO .native, NO .web
```

## Phase 5: Cleanup

### Task 5.1: Delete ALL backup files
```bash
rm -f src/**/*.bak
rm -f src/**/*.tsx.bak
```

### Task 5.2: Verify no TypeScript remains
```bash
# This command should return NOTHING
find src -name "*.tsx" -o -name "*.ts"

# This command should return NOTHING  
find src -name "*.native.*" -o -name "*.web.*" -o -name "*.ios.*" -o -name "*.android.*"
```

## Testing Requirements - MANDATORY

### After EACH phase, you MUST run these tests:
**SKIPPING TESTS = AUTOMATIC REJECTION**
```bash
# 1. Web build MUST succeed
npm run build:web

# 2. Check for TypeScript errors (should be none)
find src -name "*.tsx" | wc -l  # Should output: 0

# 3. Test critical flows
- Open app
- Create a profile  
- Add an entry
- Open settings
- Switch themes
- Share profile
```

### Final validation:
```bash
# Run the compliance check
echo "=== TypeScript Files (should be 0) ==="
find src -name "*.tsx" -o -name "*.ts" | wc -l

echo "=== Platform-specific Files (should be 0) ==="
find src -name "*.native.*" -o -name "*.web.*" | wc -l

echo "=== Duplicate Files Check ==="
for f in $(find src -name "*.js"); do
  base="${f%.js}"
  if [ -f "${base}.tsx" ]; then
    echo "ERROR: Duplicate found: ${base}"
  fi
done
```

## Common Pitfalls to AVOID

### ❌ DON'T DO THIS:
```javascript
// Don't leave TypeScript syntax
const Component: React.FC = () => { // WRONG - remove ': React.FC'

// Don't import from .tsx files
import { Something } from './Something.tsx'; // WRONG

// Don't create new platform files
Component.web.js // WRONG
Component.native.js // WRONG
```

### ✅ DO THIS:
```javascript
// Plain JavaScript
const Component = () => {

// Import from .js files
import { Something } from './Something';

// Single file with Platform.select()
Component.js // CORRECT
```

## Success Criteria - NO PARTIAL CREDIT

Your work is COMPLETE **ONLY** when:
- [ ] `find src -name "*.tsx"` returns 0 files
- [ ] `find src -name "*.native.*"` returns 0 files  
- [ ] `find src -name "*.web.*"` returns 0 files
- [ ] ALL components are in single .js files
- [ ] `npm run build:web` succeeds
- [ ] App works on web
- [ ] Theme switching works
- [ ] Settings modals open correctly
- [ ] Share functionality works

## Handoff

After completion:
1. Document any issues encountered
2. List any behavioral differences found between platform versions
3. Note any complex merges that required significant changes
4. Update this document with completion status
5. Notify team that modal consistency work can proceed

**🔥 THIS IS BLOCKING ALL OTHER WORK - COMPLETE IMMEDIATELY 🔥**

## Verification Script - RUN THIS WHEN YOU THINK YOU'RE DONE

```bash
#!/bin/bash
# FINAL COMPLIANCE CHECK - ALL MUST PASS

echo "========================================="
echo "FINAL ARCHITECTURE COMPLIANCE CHECK"
echo "========================================="

TSX_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | wc -l)
PLATFORM_COUNT=$(find src -name "*.native.*" -o -name "*.web.*" -o -name "*.ios.*" -o -name "*.android.*" | wc -l)

echo "TypeScript files found: $TSX_COUNT (MUST BE 0)"
echo "Platform-specific files found: $PLATFORM_COUNT (MUST BE 0)"

if [ $TSX_COUNT -gt 0 ]; then
  echo "❌ FAILURE: TypeScript files still exist!"
  find src -name "*.tsx" -o -name "*.ts"
  echo "FIX THESE IMMEDIATELY"
  exit 1
fi

if [ $PLATFORM_COUNT -gt 0 ]; then
  echo "❌ FAILURE: Platform-specific files still exist!"
  find src -name "*.native.*" -o -name "*.web.*"
  echo "FIX THESE IMMEDIATELY"
  exit 1
fi

echo "✅ PASS: Architecture is unified"
echo "Now testing build..."

npm run build:web
if [ $? -ne 0 ]; then
  echo "❌ FAILURE: Build failed!"
  echo "YOUR CONSOLIDATION BROKE THE BUILD"
  exit 1
fi

echo "✅✅✅ ALL CHECKS PASSED - SUBMIT FOR REVIEW ✅✅✅"
```

**IF THIS SCRIPT DOESN'T SHOW ALL GREEN CHECKS, YOU ARE NOT DONE**

## Time Estimate
- Phase 1: 2 hours (URGENT - core functionality)
- Phase 2: 3 hours (platform components)
- Phase 3: 2 hours (TypeScript removal)
- Phase 4: 1 hour (import fixes)
- Phase 5: 30 minutes (cleanup)
- Testing: 1.5 hours

**Total: ~10 hours of focused work**

Start with Phase 1 IMMEDIATELY. The app is partially broken until this is complete.

## FINAL WARNING

**You are fixing the mistakes of developers who didn't follow the architecture.**
**Do NOT become another developer who ignored the rules.**
**Do NOT submit until the verification script shows ALL GREEN.**
**Do NOT ask for extensions or exceptions.**
**Do NOT leave "just one" TypeScript file.**

**FIX IT ALL. FIX IT RIGHT. FIX IT NOW.**

---
*This prompt pack will be used to evaluate your ability to follow explicit architectural requirements. Failure to complete this properly will be noted.*