# Story S030: Increase Test Coverage from 7% to 60% Minimum

## Overview
**CRITICAL DEPLOYMENT BLOCKER**: Comprehensive test coverage improvement to meet deployment quality standards and ensure code reliability. This story will systematically increase test coverage from the current 19.57% to a minimum of 60% across all metrics (statements, branches, functions, lines) to meet deployment gate requirements and improve code reliability.

**🚨 ADVERSARIAL PEER REVIEW REQUIRED**: This story MUST follow the Adversarial Peer Review Process documented in `processes/ADVERSARIAL_REVIEW_PROCESS.md`. No exceptions.

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
- **Global Thresholds**: 19.57% (all metrics) - STILL FAILING deployment requirements
- **Critical Services**: Some coverage exists but insufficient
  - `manyllaEncryptionService.js`: 60% threshold set but not consistently met
  - `manyllaMinimalSyncServiceWeb.js`: 60% threshold set but not consistently met
  - Context providers: 50% threshold set but coverage gaps exist

## Current State Analysis

### Existing Test Coverage (19.57% global - UPDATED):
```
File                                 | % Stmts | % Branch | % Funcs | % Lines
-------------------------------------|---------|----------|---------|--------
All files                            |   19.57 |    12.82 |   14.31 |   19.76
src/components/                      |    ~0-1 |      ~0  |     ~0  |     ~0
src/context/                         |  ~65-70 |   ~40-45 |  ~65-70 |  ~65-70
src/services/                        |  ~65-70 |   ~50-55 |  ~70-75 |  ~65-70
src/theme/                           |      50 |       50 |      50 |      50
src/types/                           |      60 |       50 |      60 |      60
src/utils/                           |   ~25-30|   ~18-22 |  ~25-30 |  ~25-30
src/hooks/                           |   ~80-90|   ~70-80 |  ~80-90 |  ~80-90
```

### Existing Test Files (Keep and Extend):
- `__tests__/deployment-integration.test.js` ✅
- **Context Tests** (High Coverage - EXTEND):
  - `src/context/__tests__/SyncContext.test.js` ✅ (50% threshold set)
  - `src/context/__tests__/ThemeContext.test.js` ✅ (50% threshold set)
  - `src/context/__tests__/SyncContext.real.test.js` ✅ (Integration tests)
- **Services Tests** (Good Coverage - EXTEND):
  - `src/services/__tests__/photoService.test.js` ✅
  - `src/services/sync/__tests__/manyllaEncryptionService.basic.test.js` ✅ (60% threshold)
  - `src/services/sync/__tests__/manyllaEncryptionService.real.test.js` ✅
  - `src/services/sync/__tests__/manyllaEncryptionService.integration.test.js` ✅
  - `src/services/sync/__tests__/manyllaMinimalSyncServiceWeb.comprehensive.test.js` ✅ (60% threshold)
  - `src/services/sync/__tests__/manyllaMinimalSyncServiceWeb.real.test.js` ✅
  - `src/services/sync/__tests__/manyllaMinimalSyncServiceWeb.simple.test.js` ✅
- **Utils Tests** (Medium Coverage - EXTEND):
  - `src/utils/__tests__/errorHandling.test.js` ✅
  - `src/utils/__tests__/platform.test.js` ✅
  - `src/utils/__tests__/platform-integration.test.js` ✅
  - `src/utils/__tests__/inviteCode.test.js` ✅
  - `src/utils/__tests__/validation.test.js` ✅
  - `src/utils/__tests__/imageUtils.test.js` ✅ (HAS FAILING TESTS - NEEDS FIXES)
- **Component Tests** (Low Coverage - MAJOR EXPANSION NEEDED):
  - `src/components/Navigation/__tests__/BottomToolbar.test.js` ✅ (Basic test)
  - `src/components/ErrorBoundary/__tests__/ErrorBoundary.real.test.js` ✅
  - `src/components/Dialogs/__tests__/UnifiedAddDialog.real.test.js` ✅
- **Type/Theme Tests** (New - EXTEND):
  - `src/types/__tests__/ChildProfile.test.js` ✅
  - `src/theme/__tests__/theme.test.js` ✅
- **Hook Tests** (High Coverage - EXTEND):
  - `src/hooks/__tests__/useErrorDisplay.test.js` ✅
  - `src/hooks/__tests__/useMobileDialog.test.js` ✅
  - `src/hooks/__tests__/useMobileKeyboard.test.js` ✅

## Requirements

### Primary Coverage Goals
1. **Overall Coverage**: Achieve 60% minimum on ALL metrics (statements, branches, functions, lines)
2. **Critical Path Coverage**: 80%+ coverage on business-critical components
3. **No Regression**: All existing tests must continue to pass
4. **CI Integration**: All tests must pass in `npm run test:ci` environment
5. **Performance**: Test suite execution time increase <100ms
6. **Maintainability**: Tests must be meaningful, not just coverage padding
7. **FIX EXISTING FAILING TESTS**: All current test failures must be resolved first
8. **ADVERSARIAL REVIEW COMPLIANCE**: Must follow `processes/ADVERSARIAL_REVIEW_PROCESS.md`

### Testing Standards
7. **Framework**: Use React Testing Library (no Enzyme)
8. **Mocking Strategy**: Mock external dependencies (Material-UI, React Native components)
9. **No Snapshots**: Avoid snapshot tests unless absolutely necessary
10. **Error Testing**: Test error conditions and edge cases
11. **Async Testing**: Proper async/await patterns for services

## CRITICAL FIRST STEP: FIX EXISTING TESTS

**BEFORE implementing new tests, ALL existing test failures must be resolved:**

### Fix 1: ImageUtils Test Failures (BLOCKING)
```bash
# Current Status: 14 failing tests in src/utils/__tests__/imageUtils.test.js
# Root Cause: Mock setup issues with Canvas API and Image loading
# Required Action: Fix mocking strategy for web environment
# Files to Fix:
- src/utils/__tests__/imageUtils.test.js (fix mock setup)
- jest.setup.js (ensure proper Canvas/Image mocks)
```

### Fix 2: Console Error Cleanup (WARNING)
```bash
# Current Status: Multiple console.error calls in test output
# Root Cause: Intentional error logging in services during error handling tests
# Required Action: Mock console.error in tests or adjust test expectations
# Files to Review:
- src/services/sync/__tests__/*.test.js (mock console.error)
- src/utils/errors.js (conditional logging in tests)
```

## Implementation Plan

### Phase 0: Test Infrastructure Repair (CRITICAL FIRST)
**Must complete BEFORE Phase 1**:
1. Fix all 14 failing imageUtils tests
2. Clean up console error noise in test output
3. Verify all existing tests pass with `npm run test:ci`
4. Update any broken mock configurations

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

## COMPREHENSIVE TECHNICAL REQUIREMENTS

### COMPONENT PRIORITY MATRIX (EXECUTION ORDER)

#### TIER 1: CRITICAL PATH COMPONENTS (MUST ACHIEVE 80%+ COVERAGE)
**Execution Order: Complete ALL Tier 1 before proceeding**

```bash
# Security & Data Integrity (HIGHEST PRIORITY)
src/services/sync/manyllaEncryptionService.js
# Current: ~65% → Target: 85%+
# Test Focus: Key derivation, encryption/decryption cycles, error handling
# Risk: Zero-knowledge encryption integrity

src/services/sync/manyllaMinimalSyncServiceWeb.js
# Current: ~65% → Target: 85%+
# Test Focus: Sync protocols, network failures, data consistency
# Risk: Data loss, sync conflicts

# State Management (HIGH PRIORITY)
src/context/SyncContext.tsx
# Current: ~65% → Target: 80%+
# Test Focus: State transitions, recovery phrase handling, polling
# Risk: Application state corruption

src/context/ThemeContext.tsx
# Current: ~65% → Target: 80%+
# Test Focus: Theme persistence, system detection, switching
# Risk: UI consistency issues
```

#### TIER 2: HIGH-VALUE COMPONENTS (MUST ACHIEVE 65%+ COVERAGE)
**Execution Order: Priority sequence within tier**

```bash
# Core Navigation (USER-FACING)
src/components/Navigation/BottomToolbar.js
# Current: ~5% → Target: 75%+
# Test Focus: Navigation state, user interactions, accessibility
# Impact: Primary user interface

src/components/Navigation/BottomSheetMenu.js
# Current: 0% → Target: 65%+
# Test Focus: Menu behavior, touch interactions, state management
# Impact: Mobile user experience

# Profile Management (CORE FUNCTIONALITY)
src/components/Profile/ProfileCard.js
# Current: 0% → Target: 65%+
# Test Focus: Data display, photo handling, profile switching
# Impact: Core data presentation

src/components/Profile/ProfileEditDialog.js
# Current: 0% → Target: 65%+
# Test Focus: Form validation, data persistence, modal behavior
# Impact: Data entry accuracy

src/components/Profile/ProfileCreateDialog.js
# Current: 0% → Target: 65%+
# Test Focus: Profile creation flow, validation, error handling
# Impact: User onboarding

# Critical Dialogs (DATA OPERATIONS)
src/components/Dialogs/UnifiedAddDialog.js
# Current: ~5% → Target: 65%+ (EXTEND existing tests)
# Test Focus: Form handling, category management, data submission
# Impact: Primary data entry

src/components/Sharing/ShareDialogOptimized.js
# Current: 0% → Target: 60%+
# Test Focus: Share URL generation, encryption, access control
# Impact: Data sharing security
```

#### TIER 3: SUPPORTING COMPONENTS (MUST ACHIEVE 50%+ COVERAGE)

```bash
# Error Handling (STABILITY)
src/components/ErrorBoundary/ErrorBoundary.js
# Current: ~5% → Target: 75%+
# Test Focus: Error catching, fallback UI, recovery
# Impact: Application stability

# Form Components (DATA INTEGRITY)
src/components/Forms/MarkdownField.js
# Current: 0% → Target: 50%+
# Test Focus: Rich text editing, validation, rendering
# Impact: Content quality

src/components/Forms/SmartTextInput.js
# Current: 0% → Target: 50%+
# Test Focus: Input validation, formatting, accessibility
# Impact: Data entry quality

# Common Components (CONSISTENCY)
src/components/Common/ThemeSwitcher.js
# Current: ~10% → Target: 60%+
# Test Focus: Theme switching, persistence, system detection
# Impact: User experience consistency
```

### TESTING STRATEGY BY COMPONENT TYPE

#### Strategy 1: Service Layer Testing
**Applied to: Encryption, Sync, API services**

```javascript
// PATTERN: Comprehensive service testing
// File: src/services/__tests__/[ServiceName].comprehensive.test.js

describe('[ServiceName] Comprehensive Testing', () => {
  // 1. HAPPY PATH TESTING (30% of effort)
  describe('Normal Operations', () => {
    it('should handle standard workflow correctly');
    it('should return expected data format');
    it('should maintain performance benchmarks');
  });

  // 2. ERROR CONDITION TESTING (40% of effort)
  describe('Error Handling', () => {
    it('should handle network timeouts gracefully');
    it('should recover from malformed data');
    it('should validate input parameters');
    it('should prevent data corruption');
  });

  // 3. EDGE CASE TESTING (20% of effort)
  describe('Edge Cases', () => {
    it('should handle boundary conditions');
    it('should work with empty/null inputs');
    it('should manage concurrent operations');
  });

  // 4. INTEGRATION TESTING (10% of effort)
  describe('Integration Points', () => {
    it('should integrate with dependent services');
    it('should maintain API contracts');
  });
});
```

#### Strategy 2: Context Provider Testing
**Applied to: SyncContext, ThemeContext, ProfileContext**

```javascript
// PATTERN: Context provider with state transitions
// File: src/context/__tests__/[Context].comprehensive.test.js

const TestComponent = () => {
  const context = useContext(YourContext);
  return (
    <div>
      <span data-testid="state">{JSON.stringify(context.state)}</span>
      <button onClick={() => context.action('test')}>Action</button>
    </div>
  );
};

describe('[Context] Provider Testing', () => {
  // 1. INITIAL STATE TESTING
  it('should provide correct initial state');

  // 2. STATE TRANSITION TESTING
  it('should handle state transitions correctly');
  it('should validate state changes');

  // 3. ERROR STATE TESTING
  it('should handle provider errors gracefully');
  it('should recover from invalid state');

  // 4. PERSISTENCE TESTING
  it('should persist state across re-renders');
  it('should restore state from localStorage');
});
```

#### Strategy 3: Component Integration Testing
**Applied to: Dialogs, Forms, Navigation components**

```javascript
// PATTERN: Component with providers and interactions
// File: src/components/[Component]/__tests__/[Component].integration.test.js

const ComponentWithProviders = ({ children, ...props }) => (
  <ThemeProvider theme={theme}>
    <SyncProvider>
      <ProfileProvider>
        <ComponentName {...props}>{children}</ComponentName>
      </ProfileProvider>
    </SyncProvider>
  </ThemeProvider>
);

describe('[Component] Integration Testing', () => {
  // 1. RENDERING TESTING
  it('should render with all providers correctly');
  it('should handle missing props gracefully');

  // 2. USER INTERACTION TESTING
  it('should respond to user interactions');
  it('should validate form inputs');
  it('should submit data correctly');

  // 3. ERROR SCENARIO TESTING
  it('should display error messages appropriately');
  it('should handle submission failures');

  // 4. ACCESSIBILITY TESTING
  it('should meet accessibility standards');
  it('should support keyboard navigation');
});
```

### MOCKING STRATEGY FRAMEWORK

#### Mock Level 1: External Dependencies
```javascript
// Mock all external libraries
jest.mock('@react-native-async-storage/async-storage');
jest.mock('tweetnacl');
jest.mock('react-native', () => require('react-native-web'));
jest.mock('@mui/material/Dialog', () => ({ children }) =>
  <div data-testid="mock-dialog">{children}</div>
);
```

#### Mock Level 2: Internal Services
```javascript
// Mock internal services for component testing
jest.mock('../../../services/sync/manyllaEncryptionService', () => ({
  encryptData: jest.fn(() => Promise.resolve('encrypted')),
  decryptData: jest.fn(() => Promise.resolve('decrypted')),
  generateRecoveryPhrase: jest.fn(() => 'mock-phrase')
}));
```

#### Mock Level 3: Context Providers
```javascript
// Mock context providers for isolated component testing
jest.mock('../../../context/SyncContext', () => ({
  useSyncContext: () => ({
    syncEnabled: false,
    enableSync: jest.fn(),
    syncData: jest.fn(),
    recoveryPhrase: null
  })
}));
```

### COVERAGE MEASUREMENT AND REPORTING

#### Coverage Tracking Script
```bash
#!/bin/bash
# scripts/track-coverage-progress.sh

echo "=== S030 COVERAGE PROGRESS TRACKING ==="
echo "Timestamp: $(date)"

# Global coverage check
echo "\n=== GLOBAL COVERAGE ==="
npm run test:coverage | grep "All files" | tee -a coverage-progress.log

# Critical component coverage
echo "\n=== CRITICAL COMPONENTS ==="
npm run test:coverage -- --testPathPattern="services/sync" | grep -E "(manyllaEncryption|manyllaMinimalSync)"
npm run test:coverage -- --testPathPattern="context" | grep -E "(SyncContext|ThemeContext)"

# Component coverage by tier
echo "\n=== COMPONENT TIERS ==="
echo "Tier 1 (Critical): Services & Context"
echo "Tier 2 (High-Value): Navigation & Profiles"
echo "Tier 3 (Supporting): Forms & Common"

# Progress calculation
CURRENT_COVERAGE=$(npm run test:coverage 2>/dev/null | grep "All files" | awk '{print $4}' | sed 's/%//')
TARGET_COVERAGE=60
PROGRESS=$((($CURRENT_COVERAGE * 100) / $TARGET_COVERAGE))

echo "\n=== PROGRESS SUMMARY ==="
echo "Current: ${CURRENT_COVERAGE}%"
echo "Target: ${TARGET_COVERAGE}%"
echo "Progress: ${PROGRESS}%"

if [ "$CURRENT_COVERAGE" -ge "$TARGET_COVERAGE" ]; then
  echo "✅ COVERAGE TARGET ACHIEVED"
  exit 0
else
  echo "🔄 COVERAGE TARGET IN PROGRESS"
  exit 1
fi
```

### INTEGRATION POINTS WITH CI/CD

#### Pre-Deployment Coverage Gate
```javascript
// __tests__/coverage-gate.test.js
// Integration with deployment pipeline

describe('Deployment Coverage Gate', () => {
  it('should meet minimum coverage requirements for deployment', async () => {
    const coverageReport = await runCoverageReport();

    expect(coverageReport.global.statements).toBeGreaterThanOrEqual(60);
    expect(coverageReport.global.branches).toBeGreaterThanOrEqual(60);
    expect(coverageReport.global.functions).toBeGreaterThanOrEqual(60);
    expect(coverageReport.global.lines).toBeGreaterThanOrEqual(60);

    // Critical component requirements
    expect(coverageReport.services.encryption).toBeGreaterThanOrEqual(80);
    expect(coverageReport.services.sync).toBeGreaterThanOrEqual(80);
    expect(coverageReport.context.sync).toBeGreaterThanOrEqual(80);
    expect(coverageReport.context.theme).toBeGreaterThanOrEqual(80);
  });

  it('should have meaningful test quality metrics', () => {
    // Verify test quality, not just coverage
    const testFiles = glob.sync('src/**/*.test.js');
    let meaningfulAssertions = 0;
    let coveragePaddingTests = 0;

    testFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      meaningfulAssertions += (content.match(/expect.*toBeInTheDocument/g) || []).length;
      meaningfulAssertions += (content.match(/fireEvent/g) || []).length;
      coveragePaddingTests += (content.match(/expect.*toBeDefined/g) || []).length;
    });

    const qualityRatio = meaningfulAssertions / (meaningfulAssertions + coveragePaddingTests);
    expect(qualityRatio).toBeGreaterThan(0.8); // 80% meaningful tests
  });
});
```

### VALIDATION CHECKPOINTS

#### Checkpoint 1: Infrastructure Repair (Before Implementation)
```bash
# CP1: Verify starting state
npm run test:ci  # Must pass before starting
npm test -- imageUtils.test.js  # Must fix failing tests first
```

#### Checkpoint 2: Tier 1 Completion
```bash
# CP2: Critical components at 80%+
npm run test:coverage -- --testPathPattern="(services|context)"
# All critical components must show >= 80%
```

#### Checkpoint 3: Global Target Achievement
```bash
# CP3: Global 60% target reached
npm run test:coverage | grep "All files"
# All metrics must show >= 60%
```

#### Checkpoint 4: Quality Validation
```bash
# CP4: Test quality assessment
./scripts/validate-test-quality.sh
# Custom script to check for meaningful vs padding tests
```

#### Checkpoint 5: Final Integration
```bash
# CP5: Full pipeline validation
npm run test:ci && npm run build:web && npm run lint
# All must pass for completion
```

### PROVEN TESTING PATTERNS (MANDATORY TEMPLATES)

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
# Target coverage after implementation (UPDATED BASELINES):
src/components/     : 45% (from ~1%)     - Core UI components (MAJOR EXPANSION)
src/context/        : 80% (from ~65%)    - State management (EXTEND)
src/services/       : 85% (from ~65%)    - Business logic (EXTEND)
src/theme/          : 70% (from 50%)     - Theme configuration (EXTEND)
src/types/          : 80% (from 60%)     - Type definitions (EXTEND)
src/utils/          : 75% (from ~25%)    - Utility functions (EXPAND)
src/hooks/          : 90% (from ~80%)    - Custom hooks (EXTEND)
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
Statements   : 60.12% ( 1234/2053 )   ✅ MEETS 60% MINIMUM
Branches     : 61.45% ( 567/923 )     ✅ MEETS 60% MINIMUM
Functions    : 62.33% ( 234/376 )     ✅ MEETS 60% MINIMUM
Lines        : 60.89% ( 1198/1967 )   ✅ MEETS 60% MINIMUM
================================================================================

📊 **COVERAGE IMPROVEMENT TRACKING**:
Before: 19.57% → After: 60.12% = +40.55% improvement ✅
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

## DETAILED ACCEPTANCE CRITERIA

### MANDATORY FUNCTIONAL REQUIREMENTS (BLOCKING)
- [ ] **AC-1: Global Coverage Targets**
  - Statements coverage: >= 60.00% (currently 19.57%)
  - Branches coverage: >= 60.00% (currently 12.82%)
  - Functions coverage: >= 60.00% (currently 14.31%)
  - Lines coverage: >= 60.00% (currently 19.76%)
  - **Verification**: `npm run test:coverage | grep "All files"`

- [ ] **AC-2: Critical Component Coverage (80%+ Required)**
  - `src/services/sync/manyllaEncryptionService.js`: >= 80%
  - `src/services/sync/manyllaMinimalSyncServiceWeb.js`: >= 80%
  - `src/context/SyncContext.tsx`: >= 80%
  - `src/context/ThemeContext.tsx`: >= 80%
  - **Verification**: `npm run test:coverage -- --testPathPattern="(services|context)"`

- [ ] **AC-3: Zero Test Regressions**
  - ALL existing tests MUST continue to pass
  - NO modifications to existing test expectations without justification
  - **Verification**: `npm run test:ci` exits with code 0

- [ ] **AC-4: Test Infrastructure Repair**
  - Fix ALL 14 failing tests in `src/utils/__tests__/imageUtils.test.js`
  - Clean up console error noise in test output
  - **Verification**: `npm test -- imageUtils.test.js` all pass

### MANDATORY QUALITY REQUIREMENTS (BLOCKING)
- [ ] **AC-5: Meaningful Test Coverage**
  - Tests validate USER BEHAVIOR, not implementation details
  - NO "coverage padding" tests (e.g., `expect(component).toBeDefined()`)
  - Each test MUST have meaningful assertions using React Testing Library patterns
  - **Verification**: Manual review of test quality by peer reviewer

- [ ] **AC-6: Error Condition Coverage**
  - ALL error paths in critical services tested
  - Network failure scenarios covered in sync services
  - Form validation error states tested
  - **Verification**: Check error handling in `manyllaEncryptionService` and `manyllaMinimalSyncServiceWeb`

- [ ] **AC-7: Comprehensive Edge Case Testing**
  - Boundary conditions (empty arrays, null values, undefined)
  - Malformed data inputs
  - Race conditions in async operations
  - **Verification**: Test files include edge case sections

### MANDATORY INTEGRATION REQUIREMENTS (BLOCKING)
- [ ] **AC-8: CI Pipeline Compatibility**
  - `npm run test:ci` passes (exit code 0)
  - Tests run successfully in jsdom environment
  - NO additional dependencies required for CI
  - **Verification**: CI pipeline validation

- [ ] **AC-9: Build Process Integration**
  - `npm run build:web` continues to work
  - `npm run lint` passes with no new errors
  - Coverage thresholds updated in `package.json`
  - **Verification**: Full build cycle test

- [ ] **AC-10: Performance Requirements**
  - Total test suite execution time increase < 100ms
  - Individual test files complete in < 10 seconds
  - NO memory leaks in test environment
  - **Verification**: `time npm run test:ci` comparison

### MANDATORY DOCUMENTATION REQUIREMENTS (BLOCKING)
- [ ] **AC-11: Testing Pattern Documentation**
  - Create `APPROACH.md` documenting testing strategy
  - Document mock configuration patterns
  - Include examples of proper React Testing Library usage
  - **Verification**: Document review by peer reviewer

## ADVERSARIAL PEER REVIEW REQUIREMENTS

**🚨 CRITICAL: This story MUST go through the Adversarial Peer Review Process documented in `processes/ADVERSARIAL_REVIEW_PROCESS.md`. NO EXCEPTIONS.**

### PRE-REVIEW DEVELOPER DELIVERABLES (MANDATORY)

The implementing developer MUST provide ALL of the following before peer review:

#### 1. APPROACH.md Document (REQUIRED)
Create `/Users/adamstack/manylla/APPROACH.md` containing:

```markdown
# S030 Testing Strategy Implementation Approach

## Coverage Strategy
- **Priority Rationale**: Why each component was prioritized
- **Testing Patterns**: Specific patterns used for different component types
- **Mock Strategy**: Detailed mocking decisions and justifications
- **Edge Cases**: Complete list of edge cases identified and tested
- **Uncovered Paths**: Any code paths not covered with technical justification

## Implementation Details
- **Phase Execution**: How each phase was executed
- **Challenges Encountered**: Technical obstacles and solutions
- **Performance Considerations**: Test execution optimization approaches
- **Reusable Patterns**: Testing patterns that can be applied to future components

## Quality Assurance
- **Test Quality Standards**: How meaningful assertions were ensured
- **Regression Prevention**: Steps taken to prevent breaking existing functionality
- **Cross-Platform Compatibility**: Ensuring tests work in CI environment
```

#### 2. Implementation Report (REQUIRED)
Create `/Users/adamstack/manylla/IMPLEMENTATION_REPORT.md` containing:

```markdown
# S030 Implementation Report

## Coverage Metrics
**BEFORE:**
- Statements: 19.57%
- Branches: 12.82%
- Functions: 14.31%
- Lines: 19.76%

**AFTER:**
- Statements: [ACTUAL]%
- Branches: [ACTUAL]%
- Functions: [ACTUAL]%
- Lines: [ACTUAL]%

**IMPROVEMENT:** +[DELTA]% average improvement

## Files Created/Modified
[Complete list of all test files with absolute paths]

## Verification Commands Executed
[All commands run with their results]

## Tech Debt Discovered
[Any issues found during implementation]

## Completion Confidence
[0-100%] with justification
```

#### 3. Coverage Evidence (REQUIRED)
```bash
# Create coverage snapshots
npm run test:coverage > coverage-final.txt
npm run test:coverage -- --outputFile=coverage-detailed.json --json
```

### PEER REVIEWER VALIDATION PROTOCOL

The peer reviewer MUST execute ALL validation commands independently:

#### PHASE 1: Coverage Verification (BLOCKING)
```bash
# 1.1 Global Coverage Check (MUST BE >= 60% ALL METRICS)
npm run test:coverage | grep "All files"
# Expected format: All files | 60.xx | 60.xx | 60.xx | 60.xx |
# ANY metric < 60% = AUTOMATIC REJECTION

# 1.2 Critical Component Coverage Check (MUST BE >= 80%)
npm run test:coverage -- --testPathPattern="services/sync" | grep -E "(manyllaEncryption|manyllaMinimalSync)"
npm run test:coverage -- --testPathPattern="context" | grep -E "(SyncContext|ThemeContext)"
# ALL critical components MUST show >= 80%

# 1.3 Coverage Consistency Check
npm run test:coverage > peer-review-coverage.txt
diff coverage-final.txt peer-review-coverage.txt
# Files MUST match (no coverage discrepancies)
```

#### PHASE 2: Test Quality Assessment (BLOCKING)
```bash
# 2.1 Test File Existence Verification
find src -name "*.test.js" | wc -l
# Must show significant increase in test files

# 2.2 Meaningful Assertion Check
grep -r "expect.*toBeInTheDocument" src/**/__tests__/ | wc -l
grep -r "fireEvent" src/**/__tests__/ | wc -l
grep -r "waitFor" src/**/__tests__/ | wc -l
# Must show substantial use of meaningful React Testing Library patterns

# 2.3 Coverage Padding Detection
grep -r "expect.*toBeDefined" src/**/__tests__/ | wc -l
grep -r "expect.*toBeTruthy" src/**/__tests__/ | wc -l
# Should be minimal compared to behavioral assertions

# 2.4 Snapshot Test Verification
grep -r "toMatchSnapshot" src/**/__tests__/
# Should return empty or have specific justification
```

#### PHASE 3: Test Suite Execution (BLOCKING)
```bash
# 3.1 Full Test Suite Validation
npm run test:ci
echo "Exit code: $?"
# Exit code MUST be 0 (no failures)

# 3.2 Performance Impact Assessment
time npm run test:ci > test-performance.txt 2>&1
# Compare with baseline, increase must be < 100ms

# 3.3 Individual Component Test Validation
# Test each major component independently
npm test -- SyncContext.test.js
npm test -- manyllaEncryptionService
npm test -- ProfileCard.test.js
# ALL must pass independently
```

#### PHASE 4: Integration Verification (BLOCKING)
```bash
# 4.1 Build Process Verification
npm run build:web
echo "Build exit code: $?"
# Must complete successfully

# 4.2 Linting Verification
npm run lint
echo "Lint exit code: $?"
# Must pass with no new errors

# 4.3 TypeScript Verification
npm run typecheck
echo "TypeScript exit code: $?"
# Must pass with no new errors

# 4.4 Package.json Threshold Verification
grep -A 5 "coverageThreshold" package.json
# Must show updated thresholds to 60%
```

#### PHASE 5: Regression Detection (BLOCKING)
```bash
# 5.1 No Unintended File Changes
git status --porcelain
# Should only show intended test files and package.json

# 5.2 No New Console Pollution
npm run test:ci 2>&1 | grep -i "error" | grep -v "intentional" | wc -l
# Should be 0 or minimal

# 5.3 Existing Functionality Verification
# Run key application flows manually if necessary
```

### AUTOMATIC REJECTION CRITERIA (IMMEDIATE FAILURE)

The peer reviewer MUST reject immediately if ANY of these conditions exist:

#### BLOCKING CONDITIONS
- **COVERAGE-01**: ANY global metric < 60.00%
- **COVERAGE-02**: ANY critical component < 80.00%
- **TESTS-01**: `npm run test:ci` exit code ≠ 0
- **TESTS-02**: Any existing test failures introduced
- **PERFORMANCE-01**: Test suite time increase > 100ms
- **BUILD-01**: `npm run build:web` fails
- **BUILD-02**: `npm run lint` exit code ≠ 0
- **BUILD-03**: `npm run typecheck` exit code ≠ 0

#### MAJOR CONDITIONS (REQUIRE JUSTIFICATION)
- **QUALITY-01**: >50% of new tests are "coverage padding"
- **QUALITY-02**: Missing APPROACH.md or IMPLEMENTATION_REPORT.md
- **QUALITY-03**: Console error noise introduced without justification
- **QUALITY-04**: Existing tests modified without clear rationale

### PEER REVIEWER REPORTING FORMAT

The peer reviewer MUST use this exact format:

```
🔴 REJECTED: S030 Test Coverage Implementation
or
✅ APPROVED: S030 Test Coverage Implementation

=== VERIFICATION EVIDENCE ===

Coverage Verification:
- Global Statements: [X]% [PASS/FAIL - threshold 60%]
- Global Branches: [X]% [PASS/FAIL - threshold 60%]
- Global Functions: [X]% [PASS/FAIL - threshold 60%]
- Global Lines: [X]% [PASS/FAIL - threshold 60%]
- Critical Components: [PASS/FAIL - all >= 80%]

Test Suite Verification:
- Test Execution: [PASS/FAIL - npm run test:ci exit code]
- Performance Impact: [PASS/FAIL - <100ms increase]
- Test Count: [X] new test files created

Quality Verification:
- Meaningful Assertions: [PASS/FAIL - behavioral tests]
- Coverage Padding: [PASS/FAIL - minimal padding detected]
- Error Handling: [PASS/FAIL - error paths tested]

Integration Verification:
- Build Process: [PASS/FAIL - npm run build:web]
- Linting: [PASS/FAIL - npm run lint]
- TypeScript: [PASS/FAIL - npm run typecheck]
- Package.json: [PASS/FAIL - thresholds updated]

=== DETAILED FINDINGS ===
[Specific evidence for each PASS/FAIL]

[If REJECTED]
=== REQUIRED FIXES ===
1. [Specific fix with file/line]
2. [Specific fix with file/line]
3. [Specific fix with file/line]

=== COMPLETION ASSESSMENT ===
Overall Grade: [A/B/C/D/F]
Confidence Level: [0-100%]
Recommendation: [APPROVE/REJECT/CONDITIONAL]
```

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

## COMPREHENSIVE IMPLEMENTATION GUIDE (BOUNCING DOT CLARITY)

**This section provides CRYSTAL CLEAR step-by-step instructions that a developer can follow like a bouncing dot. Every step is concrete, measurable, and leaves NO ambiguity.**

### PRE-FLIGHT CHECKLIST (MANDATORY FIRST STEPS)

#### Step 1: Environment Verification
```bash
# Verify your starting position
cd /Users/adamstack/manylla
npm --version                        # Should be >= 18
node --version                       # Should be >= 18
git status                          # Should show clean working directory
```

#### Step 2: Baseline Coverage Measurement
```bash
# Record starting coverage (for comparison)
npm run test:coverage > coverage-before.txt
echo "BASELINE COVERAGE RECORDED" && cat coverage-before.txt | grep "All files"
```

#### Step 3: Fix Existing Test Failures (BLOCKING)
```bash
# Run tests to see current failures
npm run test:ci
# Expected: 14 failures in imageUtils.test.js

# Fix imageUtils test mocking issues:
# 1. Open src/utils/__tests__/imageUtils.test.js
# 2. Fix Canvas/Image mocking strategy (see patterns in working tests)
# 3. Ensure all 14 failing tests pass
# 4. Verify fix:
npm test -- imageUtils.test.js
# Expected: All tests passing
```

### PHASE 1: CRITICAL SERVICES EXPANSION (WEEK 1)

#### Step 4: Context Tests Enhancement
```bash
# Target: src/context/ from ~65% to 80%
# Files to enhance (in order):

# 4.1: SyncContext.test.js (EXTEND existing)
# Add these specific test cases:
# - Error boundary testing for sync failures
# - Edge cases for recovery phrase validation
# - Polling interval management
# - Memory cleanup on unmount
npm test -- SyncContext.test.js
# Verify: Coverage increase visible

# 4.2: ThemeContext.test.js (EXTEND existing)
# Add these specific test cases:
# - Theme persistence across sessions
# - System theme detection
# - Custom theme override
# - Theme switching animations
npm test -- ThemeContext.test.js
# Verify: Coverage increase visible
```

#### Step 5: Services Tests Enhancement
```bash
# Target: src/services/ from ~65% to 85%

# 5.1: Encryption Service (EXTEND existing 60% threshold)
# Files: manyllaEncryptionService.basic.test.js
# Add missing coverage:
# - Key derivation edge cases
# - Encryption error conditions
# - Memory management
# - Performance boundary testing
npm test -- manyllaEncryptionService
# Verify: All encryption tests passing

# 5.2: Sync Service (EXTEND existing 60% threshold)
# Files: manyllaMinimalSyncServiceWeb.comprehensive.test.js
# Add missing coverage:
# - Network timeout scenarios
# - Concurrent sync operations
# - Recovery phrase conflicts
# - API rate limiting
npm test -- manyllaMinimalSyncServiceWeb
# Verify: All sync tests passing
```

### PHASE 2: COMPONENT TESTS CREATION (WEEK 2)

#### Step 6: Critical Component Tests (NEW TESTS)
```bash
# Target: src/components/ from ~1% to 45%
# This is the LARGEST coverage gain needed

# 6.1: Navigation Components
# Create: src/components/Navigation/__tests__/BottomSheetMenu.test.js
# Test patterns:
# - Menu state management
# - Touch interactions
# - Accessibility features
# Template: Use BottomToolbar.test.js as base pattern

# 6.2: Profile Management
# Create: src/components/Profile/__tests__/ProfileCard.test.js
# Test patterns:
# - Profile data rendering
# - Photo display fallbacks
# - Profile switching
# - Data validation

# Create: src/components/Profile/__tests__/ProfileEditDialog.test.js
# Test patterns:
# - Form validation
# - Data persistence
# - Error handling
# - Modal behavior

# 6.3: Core Dialogs
# Create: src/components/Dialogs/__tests__/UnifiedAddDialog.test.js
# EXTEND: Existing UnifiedAddDialog.real.test.js
# Test patterns:
# - Form field validation
# - Category management
# - Image upload handling
# - Data submission
```

#### Step 7: Verification After Each Component
```bash
# After EACH component test creation:
npm run test:coverage | grep "src/components"
# Verify: Components coverage increasing toward 45%

# If coverage not increasing:
npm test -- YourNewComponent.test.js --coverage
# Debug: Check test execution and assertions
```

### PHASE 3: SUPPORTING TESTS (WEEK 3)

#### Step 8: Utils and Hooks Enhancement
```bash
# Target: src/utils/ from ~25% to 75%
# Target: src/hooks/ from ~80% to 90%

# 8.1: Utils Tests (EXTEND existing)
# Files to enhance:
# - validation.test.js (add edge cases)
# - inviteCode.test.js (add error scenarios)
# - imageUtils.test.js (fix and extend after Step 3)

# 8.2: Hook Tests (EXTEND existing)
# Files to enhance:
# - useErrorDisplay.test.js (add error boundaries)
# - useMobileDialog.test.js (add mobile-specific scenarios)
# - useMobileKeyboard.test.js (add keyboard handling edge cases)
```

#### Step 9: Type and Theme Tests
```bash
# Target: src/types/ from 60% to 80%
# Target: src/theme/ from 50% to 70%

# 9.1: Type Tests (EXTEND existing)
# File: src/types/__tests__/ChildProfile.test.js
# Add: Data validation, serialization, migration scenarios

# 9.2: Theme Tests (EXTEND existing)
# File: src/theme/__tests__/theme.test.js
# Add: Theme consistency, color calculations, responsive breakpoints
```

### VERIFICATION AND VALIDATION

#### Step 10: Coverage Verification
```bash
# Continuous verification throughout implementation:
npm run test:coverage > coverage-current.txt

# Check each metric individually:
grep "statements" coverage-current.txt    # Must show >= 60%
grep "branches" coverage-current.txt      # Must show >= 60%
grep "functions" coverage-current.txt     # Must show >= 60%
grep "lines" coverage-current.txt         # Must show >= 60%

# If ANY metric < 60%:
echo "FAILED: Coverage below threshold - continue implementation"
# If ALL metrics >= 60%:
echo "SUCCESS: Coverage target achieved"
```

#### Step 11: Quality Verification
```bash
# Test quality checks:
npm run test:ci                           # Must exit with code 0
npm run lint                              # Must pass
npm run typecheck                         # Must pass

# Performance verification:
time npm run test:ci                      # Record total time
# Compare with baseline (Step 2)
# Increase must be < 100ms

# No regressions:
git status                                # Check no unintended changes
npm run build:web                         # Must succeed
```

#### Step 12: Documentation Completion
```bash
# Create APPROACH.md document:
touch APPROACH.md
# Content must include:
# - Testing strategy rationale
# - Coverage priority decisions
# - Mocking strategy explanations
# - Edge cases identified
# - Any uncovered code paths with justifications

# Update package.json thresholds:
# Change global thresholds from 7% to 60%:
# "global": {
#   "statements": 60,
#   "branches": 60,
#   "functions": 60,
#   "lines": 60
# }
```

### ADVERSARIAL REVIEW PREPARATION

#### Step 13: Pre-Review Self-Validation
```bash
# Run ALL verification commands that peer reviewer will run:

# 1. Coverage verification
npm run test:coverage | grep "All files"
# Expected: All metrics >= 60%

# 2. Test suite verification
npm run test:ci
echo $?
# Expected: Exit code = 0

# 3. Build verification
npm run build:web
# Expected: Build succeeds

# 4. No console pollution
npm run test:ci 2>&1 | grep -i "error" | grep -v "intentional"
# Expected: No unexpected errors

# 5. Performance verification
time npm run test:ci
# Expected: Reasonable execution time
```

#### Step 14: Implementation Report Creation
```bash
# Create implementation report with:
echo "=== S030 IMPLEMENTATION REPORT ===" > implementation-report.md
echo "Files Created/Modified:" >> implementation-report.md
git diff --name-only >> implementation-report.md
echo "Coverage Before: [from coverage-before.txt]" >> implementation-report.md
echo "Coverage After: [from coverage-current.txt]" >> implementation-report.md
echo "Test Execution Time: [from performance verification]" >> implementation-report.md
echo "Completion Confidence: [0-100%]" >> implementation-report.md
```

### SUCCESS CRITERIA CHECKLIST

**EVERY item must be ✅ before adversarial review:**

#### Technical Completion
- [ ] Global coverage >= 60% (statements: __%, branches: __%, functions: __%, lines: __%)
- [ ] ALL existing tests pass (`npm run test:ci` exit code = 0)
- [ ] ALL new tests pass in local environment
- [ ] Coverage thresholds updated in `package.json`
- [ ] Build process unchanged (`npm run build:web` succeeds)

#### Quality Completion
- [ ] Tests follow React Testing Library patterns (not implementation details)
- [ ] Critical business logic has comprehensive edge case coverage
- [ ] Error conditions tested with meaningful assertions
- [ ] Tests are maintainable (clear naming, proper setup/teardown)
- [ ] No snapshot tests added (unless specifically justified)

#### Performance Completion
- [ ] Test suite execution time increase < 100ms
- [ ] No memory leaks in test environment
- [ ] CI environment compatibility maintained

#### Process Completion
- [ ] APPROACH.md document created with detailed strategy
- [ ] Implementation report created with metrics
- [ ] All verification commands documented and passing
- [ ] Ready for adversarial peer review submission

### COMMON PITFALLS AND SOLUTIONS

#### Pitfall 1: Coverage Padding
**Problem**: Writing tests that execute code but don't validate behavior
**Solution**: Focus on user interactions and business logic validation
```javascript
// ❌ Bad (coverage padding)
expect(component).toBeDefined();

// ✅ Good (behavior validation)
fireEvent.click(screen.getByRole('button', { name: /save/i }));
await waitFor(() => {
  expect(screen.getByText(/profile saved/i)).toBeInTheDocument();
});
```

#### Pitfall 2: Mock Configuration Issues
**Problem**: Tests failing due to React Native Web compatibility
**Solution**: Use established mock patterns from working tests
```javascript
// Use patterns from existing SyncContext.test.js and BottomToolbar.test.js
```

#### Pitfall 3: Performance Degradation
**Problem**: Test suite becoming too slow
**Solution**: Optimize test setup and teardown
```javascript
// Group related tests, use beforeEach/afterEach efficiently
// Mock heavy dependencies at module level
```

## FINAL IMPLEMENTATION CHECKLIST

### PHASE 0: PRE-IMPLEMENTATION (MANDATORY FIRST)
- [ ] **Infrastructure Repair**: Fix ALL 14 failing tests in `imageUtils.test.js`
- [ ] **Baseline Recording**: Execute `npm run test:coverage > coverage-baseline.txt`
- [ ] **Environment Verification**: Confirm `npm run test:ci` exits with code 0
- [ ] **Performance Baseline**: Record `time npm run test:ci` execution time

### PHASE 1: TIER 1 CRITICAL COMPONENTS (MUST COMPLETE FIRST)
- [ ] **Services Enhancement (Target: 85%)**
  - [ ] `manyllaEncryptionService.js`: Edge cases, error handling, performance
  - [ ] `manyllaMinimalSyncServiceWeb.js`: Network failures, conflicts, validation
- [ ] **Context Enhancement (Target: 80%)**
  - [ ] `SyncContext.tsx`: State transitions, polling, error recovery
  - [ ] `ThemeContext.tsx`: Persistence, system detection, switching
- [ ] **Checkpoint 1**: Verify Tier 1 components all >= 80% coverage

### PHASE 2: TIER 2 HIGH-VALUE COMPONENTS (AFTER TIER 1)
- [ ] **Navigation Components (Target: 65-75%)**
  - [ ] `BottomToolbar.js`: User interactions, accessibility
  - [ ] `BottomSheetMenu.js`: Touch behavior, state management
- [ ] **Profile Components (Target: 65%)**
  - [ ] `ProfileCard.js`: Data display, photo handling
  - [ ] `ProfileEditDialog.js`: Form validation, persistence
  - [ ] `ProfileCreateDialog.js`: Creation flow, validation
- [ ] **Dialog Components (Target: 60-65%)**
  - [ ] `UnifiedAddDialog.js`: Extend existing tests
  - [ ] `ShareDialogOptimized.js`: URL generation, encryption
- [ ] **Checkpoint 2**: Verify Tier 2 components all >= 60% coverage

### PHASE 3: TIER 3 SUPPORTING COMPONENTS (FINAL PHASE)
- [ ] **Error Handling (Target: 75%)**
  - [ ] `ErrorBoundary.js`: Error catching, fallback UI
- [ ] **Form Components (Target: 50%)**
  - [ ] `MarkdownField.js`: Rich text, validation
  - [ ] `SmartTextInput.js`: Input validation, formatting
- [ ] **Common Components (Target: 60%)**
  - [ ] `ThemeSwitcher.js`: Theme switching, persistence
- [ ] **Checkpoint 3**: Verify global coverage >= 60% all metrics

### FINAL VALIDATION PHASE
- [ ] **Coverage Verification**: ALL metrics >= 60% (`npm run test:coverage`)
- [ ] **Test Quality Check**: Meaningful assertions, no coverage padding
- [ ] **Performance Validation**: Test suite increase < 100ms
- [ ] **Integration Testing**: CI pipeline passes (`npm run test:ci`)
- [ ] **Build Verification**: `npm run build:web && npm run lint` succeeds
- [ ] **Documentation**: Create APPROACH.md and IMPLEMENTATION_REPORT.md

### ADVERSARIAL REVIEW COMPLETION
- [ ] **Developer Deliverables**: Submit all required documents
- [ ] **Peer Review**: Independent validation by peer reviewer
- [ ] **Review Outcome**: Receive ✅ APPROVED from peer reviewer
- [ ] **Final Sign-off**: Story marked COMPLETE in backlog

## COMPREHENSIVE DEFINITION OF DONE

### TECHNICAL COMPLETION (BLOCKING REQUIREMENTS)
- [ ] **TC-1**: Global coverage >= 60.00% (statements, branches, functions, lines)
- [ ] **TC-2**: Critical components >= 80.00% (encryption, sync, contexts)
- [ ] **TC-3**: Zero test regressions (`npm run test:ci` exit code = 0)
- [ ] **TC-4**: Package.json thresholds updated to reflect new minimums
- [ ] **TC-5**: Build process unchanged (`npm run build:web` succeeds)
- [ ] **TC-6**: Linting passes with no new errors (`npm run lint`)
- [ ] **TC-7**: TypeScript compilation succeeds (`npm run typecheck`)

### QUALITY COMPLETION (BLOCKING REQUIREMENTS)
- [ ] **QC-1**: Tests validate USER BEHAVIOR (React Testing Library patterns)
- [ ] **QC-2**: Error conditions comprehensively tested
- [ ] **QC-3**: Edge cases covered (null, undefined, boundary conditions)
- [ ] **QC-4**: NO "coverage padding" tests (meaningless assertions)
- [ ] **QC-5**: Mocking strategy appropriate and consistent
- [ ] **QC-6**: Test execution time increase < 100ms
- [ ] **QC-7**: Cross-platform compatibility maintained (jsdom)

### PROCESS COMPLETION (BLOCKING REQUIREMENTS)
- [ ] **PC-1**: Adversarial peer review completed with ✅ APPROVED
- [ ] **PC-2**: APPROACH.md document created with complete strategy
- [ ] **PC-3**: IMPLEMENTATION_REPORT.md with metrics and evidence
- [ ] **PC-4**: All validation commands independently verified
- [ ] **PC-5**: Performance impact assessed and documented
- [ ] **PC-6**: Testing patterns documented for future use

### DOCUMENTATION COMPLETION (BLOCKING REQUIREMENTS)
- [ ] **DC-1**: Testing patterns documented in APPROACH.md
- [ ] **DC-2**: Mock configuration patterns recorded
- [ ] **DC-3**: Coverage improvement strategy documented
- [ ] **DC-4**: Common pitfalls and solutions documented
- [ ] **DC-5**: Reusable test templates created

## RISK MITIGATION STRATEGIES

### HIGH RISK: Scope Creep
**Mitigation**: Strict tier-based execution. Complete Tier 1 before Tier 2.
**Trigger**: If any phase takes >150% estimated time, break into sub-stories.

### HIGH RISK: Test Quality Degradation
**Mitigation**: Peer reviewer has veto power on "coverage padding" tests.
**Trigger**: If >30% of tests are coverage padding, automatic rejection.

### MEDIUM RISK: Performance Impact
**Mitigation**: Continuous monitoring of test execution time.
**Trigger**: If test suite time increases >100ms, optimize before proceeding.

### MEDIUM RISK: Existing Test Breakage
**Mitigation**: Run full test suite after each major component.
**Trigger**: If ANY existing test fails, stop and fix immediately.

### LOW RISK: CI Environment Issues
**Mitigation**: Test in CI environment early and frequently.
**Trigger**: If CI tests fail but local tests pass, investigate mocking.

## SUCCESS METRICS DASHBOARD

### Coverage Progress Tracking
```bash
# Execute daily during implementation
npm run test:coverage | grep "All files" >> daily-coverage.log
echo "$(date): Statements=$(extract_statements)% Branches=$(extract_branches)% Functions=$(extract_functions)% Lines=$(extract_lines)%" >> progress.log
```

### Quality Metrics Tracking
```bash
# Count meaningful vs padding tests
MEANINGFUL=$(grep -r "expect.*toBeInTheDocument\|fireEvent\|waitFor" src/**/__tests__/ | wc -l)
PADDING=$(grep -r "expect.*toBeDefined\|expect.*toBeTruthy" src/**/__tests__/ | wc -l)
QUALITY_RATIO=$((MEANINGFUL * 100 / (MEANINGFUL + PADDING)))
echo "Quality Ratio: ${QUALITY_RATIO}% (Target: >80%)"
```

### Performance Impact Tracking
```bash
# Track test execution time
echo "=== PERFORMANCE TRACKING ===" >> performance.log
time npm run test:ci 2>&1 | grep "real" >> performance.log
echo "Baseline: [RECORD_BASELINE]" >> performance.log
```

## STORY COMPLETION CERTIFICATE

**This story is considered COMPLETE only when ALL of the following are true:**
1. ✅ Global coverage >= 60% (all 4 metrics independently verified)
2. ✅ Critical components >= 80% (encryption, sync, contexts verified)
3. ✅ ALL existing tests pass (`npm run test:ci` exit code = 0)
4. ✅ Adversarial peer review gives ✅ APPROVED
5. ✅ Performance impact < 100ms test suite increase
6. ✅ Build process unchanged (no regressions introduced)
7. ✅ All required documentation delivered (APPROACH.md, IMPLEMENTATION_REPORT.md)
8. ✅ Package.json coverage thresholds updated to 60%

**Completion Authority**: Only the peer reviewer can mark this story COMPLETE by providing ✅ APPROVED status.

**Rollback Plan**: If ANY completion requirement fails, the story returns to IN PROGRESS status until ALL requirements are met.

## COMPLETE PRIORITY FILE LIST (EXECUTION ORDER)

### CRITICAL PATH FILES (Must achieve 80%+ coverage)
```bash
# Encryption & Security (HIGHEST PRIORITY)
src/services/sync/manyllaEncryptionService.js              # 60% → 85%
src/services/sync/manyllaMinimalSyncServiceWeb.js          # 60% → 85%

# State Management (HIGH PRIORITY)
src/context/SyncContext.tsx                               # 65% → 80%
src/context/ThemeContext.tsx                              # 65% → 80%

# Core Navigation (HIGH PRIORITY)
src/components/Navigation/BottomToolbar.js                # 5% → 75%
src/components/Navigation/BottomSheetMenu.js              # 0% → 65%
```

### HIGH-VALUE FILES (Must achieve 60%+ coverage)
```bash
# Profile Management
src/components/Profile/ProfileCard.js                     # 0% → 65%
src/components/Profile/ProfileEditDialog.js               # 0% → 65%
src/components/Profile/ProfileCreateDialog.js             # 0% → 65%
src/components/Profile/CategorySection.js                 # 0% → 60%

# Core Dialogs
src/components/Dialogs/UnifiedAddDialog.js                # 0% → 65%
src/components/Sharing/ShareDialogOptimized.js            # 0% → 60%
src/components/Sync/SyncDialog.js                         # 0% → 60%

# Utilities (EXTEND EXISTING)
src/utils/validation.js                                   # 25% → 75%
src/utils/imageUtils.js                                   # 25% → 75% (FIX FIRST)
src/utils/inviteCode.js                                   # 25% → 75%
```

### MEDIUM-VALUE FILES (Must achieve 50%+ coverage)
```bash
# Layout & Common
src/components/Layout/Header.js                           # 0% → 50%
src/components/Common/ThemeSwitcher.js                    # 10% → 60%
src/components/Common/ImagePicker.js                      # 2% → 55%
src/components/Common/ThemedModal.js                      # 18% → 55%

# Forms & Input
src/components/Forms/MarkdownField.js                     # 0% → 50%
src/components/Forms/SmartTextInput.js                    # 0% → 50%
src/components/Forms/MarkdownRenderer.js                  # 0% → 50%

# Error Handling
src/components/ErrorBoundary/ErrorBoundary.js             # 0% → 55%
src/components/ErrorBoundary/ErrorFallback.js             # 0% → 50%
```

### SUPPORTING FILES (Must achieve 40%+ coverage)
```bash
# Data Models & Theme
src/types/ChildProfile.js                                 # 60% → 80%
src/theme/theme.js                                        # 50% → 70%
src/theme/modalTheme.js                                   # 0% → 60%

# Hook Extensions (EXTEND EXISTING)
src/hooks/useErrorDisplay.js                              # 80% → 90%
src/hooks/useMobileDialog.js                              # 80% → 90%
src/hooks/useMobileKeyboard.js                            # 80% → 90%
```

## ESTABLISHED TESTING PATTERNS (COPY THESE)

### Pattern 1: Context Provider Testing (from SyncContext.test.js)
```javascript
// PROVEN PATTERN - Copy this structure
import React from "react";
import { render, act, screen } from "@testing-library/react";
import { SyncProvider, useSync } from "../SyncContext";

// Mock dependencies BEFORE imports
jest.mock("../../utils/platform", () => ({
  isWeb: true,
  isNative: false,
}));

// Test component pattern for context testing
const TestComponent = () => {
  const { syncEnabled, enableSync } = useSync();
  return (
    <div>
      <span data-testid="sync-status">{syncEnabled ? "enabled" : "disabled"}</span>
      <button onClick={() => enableSync("test-phrase")}>Enable</button>
    </div>
  );
};

describe("YourNewContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides initial state correctly", () => {
    render(
      <YourProvider>
        <TestComponent />
      </YourProvider>
    );
    expect(screen.getByTestId("sync-status")).toHaveTextContent("disabled");
  });

  // Add more tests following this pattern
});
```

### Pattern 2: Component with Providers Testing (from BottomToolbar.test.js)
```javascript
// PROVEN PATTERN - Copy this mock structure
jest.mock("../../../context/ProfileContext", () => ({
  useProfileContext: () => ({
    profiles: [{ id: "1", name: "Test Profile 1" }],
    currentProfile: { id: "1", name: "Test Profile 1" },
    // Mock all context methods
  }),
}));

jest.mock("../../../context/SyncContext", () => ({
  useSyncContext: () => ({
    syncEnabled: false,
    enableSync: jest.fn(),
    // Mock all sync methods
  }),
}));

// Component testing without full provider tree
describe("YourNewComponent", () => {
  const mockSetActiveScreen = jest.fn();

  beforeEach(() => {
    mockSetActiveScreen.mockClear();
  });

  it("should import component successfully", () => {
    expect(YourComponent).toBeDefined();
    expect(typeof YourComponent).toBe("function");
  });

  // Focus on component behavior, not implementation
});
```

### Pattern 3: Service Testing (from manyllaEncryptionService.basic.test.js)
```javascript
// PROVEN PATTERN - Mock all external dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("tweetnacl", () => ({
  randomBytes: jest.fn((size) => new Uint8Array(size).fill(1)),
  hash: jest.fn((input) => new Uint8Array(64).fill(2)),
  secretbox: Object.assign(
    jest.fn((plaintext, nonce, key) => new Uint8Array(plaintext.length + 16)),
    { nonceLength: 24, open: jest.fn() }
  ),
}));

// Import after mocks
const service = require("../yourService").default;

describe("YourService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state if needed
  });

  it("should handle successful operation", async () => {
    // Test the happy path
    const result = await service.someMethod();
    expect(result).toBeDefined();
  });

  it("should handle error conditions", async () => {
    // Test error scenarios
    await expect(service.someMethod()).rejects.toThrow();
  });
});
```

### Pattern 4: Utility Function Testing (from validation.test.js)
```javascript
// PROVEN PATTERN - Simple utility testing
import { functionName } from "../utilityName";

describe("utilityName", () => {
  describe("functionName", () => {
    it("handles valid input correctly", () => {
      expect(functionName("valid input")).toBe("expected output");
    });

    it("handles edge cases", () => {
      expect(functionName("")).toBe("");
      expect(functionName(null)).toBe(null);
      expect(functionName(undefined)).toBe(undefined);
    });

    it("throws appropriate errors for invalid input", () => {
      expect(() => functionName(123)).toThrow("Expected error message");
    });
  });
});
```

## PEER REVIEW VALIDATION COMMANDS

**The peer reviewer will run EXACTLY these commands. Ensure ALL pass:**

### Coverage Validation
```bash
npm run test:coverage | grep "All files"
# Expected output format:
# All files                            |   60.12 |    61.45 |   62.33 |   60.89 |
# Must show ALL metrics >= 60%

grep -A 5 "Coverage summary" coverage/lcov-report/index.html
# Alternative coverage verification
```

### Test Quality Validation
```bash
# Check for meaningful tests (not just coverage padding)
grep -r "expect.*toBeInTheDocument" src/**/__tests__/
grep -r "fireEvent" src/**/__tests__/
grep -r "waitFor" src/**/__tests__/

# Verify no snapshot tests (unless justified)
grep -r "toMatchSnapshot" src/**/__tests__/
# Should return empty or justified cases only
```

### CI Integration Validation
```bash
npm run test:ci
echo "Exit code: $?"
# Exit code MUST be 0 (success)

# Performance validation
time npm run test:ci
# Total time should be reasonable (baseline + <100ms)
```

### Build Integration Validation
```bash
npm run lint                    # Must pass
npm run typecheck              # Must pass
npm run build:web              # Must succeed
```

### Regression Prevention
```bash
# Verify no unintended changes
git status
git diff package.json          # Should only show coverage threshold changes

# Verify deployment integration
npm run test:ci 2>&1 | grep -i "deployment"
# Deployment tests should still pass
```

## Notes
*This is a CRITICAL P1 story that blocks deployment quality gates. The 60% coverage requirement is non-negotiable for deployment approval.*

**FINAL VALIDATION**: This story is considered COMPLETE only when:
1. ✅ Global coverage >= 60% (all 4 metrics)
2. ✅ All existing tests pass (`npm run test:ci` exit code = 0)
3. ✅ Adversarial peer review APPROVED
4. ✅ Performance impact acceptable (<100ms increase)
5. ✅ No regressions in build or deployment process

**Risk Factors**:
- **HIGH**: Large scope may require breaking into sub-stories if development stalls
- **MEDIUM**: React Native Web mocking complexity may require additional setup
- **MEDIUM**: Some legacy components may be difficult to test without refactoring
- **MEDIUM**: Existing test failures must be resolved before new development
- **LOW**: Performance impact from expanded test suite

**Success Factors**:
- Focus on business-critical components first
- Use existing test patterns as templates
- Prioritize meaningful tests over coverage percentage games
- Leverage automation for repetitive test structure

---
*Story ID: S030*
*Created: 2025-09-14*
*Status: READY*
*Priority: P1 (CRITICAL)*
