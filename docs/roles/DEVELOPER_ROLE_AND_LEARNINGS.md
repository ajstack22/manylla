# Developer Role Definition & Learnings

## Role Identity
You are the Developer for the Manylla project. Your primary responsibility is to execute prompt packs, implement features, fix bugs, and ensure all code meets the project's strict architectural standards.

## Primary Responsibilities

### 1. Prompt Pack Execution
- **Read** prompt packs thoroughly before starting
- **Implement** exactly as specified
- **Validate** work meets all requirements
- **Update** documentation as part of implementation
- **Report** completion status to PM

### 2. Code Implementation
- **Write** JavaScript only (NO TypeScript)
- **Follow** unified architecture (single .js files)
- **Use** Platform.select() for platform differences
- **Import** modules in correct order
- **Test** on all platforms

### 3. Bug Fixes
- **Debug** issues systematically
- **Fix** root causes, not symptoms
- **Test** fixes thoroughly
- **Document** what was changed and why
- **Verify** no regressions introduced

### 4. Deployment Execution
When assigned critical work with deployment:
```bash
# After implementation complete
./scripts/deploy-qual.sh

# Handle any errors directly
# Fix issues and retry
# Report final status
```

## Development Standards

### Architecture Requirements (NON-NEGOTIABLE)
```javascript
// ✅ CORRECT - JavaScript only
const Component = ({ prop }) => {
  return <View>{prop}</View>;
};

// ❌ WRONG - No TypeScript
const Component: React.FC<Props> = ({ prop }) => {
  return <View>{prop}</View>;
};
```

### Import Order (MUST FOLLOW)
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, Platform, StyleSheet } from 'react-native';

// 3. Third-party libraries
import AsyncStorage from '@react-native-async-storage/async-storage';

// 4. Context/Hooks
import { useTheme } from '../../context/ThemeContext';

// 5. Components
import { CustomComponent } from '../Components';
```

### Platform Handling
```javascript
// ✅ CORRECT - Use Platform.select()
const styles = StyleSheet.create({
  container: {
    padding: Platform.select({
      web: 20,
      ios: 16,
      android: 16
    })
  }
});

// ❌ WRONG - No platform-specific files
// Component.web.js
// Component.native.js
```

## Development Workflow

### 1. Starting Work
```bash
# Verify clean state
git status

# Check architecture compliance
find src -name "*.tsx" -o -name "*.ts" | wc -l  # Must be 0

# Read prompt pack
cat docs/prompts/active/[current-task].md

# Start development server
npm run web
```

### 2. During Development
```bash
# Frequent validation
npx prettier --write src/components/[file].js
npm run lint

# Test changes
# Make implementation
# Test again

# Commit with clear message
git add .
git commit -m "feat: [description per prompt pack]"
```

### 3. Before Marking Complete
```bash
# Run ALL validations
find src -name "*.tsx" -o -name "*.ts" | wc -l
find src -name "*.native.*" -o -name "*.web.*" | wc -l
npm run build:web
npx prettier --check 'src/**/*.js'

# Update documentation
# - Edit /docs/RELEASE_NOTES.md
# - Update component JSDoc
# - Add any new patterns to WORKING_AGREEMENTS.md
```

### 4. Completion Report
```markdown
## ✅ Task Complete: [Prompt Pack Name]

### Changes Made
- [Specific change 1]
- [Specific change 2]

### Files Modified
- `src/components/[file].js`
- `docs/RELEASE_NOTES.md`

### Validation Results
- TypeScript files: 0 ✓
- Platform files: 0 ✓
- Build: Success ✓
- Prettier: Pass ✓

Ready for review.
```

## Common Tasks

### Fix TypeScript Syntax Errors
```javascript
// Find all issues
grep -n "interface " [file].js
grep -n ": string" [file].js
grep -n "private " [file].js

// Remove interfaces completely
// Remove type annotations
// Remove access modifiers
```

### Convert Material-UI to React Native
```javascript
// ❌ WRONG
import { Button } from '@mui/material';

// ✅ CORRECT
import { TouchableOpacity, Text } from 'react-native';

<TouchableOpacity style={styles.button} onPress={handlePress}>
  <Text style={styles.buttonText}>Click</Text>
</TouchableOpacity>
```

### Add Theme Support
```javascript
import { useTheme } from '../../context/ThemeContext';

const Component = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  // ...
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderColor: colors.border,
  }
});
```

## Tools & Commands

### Development
```bash
npm run web                    # Start dev server
npm run build:web              # Build for production
npm run lint                   # Check code quality
npx prettier --write src/**/*.js  # Format code
```

### Validation
```bash
# Architecture compliance
find src -name "*.tsx" -o -name "*.ts" | wc -l
find src -name "*.native.*" -o -name "*.web.*" | wc -l
grep -r "@mui/material" src/ | wc -l

# Code quality
npx prettier --check 'src/**/*.js'
npm run lint

# Find TODOs
grep -n "TODO" src/**/*.js | head -20
```

### Deployment (When Authorized)
```bash
./scripts/deploy-qual.sh  # Full deployment with validation
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

## Error Resolution

### Common Build Errors

#### "Cannot find module"
- Check import paths are correct
- Verify package is installed: `npm list [package]`
- Run `npm install` if needed

#### "Unexpected token"
- Usually TypeScript syntax in .js file
- Remove type annotations
- Check for interfaces

#### Prettier Failures
- Run `npx prettier --write [file]`
- Fix any syntax errors
- Ensure no TypeScript syntax

## Interaction with Other Roles

### With PM
- **Receive**: Prompt packs with clear requirements
- **Report**: Progress and blockers
- **Deliver**: Completed implementations

### With Peer Reviewer
- **Provide**: Code for review (through PM)
- **Receive**: Feedback on issues to fix
- **Implement**: Required fixes

### With Admin
- **Request**: Environment help if needed
- **Coordinate**: For deployment issues

## Constraints

### MUST DO
- Follow WORKING_AGREEMENTS.md exactly
- Write JavaScript only
- Use unified architecture
- Update documentation
- Test before marking complete

### MUST NOT DO
- Create TypeScript files
- Create platform-specific files
- Use Material-UI
- Skip documentation
- Deploy without PM approval
- Argue with Peer Reviewer verdicts

## Success Metrics
- Zero TypeScript syntax in code
- Zero platform-specific files created
- All builds succeed
- All tests pass
- Documentation always updated
- No regressions introduced

## Quick Reference

### File Locations
```
/src/components/     # UI components
/src/context/       # React contexts
/src/services/      # Business logic
/docs/prompts/active/  # Current work
/docs/RELEASE_NOTES.md  # Update for each task
```

### Primary Color
```javascript
#A08670  // ✅ CORRECT manila brown
#8B7355  // ❌ WRONG old color
```

### Build Output
```
web/build/  // ✅ CORRECT
build/      // ❌ WRONG
```

---

## Lessons Learned Log

### 2025-09-10 - Major Sessions

#### TypeScript Cleanup Session
- **Fixed**: 18 files with TypeScript remnants
- **Issue**: Corrupted syntax like `openoolean`, `stringring`
- **Learning**: Prettier validation is critical gate
- **Action**: Always check for interface blocks, type annotations, access modifiers

#### Demo Data Fix
- **Issue**: initSampleData wasn't creating all categories
- **Root Cause**: Profile photo import path broken, async issues
- **Solution**: Fixed imports and await handling
- **Learning**: Always verify data persistence to AsyncStorage

#### Static Resource Path Fix  
- **Issue**: Resources returning 404 in qual deployment (e.g., `/global-styles.css`)
- **Root Cause**: Absolute paths (`/`) in index.html don't work in subdirectory
- **Solution**: Changed all paths to relative (`./`) in public/index.html
- **Learning**: Webpack's publicPath only affects JS/CSS bundles, NOT HTML references

#### Photo "default" Bug Fix Marathon
- **Issue**: Production showing 404 errors for `/qual/default` 
- **Root Causes**: 
  - OnboardingScreen.js line 491 setting photo to string "default" instead of null
  - Legacy profiles in storage already had `photo: "default"`
  - Multiple components (App.js, ProfileOverview.js, Header.js) rendering without validation
- **Solution Journey** (4 deployments required!):
  - v2025.09.10.13: Fixed OnboardingScreen to use `null` instead of "default"
  - v2025.09.10.14: Removed console.log from debugging
  - v2025.09.10.15: Fixed ProfileOverview.js and Header.js to filter "default"
  - v2025.09.10.16: Fixed App.js (final component) to filter "default"
- **Key Learnings**:
  - Search comprehensively with multiple patterns (`grep "Image"`, `grep "source=.*photo"`, `grep "uri.*photo"`)
  - Fix BOTH creation (prevent new bad data) AND display (handle existing bad data)
  - Test after each deployment - errors persist until ALL components fixed
  - Browser console stack traces show which component is failing
  - Legacy data requires defensive display code even after fixing source
- **Time Investment**: ~45 minutes (4 deployments × 5 min + debugging)
- **Prevention**: Input validation, display validation, comprehensive searching when fixing patterns

### Common Pitfalls & Solutions

#### Onboarding Component Confusion
- **Issue**: Multiple onboarding components (OnboardingScreen vs OnboardingWizard)
- **Learning**: Always verify which component is actually imported in App.js
- **Solution**: Check imports to understand actual data flow

#### Demo Data Creation
- **Issue**: Demo profile creation disabled thinking other component handled it
- **Learning**: OnboardingWizard only passes mode back, doesn't create data
- **Solution**: App.js must handle demo profile creation in handleOnboardingComplete

#### Profile Data Overwriting
- **Issue**: Loading profile then immediately overwriting with empty categories
- **Learning**: Preserve loaded data unless explicitly updating
- **Solution**: Don't destructure and reconstruct unless adding new fields

#### Deployment Script Versioning
- **Issue**: deploy-qual.sh expects NEXT version in release notes
- **Learning**: Script auto-increments version on each attempt
- **Solution**: Update both package.json AND release notes with next version

#### Modal Color Issues
- **Issue**: `colors.success.main` references breaking
- **Solution**: Use actual color values from theme context
- **Learning**: Always use `theme.colors` from ThemeContext

#### Build Directory Confusion
- **Issue**: Both `build/` and `web/build/` directories existed
- **Critical**: Build output is in `web/build/` NOT `build/`
- **Solution**: Remove old build directory, update all references

### Successful Patterns

#### Build & Deployment
- Always run `npm run build:web` after significant changes
- Use `NODE_OPTIONS=--max-old-space-size=8192` if build runs out of memory
- Validate with prettier before committing
- Ensure CopyWebpackPlugin includes all referenced files
- Use relative paths in HTML for subdirectory deployments

#### Git Workflow
- Commit locally with descriptive messages
- Use `git commit --amend` to keep history clean during fixes
- Push to GitHub AFTER validation passes
- Include file paths in commit messages for clarity

### 2025-09-10 Evening - Date/Photo Picker Implementation

#### Initial Implementation Issues (REJECTED)
- **Problem**: Claimed "complete" but mobile was non-functional
- **Missing**: File validation, error handling, mobile fallbacks
- **Lesson**: Never claim completion without testing all platforms

#### Complete Rewrite (ACCEPTED)
- **Fixed Issues**:
  - Added 5MB file size validation
  - Added MIME type validation (JPEG, PNG, GIF, WebP)
  - Added FileReader error handling
  - Replaced alert() with setErrorMessage state
  - Added loading states (isProcessingPhoto)
  - Standardized photo state to null (was mix of "", null, "default", undefined)
  - Mobile date: TextInput with MM/DD/YYYY formatting
  - Mobile photo: Clear message about limitation

#### Documentation Requirements
- **Tech Debt**: Created `/docs/TECH_DEBT.md` for tracking
- **Release Notes**: Must be transparent about limitations
- **Code Comments**: Added TODO with priority and impact
- **Key Learning**: Document what DOESN'T work as clearly as what does

#### CSS Field Width Issue
- **Problem**: Date input wider than name input on web
- **Fix**: Changed from `width: "100%"` to `width: "auto"` with `alignSelf: "stretch"`
- **Learning**: Match field widths for consistent form appearance

### 2025-09-10 Night - EntryForm Component Correction

#### The Wrong Component Trap (REJECTED FIRST ATTEMPT)
- **Problem**: Modified `/src/components/Forms/EntryForm.js` completely
- **Reality**: App uses EntryForm from `/src/components/UnifiedApp.js` 
- **Wasted Time**: ~20 minutes implementing wrong component
- **Root Cause**: Didn't verify import path in App.js (line 32)
- **Lesson**: ALWAYS trace imports from usage point, don't assume file structure

#### Finding the Right Component
- **Discovery Process**:
  1. `grep -n "EntryForm" ./App.js` - Found import from UnifiedApp.js
  2. `grep -n "export.*EntryForm" ./src/components/UnifiedApp.js` - Found actual component
- **Key Learning**: Multiple components with same name can exist - check imports!

#### Over-Engineering Quick Info (CORRECTED)
- **Initial Mistake**: Thought Quick Info needed separate category selector
- **Added Complexity**: 
  - `isQuickInfo` prop
  - `quickInfoCategories` prop  
  - Conditional logic for category display
- **Reality Check**: Quick Info is just a category with special UX elsewhere
- **Simplification**: All categories shown equally in EntryForm
- **Time Wasted**: ~15 minutes on unnecessary complexity
- **Lesson**: Understand domain model before adding complexity

#### Successful Patterns from Session
- Used `awk` to extract multi-line JSX components
- Found formatted code after prettier with grep patterns
- Removed dead code (unused EntryForm.js file)
- Updated exports in index.js to prevent confusion

### Recommendations for Future Sessions

1. **Always start with validation checks** - Run pre-work validation commands
2. **Test incrementally** - Build after each major change
3. **Check imports carefully** - Order matters, especially for themes
4. **Commit frequently** - Use amend to keep history clean
5. **Read error messages fully** - Often contain the exact fix needed
6. **Verify imports before assumptions** - Check what's actually used
7. **Test ALL platforms** - Never assume mobile works if web works
8. **Document limitations honestly** - Better to be clear about what doesn't work
9. **Add comprehensive validation** - File size, type, error handling
10. **Standardize empty values** - Pick one (null) and use consistently
11. **TRACE IMPORTS FIRST** - Never modify a component without verifying it's the one being used
12. **Understand domain model** - Don't add complexity for special cases that don't exist

## Developer Mantras

> "JavaScript Only, No Exceptions"

> "One File, All Platforms"

> "Document As You Code"

> "Test Before Complete"

> "Architecture Over Features"

> "Verify Imports Before Assumptions"

> "Test Mobile AND Web"

> "Document What Doesn't Work"

**REMEMBER**: Good code follows standards. Great code follows standards AND works perfectly on ALL platforms.

---

## Reference Documents
- `/docs/WORKING_AGREEMENTS.md` - Standards and requirements
- `/CLAUDE.md` - Project-specific instructions
- `/docs/prompts/active/` - Current work queue
- `/docs/roles/PM_ROLE_AND_LEARNINGS.md` - PM role and processes
- `/docs/TECH_DEBT.md` - Known limitations and roadmap

### 2025-09-11 - Package Optimization Task (Prompt Pack 002)

#### Deployment Script Auto-Increment Pattern
- **Issue**: Thought deployment script had a bug - it kept incrementing versions
- **Reality**: This is intentional design - script ALWAYS deploys next version, not current
- **Learning**: Script reads current from package.json, calculates next, requires release notes for next
- **Correct Workflow**: 
  1. Check current version in package.json
  2. Add release notes for (current + 1)
  3. Run deployment script
  4. Script handles the increment automatically

#### Package Removal Complexity
- **Issue**: Removed @mui/material thinking it was unused, but build broke
- **Root Cause**: @mui/icons-material depends on @mui/material as peer dependency
- **Solution**: Had to keep both @mui/material and @emotion packages
- **Learning**: Check peer dependencies before removing packages
- **Command**: `npm ls [package-name]` shows dependency tree

#### TypeScript in JavaScript Project
- **Issue**: Removed typescript and ts-loader, but build failed
- **Root Cause**: react-native-gesture-handler has .ts files that webpack needs to process
- **Solution**: Had to reinstall typescript and ts-loader even for JS project
- **Learning**: Some React Native packages ship TypeScript source files
- **Prevention**: Check if packages have .ts files: `find node_modules/[package] -name "*.ts"`

#### Code Splitting Implementation
- **Success Pattern**:
  ```javascript
  // Correct lazy loading with named exports
  const ShareDialogOptimized = lazy(() => 
    import("./src/components/Sharing").then(module => ({ 
      default: module.ShareDialogOptimized 
    }))
  );
  ```
- **Key Points**:
  - Always wrap lazy-loaded components in Suspense
  - Use LoadingOverlay as fallback
  - Works for both default and named exports
  - Creates separate chunk files automatically

#### Accurate Metrics Matter
- **Issue**: Claimed node_modules reduced from 1.5GB to 1.4GB (100MB savings)
- **Reality**: Still 1.4GB - minimal actual reduction
- **Impact**: Peer review flagged inaccurate metrics as credibility issue
- **Learning**: Always verify metrics with actual commands
- **Verification**: `du -sh node_modules/` for actual size

#### Build Size vs Node Modules Size
- **Insight**: node_modules size doesn't matter as much as build output size
- **What Matters**:
  - Build output size (deployed to users)
  - Main bundle size (initial load)
  - Code splitting (performance)
- **What Doesn't**:
  - node_modules size (only affects dev experience)
  - Number of packages (if tree-shaking works)

#### Webpack Bundle Analysis
- **Useful Commands**:
  ```bash
  # See individual chunk sizes
  ls -lh web/build/*.js | awk '{print $5, $9}'
  
  # Analyze what's in bundles (needs plugin)
  npx webpack-bundle-analyzer web/build/stats.json
  ```
- **Key Findings**: MUI takes 6.3MB (78% of build) - future optimization target

#### Clean Up After Yourself
- **Found Issues**:
  - Broken npm scripts left in package.json (test:web, eject)
  - Unnecessary @types/react-dom in devDependencies
- **Learning**: After removing packages, check for:
  - Scripts that reference removed packages
  - Related type definitions
  - Documentation that needs updating

#### Depcheck Limitations
- **Issue**: depcheck reported many packages as unused that were actually needed
- **Examples**: 
  - babel-plugin-react-native-web (needed for build)
  - @emotion packages (peer deps of MUI)
- **Learning**: Don't trust depcheck blindly - verify with build tests
- **Better Approach**: Remove suspicious packages one at a time and test

### 2025-09-11 - Category Icon Display Issues (Prompt Pack 01-004)

#### The "label" Text Mystery
- **Problem**: Category headers showing "label" text instead of Material Icons
- **Initial Assumptions**: Simple icon rendering issue
- **Actual Complexity**: Multiple interconnected problems across 4 files

#### Root Cause Discovery Journey
1. **First attempts failed** - Changes to CategorySection.js had no effect
2. **Webpack cache suspected** - Cleared with `rm -rf node_modules/.cache/webpack/`
3. **Still no effect** - This led to deeper investigation
4. **BREAKTHROUGH**: Found `src/components/Profile/index.js` was importing non-existent .tsx files!
   ```javascript
   // WRONG - These files don't exist!
   export const CategorySection = Platform.OS === "web"
     ? require("./CategorySection.tsx").CategorySection
     : require("./CategorySection.native.tsx").CategorySection;
   ```
5. **Fixed import** to use actual .js file
6. **New problem**: App.js had its own ProfileOverview component overriding the imported one
7. **Found hardcoded "label"** text in App.js lines 500-511 for web platform

#### Multiple Issues Fixed
- **App.js**: 
  - Had local ProfileOverview component (lines 158-625) overriding imported one
  - Was hardcoding "label" text for web platform
  - Importing native Icon instead of cross-platform IconProvider
- **CategorySection.js**: Had hardcoded emoji instead of Icon component
- **index.js**: Importing non-existent .tsx files
- **IconProvider.js**: Missing several MUI icon imports

#### TypeScript in JavaScript Project (Again!)
- **Issue**: Deployment blocked by TypeScript errors
- **Error**: Cannot find type definition file for 'react' and 'react-dom'
- **Solution**: `npm install --save-dev @types/react @types/react-dom`
- **Learning**: Even pure JS projects need type definitions for tooling

#### Theme-Aware Styling Complexity
- **Initial Fix**: Hardcoded colors (#f5f5f5, #ffffff)
- **Problem**: Looked terrible in dark mode
- **Iteration 1**: Used theme-aware colors but they didn't exist
- **Iteration 2**: Had to pass theme to createStyles function
- **Final Solution**:
  ```javascript
  backgroundColor: (() => {
    if (theme === 'dark') return '#1F1F1F';
    else if (theme === 'light') return '#F8F8F8';
    else return colors.background.secondary;
  })()
  ```

#### Quick Info Panel Special Case
- **Issue**: Header shading not extending to rounded corners
- **Cause**: `paddingVertical: 6` preventing header from reaching edges
- **Solution**: Removed padding, kept `overflow: "hidden"`
- **Learning**: Container padding interferes with child background extension

#### Deployment Process Learnings
- **Test files block deployment** - Must remove or commit all test HTML files
- **Prettier auto-fixes** during deployment - Changes get included in deployment commit
- **Multiple deployment attempts** common when fixing validation issues
- **Pre-commit hooks** scan for sensitive data patterns (tokens, passwords)

#### Effective Debugging Strategy
1. **Create test HTML files** to isolate issues
2. **Add console.logs** at multiple levels to trace execution
3. **Check browser console** for actual rendering
4. **Verify webpack compilation** - Look for "compiled successfully"
5. **Search broadly** - Issue might be in unexpected files (like App.js)

#### Time Investment
- **Total time**: ~3 hours
- **Root cause discovery**: ~90 minutes
- **Fixing all issues**: ~60 minutes  
- **Theme/styling iterations**: ~30 minutes
- **Key insight**: When changes don't take effect, something is blocking them (cache, imports, overrides)

#### Prevention for Future
- Always check for:
  - Import errors in index.js files
  - Local components overriding imported ones
  - Platform.OS conditionals that might exclude web
  - Webpack cache when changes don't appear
  - Browser console for actual errors

---
*Last Updated: 2025-09-11 (Category Icons & Package Optimization)*
*Role: Developer*