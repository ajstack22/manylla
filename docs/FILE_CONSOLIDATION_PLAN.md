# File Consolidation Plan - Manylla Unified Codebase

## Critical Architecture Issue
The codebase has diverged from the StackMap unified architecture pattern. We have duplicate files and platform-specific implementations that should be consolidated into single .js files using Platform.select().

## Consolidation Requirements

### Phase 1: Merge Duplicate Files
These files have both .js and .tsx versions that need to be merged into single .js files:

1. **SyncContext**
   - Keep: `src/context/SyncContext.js`
   - Delete: `src/context/SyncContext.tsx`
   - Delete: `src/context/SyncContext.web.tsx`
   - Action: Merge any unique logic using Platform.select()

2. **ThemeContext**
   - Keep: `src/context/ThemeContext.js`
   - Delete: `src/context/ThemeContext.tsx`
   - Delete: `src/context/ThemeContext.native.tsx`
   - Action: Consolidate theme logic with Platform.select()

3. **Common Components**
   - Keep: `src/components/Common/index.js`
   - Delete: `src/components/Common/index.tsx`
   - Action: Export all icons and common components from single file

4. **OnboardingWizard**
   - Keep: `src/components/Onboarding/OnboardingWizard.js`
   - Delete: `src/components/Onboarding/OnboardingWizard.tsx`
   - Action: Ensure works on both web and mobile

### Phase 2: Consolidate Platform-Specific Files

#### Settings Components
Replace .native.tsx files with unified .js files:
```javascript
// Instead of CategoryManager.native.tsx and CategoryManager.tsx
// Create single CategoryManager.js with:
const styles = StyleSheet.create({
  container: {
    padding: Platform.select({ web: 20, default: 16 }),
    // ... other platform-specific styles
  }
});
```

Files to consolidate:
- CategoryManager.tsx + CategoryManager.native.tsx → CategoryManager.js
- UnifiedCategoryManager.tsx + UnifiedCategoryManager.native.tsx → UnifiedCategoryManager.js
- QuickInfoManager.tsx + QuickInfoManager.native.tsx → QuickInfoManager.js

#### Sharing Components
Consolidate all sharing components:
- ShareDialogOptimized.js + ShareDialogOptimized.native.tsx → ShareDialogOptimized.js
- QRCodeModal.js + QRCodeModal.native.tsx → QRCodeModal.js
- SharedProfileView.js + SharedProfileView.native.tsx → SharedProfileView.js
- PrintPreview.js + PrintPreview.native.tsx → PrintPreview.js
- SharedView.js + SharedView.native.tsx → SharedView.js

#### Forms Components
Unify form components:
- SmartTextInput.js + SmartTextInput.native.tsx → SmartTextInput.js
- MarkdownField.js + MarkdownField.native.tsx → MarkdownField.js
- EntryForm.js + EntryForm.native.tsx → EntryForm.js

#### Loading Component
- LoadingOverlay.js + LoadingOverlay.native.tsx → LoadingOverlay.js

### Phase 3: Convert All TypeScript to JavaScript

Remove TypeScript from these files:
- src/index.tsx → src/index.js
- src/App.test.tsx → src/App.test.js
- src/navigation/RootNavigator.tsx → src/navigation/RootNavigator.js
- src/navigation/MainTabNavigator.tsx → src/navigation/MainTabNavigator.js
- src/screens/Onboarding/OnboardingScreen.tsx → src/screens/Onboarding/OnboardingScreen.js

### Phase 4: Clean Up Backup Files

Remove all .bak files:
- src/context/SyncContext.web.tsx.bak
- src/components/Sharing/*.bak files

## Implementation Pattern

### Correct Unified File Structure:
```javascript
// CategoryManager.js - SINGLE FILE for all platforms
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';

const CategoryManager = ({ visible, onClose }) => {
  // Shared logic for all platforms
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Platform-specific rendering using conditional logic if needed */}
        {Platform.OS === 'web' ? (
          // Web-specific UI if absolutely necessary
        ) : (
          // Mobile UI
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Platform.select({
      web: 20,
      ios: 16,
      android: 16,
    }),
    ...Platform.select({
      web: {
        maxWidth: 600,
        margin: 'auto',
      },
      default: {
        flex: 1,
      },
    }),
  },
});

export default CategoryManager;
```

### WRONG Pattern to Avoid:
```
❌ CategoryManager.js
❌ CategoryManager.tsx
❌ CategoryManager.web.js
❌ CategoryManager.native.tsx
❌ CategoryManager.ios.js
❌ CategoryManager.android.js
```

### RIGHT Pattern:
```
✅ CategoryManager.js (single file with Platform.select())
```

## Import Updates Required

After consolidation, update all imports:
```javascript
// Before (WRONG):
import { CategoryManager } from './CategoryManager.native';
import { CategoryManager } from './CategoryManager.web';

// After (CORRECT):
import { CategoryManager } from './CategoryManager';
```

## Testing After Consolidation

1. **Web Build**: `npm run build:web`
2. **iOS**: Test in Xcode simulator
3. **Android**: Test in Android emulator
4. **Verify**: No TypeScript errors
5. **Check**: All modals work on all platforms
6. **Confirm**: Theme switching works everywhere

## Success Criteria

- [ ] Zero .tsx files in the project
- [ ] No .native.* or .web.* files
- [ ] All components in single .js files
- [ ] Platform differences handled with Platform.select()
- [ ] Build succeeds for web
- [ ] Mobile apps run without errors
- [ ] No duplicate component logic
- [ ] Consistent behavior across platforms

## Priority Order

1. **URGENT**: Fix SyncContext and ThemeContext (core functionality)
2. **HIGH**: Fix Common components (used everywhere)
3. **HIGH**: Fix Onboarding (first user experience)
4. **MEDIUM**: Fix Settings components
5. **MEDIUM**: Fix Sharing components
6. **LOW**: Fix test files and navigation

## Notes

- This consolidation brings us back to the StackMap architecture
- Reduces maintenance burden significantly
- Ensures consistent behavior across platforms
- Makes the modal consistency work (Sessions 1 & 2) much easier
- Prevents future divergence between platforms

## Command to Find Remaining Issues

```bash
# Find all TypeScript files
find src -name "*.tsx" -type f

# Find all platform-specific files
find src -name "*.web.*" -o -name "*.native.*" -o -name "*.ios.*" -o -name "*.android.*"

# Find duplicate base names
for f in $(find src -name "*.tsx" -type f); do 
  base="${f%.tsx}"
  if [ -f "${base}.js" ]; then 
    echo "DUPLICATE: ${base}"
  fi
done
```