# Developer Role - Learnings & Best Practices

## Last Updated: 2025-09-10

### 🎯 Purpose
Capture institutional knowledge from Developer role sessions to inform future work.

---

## ✅ Successful Patterns

### Build & Deployment
- **CRITICAL**: Build output is in `web/build/` NOT `build/`
- Always run `npm run build:web` after significant changes
- Use `NODE_OPTIONS=--max-old-space-size=8192` if build runs out of memory
- Validate with prettier before committing: `npx prettier --check 'src/**/*.js'`
- **Webpack Config**: Ensure CopyWebpackPlugin includes all files referenced in index.html
- **Subdirectory Deployments**: Must use relative paths in HTML for qual/staging environments

### Code Architecture
- **NO TypeScript**: Remove all interface declarations and type annotations
- **NO platform files**: Use `Platform.select()` instead of `.native.js` or `.web.js`
- **NO Material-UI**: Replace with React Native components
- Primary color is `#A08670` NOT `#8B7355`

### Import Order (MUST FOLLOW)
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

### Git Workflow
- Commit locally with descriptive messages
- Use `git commit --amend` to keep history clean during fixes
- Push to GitHub AFTER validation passes
- Include file paths in commit messages for clarity

---

## ⚠️ Common Pitfalls

### TypeScript Remnants
- Watch for corrupted syntax like `openoolean`, `stringring`
- Remove `interface` blocks completely
- Delete type annotations after colons
- Remove `private`, `public`, `readonly` keywords

### Demo Data Issues
- `initSampleData.js` must initialize ALL 7 categories
- Profile photo path must be correctly imported
- Async operations need proper await handling
- Data must persist to AsyncStorage

### Modal Fixes
- Replace `colors.success.main` with actual color values
- Use `theme.colors` from ThemeContext
- Ensure proper theme integration

### Resource Loading
- Check `public/index.html` for resource references
- Verify files exist before referencing them
- Remove references to non-existent CSS/favicon files
- **CRITICAL**: Use relative paths (`./`) not absolute paths (`/`) in index.html for subdirectory deployments

---

## 🔧 Useful Commands

### Validation
```bash
# Check for TypeScript files
find src -name "*.tsx" -o -name "*.ts" | wc -l  # Must be 0

# Check for platform files
find src -name "*.native.*" -o -name "*.web.*" | wc -l  # Must be 0

# Check Material-UI usage
grep -r "@mui/material" src/ | wc -l

# Validate syntax
npx prettier --check 'src/**/*.js'

# Find interfaces
grep -l "interface " src/**/*.js 2>/dev/null

# Find TODOs
grep -n "TODO" src/**/*.js | head -20
```

### Quick Fixes
```bash
# Format all files
npx prettier --write 'src/**/*.js'

# Build with extra memory
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web

# Check recent changes
git diff HEAD~1
```

---

## 📝 Session Notes

### 2025-09-10 - TypeScript Cleanup
- Fixed 18 files with TypeScript remnants
- Discovered prettier validation is critical gate
- Learned to check for corrupted syntax patterns
- Import order affects component rendering

### 2025-09-10 - Demo Data Fix
- Found initSampleData wasn't creating all categories
- Profile photo import path was broken
- Fixed async initialization issues

### 2025-09-10 - Static Resource Path Fix
- **Issue**: Resources returning 404 in qual deployment (e.g., `/global-styles.css`)
- **Root Cause**: Absolute paths (`/`) in index.html don't work when app deployed to subdirectory
- **Solution**: Changed all static resource paths to relative (`./`) in public/index.html
- **Affected Files**: favicon.svg, favicon.ico, global-styles.css, manifest.json, logo192.png
- **Learning**: Webpack's publicPath: './' only affects JS/CSS bundles, NOT HTML references
- **Quick Deploy**: `rsync -avz --delete-after web/build/ stackmap-cpanel:~/public_html/manylla/qual/`

---

## 🚀 Recommendations for Future Sessions

1. **Always start with validation checks** - Run the pre-work validation commands
2. **Test incrementally** - Build after each major change
3. **Check imports carefully** - Order matters, especially for themes
4. **Commit frequently** - Use amend to keep history clean
5. **Read error messages fully** - Often contain the exact fix needed

---

## 📚 Reference Documents
- `/docs/WORKING_AGREEMENTS.md` - Standards and requirements
- `/CLAUDE.md` - Project-specific instructions
- `/docs/prompts/active/` - Current work queue