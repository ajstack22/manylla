# Fix 'default' Photo String Causing 404 Errors

## 🔴 SEVERITY: CRITICAL - BLOCKING USER FUNCTIONALITY

**Issue**: Photo field set to string 'default' causes 404 errors when Image component tries to load it as URL

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

## Problem Details

**Production Error**: The app is generating 404 errors for `/qual/default` when profiles have their photo field set to the string "default".

**Root Cause**:
- OnboardingScreen.js line 460 sets photo to "default" string when toggled
- Image components throughout the app try to load "default" as a URL
- Results in 404 errors: `GET https://manylla.com/qual/default 404 (Not Found)`

**Affected Code**:
```javascript
// OnboardingScreen.js line 460
setPhoto(photo ? "" : "default");
```

**Impact**:
- Console errors in production for ALL users
- Unnecessary network requests
- Poor user experience
- Potential performance impact from failed requests

## Required Changes

### Change 1: Remove 'default' String from Photo Handling
**Location**: `src/[UPDATE PATH]`

**Current (WRONG)**:
```javascript
// OnboardingScreen.js line 460
setPhoto(photo ? "" : "default"); // WRONG: "default" is not a valid URL
```

**Fix (CORRECT)**:
```javascript
// Simply toggle between having a photo or not
setPhoto(photo ? "" : null); // Or just remove the photo field entirely
```

## Implementation Steps

1. **Step 1**: Fix OnboardingScreen.js line 460
   ```bash
   # Commands if needed
   ```

2. **Step 2**: Update demo profile creation to not use "default"

3. **Step 3**: Add defensive checks in Image rendering components

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
- [ ] No 404 errors in console
- [ ] Demo mode works without errors
- [ ] Profile photos display correctly or show icon fallback

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
### 2025.09.10 - 2025-09-10

#### Fixed/Added/Changed
- Fixed 404 errors for invalid photo URLs
- Improved performance by removing unnecessary network requests

#### Technical
- OnboardingScreen.js photo handling fixed
- No breaking changes
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

## Time Estimate
15 minutes

## Priority
CRITICAL - Production 404 errors affecting all users immediately

## Risk Assessment
- **Risk**: None - simple string change
  - **Mitigation**: Test photo display after change

## Rollback Plan
If issues arise after deployment:
1. Revert OnboardingScreen.js change
2. Deploy immediately

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
