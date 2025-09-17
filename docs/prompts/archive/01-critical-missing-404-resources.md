# Missing Resources Causing 404 Errors in Production

## 🔴 SEVERITY: CRITICAL - BLOCKING USER FUNCTIONALITY

**Issue**: Production deployment has 404 errors for global-styles.css and favicon.svg

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

### 404 Errors in Production Console
- `global-styles.css` - Failed to load (404)
- `favicon.svg` - Failed to load (404)
- These resources are referenced but not present in build output

### Impact
- Missing styles may affect UI appearance
- Missing favicon affects browser tab appearance
- Console errors create poor user experience

## Required Changes

### Change 1: Remove or Fix global-styles.css Reference
**Location**: `public/index.html` or webpack config

### Change 2: Add Missing favicon.svg
**Location**: `public/favicon.svg`

**Investigation Needed**:
- Check if these files exist in public/
- Verify webpack config includes them in build
- Check index.html for references
- May need to remove references or add missing files

## Implementation Steps

1. **Step 1**: Investigate Missing Resources
   ```bash
   # Check for file existence
   ls -la public/global-styles.css public/favicon.svg
   # Check index.html references
   grep -n "global-styles\|favicon" public/index.html
   ```

2. **Step 2**: Fix global-styles.css
   - If file doesn't exist, remove reference from index.html
   - Or create the file if styles are needed

3. **Step 3**: Fix favicon.svg
   - Add favicon.svg to public/ directory
   - Or use existing favicon.ico if present

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
- [ ] No 404 errors in browser console
- [ ] Favicon displays in browser tab
- [ ] Styles load correctly
- [ ] Build includes all referenced resources

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
- [UPDATE THIS - Description of change]
- [UPDATE THIS - User-facing impact]

#### Technical
- [UPDATE THIS - Files affected]
- [UPDATE THIS - Any breaking changes]
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
15-20 minutes

## Priority
CRITICAL - Console errors in production, affects perceived quality

## Risk Assessment
- **Risk**: [UPDATE THIS - Potential issue]
  - **Mitigation**: [UPDATE THIS - How to handle]

## Rollback Plan
If issues arise after deployment:
1. [UPDATE THIS - Rollback step 1]
2. [UPDATE THIS - Rollback step 2]

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
