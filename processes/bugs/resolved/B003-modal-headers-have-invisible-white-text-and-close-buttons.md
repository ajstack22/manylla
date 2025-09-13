# B003: Modal Headers Have Invisible White Text and Close Buttons

**Status**: READY FOR IMPLEMENTATION  
**Severity**: CRITICAL  
**Priority**: P0  
**Impact**: All users cannot see or easily close modals  
**Created**: 2025-09-12  
**Reported By**: User  
**Assigned To**: LLM (Hotfix)  

## Bug Description
Modal headers appear completely white/invisible, making the title text and close button (✕) unreadable. The close button is clickable but invisible. This affects all modals using ThemedModal component.

## Root Cause Analysis (Completed)
**File**: `src/components/Common/ThemedModal.js`  
**Issue**: When `headerStyle="primary"`:
- Background: `colors.primary` (brown #8B6F47)
- Text color: `colors.background.paper` (nearly white)
- Close button: Same white color
- **Result**: White text on light backgrounds = invisible

## Reproduction Steps
1. Open any modal in the application (Settings, Share, Sync, etc.)
2. Observe the header appears blank/white
3. Close button (✕) is invisible but clickable in top-right

## User Decisions Made
✅ **Q1**: Keep colored headers but fix contrast (Option A)  
✅ **Q2**: Use proper close icon instead of ✕ (Option C)  
✅ **Q3**: Hotfix immediately (Option A)  
✅ **Q4**: Fix for all 3 themes (light, dark, manylla)

## Implementation Instructions for LLM

### Files to Modify:
1. `src/components/Common/ThemedModal.js`
2. May need to import icon from `react-native-vector-icons/MaterialIcons`

### Required Changes:
```javascript
// 1. Fix text colors for proper contrast
headerTitle: {
  color: isHeaderPrimary 
    ? '#FFFFFF'  // Always white on colored header
    : colors.text.primary  // Dark text on light header
}

// 2. Replace ✕ with proper close icon
import Icon from 'react-native-vector-icons/MaterialIcons';
// In close button:
<Icon name="close" size={24} color={iconColor} />

// 3. Ensure works in all themes:
// Test with theme switcher for light/dark/manylla modes
```

### Success Criteria:
- [ ] Modal headers have visible text in all themes
- [ ] Close icon is clearly visible in all themes  
- [ ] Proper contrast ratios (WCAG AA compliant)
- [ ] Works on web and mobile platforms
- [ ] No visual regressions in other components

### Testing Required:
1. Test all modals: Share, Sync, Profile, Settings
2. Test in all 3 themes: Light, Dark, Manylla
3. Test on web (Chrome, Safari, Firefox)
4. Verify close button is easily clickable

## LLM Execution Command
```bash
execute B003 with hotfix priority
```

## Deployment
- Deploy to qual immediately after fix
- No feature flag needed (critical fix)
- Monitor for any theme-related issues

---
*Bug tracking initiated. Ready for immediate implementation.*