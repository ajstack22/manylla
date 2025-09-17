# CRITICAL: Runtime Errors in Sync & Share Modals

## 🔴 SEVERITY: CRITICAL - BLOCKING USER FUNCTIONALITY

**Issue**: Users cannot access Sync or Share features due to runtime errors.

## Error Details

### SyncDialog.js Error
```
Cannot read properties of undefined (reading 'main')
TypeError: Cannot read properties of undefined (reading 'main')
    at getStyles (webpack://manylla/./src/components/Sync/SyncDialog.js?:1:24655)
```

### ShareDialogOptimized.js Error
```
Cannot read properties of undefined (reading 'main')
TypeError: Cannot read properties of undefined (reading 'main')
    at getStyles (webpack://manylla/./src/components/Sharing/ShareDialogOptimized.js?:1:23118)
```

## Root Cause Analysis

The error indicates that `colors.text.main` is being accessed but `colors.text` is undefined. This is because the theme structure doesn't have a `main` property under `text`.

### Current Theme Structure
```javascript
// ThemeContext.js
text: {
  primary: "#333333",
  secondary: "#666666", 
  disabled: "#999999",
}
// Note: No 'main' property exists
```

### Incorrect Usage in Modals
```javascript
// Looking for colors.text.main which doesn't exist
color: colors.text.main // WRONG
```

## Required Fixes

### 1. Fix SyncDialog.js
Search for all instances of:
- `colors.text.main` → Replace with `colors.text.primary`
- `colors.background.main` → Replace with `colors.background.default`
- Any other `.main` references that don't exist in theme

### 2. Fix ShareDialogOptimized.js
Search for all instances of:
- `colors.text.main` → Replace with `colors.text.primary`
- `colors.background.main` → Replace with `colors.background.default`
- Any other `.main` references that don't exist in theme

## Implementation Steps

1. **Open SyncDialog.js**
   - Search for `.main` 
   - Replace all incorrect references
   - Verify against theme structure

2. **Open ShareDialogOptimized.js**
   - Search for `.main`
   - Replace all incorrect references
   - Verify against theme structure

3. **Test Both Modals**
   - Open Sync modal - should work without errors
   - Open Share modal - should work without errors
   - Test in all three themes (light, dark, manylla)

## Theme Structure Reference

```javascript
const theme = {
  primary: "#A08670",
  primaryLight: "#B8A088",
  primaryDark: "#8A7058",
  secondary: "#F4E4C1",
  background: {
    default: "#F5F5F5",  // NOT .main
    paper: "#FFFFFF",
    manila: "#F4E4C1",
  },
  text: {
    primary: "#333333",  // NOT .main
    secondary: "#666666",
    disabled: "#999999",
  },
  border: "#E0E0E0",
  divider: "#E8E8E8",
  shadow: "rgba(160, 134, 112, 0.15)",
}
```

## Validation Checklist

- [ ] No runtime errors when opening Sync modal
- [ ] No runtime errors when opening Share modal
- [ ] All text colors properly applied
- [ ] Theme switching works without errors
- [ ] No references to `.main` in either file

## Time Estimate
15-20 minutes

## Priority
CRITICAL - Users cannot use core features

---

**IMPORTANT**: This must be fixed immediately as it's blocking core functionality.