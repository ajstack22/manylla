# S041 - Fix Testing Library Node Access Issues (P0)

**Status**: Ready
**Type**: Bug Fix
**Effort**: Small (8h)
**Coverage Target**: Maintain or improve

## Context
ESLint with testing-library rules identified direct DOM node access in tests, which is an anti-pattern. Tests should use Testing Library queries for better maintainability and reliability.

## Requirements for Adversarial Review
1. Remove ALL direct node access in tests
2. Use Testing Library queries instead
3. Tests must still validate same behavior
4. Coverage must not decrease
5. All tests passing
6. Follow Testing Library best practices

## Implementation Steps

### 1. Discovery Phase
```bash
# Find all direct node access in tests
grep -r "container\." src --include="*.test.js" --include="*.spec.js"
grep -r "querySelector" src --include="*.test.js" --include="*.spec.js"
grep -r "getElementsBy" src --include="*.test.js" --include="*.spec.js"

# Specific files identified:
# - src/components/Loading/__tests__/LoadingSpinner.test.js (lines 53, 62)
```

### 2. Fix Pattern

#### WRONG Pattern:
```javascript
const { container } = render(<Component />);
const element = container.querySelector('.some-class');
expect(element).toBeInTheDocument();
```

#### CORRECT Pattern:
```javascript
const { getByTestId, getByText, getByRole } = render(<Component />);
const element = getByRole('button', { name: /submit/i });
expect(element).toBeInTheDocument();
```

### 3. Testing Library Query Priority
Use queries in this order:
1. `getByRole` - Best for accessibility
2. `getByLabelText` - For form elements
3. `getByPlaceholderText` - For inputs without labels
4. `getByText` - For text content
5. `getByDisplayValue` - For input values
6. `getByAltText` - For images
7. `getByTitle` - For title attributes
8. `getByTestId` - Last resort

### 4. Files to Modify
- `src/components/Loading/__tests__/LoadingSpinner.test.js`
- Any other test files with node access violations

### 5. Example Transformations

```javascript
// Before - LoadingSpinner.test.js line 53
const spinner = container.querySelector('.MuiCircularProgress-root');

// After
const spinner = getByRole('progressbar');
// OR if no role
const spinner = getByTestId('loading-spinner'); // Add data-testid to component
```

```javascript
// Before - checking style
expect(container.firstChild.style.opacity).toBe('0.7');

// After
const element = getByTestId('loading-overlay');
expect(element).toHaveStyle({ opacity: 0.7 });
```

### 6. Component Updates (if needed)
If elements can't be queried properly, add appropriate attributes:

```javascript
// In component
<div data-testid="loading-overlay" style={{ opacity: 0.7 }}>
  <CircularProgress role="progressbar" />
</div>
```

## Validation Commands
```bash
# Check for violations
npm run lint 2>&1 | grep "testing-library"

# Run affected tests
npm test LoadingSpinner.test.js
npm test -- --coverage src/components/Loading

# Verify no node access remains
grep -r "container\." src --include="*.test.js" | grep -v "// eslint-disable"

# Full test suite
npm test
```

## Success Criteria for Peer Review
- [ ] Zero direct node access in tests
- [ ] All tests still passing
- [ ] Coverage maintained or improved
- [ ] Uses correct Testing Library queries
- [ ] No ESLint testing-library violations
- [ ] Tests are more readable/maintainable

## Developer Context
You're fixing testing anti-patterns that make tests brittle. Focus on:
- Using semantic queries (role, text) over implementation details
- Making tests more maintainable
- Improving accessibility by using proper roles
- Not just making ESLint happy - actually improving test quality

## Peer Reviewer Validation Script
```bash
#!/bin/bash
echo "=== TESTING LIBRARY NODE ACCESS VALIDATION ==="

# Check for direct node access
NODE_ACCESS=$(grep -r "container\.\|querySelector\|getElementsBy" src --include="*.test.js" | grep -v "^//" | wc -l)
echo "Direct node access instances: $NODE_ACCESS"

# Check ESLint
LINT_ERRORS=$(npm run lint 2>&1 | grep "testing-library/no-node-access" | wc -l)
echo "ESLint testing-library violations: $LINT_ERRORS"

# Run tests
npm test 2>&1 | grep "Test Suites"

# Check specific file
npm test LoadingSpinner.test.js 2>&1 | grep -E "(PASS|FAIL)"

if [ "$NODE_ACCESS" -gt 0 ] || [ "$LINT_ERRORS" -gt 0 ]; then
  echo "❌ REJECTED: Node access still present in tests"
  exit 1
fi

echo "✅ Testing Library validation passed"
```

## Best Practices Reference

### DO:
- Use `screen` for queries when possible
- Use `userEvent` over `fireEvent`
- Query by accessible attributes
- Use `within` for scoped queries
- Add roles/labels to improve testability

### DON'T:
- Query by class names
- Query by HTML structure
- Access container directly
- Test implementation details
- Use array indices to select elements

## Example Full Test Transformation

```javascript
// BEFORE
import { render } from '@testing-library/react';

test('shows loading spinner', () => {
  const { container } = render(<LoadingSpinner show={true} />);
  const spinner = container.querySelector('.MuiCircularProgress-root');
  expect(spinner).toBeInTheDocument();
  expect(container.firstChild.style.opacity).toBe('0.7');
});

// AFTER
import { render, screen } from '@testing-library/react';

test('shows loading spinner', () => {
  render(<LoadingSpinner show={true} />);
  const spinner = screen.getByRole('progressbar');
  expect(spinner).toBeInTheDocument();

  const overlay = screen.getByTestId('loading-overlay');
  expect(overlay).toHaveStyle({ opacity: 0.7 });
});
```

## Notes
- This improves long-term test maintainability
- May require adding test IDs or roles to components
- Peer Reviewer will verify queries follow best practices
- Tests should be more readable after changes