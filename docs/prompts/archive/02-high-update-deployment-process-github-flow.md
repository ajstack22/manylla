# Update Deployment Process - GitHub Push Before Qual Deploy

## 🟡 SEVERITY: HIGH - PROCESS IMPROVEMENT

**Assigned To**: Admin Role

**Issue**: Current deployment process pushes to GitHub AFTER qual deployment, risking untested code in repository

## Admin Context

This is an infrastructure/process task that requires:
- Modifying deployment scripts
- Updating process documentation
- No application code changes
- Understanding of git workflow and deployment pipeline

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

### Current Process (RISKY):
1. Local commits
2. Run validations
3. Deploy to qual
4. Push to GitHub (optional)

### Problem:
- If qual deployment reveals issues, GitHub may already have broken code
- No rollback point in GitHub before deployment
- GitHub doesn't reflect tested state

### Correct Process Should Be:
1. Local commits
2. Run all validations
3. **Push to GitHub** (creates rollback point)
4. Deploy to qual from validated commit
5. If deployment fails, GitHub has last known good state

## Required Changes

### Change 1: Update deploy-qual.sh Script
**Location**: `scripts/deploy-qual.sh`

**Add GitHub push step after validation, before deployment**

### Change 2: Update CLAUDE.md Documentation
**Location**: `CLAUDE.md`

**Update deployment process section with correct order**

### Change 3: Update WORKING_AGREEMENTS.md
**Location**: `docs/WORKING_AGREEMENTS.md`

**Add deployment process with GitHub checkpoint**

## Implementation Steps

1. **Step 1**: Review Current deploy-qual.sh Script
   ```bash
   # Examine current deployment flow
   cat scripts/deploy-qual.sh
   ```

2. **Step 2**: Modify Script to Add GitHub Push
   - Add git push after all validations pass
   - Before rsync to server
   - Include option to skip push with flag

3. **Step 3**: Update Documentation
   - CLAUDE.md deployment section
   - WORKING_AGREEMENTS.md process flow
   - Add rollback procedures

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
- [ ] Script validates before pushing to GitHub
- [ ] GitHub push happens before qual deployment
- [ ] Failed deployment doesn't affect GitHub
- [ ] Rollback process documented and tested
- [ ] --skip-github flag works if needed

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
### 2025.09.10.4 - 2025-09-10

#### Process Improvement
- Updated deployment process to push to GitHub before qual deployment
- Added GitHub as checkpoint between validation and deployment
- Improved rollback safety with GitHub as source of truth

#### Technical
- Modified scripts/deploy-qual.sh flow
- Updated documentation in CLAUDE.md and WORKING_AGREEMENTS.md
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
30 minutes

## Priority
HIGH - Prevents broken code in GitHub repository, ensures clean rollback points

## Risk Assessment
- **Risk**: Accidental push of sensitive data
  - **Mitigation**: Validation checks for secrets before push
- **Risk**: Network failure between push and deploy
  - **Mitigation**: Add retry logic and clear error messages
- **Risk**: Team confusion with new process
  - **Mitigation**: Clear documentation and team notification

## Rollback Plan
If issues arise after deployment:
1. [UPDATE THIS - Rollback step 1]
2. [UPDATE THIS - Rollback step 2]

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
