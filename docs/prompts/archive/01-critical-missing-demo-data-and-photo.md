# Missing Demo Data and Profile Photo in Production

## 🔴 SEVERITY: CRITICAL - BLOCKING USER FUNCTIONALITY

**Issue**: Production deployment missing demo entries - only shows Quick Info & Daily Support. Profile photo also not displaying.

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

### Current State in Production
- Only 2 categories visible: Quick Info, Daily Support
- Missing categories: Medical Info, School Info, Communication, Behavior, Safety
- Profile photo not loading (was working previously)
- Demo data initialization appears incomplete

### Expected State
- All 7 demo categories should be populated
- Each category should have sample entries
- Profile photo (Sarah Johnson) should display
- Full demo experience for new users

## Required Changes

### Change 1: Fix Demo Data Initialization
**Location**: `src/utils/initSampleData.js`

**Investigation Needed**:
- Check if initSampleData.js is being called properly
- Verify all categories are being created
- Check profile photo path/import
- Verify data persistence after initialization

## Implementation Steps

1. **Step 1**: Investigate Demo Data Initialization
   ```bash
   # Check current implementation
   grep -n "initSampleData" src/**/*.js
   # Verify all categories defined
   grep -n "Medical Info\|School Info\|Communication" src/utils/initSampleData.js
   ```

2. **Step 2**: Fix Missing Categories
   - Ensure all 7 categories are created
   - Verify each has proper entries
   - Check async/await handling

3. **Step 3**: Fix Profile Photo
   - Check photo import/path
   - Verify photo asset exists in build
   - Fix any broken references

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
- [ ] All 7 demo categories appear on first load
- [ ] Each category has appropriate sample entries
- [ ] Profile photo displays correctly
- [ ] Demo data persists after page refresh
- [ ] New user onboarding shows complete demo

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
### 2025.09.10.3 - 2025-09-10

#### Fixed
- Restored missing demo categories (Medical, School, Communication, Behavior, Safety)
- Fixed profile photo not displaying
- Ensured complete demo data initialization

#### Technical
- Fixed initSampleData.js initialization
- Corrected profile photo asset path
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
30-45 minutes

## Priority
CRITICAL - Production users seeing incomplete demo, poor first impression

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
