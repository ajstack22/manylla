# Add Calendar Picker and Fix Photo Picker in Onboarding

## 🟡 SEVERITY: HIGH - MAJOR FUNCTIONALITY ISSUE

**Issue**: Date input is text-only with manual formatting, and photo picker is non-functional placeholder

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

The onboarding wizard's child information page has two significant UX issues:

**1. Date of Birth Input**:
- Currently uses a text input with manual MM/DD/YYYY formatting
- Users must type numbers and slashes are auto-added via formatDateInput function
- Error-prone and not user-friendly
- No validation for valid dates
- Poor mobile experience typing dates
- Current code at lines 510-525 in OnboardingScreen.js

**2. Photo Picker**:
- Currently just toggles a "default" string value
- No actual file picker implementation
- No image preview capability
- Doesn't actually upload or store photos
- Just shows PersonIcon regardless of selection
- Current code at lines 453-469 in OnboardingScreen.js

**Impact**:
- Poor first-time user experience
- Data entry errors for dates
- No ability to add actual profile photos
- Professional appearance compromised

## Required Changes

### Change 1: Implement Native Date Picker
**Location**: `src/screens/Onboarding/OnboardingScreen.js`

**Current (WRONG)**:
```javascript
// Text input with manual formatting (lines 510-525)
<TextInput
  style={styles.input}
  placeholder="MM/DD/YYYY"
  placeholderTextColor={colors.text.disabled}
  value={dateOfBirth}
  onChangeText={handleDateChange}
  keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
  maxLength={10}
/>
```

**Fix (CORRECT)**:
```javascript
// Platform-specific date picker
{Platform.OS === 'web' ? (
  <input
    type="date"
    className="date-input"
    style={webDateInputStyle}
    value={dateOfBirth}
    onChange={(e) => setDateOfBirth(e.target.value)}
    max={new Date().toISOString().split('T')[0]}
  />
) : (
  <TouchableOpacity
    style={styles.input}
    onPress={() => {
      // For React Native, show native date picker
      // Implementation depends on platform
    }}
  >
    <Text style={dateOfBirth ? styles.inputText : styles.placeholderText}>
      {dateOfBirth || 'Tap to select date'}
    </Text>
  </TouchableOpacity>
)}
```

### Change 2: Implement Real Photo Picker
**Current (WRONG)**:
```javascript
// Non-functional toggle (lines 454-465)
<TouchableOpacity
  style={[styles.photoButton, photo && styles.photoButtonSelected]}
  onPress={() => {
    setPhoto(photo ? "" : "default");
  }}
>
  <PersonIcon size={40} color={photo ? colors.primary : colors.text.secondary} />
</TouchableOpacity>
```

**Fix (CORRECT)**:
```javascript
// Functional photo picker with preview
const handlePhotoPicker = () => {
  if (Platform.OS === 'web') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setPhoto(e.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
  // Mobile implementation would use react-native-image-picker
};

<TouchableOpacity
  style={[styles.photoButton, photo && styles.photoButtonSelected]}
  onPress={handlePhotoPicker}
>
  {photo && photo !== 'default' ? (
    <Image source={{ uri: photo }} style={styles.photoImage} />
  ) : (
    <PersonIcon size={40} color={colors.text.secondary} />
  )}
</TouchableOpacity>
```

## Implementation Steps

1. **Step 1**: Update OnboardingScreen.js imports
   ```javascript
   import { Image } from 'react-native';
   // Note: For full mobile support, would need react-native-image-picker
   // But we'll start with web-compatible solution
   ```

2. **Step 2**: Replace date input implementation
   - Remove formatDateInput and handleDateChange functions
   - Add platform-specific date picker
   - Style for web date input

3. **Step 3**: Replace photo picker implementation
   - Add handlePhotoPicker function
   - Update TouchableOpacity to call real picker
   - Add Image component for preview
   - Add photoImage style

4. **Step 4**: Add necessary styles
   ```javascript
   photoImage: {
     width: 96,
     height: 96,
     borderRadius: 48,
   },
   inputText: {
     color: colors.text.primary,
     fontSize: 16,
   },
   placeholderText: {
     color: colors.text.disabled,
     fontSize: 16,
   },
   // Web-specific date input styling
   webDateInputStyle: {
     padding: '12px 15px',
     fontSize: '16px',
     borderRadius: '8px',
     border: `1px solid ${colors.border}`,
     backgroundColor: colors.background.secondary,
     color: colors.text.primary,
     width: '100%',
   },
   ```

5. **Step 5**: Test functionality
   - Web: Verify HTML5 inputs work
   - Mobile: May need additional library for full support

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
- [ ] Date picker shows native calendar on web
- [ ] Photo picker opens file dialog on web
- [ ] Selected photo displays as preview
- [ ] Photo data is saved as base64 with profile
- [ ] Date is properly formatted and saved
- [ ] Maximum date is today (no future dates)
- [ ] Cancel/clear photo works correctly
- [ ] Styles match existing theme
- [ ] No console.log statements remain
- [ ] Works in light/dark/manylla themes

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
- Added native date picker for birth date selection
- Implemented functional photo picker with preview
- Improved onboarding user experience significantly

#### Technical
- Updated OnboardingScreen.js with proper pickers
- Web-first implementation (no additional dependencies)
- Platform-specific UI using Platform.select()
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
2-3 hours (web-focused implementation)

## Priority
HIGH - Core UX feature affecting all new users during critical first interaction

## Risk Assessment
- **Risk**: Browser compatibility for HTML5 date input
  - **Mitigation**: Test across major browsers, fallback to text if needed
- **Risk**: Large image files could slow app
  - **Mitigation**: Resize images client-side before storing
- **Risk**: Mobile may need additional libraries
  - **Mitigation**: Start with web, plan mobile enhancement separately

## Rollback Plan
If issues arise after deployment:
1. Revert OnboardingScreen.js to previous version
2. Clear any cached profile data with invalid photo format
3. Re-deploy previous working version

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
