# Story S019: Add default case to switch statements (P3)

## Overview
Ensure all switch statements in the codebase have appropriate default cases for code safety, maintainability, and to follow JavaScript best practices.

## Status
- **Priority**: P3 (Code Quality)
- **Status**: COMPLETED
- **Created**: 2025-09-13
- **Type**: Code Quality/Tech Debt
- **Effort**: Small (2-4h)

## 🚨 ADVERSARIAL REVIEW NOTICE
This story will be implemented through the Adversarial Review Process documented in `processes/ADVERSARIAL_REVIEW_PROCESS.md`. The peer reviewer will independently verify EVERY requirement and actively look for reasons to reject the implementation.

## Context & Impact
Switch statements without default cases can lead to:
- **Silent failures** when unexpected values are passed
- **Debugging complexity** in production environments
- **Code maintainability issues** when new cases are added
- **ESLint violations** if `default-case` rule is enabled

This is a **preventive code quality measure** that improves robustness and follows industry best practices.

## Current State Analysis
Based on comprehensive codebase analysis, **ALL 10 switch statements already have default cases**:

1. `/src/context/ToastContext.js` - Toast icon selection (✅ has default)
2. `/src/components/Toast/ToastManager.js` - Duration calculation (✅ has default)
3. `/src/components/Toast/ToastManager.js` - Icon selection (✅ has default)
4. `/src/components/Navigation/BottomToolbar.js` - Sync status colors (✅ has default)
5. `/src/components/Navigation/BottomSheetMenu.js` - Keyboard shortcuts (⚠️ no default - intentional)
6. `/src/components/Modals/PrivacyModal/PrivacyModal.js` - Content rendering (✅ has default)
7. `/src/components/Modals/SupportModal/SupportModal.js` - Content rendering (⚠️ no default)
8. `/src/components/Common/ThemeSwitcher.js` - Icon selection (3 instances, ✅ all have default)
9. `/src/components/Onboarding/ProgressiveOnboarding.js` - Step calculation (2 instances, ✅ both have default)
10. `/src/components/Sync/SyncDialog.js` - Mode rendering (✅ has default)

## Requirements

### 1. Audit and Analysis
- [ ] **Run comprehensive search** for all switch statements: `grep -r "switch\s*(" src/ --include="*.js"`
- [ ] **Document each switch statement** with its purpose and current default case status
- [ ] **Identify missing default cases** that need to be added
- [ ] **Validate existing default cases** are appropriate and meaningful

### 2. Implementation Rules
- [ ] **Add meaningful default cases** where missing (not just empty defaults)
- [ ] **Use appropriate fallback behavior**:
  - Return sensible default values for data functions
  - Log warnings for unexpected enum values
  - Throw descriptive errors for invalid states
- [ ] **Preserve existing behavior** - don't change working logic
- [ ] **Add JSDoc comments** explaining default case reasoning

### 3. Quality Standards
- [ ] **No breaking changes** to existing functionality
- [ ] **Consistent error handling** patterns across similar switch statements
- [ ] **Meaningful console warnings** for unexpected values (not errors that break flow)
- [ ] **Code comments** explaining why specific default actions were chosen

## Detailed Implementation Steps

### Step 1: Comprehensive Switch Statement Audit
```bash
# Find all switch statements
grep -r "switch\s*[(]" src/ --include="*.js" -n

# Find switch statements without default cases
grep -r -A 20 "switch\s*[(]" src/ --include="*.js" | grep -B 20 -v "default:"

# Validate existing default cases are reachable
grep -r -A 10 "default:" src/ --include="*.js"
```

### Step 2: Analyze Each Switch Statement
For each switch statement, determine:

1. **Purpose**: What does this switch control?
2. **Input domain**: What values are expected?
3. **Current default**: Does it exist? Is it appropriate?
4. **Risk level**: What happens if an unexpected value is passed?
5. **Action needed**: Add default, improve existing, or document as intentionally missing

### Step 3: Implementation Patterns

**For UI rendering switches:**
```javascript
switch (item.type) {
  case "title":
    return <Text style={styles.title}>{item.text}</Text>;
  case "subtitle":
    return <Text style={styles.subtitle}>{item.text}</Text>;
  default:
    console.warn(`Unknown item type: ${item.type}`);
    return null; // Graceful degradation
}
```

**For data transformation switches:**
```javascript
switch (type) {
  case "error":
    return 5000;
  case "warning":
    return 4000;
  default:
    console.warn(`Unknown toast type: ${type}, using default duration`);
    return 3000; // Safe fallback
}
```

**For event handling switches (keyboard shortcuts):**
```javascript
switch (event.key) {
  case "Escape":
    onClose();
    break;
  case "Enter":
    onSubmit();
    break;
  // Note: Intentionally no default case
  // Other keys should be passed through to default browser handling
}
```

## Files Likely to Need Updates

Based on analysis, focus on these files:

### High Priority
1. **`/src/components/Modals/SupportModal/SupportModal.js`**
   - Switch statement around line 45-60
   - Missing default case for content rendering
   - **Action**: Add `default: return null;` with warning

### Medium Priority
2. **`/src/components/Navigation/BottomSheetMenu.js`**
   - Switch statement around line 25-40
   - Keyboard shortcut handling - may be intentionally missing default
   - **Action**: Evaluate if default case should be added or documented as intentional

### Verification Files
3. **All other switch statements** should be verified to ensure default cases are:
   - Present
   - Meaningful (not just empty returns)
   - Properly handle edge cases
   - Include appropriate logging

## Success Criteria & Verification Commands

### Automated Verification
```bash
# 1. Verify no switch statements lack default cases
grep -r -A 20 "switch\s*[(]" src/ --include="*.js" > temp_switches.txt
# Expected: All switch blocks should contain "default:"

# 2. Check for empty or trivial default cases
grep -r -A 2 "default:" src/ --include="*.js" | grep -E "(return null;|break;)$"
# Expected: Default cases should have meaningful actions or comments

# 3. Verify no compilation errors
npm run build:web
# Expected: Clean build with no errors

# 4. Verify no new linting violations
npm run lint
# Expected: No increase in linting warnings

# 5. Verify tests pass
npm test
# Expected: All existing tests continue to pass
```

### Manual Verification Checklist
- [ ] **Switch Statement Audit**: All switch statements identified and documented
- [ ] **Default Cases Present**: Every switch has appropriate default case or documented reason for omission
- [ ] **Meaningful Defaults**: Default cases provide useful fallback behavior, not just empty returns
- [ ] **Consistent Patterns**: Similar switch statements use similar default case patterns
- [ ] **Error Handling**: Default cases include appropriate logging for unexpected values
- [ ] **No Breaking Changes**: Existing functionality preserved exactly
- [ ] **Documentation**: JSDoc comments explain default case reasoning where non-obvious

## Edge Cases & Considerations

### 1. Event Handler Switches
**Issue**: Keyboard shortcut switches may intentionally omit defaults to allow event bubbling
**Solution**: Document decision and add comment explaining intentional omission

### 2. Enum-Based Switches
**Issue**: TypeScript enums may make default cases seem unnecessary
**Solution**: Add runtime safety for production environments where types aren't enforced

### 3. Performance Sensitive Switches
**Issue**: Adding logging to default cases might impact performance
**Solution**: Use conditional logging based on environment (development only)

### 4. State Machine Switches
**Issue**: Some switches represent state machines where unexpected states should throw
**Solution**: Use descriptive error messages and fail fast for invalid states

## Code Quality Standards

### Default Case Patterns
```javascript
// ✅ Good: Meaningful fallback with logging
default:
  console.warn(`Unknown sync status: ${syncStatus}, using default color`);
  return colors.text?.primary || "#A08670";

// ✅ Good: Graceful degradation for UI
default:
  console.warn(`Unknown content type: ${item.type}`);
  return null; // Don't render unknown types

// ❌ Bad: Silent failure
default:
  return null;

// ❌ Bad: Cryptic fallback
default:
  return "default";
```

### JSDoc Documentation
```javascript
/**
 * Renders content based on item type
 * @param {Object} item - Content item with type property
 * @returns {React.Element|null} Rendered element or null for unknown types
 */
switch (item.type) {
  // ... cases
  default:
    // Log warning for debugging while gracefully handling unknown types
    console.warn(`Unknown content type '${item.type}' in renderItem`);
    return null;
}
```

## Testing Requirements

### Unit Tests
- [ ] **Test default case behavior** for each modified switch statement
- [ ] **Verify warning messages** are logged for unknown values
- [ ] **Confirm fallback values** are correct and safe
- [ ] **Test edge cases** with null, undefined, and unexpected values

### Integration Tests
- [ ] **End-to-end functionality** remains unchanged
- [ ] **No visual regressions** in UI components
- [ ] **Performance impact** is negligible

## Dependencies
- **Prerequisite**: Understanding of React component lifecycle
- **Knowledge**: ESLint configuration and JavaScript best practices
- **Tools**: Familiarity with grep/ripgrep for codebase analysis

## Estimated Effort Breakdown
- **Research & Analysis**: 1 hour (switch statement audit)
- **Implementation**: 1.5 hours (adding/improving default cases)
- **Testing & Verification**: 1 hour (manual testing and validation)
- **Documentation**: 0.5 hours (JSDoc comments and code review prep)
- **Total**: 4 hours (Small)

## Success Metrics
```bash
# Primary success metric
grep -r "switch\s*(" src/ --include="*.js" | wc -l
# Expected: All switch statements found

grep -r -A 20 "switch\s*[(]" src/ --include="*.js" | grep -c "default:"
# Expected: Count equals or exceeds switch statement count

# Quality metrics
npm run lint 2>&1 | grep -c "warning"
# Expected: No increase in warnings

npm run build:web 2>&1 | grep -c "error"
# Expected: 0 build errors

npm test 2>&1 | grep "Tests.*passed"
# Expected: All tests passing
```

## Roles & Responsibilities

### Developer Role
- **Focus**: Systematic analysis and implementation
- **Approach**: Use provided grep commands to audit all switch statements
- **Priority**: Code safety and maintainability over performance
- **Validation**: Test each change with unexpected input values

### Peer Reviewer Role
- **Focus**: Verify EVERY switch statement independently
- **Approach**: Run audit commands independently, don't trust developer's analysis
- **Priority**: Find any missing default cases or inappropriate fallback behavior
- **Validation**: Test edge cases and confirm logging works correctly

---
*Story ID: S019*
*Created: 2025-09-14*
*Status: READY FOR ADVERSARIAL REVIEW*
*Estimated: Small (4h)*
