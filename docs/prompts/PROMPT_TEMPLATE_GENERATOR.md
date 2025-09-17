# Prompt Pack Template Generator

## Usage
Copy this template when creating any new prompt pack. Fill in the [PLACEHOLDERS].

---

# [TITLE]

## [🔴/🟡/🟢] SEVERITY: [CRITICAL/HIGH/MEDIUM/LOW] - [IMPACT DESCRIPTION]

**Issue**: [Brief description of the problem]

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

[Detailed description of the issue]

## Required Changes

### Change 1: [Description]
**Location**: `src/[path]`

**Current (WRONG)**:
```javascript
[Current problematic code]
```

**Fix (CORRECT)**:
```javascript
[Corrected code]
```

### Change 2: [Description]
[Continue pattern...]

## Implementation Steps

1. **Step 1**: [Description]
   ```bash
   [Any commands needed]
   ```

2. **Step 2**: [Description]
   - [Substep]
   - [Substep]

3. **Step 3**: [Description]

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
- [ ] [Test case 1]
- [ ] [Test case 2]
- [ ] [Test case 3]

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
### [Version Number] - [Date]

#### [Fixed/Added/Changed]
- [Description of change]
- [User-facing impact]

#### Technical
- [Files affected]
- [Any breaking changes]
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
[X hours/minutes]

## Priority
[CRITICAL/HIGH/MEDIUM/LOW] - [Reason]

## Risk Assessment
- **Risk**: [Potential issue]
  - **Mitigation**: [How to handle]

## Rollback Plan
If issues arise after deployment:
1. [Rollback step 1]
2. [Rollback step 2]

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete