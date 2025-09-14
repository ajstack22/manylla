# S029: Test Coverage Implementation Approach

## Overview
This document outlines the strategy for increasing test coverage from 7% to 60% minimum across all metrics (statements, branches, functions, lines) for the Manylla project.

## Current State Analysis

### Coverage Baseline (September 14, 2025)
- **Global Coverage**: 7% (all metrics) - FAILING deployment requirements
- **Components**: 1.12% coverage - Critical gap
- **Context**: 66.66% coverage - Good baseline to extend
- **Services**: 67.40% coverage - Good baseline but needs extension
- **Theme**: 0% coverage - Needs implementation
- **Types**: 0% coverage - Needs implementation
- **Utils**: 26.39% coverage - Moderate baseline to build on

### Coverage Targets by Directory
```
src/components/     : 45% (from 1.12%)  - Primary focus area
src/context/        : 80% (from 66.66%) - Extend existing tests
src/services/       : 85% (from 67.40%) - Critical business logic
src/theme/          : 60% (from 0%)     - Basic coverage
src/types/          : 70% (from 0%)     - Type validation
src/utils/          : 75% (from 26.39%) - Utility functions
```

## Implementation Strategy

### Phase 1: High-Value Services (Target: +25% coverage)

#### Priority 1.1: Critical Services
**Files to focus on:**
- `src/services/sync/manyllaEncryptionService.js` - Zero-knowledge encryption (CRITICAL)
- `src/services/sync/manyllaMinimalSyncServiceWeb.js` - Data sync (CRITICAL)
- `src/services/photoService.js` - Photo management (already has tests, extend)

**Testing Approach:**
- **Encryption Service**: Test key derivation, encryption/decryption cycles, UTF-8 handling for iOS compatibility, error conditions
- **Sync Service**: Test backup/restore, network errors, conflict resolution, recovery phrase validation
- **Photo Service**: Extend existing tests with edge cases, error handling

#### Priority 1.2: Context Providers
**Files to extend:**
- `src/context/SyncContext.tsx` - Extend with more sync states, error conditions
- `src/context/ThemeContext.tsx` - Extend with theme switching, persistence

**Testing Approach:**
- Mock underlying services completely
- Test provider state changes, action dispatching
- Test error boundaries and recovery
- Test provider composition and context consumption

#### Priority 1.3: Utility Functions
**Files to focus on:**
- `src/utils/validation.js` - Data validation (0% coverage, high impact)
- `src/utils/imageUtils.js` - Image processing (9% coverage)
- `src/utils/inviteCode.js` - Invite/share codes (0% coverage)
- Extend: `src/utils/errors.js`, `src/utils/platform.js` (existing tests)

**Testing Approach:**
- Test all validation rules, edge cases, malformed input
- Test image processing functions, format conversion, error handling
- Test invite code generation, validation, expiration
- Add comprehensive error condition testing

### Phase 2: Core Components (Target: +20% coverage)

#### Priority 2.1: Navigation Components
- `src/components/Navigation/BottomToolbar.js` (extend existing tests)
- `src/components/Navigation/BottomSheetMenu.js` (new tests)

**Testing Approach:**
- Test navigation state changes, active states
- Test touch interactions, accessibility
- Test responsive behavior, platform differences
- Mock navigation dependencies

#### Priority 2.2: Profile Management
- `src/components/Profile/ProfileCard.js`
- `src/components/Profile/ProfileEditDialog.js`
- `src/components/Profile/ProfileCreateDialog.js`
- `src/components/Profile/CategorySection.js`

**Testing Approach:**
- Test CRUD operations, form validation
- Test modal open/close states, data flow
- Test profile state management integration
- Mock Material-UI Dialog components to avoid rendering issues

#### Priority 2.3: Critical Dialogs
- `src/components/Dialogs/UnifiedAddDialog.js`
- `src/components/Sharing/ShareDialogOptimized.js`
- `src/components/Sync/SyncDialog.js`

**Testing Approach:**
- Test dialog lifecycle, form submission
- Test data validation, error display
- Test integration with context providers
- Mock external service calls

### Phase 3: Supporting Components (Target: +10% coverage)

#### Layout & Common Components
- `src/components/Layout/Header.js`
- `src/components/Common/ThemeSwitcher.js`
- `src/components/Common/ImagePicker.js`
- `src/components/Common/ThemedModal.js`

**Testing Approach:**
- Test basic rendering, prop handling
- Test theme integration, responsive behavior
- Test user interactions, state changes
- Keep tests focused on behavior, not implementation

#### Forms & Input Components
- `src/components/Forms/MarkdownField.js`
- `src/components/Forms/SmartTextInput.js`
- `src/components/Forms/MarkdownRenderer.js`

**Testing Approach:**
- Test input handling, validation display
- Test markdown parsing, rendering output
- Test accessibility features, keyboard navigation
- Mock complex dependencies (markdown parsers)

### Phase 4: Data Models & Theme (Target: +5% coverage)

#### Type Definitions & Theme
- `src/types/ChildProfile.js` - Type validation functions
- `src/theme/theme.js` - Theme configuration
- `src/theme/modalTheme.js` - Modal theming

**Testing Approach:**
- Test type validation functions, schema compliance
- Test theme object structure, color calculations
- Test theme provider integration
- Focus on exported functions, not just object exports

## Technical Implementation Details

### Testing Framework Setup
- **Framework**: Jest with React Testing Library (existing setup)
- **Mocking Strategy**: Mock external dependencies (Material-UI, React Native components)
- **Environment**: jsdom for component testing
- **Coverage**: Use existing Jest coverage configuration

### Mock Strategy

#### Component Testing Mocks
```javascript
// Mock Material-UI components that cause rendering issues
jest.mock('@mui/material/Dialog', () => ({ children, open }) =>
  open ? <div data-testid="mock-dialog">{children}</div> : null
);

// Mock React Native components
jest.mock('react-native', () => require('react-native-web'));

// Mock image picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn()
}));
```

#### Service Testing Mocks
```javascript
// Mock fetch for service tests
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));
```

#### Context Provider Mocks
```javascript
// Create test wrapper for context providers
const TestProviders = ({ children }) => (
  <CustomThemeProvider>
    <ThemeProvider theme={theme}>
      <SyncProvider>
        {children}
      </SyncProvider>
    </ThemeProvider>
  </CustomThemeProvider>
);
```

### Error Testing Strategy
- **Network Errors**: Test service failure scenarios, timeout handling
- **Validation Errors**: Test malformed input, boundary conditions
- **State Errors**: Test context provider error states, recovery mechanisms
- **UI Errors**: Test component error boundaries, graceful degradation

### Async Testing Patterns
```javascript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText(/success message/i)).toBeInTheDocument();
});

// Test service promises
await expect(syncService.backup(data)).resolves.toEqual(expectedResult);
await expect(syncService.backup(null)).rejects.toThrow('Invalid data');
```

### Performance Considerations
- **Test Execution Time**: Target <100ms increase overall
- **Mock Optimization**: Use lightweight mocks, avoid heavy rendering
- **Selective Testing**: Focus on business logic, avoid trivial getter/setter tests
- **Parallel Execution**: Leverage Jest's parallel test execution

### Quality Assurance

#### Meaningful Test Criteria
- **Behavior Testing**: Test user interactions and outcomes, not implementation details
- **Edge Case Coverage**: Test boundary conditions, error states, empty data
- **Integration Testing**: Test component interactions with context providers
- **Accessibility Testing**: Include basic a11y assertions where relevant

#### Test Patterns to Avoid
- **Snapshot Testing**: Avoid unless absolutely necessary (as per story requirements)
- **Implementation Detail Testing**: Don't test internal component state directly
- **Trivial Tests**: Avoid testing simple getters, setters, or pass-through functions
- **Mock Overuse**: Don't mock everything - test real behavior where possible

## Risk Mitigation

### Technical Risks
- **React Native Web Compatibility**: Use established mocking patterns, test on jsdom
- **Material-UI Integration**: Mock problematic components, focus on behavior
- **Async Testing Complexity**: Use established waitFor patterns, proper error handling
- **Performance Impact**: Monitor test execution time, optimize slow tests

### Implementation Risks
- **Scope Creep**: Stick to coverage targets, don't over-engineer tests
- **Time Management**: Prioritize high-impact tests first, track progress
- **Quality vs Quantity**: Focus on meaningful tests, not just coverage percentage
- **Existing Test Regression**: Run full test suite frequently, maintain compatibility

### Rollback Strategy
- **Modular Implementation**: Implement by phase, can rollback individual phases
- **Coverage Tracking**: Monitor coverage after each phase, adjust if needed
- **Test Isolation**: Each new test file is independent, easy to remove if problematic
- **Configuration Rollback**: Coverage thresholds can be adjusted if targets not met

## Success Metrics

### Coverage Targets (Must Achieve)
- **Statements**: ≥ 60%
- **Branches**: ≥ 60%
- **Functions**: ≥ 60%
- **Lines**: ≥ 60%

### Quality Metrics
- **All Tests Pass**: 100% test pass rate in CI environment
- **Performance**: <100ms increase in total test execution time
- **No Regressions**: All existing tests continue to pass
- **Meaningful Coverage**: Focus on business logic, user interactions

### Verification Commands
```bash
npm run test:coverage              # Verify 60%+ coverage
npm run test:ci                    # Verify CI environment passes
npm run lint                       # Verify no linting errors
npm run typecheck                  # Verify no TypeScript errors
npm run build:web                  # Verify build still works
```

## Implementation Timeline

### Phase 1 (Days 1-3): High-Value Services
- Day 1: Encryption service comprehensive tests
- Day 2: Sync service tests, context provider extensions
- Day 3: Utility function tests, validation logic

### Phase 2 (Days 4-6): Core Components
- Day 4: Navigation component tests
- Day 5: Profile management component tests
- Day 6: Critical dialog component tests

### Phase 3 (Days 7-8): Supporting Components
- Day 7: Layout and common component tests
- Day 8: Form and input component tests

### Phase 4 (Day 9): Data Models & Theme
- Day 9: Type definitions and theme tests

### Phase 5 (Day 10): Verification & Review
- Day 10: Coverage verification, performance testing, adversarial review

## Conclusion

This approach prioritizes high-impact testing that validates actual functionality while achieving the required 60% coverage target. The phased implementation allows for course correction and ensures we build meaningful test coverage that will benefit long-term code quality and deployment confidence.

The focus on business-critical services first (encryption, sync, validation) ensures that even if we don't reach 60% coverage, we'll have tested the most important functionality. The component testing strategy emphasizes user behavior and integration points rather than implementation details.

By following this approach, we'll create a robust test suite that not only meets the coverage requirements but also provides ongoing value for regression testing and code quality assurance.