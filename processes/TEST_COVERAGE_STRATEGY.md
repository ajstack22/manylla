# Test Coverage Strategy & Enforcement

## EXECUTIVE SUMMARY
This document defines our mandatory test coverage requirements and continuous improvement approach. Every story implementation MUST include tests that increase coverage by at least 10% or maintain 100% coverage.

## COVERAGE GOALS

### Current State (September 2025)
- **Baseline**: 10% overall coverage
- **Target**: 100% coverage by Q1 2026
- **Minimum Increment**: +10% per story

### Roadmap to 100%
```
Current: 10% → 20% → 30% → 40% → 50% → 60% → 70% → 80% → 90% → 100%
Timeline: Sep → Oct → Nov → Dec → Jan → Feb → Mar → Apr → May → Jun
```

## MANDATORY REQUIREMENTS

### Every Story Must:
1. **Increase coverage by ≥10%** OR maintain if already at 100%
2. **Include tests for ALL new code**
3. **Update tests for ALL modified code**
4. **Pass the entire test suite**
5. **Document coverage metrics in PR**

### Coverage Metrics Tracked:
- Statements
- Branches
- Functions
- Lines

All four metrics must meet the minimum threshold.

## TESTING PRIORITIES

### Priority 1: Critical Systems (Target: 95%+)
- Encryption services (`manyllaEncryptionService.js`)
- Sync services (`manyllaMinimalSyncService*.js`)
- Data storage (`ProfileStorageService.js`)
- Authentication/Authorization

### Priority 2: Core Business Logic (Target: 80%+)
- Profile management
- Category operations
- Entry CRUD operations
- Share functionality

### Priority 3: Utilities (Target: 90%+)
- Validation functions
- Data transformers
- Error handlers
- Platform utilities

### Priority 4: UI Components (Target: 60%+)
- Forms and inputs
- Modals and dialogs
- Navigation components
- Display components

### Priority 5: Configuration (Target: 50%+)
- Theme definitions
- Constants
- Static configurations

## TESTING STANDARDS

### Test Quality Requirements
```javascript
// ❌ BAD: Coverage padding
test('component renders', () => {
  render(<Component />);
  expect(true).toBe(true);
});

// ✅ GOOD: Meaningful test
test('validates email format and shows error for invalid input', () => {
  render(<EmailInput />);
  const input = screen.getByRole('textbox');

  fireEvent.change(input, { target: { value: 'invalid-email' } });
  fireEvent.blur(input);

  expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
  expect(input).toHaveAttribute('aria-invalid', 'true');
});
```

### Test Categories Required

#### 1. Unit Tests
- Individual functions
- Isolated components
- Pure utilities
- Business logic

#### 2. Integration Tests
- Component interactions
- Service integrations
- Data flow testing
- API interactions

#### 3. Edge Case Tests
- Boundary conditions
- Error scenarios
- Empty/null states
- Maximum limits

#### 4. Regression Tests
- Bug fix validation
- Prevents reoccurrence
- Documents issues

## ENFORCEMENT MECHANISMS

### 1. Pre-Commit Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run tests
npm test || exit 1

# Check coverage
COVERAGE=$(npm run test:coverage | grep "All files" | awk '{print $10}' | sed 's/%//')
if [ "$COVERAGE" -lt "$PREVIOUS_COVERAGE" ]; then
  echo "❌ Coverage decreased from $PREVIOUS_COVERAGE% to $COVERAGE%"
  exit 1
fi
```

### 2. CI/CD Pipeline
```yaml
# GitHub Actions
test-coverage:
  runs-on: ubuntu-latest
  steps:
    - name: Run Tests with Coverage
      run: |
        npm run test:ci
        npm run test:coverage

    - name: Validate Coverage Increase
      run: |
        ./scripts/validate-coverage-increase.sh

    - name: Comment PR with Coverage
      uses: actions/github-script@v6
      with:
        script: |
          // Post coverage report to PR
```

### 3. Deployment Gate
```bash
# deploy-qual.sh additions
echo "Step 11: Validating test coverage requirements..."
CURRENT_COVERAGE=$(npm run test:coverage | grep "All files" | awk '{print $10}' | sed 's/%//')
REQUIRED_COVERAGE=60  # Increases monthly

if [ "$CURRENT_COVERAGE" -lt "$REQUIRED_COVERAGE" ]; then
  echo "❌ Coverage $CURRENT_COVERAGE% is below required $REQUIRED_COVERAGE%"
  echo "Deployment blocked until coverage improves"
  exit 1
fi
```

## IMPLEMENTATION GUIDE

### Step 1: Identify Coverage Gaps
```bash
# Generate detailed coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# Identify untested files
grep "0%" coverage/lcov-report/index.html
```

### Step 2: Write Tests for New Code
```javascript
// For every new function/component:
// 1. Create corresponding test file
// 2. Test happy path
// 3. Test error conditions
// 4. Test edge cases
// 5. Test integrations
```

### Step 3: Update Tests for Modified Code
```javascript
// When modifying existing code:
// 1. Run existing tests
// 2. Update broken tests
// 3. Add tests for new behavior
// 4. Ensure coverage doesn't decrease
```

### Step 4: Validate Coverage Improvement
```bash
# Before starting work
npm run test:coverage > coverage-before.txt

# After completing work
npm run test:coverage > coverage-after.txt

# Compare
diff coverage-before.txt coverage-after.txt
```

## TESTING PATTERNS

### React Component Testing
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Component', () => {
  it('handles user interactions correctly', async () => {
    renderWithProviders(<Component />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

### Service Testing
```javascript
describe('EncryptionService', () => {
  let service;

  beforeEach(() => {
    service = new EncryptionService();
  });

  it('encrypts and decrypts data correctly', () => {
    const data = { secret: 'test' };
    const encrypted = service.encrypt(data);
    const decrypted = service.decrypt(encrypted);

    expect(decrypted).toEqual(data);
    expect(encrypted).not.toEqual(data);
  });

  it('handles invalid input gracefully', () => {
    expect(() => service.encrypt(null)).toThrow('Invalid input');
  });
});
```

### Async Testing
```javascript
it('handles async operations', async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'test' })
  });
  global.fetch = mockFetch;

  const result = await fetchData();

  expect(mockFetch).toHaveBeenCalledWith('/api/data');
  expect(result).toEqual({ data: 'test' });
});
```

## COMMON TESTING CHALLENGES

### Challenge 1: Canvas/Image Testing
```javascript
// Solution: Mock Canvas API
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4)
    }))
  }));
});
```

### Challenge 2: React Native Web Components
```javascript
// Solution: Mock React Native modules
jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  ScrollView: 'ScrollView',
  View: 'View',
  Text: 'Text'
}));
```

### Challenge 3: localStorage Testing
```javascript
// Solution: Setup localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;
```

## MONTHLY COVERAGE TARGETS

| Month | Target | Focus Area |
|-------|--------|-----------|
| Sep 2025 | 20% | Critical services & utilities |
| Oct 2025 | 30% | Core business logic |
| Nov 2025 | 40% | Major UI components |
| Dec 2025 | 50% | Form components & validation |
| Jan 2026 | 60% | Navigation & routing |
| Feb 2026 | 70% | Edge cases & error handling |
| Mar 2026 | 80% | Integration tests |
| Apr 2026 | 90% | Performance & optimization |
| May 2026 | 95% | Security & encryption |
| Jun 2026 | 100% | Final gap closure |

## REPORTING & METRICS

### Weekly Coverage Report
```bash
#!/bin/bash
# scripts/weekly-coverage-report.sh

echo "=== Weekly Coverage Report ==="
echo "Date: $(date)"
echo ""

npm run test:coverage | grep "All files"

echo ""
echo "Top 5 Least Covered Files:"
npm run test:coverage | grep "^[[:space:]]*[^|]*|" | sort -t'|' -k3 -n | head -5

echo ""
echo "Progress This Week:"
git log --since="1 week ago" --grep="test:" --oneline | wc -l
echo "test commits"
```

### PR Template Addition
```markdown
## Test Coverage
- [ ] Tests added for new code
- [ ] Tests updated for modified code
- [ ] Coverage increased by ≥10% (or maintained at 100%)

### Coverage Metrics
- Before: X%
- After: Y%
- Increase: Z%

### Test Summary
- New test files: X
- Updated test files: Y
- Total tests added: Z
```

## EXCEPTIONS & WAIVERS

### Valid Exceptions (Rare)
1. **Generated code** - May exclude with comment
2. **Third-party integrations** - If thoroughly mocked
3. **Deprecated code** - Scheduled for removal
4. **Config files** - Pure configuration only

### Waiver Process
1. Document reason in PR
2. Get PM approval
3. Create tech debt story for future coverage
4. Set deadline for resolution

## TOOLS & RESOURCES

### Coverage Tools
- **Jest**: Primary test runner
- **React Testing Library**: Component testing
- **Coverage Reports**: HTML, lcov, text
- **SonarQube**: Code quality metrics (future)

### Learning Resources
- [Testing Library Docs](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## SUCCESS METRICS

### Leading Indicators
- Tests per PR
- Coverage trend (weekly)
- Test execution time
- Flaky test count

### Lagging Indicators
- Production bugs
- Regression rate
- Time to fix bugs
- Customer-reported issues

## ACCOUNTABILITY

### Roles & Responsibilities

#### Developers
- Write tests for all code
- Maintain/improve coverage
- Fix broken tests immediately

#### Peer Reviewers
- Verify test coverage
- Validate test quality
- Reject PRs without tests

#### Project Manager
- Track coverage trends
- Enforce standards
- Remove blockers

#### Team Lead
- Set coverage targets
- Review exceptions
- Provide training

## CONTINUOUS IMPROVEMENT

### Monthly Retrospective Topics
1. What prevented us from reaching coverage goals?
2. Which testing patterns worked well?
3. What tools/training do we need?
4. How can we make testing easier?

### Quarterly Review
- Adjust targets based on progress
- Update testing patterns
- Evaluate tool effectiveness
- Celebrate milestones

---

*Remember: Tests are not a burden, they're an investment in code quality, maintainability, and developer confidence. Every test written today prevents a bug tomorrow.*