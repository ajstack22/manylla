# Fix React Native Vector Icons for Web

## ⚠️ SEVERITY: FOUNDATION FIX - UNBLOCKS UNIFIED ARCHITECTURE

**Issue**: React Native Vector Icons not displaying on web, forcing continued Material-UI dependency

**Root Cause**: Missing font file configuration in webpack - the TTF fonts exist in node_modules but aren't being served to the browser

**Current Status**: READY TO FIX - Clear path forward with webpack configuration

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

## The ACTUAL Problem (Not What We Thought)

### What's Really Happening
1. **Webpack IS configured correctly** for react-native-web (line 95 in webpack.config.js)
2. **Font files EXIST** in node_modules/react-native-vector-icons/Fonts/
3. **BUT: Fonts aren't being copied to web/build/** - That's the only issue!
4. **React Native components work fine** - Only icons are broken

### The Simple Fix
We need to copy the font files to the web build and add CSS @font-face rules. That's it!

## Problem Details

Material-UI imports found in 6 files:
1. `src/context/ThemeContext.js` (lines 309-310) - Web-specific fallback
2. `src/hooks/useMobileKeyboard.js` - Using MUI hooks
3. `src/hooks/useMobileDialog.js` - Using MUI components
4. `src/components/Forms/MarkdownRenderer.js` - Typography component
5. `src/components/Forms/RichTextInput.js` - Various MUI components
6. `src/theme/theme.js` - createTheme function

## Required Changes - SIMPLE 3-STEP FIX

### Step 1: Update webpack.config.js to Copy Font Files
**Location**: `webpack.config.js` (around line 5, after CopyWebpackPlugin import)

**Add to plugins array (around line 130)**:
```javascript
new CopyWebpackPlugin({
  patterns: [
    {
      from: 'node_modules/react-native-vector-icons/Fonts',
      to: 'fonts'
    }
  ]
})
```

### Step 2: Create Font Face CSS
**Create new file**: `public/vector-icons.css`

```css
@font-face {
  font-family: 'MaterialIcons';
  src: url('./fonts/MaterialIcons.ttf') format('truetype');
}

@font-face {
  font-family: 'FontAwesome';
  src: url('./fonts/FontAwesome.ttf') format('truetype');
}

/* Add other fonts as needed */
```

### Step 3: Include CSS in HTML
**Location**: `public/index.html`

**Add in <head> section**:
```html
<link rel="stylesheet" href="vector-icons.css">
```

## Implementation Steps

1. **Step 1**: Test current icon display issue
   ```bash
   npm run web
   # Open browser, check console for font 404 errors
   # You'll see missing font file requests
   ```

2. **Step 2**: Apply the webpack fix
   ```bash
   # Add CopyWebpackPlugin to webpack.config.js
   # Create vector-icons.css
   # Update index.html
   ```

3. **Step 3**: Verify icons now work
   ```bash
   npm run build:web
   # Check web/build/fonts/ directory exists
   # Test in browser - icons should display

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
- [ ] Icons display correctly on web (no missing characters/boxes)
- [ ] Icons display correctly on iOS simulator
- [ ] Theme switching still works (icons change color properly)
- [ ] All Material-UI imports can now be removed
- [ ] Build size should decrease after MUI removal

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
### Version TBD

#### Fixed
- React Native Vector Icons now display correctly on web
- Removed Material-UI dependency (reduced bundle size)

#### Technical
- Added font file copying to webpack build
- Created CSS font-face definitions for icon fonts
- No breaking changes - purely build configuration
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

## Why This Will Work

### Evidence
1. **Webpack already handles .ttf files** (line 31-36 in webpack.config.js)
2. **Fonts exist** in node_modules/react-native-vector-icons/Fonts/
3. **CopyWebpackPlugin is already imported** (line 5)
4. **This is a standard pattern** used by many React Native Web projects

### What If It Doesn't Work?
If icons still don't display after these changes:
1. Check browser DevTools Network tab for 404s on font files
2. Verify web/build/fonts/ directory contains the .ttf files
3. Check that vector-icons.css is being loaded
4. Try adding `font-display: block;` to @font-face rules

## Time Estimate
30 minutes (it's just 3 config changes)

## Priority
CRITICAL - Blocks unified architecture and Android development

## Risk Assessment
- **Risk**: None - These are config-only changes
  - **Mitigation**: Can easily revert if needed

## Rollback Plan
If issues arise after deployment:
1. Remove CopyWebpackPlugin config from webpack.config.js
2. Keep using Material-UI icons temporarily
3. No data or state changes involved - purely display

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
