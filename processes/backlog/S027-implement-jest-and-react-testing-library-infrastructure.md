# Story S027: Implement Jest and React Testing Library Infrastructure

## Overview
Transform Manylla from having no automated tests to having a mandatory testing pipeline that blocks deployments if tests fail. Based on StackMap's successful implementation that achieved 24+ passing tests with zero ability to bypass quality gates.

## Status
- **Priority**: P1 (High - Do Next)
- **Status**: READY
- **Created**: 2025-09-14
- **Assigned**: Unassigned
- **Type**: INFRASTRUCTURE
- **Effort**: Medium (24h)

## Background
Manylla currently has no automated testing infrastructure, creating deployment risks and making refactoring dangerous. StackMap successfully implemented Jest and React Testing Library, going from 0 to 24+ mandatory tests that run on every deployment. This story brings the same robust testing infrastructure to Manylla, ensuring code quality and preventing production bugs.

## Requirements

### 1. Jest Testing Infrastructure
- Install and configure Jest for React Native Web
- Set up React Testing Library with proper mocks
- Configure test environment for Manylla's unified codebase
- Handle React Native Web specific testing challenges

### 2. Initial Test Suite
- Create component tests for critical UI components
- Add integration tests for state management (Context API)
- Write tests for encryption service (critical path)
- Ensure minimum 10 passing tests before completion

### 3. Deployment Pipeline Integration
- Integrate tests into deploy-qual.sh
- Make tests mandatory (cannot be skipped)
- Block deployment if any test fails
- Add clear test result reporting

### 4. Developer Experience
- Add npm scripts for test execution
- Configure watch mode for development
- Set up coverage reporting
- Create test file templates

## Success Metrics
```bash
# All commands must pass before story is complete

# 1. Tests run successfully
npm test
# Expected: At least 10 tests passing, 0 failing

# 2. Coverage report generates
npm run test:coverage
# Expected: Coverage report generated, minimum 30% coverage

# 3. Deployment script runs tests
./scripts/deploy-qual.sh --dry-run
# Expected: Tests execute, deployment blocked if tests fail

# 4. No ability to skip tests
grep -r "skip-tests" scripts/
# Expected: 0 results (flag completely removed)

# 5. Watch mode works
npm run test:watch
# Expected: Tests re-run on file changes
```

## Implementation Guidelines

### Phase 1: Installation and Configuration (4 hours)
1. **Install Dependencies**
   ```bash
   npm install --save-dev --legacy-peer-deps \
     @testing-library/react-native \
     @testing-library/jest-native \
     @testing-library/react-hooks \
     jest-environment-jsdom \
     @babel/preset-react
   ```

2. **Create Configuration Files**
   - `jest.config.js` - Use StackMap's config as template
   - `jest.setup.js` - Mock React Native modules
   - `__mocks__/svgMock.js` - Handle SVG imports

3. **Update package.json**
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage",
     "test:pre-commit": "jest --bail --findRelatedTests"
   }
   ```

### Phase 2: Write Initial Tests (8 hours)
1. **Component Tests** (minimum 3 components)
   - `src/components/Navigation/BottomToolbar/__tests__/BottomToolbar.test.js`
   - `src/components/Profile/ProfileCard/__tests__/ProfileCard.test.js`
   - `src/components/Dialogs/AddEditDialog/__tests__/AddEditDialog.test.js`

2. **Service Tests** (critical paths)
   - `src/services/sync/__tests__/manyllaEncryptionService.test.js`
   - `src/services/sync/__tests__/manyllaMinimalSyncService.test.js`

3. **Context Tests** (state management)
   - `src/context/__tests__/ProfileContext.test.js`
   - `src/context/__tests__/SyncContext.test.js`

### Phase 3: Deployment Integration (4 hours)
1. **Update deploy-qual.sh**
   - Remove any --skip-tests flag completely
   - Add mandatory test execution before build
   - Block deployment on test failure
   - Add clear success/failure messaging

2. **Test the Pipeline**
   - Run full deployment with passing tests
   - Verify deployment blocked with failing test
   - Ensure no workarounds exist

### Phase 4: Documentation and Training (4 hours)
1. **Create Testing Documentation**
   - `docs/testing/README.md` - Testing guide
   - `docs/testing/examples.md` - Test examples
   - Update CLAUDE.md with testing requirements

2. **Set Up Templates**
   - Component test template
   - Service test template
   - Integration test template

### Phase 5: Verification (4 hours)
1. **Run Complete Test Suite**
2. **Generate Coverage Report**
3. **Test Deployment Pipeline End-to-End**
4. **Create PR with All Changes**

## Technical Details

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgMock.js',
  },
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx}',
    '**/?(*.)+(spec|test).{js,jsx}',
  ],
  verbose: true,
};
```

### Test File Structure
```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.js
│       └── __tests__/
│           └── ComponentName.test.js
└── services/
    ├── serviceName.js
    └── __tests__/
        └── serviceName.test.js
```

## Acceptance Criteria
- [ ] Jest and React Testing Library installed with all dependencies
- [ ] Configuration files created (jest.config.js, jest.setup.js)
- [ ] Minimum 10 tests written and passing
- [ ] Tests integrated into deploy-qual.sh (mandatory execution)
- [ ] --skip-tests flag completely removed from all scripts
- [ ] npm test scripts added to package.json
- [ ] Coverage reporting configured and working
- [ ] Documentation created in docs/testing/
- [ ] No ability to bypass tests during deployment
- [ ] Build passes with all tests
- [ ] Deployment blocked if any test fails
- [ ] Clear test results shown in deployment output

## Risk Mitigation
- **Risk**: React 19.1.0 peer dependency conflicts
  - **Mitigation**: Use --legacy-peer-deps flag during installation

- **Risk**: React Native Web module conflicts
  - **Mitigation**: Use testEnvironment: 'node' instead of 'jsdom'

- **Risk**: Style testing complications
  - **Mitigation**: Test functionality over styles, use objectContaining for style assertions

- **Risk**: Slow test execution
  - **Mitigation**: Keep initial test suite focused on critical paths

## Dependencies
- No blocking dependencies
- Can be implemented independently
- Enhances all future development work

## Estimated Effort
- **Installation & Config**: 4 hours
- **Initial Test Suite**: 8 hours
- **Deployment Integration**: 4 hours
- **Documentation**: 4 hours
- **Verification & Polish**: 4 hours
- **Total**: 24 hours (3 days)

## Expected Outcomes
1. **Immediate**
   - 10+ automated tests running on every deployment
   - Zero ability to skip quality gates
   - Deployment blocked on test failure

2. **Short-term (1 month)**
   - 50+ tests covering critical paths
   - 40% code coverage
   - Reduced production bugs

3. **Long-term (3 months)**
   - 100+ tests with 60% coverage
   - Developer confidence in refactoring
   - Significantly reduced debugging time

## Notes
This implementation follows StackMap's proven approach, which successfully transformed their project from zero testing to mandatory quality gates. The same patterns and configurations will work for Manylla with minor adjustments for the different state management approach (Context API vs Zustand).

Key difference from StackMap:
- Manylla uses Context API instead of Zustand for state
- Manylla has encryption services that need careful testing
- Manylla's deploy script is deploy-qual.sh (not qual_deploy.sh)

---
*Story ID: S027*
*Created: 2025-09-14*
*Status: READY*
*Based on: StackMap Jest Implementation Guide v2025.09.14.4*