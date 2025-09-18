# Story S029*: Refactor App Initialization to Fix Android Text Rendering

## Overview
Implement fix for Android Text components not rendering in UnifiedApp context. Investigation (B010) revealed the complex provider hierarchy (AppWrapper->RootView->ThemeProvider->SyncProvider) prevents Text initialization on Android. Need to refactor App.js initialization sequence to ensure Text components work on Android while maintaining all existing functionality.

## Status
- **Priority**: P0
- **Status**: READY
- **Created**: 2025-09-17
- **Assigned**: Unassigned
- **Type**: BUGFIX

## Background
All Text components are invisible on Android making the app completely unusable. Investigation showed Text works in isolation but fails when wrapped in our provider hierarchy. This is blocking all Android users from using the app. StackMap avoided this by using simpler initialization, we need to fix our complex provider nesting.

## Requirements
1. Fix Text rendering on Android
2. Maintain all provider functionality
3. No regression on iOS or Web
4. Zero console warnings
5. Works on Android API 35

## Success Metrics
```bash
# Verification commands
OnboardingScreen displays Welcome title and all button text. No ViewManagerPropertyUpdater warnings in console. Text visible immediately on app launch without delays. All screens show text correctly on Android devices.
```

## Implementation Guidelines
- Follow existing patterns in the codebase
- Ensure cross-platform compatibility  
- Update relevant documentation
- Add appropriate tests
- Use TypeScript for type safety
- Follow Manylla coding conventions

## Acceptance Criteria
- [ ] All requirements implemented
- [ ] All success metrics pass
- [ ] Tests written and passing
- [ ] All platforms verified (Web, iOS, Android)
- [ ] Documentation updated
- [ ] Code review completed
- [ ] No console errors or warnings

## Dependencies
Bug B010 investigation complete - Text rendering issue root cause identified

## Related Items
- **Bug**: B010 - React Native Text components not rendering content on Android
- **Test Component**: src/screens/TestText.js (proves Text works in isolation)

## Estimated Effort
**Total**: 8

## Technical Implementation Plan

### Root Cause
The complex provider hierarchy in App.js (AppWrapper → RootView → ThemeProvider → SyncProvider) interferes with React Native Text component initialization on Android. Text works in isolation but fails when nested in these providers.

### Recommended Solution

1. **Create platform-specific initialization**:
```javascript
// App.js
function App() {
  useAndroidBackHandler();

  // Android needs simpler provider structure
  if (platform.isAndroid) {
    return (
      <ThemeProvider>
        <SyncProvider>
          <AppContent />
        </SyncProvider>
      </ThemeProvider>
    );
  }

  // iOS/Web can use full provider hierarchy
  return (
    <AppWrapper>
      <RootView style={{ flex: 1 }}>
        <ThemeProvider>
          <SyncProvider>
            <AppContent />
          </SyncProvider>
        </ThemeProvider>
      </RootView>
    </AppWrapper>
  );
}
```

2. **Alternative: Add initialization delay for Android**:
```javascript
const [isReady, setIsReady] = useState(!platform.isAndroid);

useEffect(() => {
  if (platform.isAndroid) {
    // Let native modules initialize
    requestAnimationFrame(() => {
      setIsReady(true);
    });
  }
}, []);

if (!isReady) return null;
```

### Testing Checklist
- [ ] Text visible on OnboardingScreen
- [ ] No ViewManagerPropertyUpdater warnings
- [ ] All buttons show labels
- [ ] TextInput placeholders visible
- [ ] Works on Android API 35
- [ ] No regression on iOS/Web

## Notes
*Story created via create-story-with-details.sh*
*Investigation used Atlas Troubleshooting Framework*

---
*Story ID: S029**
*Created: 2025-09-17*
*Status: READY*
