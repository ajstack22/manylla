#!/bin/bash

# Prompt Pack Generator Script
# Usage: ./scripts/create-prompt-pack.sh [priority] [name]
# Example: ./scripts/create-prompt-pack.sh 01-critical fix-login-error

PRIORITY=$1
NAME=$2

if [ -z "$PRIORITY" ] || [ -z "$NAME" ]; then
    echo "Usage: ./scripts/create-prompt-pack.sh [priority] [name]"
    echo "Priority levels:"
    echo "  01-critical - Blocking user functionality"
    echo "  02-high     - Major issues affecting core features"  
    echo "  03-medium   - Enhancements and polish"
    echo "  04-low      - Nice-to-have improvements"
    echo ""
    echo "Example: ./scripts/create-prompt-pack.sh 01-critical fix-login-error"
    exit 1
fi

# Determine severity based on priority
case $PRIORITY in
    01-critical*)
        SEVERITY="🔴"
        LEVEL="CRITICAL"
        IMPACT="BLOCKING USER FUNCTIONALITY"
        ;;
    02-high*)
        SEVERITY="🟡"
        LEVEL="HIGH"
        IMPACT="MAJOR FUNCTIONALITY ISSUE"
        ;;
    03-medium*)
        SEVERITY="🟢"
        LEVEL="MEDIUM"
        IMPACT="UX ENHANCEMENT"
        ;;
    04-low*)
        SEVERITY="🔵"
        LEVEL="LOW"
        IMPACT="MINOR IMPROVEMENT"
        ;;
    *)
        echo "Invalid priority. Use: 01-critical, 02-high, 03-medium, or 04-low"
        exit 1
        ;;
esac

FILENAME="docs/prompts/active/${PRIORITY}-${NAME}.md"

# Check if file already exists
if [ -f "$FILENAME" ]; then
    echo "Error: $FILENAME already exists!"
    exit 1
fi

# Create the prompt pack from template
cat > "$FILENAME" << 'EOF'
# [TITLE - UPDATE THIS]

## SEVERITY_PLACEHOLDER SEVERITY: LEVEL_PLACEHOLDER - IMPACT_PLACEHOLDER

**Issue**: [Brief description of the problem - UPDATE THIS]

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

[UPDATE THIS SECTION - Detailed description of the issue]

## Required Changes

### Change 1: [UPDATE THIS - Description]
**Location**: `src/[UPDATE PATH]`

**Current (WRONG)**:
```javascript
// UPDATE THIS - Show current problematic code
```

**Fix (CORRECT)**:
```javascript
// UPDATE THIS - Show corrected code
```

## Implementation Steps

1. **Step 1**: [UPDATE THIS]
   ```bash
   # Commands if needed
   ```

2. **Step 2**: [UPDATE THIS]

3. **Step 3**: [UPDATE THIS]

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
- [ ] [UPDATE THIS - Test case 1]
- [ ] [UPDATE THIS - Test case 2]
- [ ] [UPDATE THIS - Test case 3]

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
### VERSION_PLACEHOLDER - DATE_PLACEHOLDER

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
[UPDATE THIS - X hours/minutes]

## Priority
LEVEL_PLACEHOLDER - [UPDATE THIS - Add specific reason]

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
EOF

# Replace placeholders
sed -i '' "s/SEVERITY_PLACEHOLDER/$SEVERITY/g" "$FILENAME"
sed -i '' "s/LEVEL_PLACEHOLDER/$LEVEL/g" "$FILENAME"
sed -i '' "s/IMPACT_PLACEHOLDER/$IMPACT/g" "$FILENAME"
sed -i '' "s/VERSION_PLACEHOLDER/$(date +%Y.%m.%d)/g" "$FILENAME"
sed -i '' "s/DATE_PLACEHOLDER/$(date +%Y-%m-%d)/g" "$FILENAME"

echo "✅ Created prompt pack: $FILENAME"
echo ""
echo "Next steps:"
echo "1. Edit $FILENAME to add specific details"
echo "2. Update the [TITLE] and all [UPDATE THIS] sections"
echo "3. Add specific code examples and test cases"
echo "4. Review against WORKING_AGREEMENTS.md"
echo ""
echo "Sections to update:"
grep -n "\[.*UPDATE.*\]" "$FILENAME" | head -10