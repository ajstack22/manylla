# EntryForm Component Issues

## 🟡 SEVERITY: HIGH - FUNCTIONAL ISSUES

**Issue**: Missing category selector for Quick Info entries and unnecessary "Share With" component

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
import { Picker } from "@react-native-picker/picker";

// 4. Context/Hooks
import { useTheme } from '../../context/ThemeContext';

// 5. Components
import { Component } from '../Component';
```

## Problem Details

### Issue 1: Missing Quick Info Category Selector
- Quick Info entries need a category selector
- Currently only works for regular categories
- Users cannot properly categorize Quick Info items

### Issue 2: Unnecessary Share With Component
- "Share With" visibility options should be removed
- This feature is not part of the current design
- Creates confusion and complexity

## Required Changes

### Change 1: Add Category Selector for Quick Info
**Location**: `src/components/Forms/EntryForm.js`

**Current (WRONG)**:
```javascript
// No category selector for Quick Info entries
```

**Fix (CORRECT)**:
```javascript
// Add Quick Info category selection when appropriate
{isQuickInfo && (
  <View style={styles.formField}>
    <Text style={styles.modalLabel}>Quick Info Category</Text>
    <Picker
      selectedValue={selectedCategory}
      onValueChange={setSelectedCategory}
      style={styles.picker}
    >
      <Picker.Item label="Select a category..." value="" />
      {quickInfoCategories.map((cat) => (
        <Picker.Item 
          key={cat.id} 
          label={cat.displayName} 
          value={cat.id} 
        />
      ))}
    </Picker>
  </View>
)}
```

### Change 2: Remove Share With Component
**Location**: `src/components/Forms/EntryForm.js`

**Current (WRONG)**:
```javascript
{/* Visibility */}
<View style={styles.formField}>
  <Text style={styles.modalLabel}>Who can see this?</Text>
  {/* Visibility checkboxes */}
  <TouchableOpacity
    style={styles.checkboxRow}
    onPress={() => toggleVisibility("private")}
  >
    {/* ... */}
  </TouchableOpacity>
</View>
```

**Fix (CORRECT)**:
```javascript
// Remove entire visibility section
// Remove selectedVisibility state
// Remove toggleVisibility function
// Remove visibility from saved data
```

## Implementation Steps

1. **Identify Entry Type**
   - Add `isQuickInfo` prop to EntryForm
   - Add `quickInfoCategories` prop
   - Pass appropriate categories from parent

2. **Add Category Selector**
   ```javascript
   // In props
   isQuickInfo = false,
   quickInfoCategories = [],
   
   // In render
   const categoriesToShow = isQuickInfo ? quickInfoCategories : categories;
   ```

3. **Remove Share Component**
   - Delete visibility UI section (lines with "Who can see this?")
   - Remove `selectedVisibility` state
   - Remove `toggleVisibility` function
   - Remove `visibility` field from handleSubmit

4. **Test Changes**
   ```bash
   npm run web
   # Test both regular and Quick Info entries
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
- [ ] Regular entries show regular category selector
- [ ] Quick Info entries show Quick Info category selector
- [ ] Category selection is required for both types
- [ ] No "Share With" or visibility options present
- [ ] Data saves correctly without visibility field
- [ ] Form validates category selection before save

### Cross-Platform Testing
- [ ] Web (Chrome, Safari, Firefox)
- [ ] iOS Simulator
- [ ] Theme switching (light/dark/manylla)

## Documentation Updates Required

### Files to Update
- [ ] `/docs/RELEASE_NOTES.md` - Add EntryForm improvements
- [ ] `/docs/architecture/forms.md` - Update form structure docs
- [ ] Component JSDoc comments - Update EntryForm props documentation
- [ ] `/docs/WORKING_AGREEMENTS.md` - Update if new patterns established

### Release Notes Entry Template
```markdown
### 2025.09.10.3 - 2025-09-10

#### Fixed
- Added Quick Info category selector to entry form
- Removed unnecessary "Share With" visibility options

#### Technical
- Updated EntryForm.js to support Quick Info categories
- Simplified form by removing visibility state management
```

## Success Criteria

### Acceptance Requirements
- [ ] All architecture validations pass
- [ ] Quick Info entries have category selector
- [ ] Regular entries have category selector
- [ ] No visibility/share options remain
- [ ] Build succeeds without errors
- [ ] Form saves data correctly
- [ ] Documentation updated
- [ ] Release notes added

### Definition of Done
- Category selectors working for both types
- Share With component completely removed
- Tests passing
- Documentation updated
- Release notes written
- Build validation passed
- Ready for deployment

## Time Estimate
30-45 minutes

## Priority
HIGH - Affects core data entry functionality

## Risk Assessment
- **Risk**: Breaking existing entry creation
  - **Mitigation**: Test both regular and Quick Info entries thoroughly
- **Risk**: Data migration issues from visibility removal
  - **Mitigation**: Existing data unaffected, only new entries impacted

## Rollback Plan
If issues arise after deployment:
1. Git revert the EntryForm changes
2. Redeploy previous version
3. Debug issues in development
4. Re-implement with fixes

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
- Test both regular and Quick Info entry types