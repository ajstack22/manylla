# Consolidate Duplicate Onboarding Components

## 🟢 SEVERITY: MEDIUM - UX ENHANCEMENT

**Issue**: Two onboarding components exist (OnboardingScreen.js and OnboardingWizard.js) creating confusion and technical debt

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

The codebase currently has two separate onboarding components that serve overlapping purposes:

1. **OnboardingScreen.js** (src/screens/OnboardingScreen.js)
   - Full implementation with ProfileContext integration
   - Handles demo mode creation
   - Complex state management
   - Used in main App.js flow

2. **OnboardingWizard.js** (src/components/Onboarding/OnboardingWizard.js)
   - Simpler UI component
   - Appears to be an older or alternative implementation
   - May not be actively used

This duplication:
- Creates confusion about which component to use/modify
- Increases maintenance burden
- Led to the recent demo mode bug
- Violates DRY principles
- Makes the codebase harder to understand for new developers

## Required Changes

### Change 1: Audit and Document Current Usage
**Location**: `src/screens/OnboardingScreen.js` and `src/components/Onboarding/OnboardingWizard.js`

**Analysis Required**:
```bash
# Find all references to both components
grep -r "OnboardingScreen" src/
grep -r "OnboardingWizard" src/
```

### Change 2: Consolidate into Single Component
**Decision Required**: Determine canonical component based on:
- Current usage in App.js
- Feature completeness
- Code quality
- Integration with ProfileContext

### Change 3: Remove Duplicate Component
**Action**: After consolidation, remove the unused component and update all references

## Implementation Steps

1. **Step 1**: Audit current usage
   ```bash
   # Find all imports and usage
   grep -r "OnboardingScreen" src/ --include="*.js"
   grep -r "OnboardingWizard" src/ --include="*.js"
   ```

2. **Step 2**: Compare implementations
   - Document features in each component
   - Identify missing features in canonical choice
   - Note any unique functionality to preserve

3. **Step 3**: Consolidate components
   - Choose OnboardingScreen.js as canonical (currently used in App.js)
   - Migrate any missing features from OnboardingWizard.js
   - Update all references

4. **Step 4**: Remove duplicate
   - Delete OnboardingWizard.js
   - Remove any unused imports
   - Test thoroughly

5. **Step 5**: Update documentation
   - Document the single onboarding flow
   - Update component architecture docs

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
- [ ] New user onboarding flow works correctly
- [ ] Demo mode creation functions properly
- [ ] All 6 categories appear in demo mode
- [ ] Profile photo loads correctly
- [ ] Onboarding can be skipped if needed
- [ ] Re-onboarding works if user clears data

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
- Consolidated duplicate onboarding components into single implementation
- Improved code maintainability and reduced confusion

#### Technical
- Removed OnboardingWizard.js in favor of OnboardingScreen.js
- Updated all component references
- No breaking changes - functionality preserved
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
2-3 hours (including testing)

## Priority
MEDIUM - Technical debt that caused recent bug and creates ongoing maintenance burden

## Risk Assessment
- **Risk**: Removing wrong component could break onboarding
  - **Mitigation**: Thorough analysis of usage before removal
- **Risk**: Missing functionality in consolidated component
  - **Mitigation**: Feature comparison and migration before removal

## Rollback Plan
If issues arise after deployment:
1. Revert the commit that removed OnboardingWizard.js
2. Restore any import statements that were changed
3. Re-deploy previous version

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
