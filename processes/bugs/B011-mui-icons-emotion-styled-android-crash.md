# Bug B011: MUI Icons and Emotion Styled Components Crash on Android

## Overview
**Severity**: Critical
**Priority**: P0
**Status**: OPEN
**Reported**: 2025-09-17
**Reporter**: AI Assistant via Atlas Troubleshooting Framework
**Environment**: React Native 0.80.1, Android API 35

## Description
The app crashes on Android with "View config getter callback for component 'path' must be a function" errors when attempting to render any screen. This is caused by Material-UI (MUI) icon components that use @emotion/styled internally, which is incompatible with React Native. The app has 90+ MUI icon imports that all fail on Android.

## Root Cause
Material-UI (@mui/icons-material) is a web-only library that depends on @emotion/styled for CSS-in-JS styling. These libraries use DOM-specific APIs that don't exist in React Native, causing immediate crashes when components try to render.

## Affected Files
1. **src/components/Common/IconProvider.js** - 90+ MUI icon imports
2. **src/components/Navigation/BottomSheetMenu.js** - ExpandLess/ExpandMore icons
3. **src/context/ToastContext.js** - Success/Error/Warning/Palette icons (partially fixed)

## Steps to Reproduce
1. Run the app on Android: `npx react-native run-android`
2. App launches but immediately shows error screen
3. Error: "View config getter callback for component 'path' must be a function"
4. Stack trace shows emotion-element and emotion-styled in the call stack

## Expected Behavior
- Icons should render correctly on all platforms
- No crashes or error screens
- Consistent icon appearance across iOS, Android, and Web

## Actual Behavior
- Android: Immediate crash with emotion/styled errors
- iOS: May work if iOS handles undefined components differently
- Web: Works because MUI is designed for web

## Error Messages/Logs
```
Render Error
View config getter callback for component 'path' must be a function (received 'undefined').
Make sure to start component names with a capital letter.

Component Stack:
<anonymous> />
  emotion-element-a1829a1e.cjs.js:77
<SvgIcon />
  SvgIcon.js:119
<React.forwardRef_0 />
  View.js:32
```

## Impact Analysis
- **User Impact**: Critical - App is completely unusable on Android
- **Frequency**: Always - Affects 100% of Android users
- **Workaround**: None - Icons are used throughout the app
- **Affected Users**: All Android users

## Investigation Findings

### Dependencies Involved
```json
"@mui/icons-material": "^6.5.0",
"@mui/material": "^6.5.0",
"@emotion/react": "^11.14.0",
"@emotion/styled": "^11.14.1"
```

### Icon Usage Pattern in IconProvider.js
```javascript
// Current (broken) implementation
const icons = {
  Menu: require("@mui/icons-material/Menu").default,
  Close: require("@mui/icons-material/Close").default,
  ArrowBack: require("@mui/icons-material/ArrowBack").default,
  // ... 90+ more icons
};
```

### Why It Fails
1. MUI icons render as React components that use emotion/styled
2. Emotion creates styled components using `document.createElement` and CSS-in-JS
3. React Native doesn't have a DOM or `document` object
4. The styled components try to create SVG elements which don't exist in React Native

## Proposed Fix

### Option 1: Replace with React Native Vector Icons (Recommended)
```javascript
// Install react-native-vector-icons
// npm install react-native-vector-icons

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const icons = {
  Menu: () => <MaterialIcons name="menu" size={24} />,
  Close: () => <MaterialIcons name="close" size={24} />,
  ArrowBack: () => <MaterialIcons name="arrow-back" size={24} />,
  // Map all icons to vector icon equivalents
};
```

### Option 2: Platform-Specific Icon Provider
```javascript
const IconProvider = Platform.select({
  web: () => require('./IconProvider.web'), // MUI icons
  default: () => require('./IconProvider.native'), // Vector icons
});
```

### Option 3: Create Custom SVG Components
Use react-native-svg to create custom icon components that work on all platforms.

## Temporary Workarounds Applied
1. ✅ Replaced ToastContext icons with emoji fallbacks
2. ❌ IconProvider.js still uses MUI (too many icons to replace quickly)
3. ❌ BottomSheetMenu still imports MUI ExpandLess/ExpandMore

## Verification Steps
```bash
# After implementing fix
npx react-native run-android
# Expected: App loads without errors
# All icons should be visible
# No emotion/styled errors in console
```

## Acceptance Criteria
- [ ] All MUI icon imports removed from React Native code paths
- [ ] Icons render correctly on Android devices
- [ ] Icons render correctly on iOS devices
- [ ] Icons render correctly on Web
- [ ] No console errors about emotion/styled
- [ ] No "View config getter callback" errors
- [ ] Tests added for icon rendering on each platform
- [ ] IconProvider documented with platform requirements

## Related Items
- **Bug B010**: React Native Text components not rendering (related but separate issue)
- **Story S029**: Refactor App Initialization (attempted fix for Text rendering)
- **Dependencies**: Need to evaluate if @mui/material is needed at all for React Native

## Technical Details

### MUI Icons Found (Partial List)
- Menu, Close, ArrowBack, MoreVert, Search, Settings
- Person, PersonAdd, Edit, Delete, AccountCircle, CameraAlt
- Add, AddCircle, Category, LocalHospital, Psychology
- Restaurant, School, Warning, Home, Share, Print, QrCode
- Link, ContentCopy, Download, Sync, Cloud, CloudSync
- CloudUpload, CloudDownload, CloudDone, Label, LabelOutline
- Tag, Logout, Lock, LockOpen, Security, PrivacyTip
- DarkMode, LightMode, Palette, Brightness6, CheckCircle
- Error, Info, Favorite, TrendingUp, People, Flag, Star
- FitnessCenter, ChatBubble, Lightbulb, Today, Healing
- ContactPhone, CheckBox, CheckBoxOutlineBlank
- RadioButtonChecked, RadioButtonUnchecked, CalendarToday
- Schedule, Event, Description, Folder, InsertDriveFile
- ExpandMore, ExpandLess, ChevronRight, ChevronLeft
- ArrowUpward, ArrowDownward, DragHandle, Visibility
- VisibilityOff, Help, HelpOutline, Notifications
- NotificationsOff, Refresh, Save, Cancel, Done
- MoreHoriz, PlaylistAddCheck

### Migration Strategy
1. **Phase 1**: Create icon mapping table (MUI name -> vector icon name)
2. **Phase 2**: Install and configure react-native-vector-icons
3. **Phase 3**: Create platform-specific IconProvider
4. **Phase 4**: Replace all icon usages systematically
5. **Phase 5**: Remove MUI dependencies if not needed elsewhere
6. **Phase 6**: Test on all platforms

## Lessons Learned
1. Always check if libraries are React Native compatible before using
2. MUI is web-only and should not be used in React Native projects
3. Platform-specific code should be isolated in separate modules
4. Icon systems need special consideration in cross-platform apps

---
*Bug ID: B011*
*Severity: Critical*
*Priority: P0*
*Status: OPEN*

## Atlas Troubleshooting Notes
This bug was discovered while investigating B010 (Text rendering issues). The Atlas framework helped identify:
1. Initial symptom: Text not rendering
2. First fix: Removed nested providers (partially worked)
3. Second issue: Styled component crashes
4. Root cause: MUI icons using emotion/styled
5. Scope: Much larger than initially thought (90+ icons)

The systematic approach revealed that what appeared to be a Text rendering issue was actually a cascade of problems stemming from using web-only libraries in React Native.