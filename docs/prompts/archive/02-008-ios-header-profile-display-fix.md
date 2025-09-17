# Fix iOS Header Not Updating with Profile Information

## 🔴 SEVERITY: CRITICAL - BLOCKING USER FUNCTIONALITY

**Issue**: On iOS, the header continues to show "manylla" instead of updating to display the user's profile name and photo after profile creation

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

**Platform-Specific Bug**: The header component is not updating on iOS devices/simulator after a profile is created or selected.

**Current Behavior (iOS)**:
- Header always shows "manylla" text
- No profile photo displayed
- Profile name not shown
- Works correctly on web

**Expected Behavior**:
- After profile creation/selection, header should show:
  - Profile photo (or PersonIcon if no photo)
  - Profile name
  - Should update immediately when profile changes

**Suspected Causes**:
1. State update not triggering re-render on iOS
2. Platform.OS conditional logic issue
3. AsyncStorage read timing difference on iOS
4. React Navigation header update issue
5. Context not propagating changes on iOS

**Files to Check**:
- `src/components/Layout/Header.js`
- `src/context/ProfileContext.js`
- `App.js` (header configuration)
- Navigation setup

## Required Changes

### Change 1: Debug Header Profile Display on iOS
**Location**: `src/components/Layout/Header.js`

**Debugging Steps**:
```javascript
// 1. Add console.log to verify profile data
const Header = () => {
  const { profile } = useProfiles();
  console.log('[iOS Debug] Header profile:', profile);
  
  // Check if profile updates are received
  useEffect(() => {
    console.log('[iOS Debug] Profile changed in Header:', profile?.name);
  }, [profile]);
}

// 2. Check Platform-specific rendering
{Platform.OS === 'ios' && console.log('[iOS] Rendering header')}

// 3. Force re-render test
const [forceUpdate, setForceUpdate] = useState(0);
useEffect(() => {
  const interval = setInterval(() => {
    setForceUpdate(prev => prev + 1);
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

### Change 2: Ensure ProfileContext Updates Propagate
**Location**: `src/context/ProfileContext.js`

**Verify Context Updates**:
```javascript
// Make sure context triggers re-renders
const saveProfiles = async (profiles) => {
  console.log('[iOS Debug] Saving profiles:', profiles);
  await AsyncStorage.setItem('profiles', JSON.stringify(profiles));
  setProfiles([...profiles]); // Force new array reference
  
  // iOS-specific force update
  if (Platform.OS === 'ios') {
    setTimeout(() => {
      setProfiles([...profiles]);
    }, 100);
  }
};
```

### Change 3: Fix Header Display Logic
**Location**: `src/components/Layout/Header.js`

**Potential Fix**:
```javascript
// Ensure profile display works on iOS
const shouldShowProfile = profile && profile.name;

// Force text update on iOS
<Text style={styles.headerTitle}>
  {Platform.OS === 'ios' 
    ? (profile?.name || 'manylla')
    : (profile?.name || 'manylla')
  }
</Text>

// Ensure Image component works on iOS
{profile?.photo && profile.photo !== 'default' ? (
  <Image 
    source={{ uri: profile.photo }}
    style={styles.profileAvatar}
    key={profile.photo} // Force re-render with key
  />
) : (
  <PersonIcon size={24} color={colors.text.primary} />
)}
```

## Implementation Steps

1. **Step 1**: Debug on iOS Simulator
   ```bash
   # Start React Native on iOS
   npx react-native run-ios
   
   # Watch console logs
   npx react-native log-ios
   ```

2. **Step 2**: Add debugging to identify issue
   - Add console.logs to Header.js
   - Check ProfileContext updates
   - Verify AsyncStorage reads on iOS
   - Test with forced re-renders

3. **Step 3**: Implement platform-specific fix
   - May need iOS-specific state update
   - Could require setTimeout for iOS
   - Might need key prop for forcing updates
   - Test Navigation header integration

4. **Step 4**: Test profile switching
   - Create profile
   - Switch profiles
   - Clear and recreate
   - Verify header updates each time

5. **Step 5**: Remove debug code
   - Clean up console.logs
   - Keep only necessary fixes

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
- [ ] Header shows "manylla" before profile creation (iOS)
- [ ] Header updates to show profile name after creation (iOS)
- [ ] Profile photo displays if available (iOS)
- [ ] PersonIcon shows if no photo (iOS)
- [ ] Header updates when switching profiles (iOS)
- [ ] Header updates after app restart (iOS)
- [ ] Works on iPhone simulator
- [ ] Works on iPad simulator
- [ ] No console errors
- [ ] Web functionality unchanged

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
1-2 hours (including iOS testing)

## Priority
CRITICAL - iOS users cannot see their profile information, breaking core UX

## Risk Assessment
- **Risk**: Fix might affect web version
  - **Mitigation**: Test thoroughly on both platforms
- **Risk**: Force updates could cause performance issues
  - **Mitigation**: Use minimal re-render approach
- **Risk**: iOS-specific code complexity
  - **Mitigation**: Use Platform.select() properly

## Rollback Plan
If issues arise after deployment:
1. Revert Header.js changes
2. Revert ProfileContext.js changes
3. Test web still works

---

**IMPORTANT**: 
- Follow WORKING_AGREEMENTS.md strictly
- Update documentation as part of the work, not after
- Run ALL validation commands before marking complete
