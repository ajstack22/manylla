# S007: Dead Code Elimination and Import Cleanup

## Overview
Comprehensive cleanup of unused imports, dead code, unused files, and redundant components identified during linter analysis and codebase review.

## Findings from Analysis

### 1. Unused Files
- `src/components/ErrorBoundary/ErrorBoundary.future.js` - Future implementation never imported
- `src/components/Profile/ProfileOverview.rn.js` - React Native specific file not referenced
- `src/components/Toast/ToastManager.js` - Only imported once, may be redundant

### 2. Unused Imports (159 warnings from linter)
High-frequency unused imports across multiple files:
- `Platform` - 25+ files still importing but not using after migration
- `View`, `Text`, `TouchableOpacity` - Imported but unused in many components
- `Alert` - 10+ files import but don't use
- Various hooks (`useEffect`, `useRef`) imported but not used

### 3. Unused Variables and Functions
From linter analysis:
- `getStatusBarHeight` in App.js
- `scrollViewRef` in App.js  
- `originalLog`, `originalInfo`, `originalDebug` in index.web.js
- `getTextStyle`, `getScrollViewProps` in multiple dialog components
- `formatDateForDisplay` in OnboardingScreen.js
- Many unused destructured props and state variables

### 4. Dead Test Code
- `src/App.test.js` - Basic test file, likely from initial setup
- Test files in `__tests__` folders that may be outdated

### 5. Stub Files
- `src/stubs/gestureHandler.js` - Check if still needed for web
- `src/stubs/gestureHandlerRoot.js` - May be redundant with current implementation

### 6. Duplicate/Redundant Code Patterns
- Multiple modal/dialog implementations (7 files) - could be consolidated
- Repeated Platform import removal needed across 25+ files
- Similar error handling patterns that could be centralized

## Scope of Work

### Phase 1: Remove Unused Imports
- [ ] Remove unused `Platform` imports (25+ files)
- [ ] Remove unused React Native component imports (`View`, `Text`, etc.)
- [ ] Remove unused React hook imports
- [ ] Remove unused utility function imports

### Phase 2: Delete Dead Files
- [ ] Remove `ErrorBoundary.future.js` if truly unused
- [ ] Remove `ProfileOverview.rn.js` if not needed
- [ ] Evaluate and potentially remove `ToastManager.js`
- [ ] Clean up old test files

### Phase 3: Clean Unused Variables
- [ ] Remove unused function parameters
- [ ] Remove unused state variables
- [ ] Remove unused destructured props
- [ ] Clean up assigned but never used variables

### Phase 4: Consolidate Redundant Code
- [ ] Evaluate modal/dialog components for consolidation
- [ ] Consider centralizing error handling patterns
- [ ] Review stub files necessity

## Success Criteria
- [ ] Zero "unused variable" warnings from linter
- [ ] All dead files removed
- [ ] Reduced bundle size
- [ ] Cleaner, more maintainable codebase
- [ ] All tests still pass
- [ ] Web and mobile builds successful

## Testing Plan
1. Run linter before and after to measure improvement
2. Test web build: `npm run build:web`
3. Test mobile builds: `npx react-native run-android`
4. Run test suite: `npm test`
5. Manual testing of key features
6. Check bundle size reduction

## Risk Assessment
- **Low Risk**: Removing unused imports
- **Medium Risk**: Deleting files (ensure truly unused)
- **Low Risk**: Removing unused variables
- **Medium Risk**: Consolidating components (requires careful testing)

## Estimated Effort
- 3-4 hours for comprehensive cleanup
- Additional 1-2 hours for testing and validation

## Metrics to Track
- Before: 159 linter warnings
- After: Target < 20 warnings
- Bundle size reduction percentage
- Files removed count
- Lines of code removed

## Dependencies
- None - this is pure cleanup work

## Notes
- Use ESLint auto-fix where possible
- Consider adding stricter linter rules after cleanup
- Document any intentionally unused code (for future features)
- Create follow-up stories for larger refactoring opportunities

---
*Created: 2025-09-12*
*Status: Ready*
*Priority: P2 - Medium*