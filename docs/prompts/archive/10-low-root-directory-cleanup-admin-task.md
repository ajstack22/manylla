# Clean Up Root Directory - Admin Task

## 🔵 SEVERITY: LOW - MINOR IMPROVEMENT

**Issue**: The root directory has accumulated 70+ files including backups, test files, and old scripts that should be organized or removed

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

The root directory `/Users/adamstack/manylla/` contains many files that clutter the project structure:

**Issues identified**:
- Multiple App.js backup/test files (App.js.backup, App.simple.js, App.test.js, App.test2.js, App.test3.js)
- Old migration scripts (consolidate-platform-files.sh, consolidate-unified.sh, apply-schema.sh)
- Backup directories (backup-before-unification)
- Old build directory (should only have web/build)
- Various test and temporary files
- Old configuration files that may no longer be needed

**Admin Role Task**: Clean up the root directory to maintain only essential project files, improving project organization and reducing confusion.

## Required Changes

### Change 1: Audit Root Directory Files
**Location**: `/Users/adamstack/manylla/`

**Current State Analysis**:
```bash
# Files to review
ls -la *.js | grep -v "^App.js\|^index.js"  # Non-essential JS files
ls -la *.sh  # Shell scripts
ls -la App.*  # App.js variants
ls -d */ | grep -v "^src/\|^public/\|^node_modules/"  # Directories
```

### Change 2: Files to KEEP (Essential)
**MUST PRESERVE**:
```
# Core project files
App.js                  # Main application entry
app.json               # React Native config
babel.config.js        # Babel configuration
webpack.config.js      # Web build config
package.json           # Dependencies
package-lock.json      # Dependency lock
CLAUDE.md             # AI assistant instructions
PROJECT_TYPE          # Project type marker
.gitignore            # Git ignore rules
.eslintrc.json        # Linting config
.eslintignore         # Linting ignore

# Directories (essential)
src/                  # Source code
public/               # Public assets
web/                  # Web build output
scripts/              # Deployment scripts
docs/                 # Documentation
ios/                  # iOS project
android/              # Android project
api/                  # Backend API
node_modules/         # Dependencies
.git/                 # Git repository
```

### Change 3: Files to REMOVE
**CANDIDATES FOR DELETION**:
```
# Backup/test files
App.js.backup         # Old backup
App.simple.js         # Test variant
App.test.js          # Test file
App.test2.js         # Test file
App.test3.js         # Test file

# Old migration scripts
apply-schema.sh              # Database migration (completed)
consolidate-platform-files.sh  # Platform consolidation (completed)
consolidate-unified.sh         # Unification script (completed)
final-compliance-check.sh     # One-time check (if exists)
fix-font-sizes.sh            # One-time fix (if exists)

# Old directories
backup-before-unification/   # Old backup
build/                       # Old CRA build dir (use web/build now)

# Other candidates
config-overrides.js          # Check if still needed
test-mobile-api.sh          # Check if still needed
```

## Implementation Steps

1. **Step 1**: Create comprehensive backup
   ```bash
   # Create timestamped backup of entire root
   mkdir -p backups
   tar -czf backups/root-cleanup-$(date +%Y%m%d-%H%M%S).tar.gz \
     --exclude=node_modules \
     --exclude=.git \
     --exclude=web/build \
     --exclude=backups \
     .
   ```

2. **Step 2**: Clean up App.js variants
   ```bash
   # Remove test and backup App.js files
   rm -f App.js.backup
   rm -f App.simple.js
   rm -f App.test.js
   rm -f App.test2.js
   rm -f App.test3.js
   ```

3. **Step 3**: Remove completed migration scripts
   ```bash
   # Remove one-time migration scripts
   rm -f apply-schema.sh
   rm -f consolidate-platform-files.sh
   rm -f consolidate-unified.sh
   rm -f final-compliance-check.sh
   rm -f fix-font-sizes.sh
   ```

4. **Step 4**: Clean up old directories
   ```bash
   # Remove old backup directory
   rm -rf backup-before-unification/
   
   # Remove old build directory (we use web/build now)
   rm -rf build/
   ```

5. **Step 5**: Review and clean other files
   ```bash
   # Check if these are still needed
   ls -la config-overrides.js  # May be needed for React Native Web
   ls -la test-mobile-api.sh   # Check if actively used
   
   # If not needed, remove:
   # rm -f config-overrides.js
   # rm -f test-mobile-api.sh
   ```

6. **Step 6**: Verify nothing broke
   ```bash
   # Ensure project still works
   npm run build:web
   npm test
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
- [ ] Web build succeeds (`npm run build:web`)
- [ ] React Native bundler starts (`npm start`)
- [ ] No broken imports or references
- [ ] Git status shows expected deletions
- [ ] Deployment script still works

### Cross-Platform Testing
- [ ] Web (Chrome, Safari, Firefox)
- [ ] iOS Simulator
- [ ] Theme switching (light/dark/manylla)

## Documentation Updates Required

### Files to Update
- [ ] `/docs/RELEASE_NOTES.md` - Note cleanup performed
- [ ] `.gitignore` - Add `/backups` directory if keeping backups
- [ ] `CLAUDE.md` - Update if any referenced files were removed

### Release Notes Entry Template
```markdown
### 2025.09.10 - 2025-09-10

#### Fixed/Added/Changed
- Cleaned up root directory clutter
- Removed obsolete test and backup files
- Improved project organization

#### Technical
- Removed [X] obsolete files from root directory
- Removed old backup and build directories
- No functional changes
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
20-30 minutes

## Priority
LOW - Cleanup task with no functional impact, improves project organization

## Risk Assessment
- **Risk**: Accidentally deleting a needed file
  - **Mitigation**: Full backup created before any deletions
- **Risk**: Breaking build or deployment scripts
  - **Mitigation**: Test builds after cleanup
- **Risk**: Removing a script someone is using
  - **Mitigation**: Check with team, keep backup for 30 days

## Rollback Plan
If issues arise after deployment:
1. Restore from backup: `tar -xzf backups/root-cleanup-[timestamp].tar.gz`
2. Commit restored files if needed

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
