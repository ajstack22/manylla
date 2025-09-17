# Clean Up /docs Directory - Admin Task

## 🔵 SEVERITY: LOW - MINOR IMPROVEMENT

**Issue**: The /docs directory has accumulated many files over time and needs cleanup to improve maintainability

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

The `/docs` directory contains a mix of current documentation, obsolete files, and various planning documents that have accumulated over the project's lifecycle. This creates:

- Confusion about which docs are current
- Unnecessary repo bloat
- Difficulty finding relevant documentation
- Outdated information that may mislead developers

**Admin Role Task**: As the system administrator, audit and clean up the `/docs` directory to maintain only essential, current documentation.

## Required Changes

### Change 1: Audit Current /docs Structure
**Location**: `/docs/**`

**Current Structure Analysis**:
```bash
# Run these commands to understand current state
find docs -type f -name "*.md" | wc -l  # Count markdown files
ls -la docs/  # List top-level structure
find docs -type f -name "*.md" -exec wc -l {} + | sort -n  # File sizes
find docs -type f -mtime +30  # Files not modified in 30+ days
```

### Change 2: Identify Files to Preserve
**MUST KEEP**:
- `/docs/WORKING_AGREEMENTS.md` - Core development standards
- `/docs/RELEASE_NOTES.md` - Version history
- `/docs/prompts/active/*` - Active work items
- `/docs/prompts/archive/*` - Completed work reference
- `/docs/prompts/PROCESS.md` - Prompt pack workflow
- `/docs/prompts/README.md` - Prompt pack documentation

### Change 3: Clean Up Obsolete Files
**CANDIDATES FOR REMOVAL**:
- Old TODO files
- Outdated architecture documents
- Draft documents never finalized
- Duplicate information
- Old planning documents
- Superseded specifications

## Implementation Steps

1. **Step 1**: Create backup of current docs
   ```bash
   # Create timestamped backup
   tar -czf docs-backup-$(date +%Y%m%d).tar.gz docs/
   ```

2. **Step 2**: Audit and list files for removal
   ```bash
   # Find potential cleanup candidates
   find docs -type f -name "*.md" | grep -v "WORKING_AGREEMENTS\|RELEASE_NOTES\|prompts/"
   
   # Check for old TODOs
   find docs -type f -name "*TODO*" -o -name "*todo*"
   
   # Find duplicates by name pattern
   find docs -type f -name "*.md" | sed 's/_v[0-9]*.md/.md/' | sort | uniq -d
   ```

3. **Step 3**: Review each file category
   - Check if content is duplicated elsewhere
   - Verify no active references to the file
   - Confirm information is outdated or superseded

4. **Step 4**: Execute cleanup
   ```bash
   # Remove identified files (list specific files after audit)
   rm docs/[obsolete-file-1].md
   rm docs/[obsolete-file-2].md
   # etc.
   ```

5. **Step 5**: Reorganize remaining docs
   ```bash
   # Create clear structure if needed
   mkdir -p docs/architecture
   mkdir -p docs/guides
   mkdir -p docs/reference
   # Move files to appropriate locations
   ```

6. **Step 6**: Update any references
   ```bash
   # Check for broken references
   grep -r "docs/" --include="*.md" --include="*.js" .
   ```

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
- [ ] No broken documentation links
- [ ] All critical files preserved
- [ ] Backup created successfully
- [ ] Build still succeeds
- [ ] Deploy script still works

### Cross-Platform Testing
- [ ] Web (Chrome, Safari, Firefox)
- [ ] iOS Simulator
- [ ] Theme switching (light/dark/manylla)

## Documentation Updates Required

### Files to Update
- [ ] `/docs/RELEASE_NOTES.md` - Note documentation cleanup
- [ ] Create `/docs/README.md` if needed - Index of remaining docs
- [ ] Update any files with broken references to removed docs

### Release Notes Entry Template
```markdown
### 2025.09.10 - 2025-09-10

#### Fixed/Added/Changed
- Cleaned up obsolete documentation files
- Improved documentation organization

#### Technical
- Removed [X] obsolete documentation files
- Reorganized docs structure for clarity
- No code changes required
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
LOW - Documentation cleanup with no functional impact

## Risk Assessment
- **Risk**: Accidentally deleting important documentation
  - **Mitigation**: Create backup before cleanup, review each file carefully
- **Risk**: Breaking documentation references
  - **Mitigation**: grep for references before deletion

## Rollback Plan
If issues arise after deployment:
1. Restore from backup: `tar -xzf docs-backup-[date].tar.gz`
2. Commit restored files back to repo

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
