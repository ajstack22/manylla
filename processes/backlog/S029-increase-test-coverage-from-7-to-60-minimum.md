# Story S029: Increase Test Coverage from 7% to 60% Minimum

## Overview
Comprehensive test coverage improvement to meet deployment quality standards and ensure code reliability. This story will systematically increase test coverage from the current 7% to a minimum of 60% across all metrics (statements, branches, functions, lines) to meet deployment gate requirements and improve code reliability.

## Status
- **Priority**: P1 (CRITICAL - Blocks deployment quality gates)
- **Status**: READY
- **Created**: 2025-09-14
- **Assigned**: Unassigned
- **Type**: TESTING
- **Estimated Hours**: 40-60 hours (XL effort)

## Background
Current test coverage is critically low at only 7%, far below the 60% requirement needed for quality deployments. This creates deployment blockers and reduces confidence in code changes. The deployment integration test is currently failing due to insufficient coverage thresholds.

**Current Coverage State** (as of 2025-09-14):
- **Global Thresholds**: 7% (all metrics) - FAILING deployment requirements
- **Critical Services**: Some coverage exists but insufficient
  - `manyllaEncryptionService.js`: 60% threshold set but not consistently met
  - `manyllaMinimalSyncServiceWeb.js`: 60% threshold set but not consistently met
  - Context providers: 50% threshold set but coverage gaps exist

## Current State Analysis

### Existing Test Coverage (7% global):
```
File                                 | % Stmts | % Branch | % Funcs | % Lines
-------------------------------------|---------|----------|---------|--------
src/components/                      |    1.12 |     0.62 |    1.27 |    1.12
src/context/                         |   66.66 |    41.66 |   66.66 |   66.66
src/services/                        |   67.40 |    51.89 |   72.22 |   68.05
src/theme/                           |       0 |        0 |       0 |       0
src/types/                           |       0 |        0 |       0 |       0
src/utils/                           |   26.39 |     18.2 |   25.42 |   25.95
```

### Existing Test Files (Keep and Extend):
- `__tests__/deployment-integration.test.js` ✅
- `src/utils/__tests__/errorHandling.test.js` ✅
- `src/services/__tests__/photoService.test.js` ✅
- `src/utils/__tests__/platform.test.js` ✅
- `src/utils/__tests__/platform-integration.test.js` ✅
- `src/components/Navigation/__tests__/BottomToolbar.test.js` ✅
- `src/services/sync/__tests__/manyllaMinimalSyncServiceWeb.comprehensive.test.js` ✅
- `src/services/sync/__tests__/manyllaEncryptionService.test.js` ✅
- `src/context/__tests__/ThemeContext.test.js` ✅
- `src/context/__tests__/SyncContext.test.js` ✅

## Requirements

### Primary Coverage Goals
1. **Overall Coverage**: Achieve 60% minimum on ALL metrics (statements, branches, functions, lines)
2. **Critical Path Coverage**: 80%+ coverage on business-critical components
3. **No Regression**: All existing tests must continue to pass
4. **CI Integration**: All tests must pass in `npm run test:ci` environment
5. **Performance**: Test suite execution time increase <100ms
6. **Maintainability**: Tests must be meaningful, not just coverage padding

### Testing Standards
7. **Framework**: Use React Testing Library (no Enzyme)
8. **Mocking Strategy**: Mock external dependencies (Material-UI, React Native components)
9. **No Snapshots**: Avoid snapshot tests unless absolutely necessary
10. **Error Testing**: Test error conditions and edge cases
11. **Async Testing**: Proper async/await patterns for services

## Implementation Plan

### Phase 1: High-Value Components (Target: +25% coverage)
**Priority Order** (implement in this sequence):

#### 1.1 Core Services (Critical Path)
```bash
# Target Files (in priority order):
src/services/sync/manyllaEncryptionService.js     # CRITICAL - Zero-knowledge encryption
src/services/sync/manyllaMinimalSyncServiceWeb.js # CRITICAL - Data sync
src/services/photoService.js                      # HIGH - Photo management ✅ (has tests)
```

#### 1.2 Context Providers (State Management)
```bash
src/context/SyncContext.tsx      # CRITICAL - Sync state ✅ (has tests, extend)
src/context/ThemeContext.tsx     # HIGH - Theme state ✅ (has tests, extend)
```

#### 1.3 Utilities (Business Logic)
```bash
src/utils/errors.js              # HIGH - Error handling ✅ (has tests, extend)
src/utils/platform.js            # HIGH - Platform detection ✅ (has tests, extend)
src/utils/validation.js          # HIGH - Data validation
src/utils/imageUtils.js          # MEDIUM - Image processing
src/utils/inviteCode.js          # MEDIUM - Invite/share codes
```

### Phase 2: Core Components (Target: +20% coverage)
**Component Testing Strategy**:

#### 2.1 Navigation Components
```bash
src/components/Navigation/BottomToolbar.js        # HIGH ✅ (has tests, extend)
src/components/Navigation/BottomSheetMenu.js      # HIGH - Navigation state
```

#### 2.2 Profile Management
```bash
src/components/Profile/ProfileCard.js             # HIGH - Profile display
src/components/Profile/ProfileEditDialog.js       # HIGH - Profile editing
src/components/Profile/ProfileCreateDialog.js     # HIGH - Profile creation
src/components/Profile/CategorySection.js         # MEDIUM - Category management
```

#### 2.3 Critical Dialogs
```bash
src/components/Dialogs/UnifiedAddDialog.js        # HIGH - Data entry
src/components/Sharing/ShareDialogOptimized.js    # HIGH - Sharing functionality
src/components/Sync/SyncDialog.js                 # HIGH - Sync setup
```

### Phase 3: Supporting Components (Target: +10% coverage)
#### 3.1 Layout & Common
```bash
src/components/Layout/Header.js                   # MEDIUM - Layout
src/components/Common/ThemeSwitcher.js            # MEDIUM - Theme switching
src/components/Common/ImagePicker.js              # MEDIUM - Image selection
src/components/Common/ThemedModal.js              # MEDIUM - Modal wrapper
```

#### 3.2 Forms & Input
```bash
src/components/Forms/MarkdownField.js             # MEDIUM - Rich text
src/components/Forms/SmartTextInput.js            # MEDIUM - Smart input
src/components/Forms/MarkdownRenderer.js          # MEDIUM - Markdown display
```

### Phase 4: Data Models & Theme (Target: +5% coverage)
```bash
src/types/ChildProfile.js                         # LOW - Type definitions
src/theme/theme.js                                # LOW - Theme configuration
src/theme/modalTheme.js                           # LOW - Modal theming
```

## Technical Specifications

### Testing Patterns to Follow

#### 1. Component Testing Template
```javascript
// src/components/[Component]/__tests__/[Component].test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { SyncProvider } from '../../../context/SyncContext';
import { ThemeProvider as CustomThemeProvider } from '../../../context/ThemeContext';
import ComponentName from '../ComponentName';
import { theme } from '../../../theme/theme';

// Mock dependencies
jest.mock('../../../services/someService', () => ({
  someMethod: jest.fn()
}));

const MockProviders = ({ children }) => (
  <CustomThemeProvider>
    <ThemeProvider theme={theme}>
      <SyncProvider>
        {children}
      </SyncProvider>
    </ThemeProvider>
  </CustomThemeProvider>
);

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <MockProviders>
        <ComponentName />
      </MockProviders>
    );
    expect(screen.getByTestId('component-name')).toBeInTheDocument();
  });

  it('handles user interactions correctly', async () => {
    // Test user interactions
  });

  it('handles error states gracefully', () => {
    // Test error conditions
  });
});
```

#### 2. Service Testing Template
```javascript
// src/services/__tests__/serviceName.test.js
import ServiceName from '../serviceName';

// Mock external dependencies
global.fetch = jest.fn();
global.console.error = jest.fn();

describe('ServiceName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('methodName', () => {
    it('handles successful operation', async () => {
      // Test success case
    });

    it('handles network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      // Test error handling
    });

    it('validates input parameters', () => {
      // Test input validation
    });
  });
});
```

#### 3. Utility Testing Template
```javascript
// src/utils/__tests__/utilityName.test.js
import { functionName } from '../utilityName';

describe('utilityName', () => {
  describe('functionName', () => {
    it('handles valid input correctly', () => {
      // Test valid cases
    });

    it('handles edge cases', () => {
      // Test edge cases
    });

    it('throws appropriate errors for invalid input', () => {
      expect(() => functionName(null)).toThrow('Expected error message');
    });
  });
});
```

### React Native Web Compatibility

#### Mock Configuration (jest.setup.js)
Ensure these mocks are properly configured:
```javascript
// Mock React Native components for web testing
jest.mock('react-native', () => require('react-native-web'));
jest.mock('react-native-vector-icons', () => 'Icon');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

### Coverage Goals by Directory

```bash
# Target coverage after implementation:
src/components/     : 45% (from 1.12%)  - Core UI components
src/context/        : 80% (from 66.66%) - State management
src/services/       : 85% (from 67.40%) - Business logic
src/theme/          : 60% (from 0%)     - Theme configuration
src/types/          : 70% (from 0%)     - Type definitions
src/utils/          : 75% (from 26.39%) - Utility functions
```

## Success Metrics

### Verification Commands
```bash
# Primary validation (MUST pass):
npm run test:coverage                    # Show >= 60% on all metrics
npm run test:ci                          # CI environment passes
npm run test                             # Development tests pass

# Coverage validation:
npm run test:coverage | grep "All files"  # Check global coverage
npm run test:coverage | grep "statements" # Verify statements >= 60%
npm run test:coverage | grep "branches"   # Verify branches >= 60%
npm run test:coverage | grep "functions"  # Verify functions >= 60%
npm run test:coverage | grep "lines"      # Verify lines >= 60%

# Performance validation:
time npm run test:ci                     # Total time should be reasonable
npm run test:ci 2>&1 | grep "Time:"      # Individual test times

# Quality validation:
npm run lint                             # No linting errors
npm run typecheck                        # No TypeScript errors
grep -r "console.log" src/               # No console.logs added
grep -r "TODO" src/                      # No new TODOs
```

### Expected Coverage Report Output
```
============================== Coverage summary ===============================
Statements   : 60.12% ( 1234/2053 )
Branches     : 61.45% ( 567/923 )
Functions    : 62.33% ( 234/376 )
Lines        : 60.89% ( 1198/1967 )
================================================================================
```

## Implementation Guidelines

### Code Quality Standards
1. **Meaningful Tests**: Test behavior, not implementation details
2. **Edge Case Coverage**: Test error conditions, null values, empty arrays
3. **User Journey Testing**: Test complete user workflows
4. **Integration Points**: Test component interactions
5. **Accessibility Testing**: Include basic a11y assertions where relevant

### React Testing Library Best Practices
```javascript
// ✅ Good - Test user behavior
expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();

// ❌ Bad - Test implementation details
expect(wrapper.find('.save-button')).toHaveLength(1);

// ✅ Good - Test interactions
fireEvent.click(screen.getByRole('button', { name: /save/i }));
await waitFor(() => {
  expect(screen.getByText(/profile saved/i)).toBeInTheDocument();
});

// ❌ Bad - Test internal state
expect(component.state.isSaving).toBe(true);
```

### Mock Strategy
```javascript
// ✅ Mock external dependencies
jest.mock('../../../services/sync/manyllaMinimalSyncServiceWeb');

// ✅ Mock Material-UI components that cause issues
jest.mock('@mui/material/Dialog', () => ({ children }) => <div data-testid="mock-dialog">{children}</div>);

// ✅ Mock React Native components
jest.mock('react-native', () => require('react-native-web'));
```

## Acceptance Criteria

### Functional Requirements
- [ ] **Global coverage >= 60%** on all four metrics (statements, branches, functions, lines)
- [ ] **All existing tests continue to pass** (no regressions)
- [ ] **CI pipeline passes** with `npm run test:ci`
- [ ] **New tests follow established patterns** in `__tests__/` directories
- [ ] **Critical components have 80%+ coverage**: encryption, sync, profile management
- [ ] **No snapshot tests** unless absolutely necessary and well-justified

### Quality Requirements
- [ ] **Tests are meaningful**: Test user behavior, not implementation details
- [ ] **Error conditions tested**: All major error paths have test coverage
- [ ] **Mocking is appropriate**: External dependencies properly mocked
- [ ] **Performance acceptable**: Test suite runs in reasonable time (<200ms increase)
- [ ] **Documentation updated**: Any new testing patterns documented

### Integration Requirements
- [ ] **Deployment integration test passes**: `__tests__/deployment-integration.test.js`
- [ ] **Coverage thresholds updated**: `package.json` jest.coverageThreshold reflects new minimums
- [ ] **No console warnings**: Test execution produces no warnings or errors
- [ ] **Cross-platform compatibility**: Tests work in CI environment (jsdom)

## ADVERSARIAL REVIEW REQUIREMENTS

This story MUST go through the Adversarial Peer Review Process documented in `processes/ADVERSARIAL_REVIEW_PROCESS.md`.

### Developer Deliverables
The implementing developer MUST provide:

1. **APPROACH.md Document** detailing:
   - Testing strategy for each component type
   - Rationale for coverage priorities
   - Mocking decisions and justifications
   - Edge cases identified and tested
   - Any uncovered code paths with explanations

2. **Implementation Report** including:
   - List of all test files created/modified
   - Coverage metrics before and after each phase
   - Verification commands executed with results
   - Any tech debt or issues discovered
   - Completion confidence assessment

### Peer Review Validation Points
The peer reviewer MUST verify:

1. **Coverage Verification**:
   ```bash
   npm run test:coverage                    # Independent coverage check
   grep -A 10 "Coverage summary" coverage/lcov-report/index.html
   ```

2. **Test Quality Assessment**:
   ```bash
   # Check test files follow patterns
   find src -name "*.test.js" -exec head -20 {} \;
   # Verify no snapshot tests
   grep -r "toMatchSnapshot" src/
   # Check meaningful assertions
   grep -r "expect.*toBeInTheDocument" src/
   ```

3. **CI Integration**:
   ```bash
   npm run test:ci                          # Full CI test run
   echo $?                                  # Exit code must be 0
   ```

4. **Performance Impact**:
   ```bash
   time npm run test:ci                     # Time full test suite
   ```

5. **No Regressions**:
   ```bash
   npm run lint                             # Linting still passes
   npm run typecheck                        # TypeScript still passes
   npm run build:web                        # Build still works
   ```

### Review Rejection Criteria
The peer reviewer MUST reject if ANY of the following:
- Global coverage < 60% on any metric
- Existing tests fail or are modified inappropriately
- Tests are "coverage padding" without meaningful assertions
- Performance degradation > 100ms test suite increase
- CI pipeline fails
- Console errors/warnings introduced
- Documentation promises not delivered

## Dependencies
**None** - This story can be implemented independently

## Estimated Effort
**Total**: XL (40-60 hours)

**Breakdown**:
- Phase 1 (High-value): 20-25 hours
- Phase 2 (Core components): 15-20 hours
- Phase 3 (Supporting): 8-12 hours
- Phase 4 (Data/Theme): 3-5 hours
- Review/refinement: 5-8 hours

## Definition of Done

### Technical Completion
- [ ] Global test coverage >= 60% (statements, branches, functions, lines)
- [ ] All new tests pass in local and CI environments
- [ ] All existing tests continue to pass (zero regressions)
- [ ] Coverage thresholds updated in `package.json`
- [ ] Deployment integration test passes

### Quality Completion
- [ ] Tests follow React Testing Library best practices
- [ ] Critical business logic has comprehensive test coverage
- [ ] Error conditions and edge cases are tested
- [ ] Tests are maintainable and well-documented
- [ ] No unnecessary snapshot tests added

### Process Completion
- [ ] Adversarial peer review completed with APPROVAL
- [ ] APPROACH.md document created with testing strategy
- [ ] All verification commands pass independently
- [ ] Performance impact assessed and acceptable
- [ ] Documentation updated with any new testing patterns

## Notes
*This is a CRITICAL P1 story that blocks deployment quality gates. The 60% coverage requirement is non-negotiable for deployment approval.*

**Risk Factors**:
- Large scope may require breaking into sub-stories if development stalls
- React Native Web mocking complexity may require additional setup
- Some legacy components may be difficult to test without refactoring

**Success Factors**:
- Focus on business-critical components first
- Use existing test patterns as templates
- Prioritize meaningful tests over coverage percentage games
- Leverage automation for repetitive test structure

---
*Story ID: S029*
*Created: 2025-09-14*
*Status: READY*
*Priority: P1 (CRITICAL)*
