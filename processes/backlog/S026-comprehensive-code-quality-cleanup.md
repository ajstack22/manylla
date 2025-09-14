# Story S026: Comprehensive Code Quality Cleanup

## Overview
Eliminate all code quality violations by fixing 123 ESLint errors and 12 warnings across the codebase. This comprehensive cleanup combines issues from S019 (switch default cases), S020 (unreachable code), and S021 (unused variables) to achieve zero lint violations and establish a clean code baseline for future development.

## Status
- **Priority**: P1
- **Status**: READY
- **Created**: 2025-09-14
- **Assigned**: Unassigned
- **Type**: TESTING
- **Combines**: S019, S020, S021

## Background
The codebase currently has significant lint violations that impact code quality, maintainability, and developer experience. Analysis shows:
- **123 ESLint errors** (primarily in test files)
- **12 ESLint warnings** (unused variables and imports)
- **Missing default cases** in switch statements
- **Testing Library violations** in component tests
- **Undefined mock variables** in test suites

This technical debt affects productivity and code reliability. A systematic cleanup is required to establish a clean baseline and enable stricter quality gates.

## Current State Analysis

### ESLint Error Breakdown (123 total)
#### SyncContext.test.js (88 errors)
- `no-undef`: 18 instances of undefined `mockSyncService` and `mockEncryptionService`
- `testing-library/prefer-screen-queries`: 58 instances of destructured queries from render
- `testing-library/no-unnecessary-act`: 6 instances of unnecessary act wrappers
- `testing-library/no-render-in-setup`: 1 instance of render in beforeEach
- **Files**: `/Users/adamstack/manylla/src/context/__tests__/SyncContext.test.js`

#### manyllaMinimalSyncServiceWeb.test.js (35 errors)
- `no-undef`: 30 instances of undefined mocks (`mockEncryptionService`, `server`, `http`, `HttpResponse`)
- `no-unused-vars`: 5 instances of assigned but unused variables
- **Files**: `/Users/adamstack/manylla/src/services/sync/__tests__/manyllaMinimalSyncServiceWeb.test.js`

### ESLint Warning Breakdown (12 total)
#### Test File Warnings
- **SyncContext.test.js**: 2 unused imports (`waitFor`, `ManyllaEncryptionService`)
- **manyllaEncryptionService.test.js**: 2 unused variables (`TEST_VECTORS`, `waitForAsync`)
- **manyllaMinimalSyncServiceWeb.comprehensive.test.js**: 2 unused variables (`TEST_SYNC_ID`, `expectedClean`)
- **manyllaMinimalSyncServiceWeb.simple.test.js**: 1 unused import (`manyllaEncryptionService`)
- **manyllaMinimalSyncServiceWeb.test.js**: 5 unused variables (`result`, `pullSpy`, `pushPromise`, imports)

### Switch Statement Analysis (9 files requiring default cases)
1. **ToastContext.js**: `switch (currentToast.severity)` - **Missing default case**
2. **SyncDialog.js**: `switch (mode)` - **Missing default case**
3. **BottomSheetMenu.js**: `switch (event.key)` - **Missing default case**
4. **SupportModal.js**: `switch (item.type)` - **Missing default case**
5. **PrivacyModal.js**: `switch (item.type)` - **Missing default case**
6. **ProgressiveOnboarding.js**: Two switches **missing default cases**
7. **BottomToolbar.js**: Has default case ✅
8. **ThemeSwitcher.js**: Three switches with default cases ✅
9. **ToastManager.js**: Two switches with default cases ✅

### Unreachable Code Assessment
- **ImagePicker.js**: No unreachable code detected (well-structured early returns)
- **Other components**: No obvious unreachable code patterns found

## Requirements

### Phase 1: Fix Critical ESLint Errors (123 errors)
1. **Test Mock Definitions**: Fix all `no-undef` errors by properly defining mock objects
2. **Testing Library Compliance**: Convert all destructured queries to screen-based queries
3. **Remove Unnecessary Act Wrappers**: Fix `testing-library/no-unnecessary-act` violations
4. **Fix Setup Issues**: Resolve `testing-library/no-render-in-setup` violations
5. **Mock Service Definitions**: Define all undefined mock services with proper typing

### Phase 2: Fix ESLint Warnings (12 warnings)
1. **Remove Unused Imports**: Clean up all unused import statements
2. **Remove Unused Variables**: Delete or utilize all unused variable declarations
3. **Clean Test Utilities**: Remove dead code from test helper functions

### Phase 3: Add Default Cases to Switch Statements
1. **ToastContext.js**: Add default case returning info icon for unknown severity
2. **SyncDialog.js**: Add default case returning menu view for unknown mode
3. **BottomSheetMenu.js**: Add default case (no-op) for unknown key events
4. **SupportModal.js**: Add default case returning null for unknown item types
5. **PrivacyModal.js**: Add default case returning null for unknown item types
6. **ProgressiveOnboarding.js**: Add default cases returning 0 for unknown steps

### Phase 4: Final Validation
1. **Zero Lint Violations**: Achieve `npm run lint` with 0 errors, 0 warnings
2. **Test Suite Integrity**: Ensure all tests still pass after cleanup
3. **Functionality Verification**: Verify no regressions in app behavior
4. **Code Coverage**: Maintain or improve test coverage percentages

## Success Metrics
```bash
# Primary Validation
npm run lint                    # Expected: 0 errors, 0 warnings
npm test                        # Expected: All tests passing
npm run build:web               # Expected: Successful build

# Verification Commands
npm run lint -- --format=json  # Detailed lint report (should be clean)
npm run test -- --coverage     # Test coverage report
grep -r "switch\s*(" src/ --include="*.js" | grep -v "default:" # Should find no results

# Platform Testing
npm run web                     # Web dev server starts successfully
npm run build:web               # Production build completes
```

## Implementation Guidelines

### Testing Library Migration
- Replace all `const { getByTestId } = render()` with `render()` + `screen.getByTestId`
- Remove unnecessary `act()` wrappers around Testing Library utilities
- Move render calls out of `beforeEach` blocks to individual test cases
- Use `screen` queries consistently throughout test suite

### Mock Service Patterns
```javascript
// Correct pattern for mock services
const mockSyncService = {
  isEnabled: jest.fn(() => false),
  enable: jest.fn(),
  disable: jest.fn(),
  // ... all required methods
};

const mockEncryptionService = {
  encryptData: jest.fn(),
  decryptData: jest.fn(),
  // ... all required methods
};
```

### Switch Statement Default Cases
```javascript
// Pattern for UI component switches
switch (item.type) {
  case "title":
    return <Title>{item.text}</Title>;
  case "subtitle":
    return <Subtitle>{item.text}</Subtitle>;
  default:
    console.warn(`Unknown item type: ${item.type}`);
    return null;
}

// Pattern for enum-like switches
switch (currentStep) {
  case "welcome":
    return 0;
  case "privacy":
    return 1;
  default:
    return 0; // Safe fallback
}
```

## Technical Requirements

### ESLint Configuration Compliance
- All rules in `.eslintrc.js` must pass
- Testing Library plugin rules must be satisfied
- No disabled ESLint rules without justification
- Consistent code formatting throughout

### Testing Standards
- All existing tests must continue to pass
- Test cleanup should not reduce code coverage
- Mock objects must match real service interfaces
- Test isolation must be maintained

### Switch Statement Completeness
- Every switch statement must have a default case
- Default cases should provide safe fallback behavior
- Unknown values should be logged for debugging
- Default behavior should not break application flow

### Code Quality Gates
- Zero ESLint errors or warnings
- All TypeScript type checking passes
- No console.error or console.warn in production code
- Consistent import patterns throughout codebase

## Risk Assessment

### High Risk Areas
1. **Test Breakage**: Modifying test mocks may break test assertions
2. **Mock Interface Mismatches**: Mocks must match real service interfaces
3. **Testing Library Migration**: Query changes may affect test reliability
4. **Switch Default Cases**: Must not alter existing control flow

### Mitigation Strategies
1. **Incremental Testing**: Test each file modification immediately
2. **Interface Validation**: Verify mocks match TypeScript interfaces
3. **Regression Testing**: Run full test suite after each major change
4. **Code Review**: Mandatory peer review for all test modifications

### Rollback Plan
- Git commit after each phase completion
- Automated test suite as safety net
- Revert individual commits if issues discovered
- Maintain branch separation for each phase

## Validation Criteria

### Phase 1 Completion Criteria
- [ ] All 123 ESLint errors resolved
- [ ] All test files properly define mock services
- [ ] All Testing Library violations fixed
- [ ] Test suite passes with all changes
- [ ] No new lint violations introduced

### Phase 2 Completion Criteria
- [ ] All 12 ESLint warnings resolved
- [ ] No unused imports remaining
- [ ] No unused variables remaining
- [ ] Code coverage maintained or improved

### Phase 3 Completion Criteria
- [ ] Default cases added to all switch statements missing them
- [ ] All switch statements provide safe fallback behavior
- [ ] No functional regressions introduced
- [ ] UI behavior remains consistent

### Final Acceptance Criteria
- [ ] `npm run lint` returns exit code 0 with no output
- [ ] `npm test` passes all test suites
- [ ] `npm run build:web` completes successfully
- [ ] All platforms verified (web at minimum)
- [ ] No console errors in browser dev tools
- [ ] Application functionality unchanged

## Adversarial Review Requirements

This story **MUST** follow the Adversarial Review Process defined in `/Users/adamstack/manylla/processes/ADVERSARIAL_REVIEW_PROCESS.md`.

### Developer Implementation Requirements
- Work autonomously through all phases
- Provide detailed command output for verification
- Test each modification before moving to next phase
- Document any assumptions or deviations
- Report completion confidence (target: 100%)

### Peer Reviewer Validation Requirements
The peer reviewer **MUST** independently verify:

```bash
# Component Usage Verification
grep -r "import.*SyncContext" src/ --include="*.js"
grep -r "import.*ToastContext" src/ --include="*.js"

# Lint Verification
npm run lint                           # Expected: 0 errors, 0 warnings
npm run lint -- --format=json         # Detailed verification

# Test Suite Verification
npm test                               # Expected: All tests pass
npm run test -- --coverage            # Expected: Coverage maintained

# Switch Statement Verification
grep -r "switch\s*(" src/ --include="*.js" -A 10 | grep -B 5 -A 5 "default:"

# Build Verification
npm run build:web                      # Expected: Clean build
npm run web                            # Expected: Starts without errors
```

### Review Rejection Criteria
The peer reviewer **MUST** reject if ANY of these conditions exist:
- `npm run lint` reports any errors or warnings
- Any test failures in `npm test`
- Any switch statement lacks a default case
- Any mock service is undefined in tests
- Any unused imports or variables remain
- Build process fails or shows warnings
- Application functionality is altered

### Review Approval Format
```
✅ APPROVED: Comprehensive Code Quality Cleanup

Evidence:
- npm run lint: 0 errors, 0 warnings ✅
- npm test: All 47 tests passing ✅
- Switch statements: All 9 files have default cases ✅
- Mock services: All properly defined ✅
- Build process: Clean with no warnings ✅

Requirements Checklist:
□ Phase 1 (123 ESLint errors): PASS - All errors resolved
□ Phase 2 (12 ESLint warnings): PASS - All warnings resolved
□ Phase 3 (Switch defaults): PASS - All switch statements have defaults
□ Phase 4 (Final validation): PASS - Zero lint violations achieved
□ Test suite integrity: PASS - All tests passing
□ No regressions: PASS - Application functionality unchanged
```

## Implementation Phases

### Phase 1: Fix Critical ESLint Errors (Estimated: 8 hours)

#### 1.1 Fix SyncContext.test.js (88 errors)
**Mock Service Definitions** (6 undefined variable errors):
```javascript
// Add at top of describe block
const mockSyncService = {
  isEnabled: jest.fn(() => false),
  enable: jest.fn(() => Promise.resolve()),
  disable: jest.fn(() => Promise.resolve()),
  push: jest.fn(() => Promise.resolve()),
  pull: jest.fn(() => Promise.resolve(null)),
  getStatus: jest.fn(() => 'disconnected')
};

const mockEncryptionService = {
  encryptData: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
  decryptData: jest.fn((data) => Promise.resolve(data.replace('encrypted_', ''))),
  generateRecoveryPhrase: jest.fn(() => 'test-recovery-phrase')
};
```

**Testing Library Query Migration** (58 prefer-screen-queries errors):
```javascript
// Before (incorrect):
const { getByTestId, getByText } = render(<SyncContext.Provider>...</>);
expect(getByTestId('sync-status')).toBeInTheDocument();

// After (correct):
render(<SyncContext.Provider>...</>);
expect(screen.getByTestId('sync-status')).toBeInTheDocument();
```

**Remove Unnecessary Act Wrappers** (6 no-unnecessary-act errors):
```javascript
// Before (incorrect):
act(() => {
  fireEvent.click(screen.getByTestId('enable-sync'));
});

// After (correct):
fireEvent.click(screen.getByTestId('enable-sync'));
```

**Fix Render in Setup** (1 no-render-in-setup error):
```javascript
// Before (incorrect):
beforeEach(() => {
  render(<TestComponent />);
});

// After (correct):
// Move render call into individual test cases
```

#### 1.2 Fix manyllaMinimalSyncServiceWeb.test.js (35 errors)
**Mock Definitions** (30 undefined variable errors):
```javascript
// Add proper mock setup
const mockEncryptionService = { /* ... */ };

// MSW server mocks
import { http, HttpResponse } from 'msw';
import { server } from '../../../testing/mswServer';
```

**Clean Unused Variables** (5 no-unused-vars errors):
- Remove or utilize variables: `result`, `pullSpy`, `pushPromise`

### Phase 2: Fix ESLint Warnings (Estimated: 2 hours)

#### 2.1 Clean Import Statements
**Files requiring cleanup**:
- `SyncContext.test.js`: Remove unused `waitFor`, `ManyllaEncryptionService`
- `manyllaEncryptionService.test.js`: Remove unused `TEST_VECTORS`, `waitForAsync`
- `manyllaMinimalSyncServiceWeb.comprehensive.test.js`: Remove unused `TEST_SYNC_ID`
- `manyllaMinimalSyncServiceWeb.simple.test.js`: Remove unused `manyllaEncryptionService`

#### 2.2 Remove Dead Code
- Remove unused variable assignments
- Clean up test helper functions
- Remove commented-out code blocks

### Phase 3: Add Default Cases to Switch Statements (Estimated: 3 hours)

#### 3.1 ToastContext.js - Severity Switch
```javascript
switch (currentToast.severity) {
  case "success":
    return <SuccessIcon sx={{ fontSize: "1.4rem", color: "success.main" }} />;
  case "error":
    return <ErrorIcon sx={{ fontSize: "1.4rem", color: "error.main" }} />;
  case "warning":
    return <WarningIcon sx={{ fontSize: "1.4rem", color: "warning.main" }} />;
  default:
    return <InfoIcon sx={{ fontSize: "1.4rem", color: "info.main" }} />;
}
```

#### 3.2 SyncDialog.js - Mode Switch
```javascript
switch (mode) {
  case "menu":
    return renderMenu();
  case "enable":
    return renderEnableStep();
  case "join":
    return renderJoinStep();
  case "phrase":
    return renderPhraseStep();
  case "invite":
    return renderInviteStep();
  default:
    console.warn(`Unknown sync dialog mode: ${mode}`);
    return renderMenu(); // Safe fallback
}
```

#### 3.3 BottomSheetMenu.js - Keyboard Switch
```javascript
switch (event.key) {
  case "Escape":
    onClose();
    break;
  case "1":
    onShare();
    onClose();
    break;
  case "2":
    onPrint();
    onClose();
    break;
  // ... other cases
  default:
    // No action needed for other keys
    break;
}
```

#### 3.4 Modal Component Switches
**SupportModal.js** and **PrivacyModal.js**:
```javascript
switch (item.type) {
  case "title":
    return <Text style={styles.title}>{item.text}</Text>;
  case "subtitle":
    return <Text style={styles.subtitle}>{item.text}</Text>;
  // ... other cases
  default:
    console.warn(`Unknown item type: ${item.type}`, item);
    return null;
}
```

#### 3.5 ProgressiveOnboarding.js - Step Switches
```javascript
switch (currentStep) {
  case "welcome":
    return 0;
  case "choose-path":
    return 1;
  case "privacy":
    return 2;
  case "ready":
    return 3;
  default:
    console.warn(`Unknown onboarding step: ${currentStep}`);
    return 0; // Safe fallback to beginning
}
```

### Phase 4: Final Validation (Estimated: 2 hours)

#### 4.1 Comprehensive Testing
```bash
# Lint verification
npm run lint 2>&1 | tee lint-results.txt
# Should show: 0 errors, 0 warnings

# Test suite verification
npm test -- --coverage 2>&1 | tee test-results.txt
# Should show: All tests passing

# Build verification
npm run build:web 2>&1 | tee build-results.txt
# Should complete successfully

# Runtime verification
npm run web &
sleep 10
curl -f http://localhost:3000 || echo "Web server failed"
```

#### 4.2 Switch Statement Verification
```bash
# Verify all switch statements have default cases
grep -r "switch\s*(" src/ --include="*.js" -A 15 |
grep -B 10 -A 5 "}" |
grep -L "default:"
# Should return empty (no switches without defaults)
```

#### 4.3 Regression Testing
- Manual testing of key application flows
- Verify no console errors in browser dev tools
- Test sync functionality still works
- Verify onboarding flow still works
- Test theme switching still works

## Dependencies
- **Prerequisite**: None - this is foundational cleanup
- **Concurrent**: Can run alongside other P1-P3 stories
- **Blocking**: Future quality gates depend on this completion

## Estimated Effort Breakdown
- **Research & Analysis**: 1 hour (already completed)
- **Phase 1 Implementation**: 8 hours (test file fixes)
- **Phase 2 Implementation**: 2 hours (warning cleanup)
- **Phase 3 Implementation**: 3 hours (switch defaults)
- **Phase 4 Validation**: 2 hours (comprehensive testing)
- **Documentation & Review**: 1 hour
- **Total**: 17 hours (**L - Large**)

## Notes
- **Combines Stories**: This replaces S019, S020, S021 with comprehensive approach
- **Quality Foundation**: Establishes baseline for future quality gates
- **Testing Focus**: Most complexity is in test file modernization
- **Zero Tolerance**: Must achieve exactly zero lint violations
- **Automated Validation**: All success criteria have automated verification
- **Risk Mitigation**: Extensive testing and validation at each phase

---
*Story ID: S026*
*Created: 2025-09-14*
*Status: READY*
*Replaces: S019, S020, S021*
*Requires: Adversarial Review Process*