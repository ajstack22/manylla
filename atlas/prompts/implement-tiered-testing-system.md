# Atlas Prompt: Implement Tiered Testing System for Production Deployments

## 📋 Task Overview
Implement a tiered testing strategy that separates critical tests (must pass) from non-critical tests (can be flaky), enabling safer production deployments while maintaining code quality.

**Use Atlas Standard workflow for this task.**

---

## 🎯 Objective

**Problem:** Current deployment requires 100% test pass rate, but many UI/integration tests are flaky. This blocks deployments even when critical functionality (security, data integrity) is working perfectly.

**Solution:** Implement a 3-tier test system:
- **Tier 1 (Critical)**: Security, encryption, data integrity - **100% must pass**
- **Tier 2 (Important)**: Core features, business logic - **95%+ should pass**
- **Tier 3 (UI/Integration)**: Rendering, animations, interactions - **Allow failures**

**Goal:** Deploy safely with confidence in critical paths while acknowledging test environment limitations.

---

## 📊 Context

**Current Test Metrics (Example from Manylla):**
```
Test Suites: 27 passed, 39 skipped, 3 failed (90% pass rate)
Tests: 761 passed, 1105 skipped, 14 failed (98% pass rate)
Coverage: 30-40%
```

**Pain Points:**
- ❌ UI tests fail due to test environment issues (not production bugs)
- ❌ Animation/timing tests are flaky in CI
- ❌ 100% requirement blocks valid deployments
- ❌ 39 test suites skipped (32.5% of tests) - poor visibility

**Success Criteria:**
- ✅ Critical tests (encryption, auth, data) run on every deployment
- ✅ Deployment allowed when critical tests pass, even if UI tests fail
- ✅ Clear visibility into test health by tier
- ✅ Gradual reduction in skipped tests

---

## 🏗️ Atlas Workflow Directive

**Workflow Tier:** Standard (30-60 minutes)
**Complexity:** Medium (test categorization + script updates)
**Risk:** Low (only changes test execution, not production code)
**Reversibility:** High (easy to revert to 100% requirement)

---

## Phase 1: Audit - Identify Critical Tests (10-15 min)

### Task 1.1: Categorize Existing Tests

**Step 1: Find all test files**
```bash
find src -name "*.test.js" -o -name "*.test.ts" | wc -l
```

**Step 2: Identify critical test patterns**

**For Manylla (health/privacy app):**
```bash
# Critical: Encryption & Security
find src -path "*/sync/*encryption*.test.js"
find src -path "*/services/*auth*.test.js"
find src -path "*/utils/*security*.test.js"

# Critical: Data Integrity
find src -path "*/sync/*.test.js"
find src -path "*/storage/*.test.js"

# Important: Core Features
find src -path "*/Profile/*.test.js"
find src -path "*/services/*.test.js"

# UI/Integration (can be flaky)
find src -path "*/Navigation/*.test.js"
find src -path "*/components/Common/*.test.js"
```

**For StackMap (code mapping tool):**
```bash
# Critical: Code Analysis & Parsing
find src -path "*/parser/*.test.js"
find src -path "*/analyzer/*.test.js"

# Critical: File Operations
find src -path "*/file*.test.js"
find src -path "*/git*.test.js"

# Important: Mapping Logic
find src -path "*/mapper/*.test.js"

# UI (can be flaky)
find src -path "*/components/*.test.js"
```

**For SmilePile (photo/memory app):**
```bash
# Critical: Photo Processing & Storage
find android -path "*/photo*.test.*" -o -path "*/image*.test.*"
find android -path "*/storage*.test.*"

# Critical: Data Persistence
find android -path "*/database*.test.*"
find android -path "*/repository*.test.*"

# Important: UI Logic
find android -path "*/viewmodel*.test.*"

# UI (can be flaky)
find android -path "*/ui/*.test.*"
find android -path "*/compose/*.test.*"
```

**Step 3: Create categorization matrix**

Create a file `docs/TEST_TIERS.md`:

```markdown
# Test Tier Categorization

## Tier 1: Critical (Must Pass 100%)
**Deployment blocks if ANY test fails**

### Security & Encryption
- [ ] `services/sync/manyllaEncryptionService*.test.js`
- [ ] `services/sync/manyllaMinimalSyncService*.test.js`
- [ ] `utils/SecureRandomService.test.js`

### Data Integrity
- [ ] `services/storageService.test.js`
- [ ] `services/sync/conflictResolver.test.js`

### Authentication (if applicable)
- [ ] `services/authService*.test.js`
- [ ] `utils/inviteCode.test.js`

**Total Critical Tests:** ~15-25 test suites

## Tier 2: Important (95%+ Pass Rate)
**Warning if below threshold, but doesn't block**

### Core Business Logic
- [ ] `components/Profile/*.test.js`
- [ ] `services/photoService.test.js`
- [ ] `utils/validation*.test.js`

### State Management
- [ ] `context/*.test.js`
- [ ] `hooks/*.test.js`

**Total Important Tests:** ~30-50 test suites

## Tier 3: UI/Integration (Flaky Allowed)
**Failures logged but don't block deployment**

### Component Rendering
- [ ] `components/Navigation/*.test.js`
- [ ] `components/Common/*.test.js`
- [ ] `components/Forms/*.test.js`

### Animations & Interactions
- [ ] `components/*/animations.test.js`
- [ ] `components/*/gestures.test.js`

### Integration Tests
- [ ] `__tests__/integration/*.test.js`
- [ ] `e2e/*.test.js`

**Total UI/Integration Tests:** ~40-80 test suites
```

---

## Phase 2: Implementation - Create Test Scripts (15-20 min)

### Task 2.1: Add Tiered Test Scripts to package.json

**Update `package.json` with new test commands:**

```json
{
  "scripts": {
    // Existing
    "test": "jest",
    "test:ci": "jest --ci --coverage --maxWorkers=2",

    // NEW: Tiered test scripts
    "test:critical": "jest --testPathPattern='(encryption|sync.*service|auth|storage)' --bail --maxWorkers=1",
    "test:important": "jest --testPathPattern='(Profile|services|validation|context|hooks)' --coverage",
    "test:ui": "jest --testPathPattern='(components/Common|components/Navigation|components/Forms)' --passWithNoTests",

    // NEW: Smoke tests (ultra-fast critical subset)
    "test:smoke": "jest --testPathPattern='(encryption|auth)' --testNamePattern='should (encrypt|decrypt|authenticate)' --maxWorkers=1",

    // NEW: Coverage by tier
    "test:coverage:critical": "jest --testPathPattern='(encryption|sync|auth|storage)' --coverage --coverageThreshold='{\"global\":{\"statements\":80,\"branches\":75,\"functions\":80,\"lines\":80}}'",

    // NEW: Watch mode by tier
    "test:watch:critical": "jest --watch --testPathPattern='(encryption|sync|auth)'",
    "test:watch:important": "jest --watch --testPathPattern='(Profile|services|validation)'"
  }
}
```

**For Android/Kotlin projects (SmilePile), update `build.gradle.kts`:**

```kotlin
tasks.register("testCritical") {
    group = "verification"
    description = "Run critical tests (encryption, storage, data integrity)"

    dependsOn(":app:testDebugUnitTest")

    doLast {
        exec {
            commandLine("./gradlew", "test",
                "--tests", "*Encryption*",
                "--tests", "*Storage*",
                "--tests", "*Repository*",
                "--fail-fast"
            )
        }
    }
}

tasks.register("testImportant") {
    group = "verification"
    description = "Run important business logic tests"

    dependsOn(":app:testDebugUnitTest")

    doLast {
        exec {
            commandLine("./gradlew", "test",
                "--tests", "*ViewModel*",
                "--tests", "*UseCase*"
            )
        }
    }
}
```

### Task 2.2: Verify Test Scripts Work

**Test each tier individually:**

```bash
# Tier 1: Critical (should be small set, run fast)
npm run test:critical
# Expected: ~15-25 tests, complete in <30 seconds

# Tier 2: Important (medium set)
npm run test:important
# Expected: ~30-50 tests, complete in 1-2 minutes

# Tier 3: UI (large set, some may fail)
npm run test:ui
# Expected: ~40-80 tests, some failures OK

# Smoke tests (ultra-fast sanity check)
npm run test:smoke
# Expected: ~5-10 critical tests, complete in <10 seconds
```

---

## Phase 3: Deployment Integration (15-20 min)

### Task 3.1: Update Deployment Script

**Modify `scripts/deploy-qual.sh` (or equivalent):**

**Find the current test execution:**
```bash
grep -A 10 "npm run test:ci" scripts/deploy-qual.sh
```

**Replace with tiered approach:**

```bash
# ============================================
# STEP 9: TIERED TEST SUITE
# ============================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}9. Running Tiered Test Suite${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Tier 1: Critical Tests (MUST PASS - blocks deployment)
echo -e "${YELLOW}→ Running Tier 1: Critical Tests (encryption, auth, data integrity)...${NC}"
timeout 60 npm run test:critical > /tmp/test-critical.txt 2>&1
CRITICAL_EXIT=$?

if [ $CRITICAL_EXIT -ne 0 ]; then
    cat /tmp/test-critical.txt
    FAILED_COUNT=$(grep -c "●" /tmp/test-critical.txt 2>/dev/null || echo "unknown")
    handle_error "CRITICAL TESTS FAILED ($FAILED_COUNT failures)" \
        "Critical tests must pass 100%. Fix immediately: npm run test:critical"
fi

CRITICAL_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-critical.txt | grep -oE "[0-9]+" || echo "0")
echo -e "${GREEN}✅ Critical tests passed ($CRITICAL_PASSED tests)${NC}"

# Tier 2: Important Tests (95%+ should pass - warning only)
echo -e "${YELLOW}→ Running Tier 2: Important Tests (core features, business logic)...${NC}"
timeout 120 npm run test:important > /tmp/test-important.txt 2>&1
IMPORTANT_EXIT=$?

IMPORTANT_TOTAL=$(grep -oE "[0-9]+ total" /tmp/test-important.txt | head -1 | grep -oE "[0-9]+" || echo "0")
IMPORTANT_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-important.txt | grep -oE "[0-9]+" || echo "0")

if [ $IMPORTANT_TOTAL -gt 0 ]; then
    IMPORTANT_PASS_RATE=$(( IMPORTANT_PASSED * 100 / IMPORTANT_TOTAL ))

    if [ $IMPORTANT_PASS_RATE -lt 95 ]; then
        echo -e "${YELLOW}⚠️  Important test pass rate: ${IMPORTANT_PASS_RATE}% (below 95% threshold)${NC}"
        echo -e "${YELLOW}   Consider fixing before next deployment${NC}"
    else
        echo -e "${GREEN}✅ Important tests: ${IMPORTANT_PASS_RATE}% pass rate ($IMPORTANT_PASSED/$IMPORTANT_TOTAL)${NC}"
    fi
fi

# Tier 3: UI/Integration Tests (informational only)
echo -e "${YELLOW}→ Running Tier 3: UI/Integration Tests (informational)...${NC}"
timeout 120 npm run test:ui > /tmp/test-ui.txt 2>&1
UI_EXIT=$?

UI_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-ui.txt | grep -oE "[0-9]+" || echo "0")
UI_FAILED=$(grep -oE "[0-9]+ failed" /tmp/test-ui.txt | grep -oE "[0-9]+" || echo "0")

if [ $UI_FAILED -gt 0 ]; then
    echo -e "${YELLOW}⚠️  UI tests: $UI_PASSED passed, $UI_FAILED failed (non-blocking)${NC}"
else
    echo -e "${GREEN}✅ UI tests: All $UI_PASSED tests passed${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test Suite Summary:${NC}"
echo -e "${GREEN}  Tier 1 (Critical):  $CRITICAL_PASSED passed ✅${NC}"
echo -e "${GREEN}  Tier 2 (Important): $IMPORTANT_PASSED/$IMPORTANT_TOTAL (${IMPORTANT_PASS_RATE}%)${NC}"
echo -e "${GREEN}  Tier 3 (UI):        $UI_PASSED passed, $UI_FAILED failed${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
```

### Task 3.2: Add Pre-deployment Smoke Test

**Add smoke test before full deployment (optional but recommended):**

```bash
# ============================================
# STEP 0: SMOKE TEST (Before Full Validation)
# ============================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Pre-flight: Smoke Test (10 second sanity check)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

timeout 15 npm run test:smoke > /tmp/test-smoke.txt 2>&1
SMOKE_EXIT=$?

if [ $SMOKE_EXIT -ne 0 ]; then
    cat /tmp/test-smoke.txt
    handle_error "Smoke test failed - basic functionality broken" \
        "Fix critical issues before proceeding: npm run test:smoke"
fi

SMOKE_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-smoke.txt | grep -oE "[0-9]+" || echo "0")
echo -e "${GREEN}✅ Smoke test passed ($SMOKE_PASSED critical tests)${NC}"
echo ""
```

---

## Phase 4: Documentation & Monitoring (10 min)

### Task 4.1: Update Development Documentation

**Create/update `docs/TESTING_STRATEGY.md`:**

```markdown
# Testing Strategy

## Test Execution Tiers

### Quick Reference

| Tier | Purpose | Pass Rate | Blocks Deploy? | Run Time |
|------|---------|-----------|----------------|----------|
| **Smoke** | Sanity check | 100% | ✅ Yes | ~10s |
| **Critical** | Security, data | 100% | ✅ Yes | ~30s |
| **Important** | Core features | 95%+ | ⚠️ Warning | ~2min |
| **UI** | Rendering, UX | Best effort | ❌ No | ~3min |

### Commands

```bash
# Development
npm run test:watch:critical    # Watch critical tests while coding
npm test                        # Run all tests locally

# CI/Deployment
npm run test:smoke             # Fast sanity check (10s)
npm run test:critical          # Must pass for deployment (30s)
npm run test:important         # Should pass 95%+ (2min)
npm run test:ui                # Best effort (3min)

# Coverage
npm run test:coverage:critical # Require 80% coverage on critical code
```

### When to Use Each Tier

**Use `test:smoke` when:**
- Quick sanity check before commit
- Pre-deployment fast validation
- Post-merge verification

**Use `test:critical` when:**
- Before opening PR
- In deployment pipeline (blocks on failure)
- After fixing security issues

**Use `test:important` when:**
- Running full test suite locally
- Weekly test health check
- Investigating coverage gaps

**Use `test:ui` when:**
- Working on UI components
- Debugging test failures
- Improving test coverage

### Adding New Tests

**Decision Tree:**

1. **Does it test encryption, auth, or data integrity?**
   → Add to `test:critical` pattern in package.json

2. **Does it test core business logic or state management?**
   → Add to `test:important` pattern

3. **Does it test UI rendering, animations, or interactions?**
   → Add to `test:ui` pattern

**Example:**
```javascript
// NEW: Critical test (encryption)
// File: services/sync/__tests__/newEncryption.test.js
// Automatically included in test:critical via pattern match

describe('New Encryption Feature', () => {
  test('should encrypt with new algorithm', () => {
    // This will be required to pass for deployment
  });
});
```
```

### Task 4.2: Add Test Health Monitoring

**Create `scripts/test-health-report.sh`:**

```bash
#!/bin/bash

# Test Health Report
# Usage: ./scripts/test-health-report.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║            Test Suite Health Report                       ║"
echo "╟────────────────────────────────────────────────────────────╢"

# Run each tier and capture results
npm run test:critical > /tmp/critical.txt 2>&1
CRITICAL_EXIT=$?

npm run test:important > /tmp/important.txt 2>&1
IMPORTANT_EXIT=$?

npm run test:ui > /tmp/ui.txt 2>&1
UI_EXIT=$?

# Parse results
CRITICAL_PASSED=$(grep -oE "[0-9]+ passed" /tmp/critical.txt | grep -oE "[0-9]+" | head -1 || echo "0")
CRITICAL_FAILED=$(grep -oE "[0-9]+ failed" /tmp/critical.txt | grep -oE "[0-9]+" | head -1 || echo "0")

IMPORTANT_PASSED=$(grep -oE "[0-9]+ passed" /tmp/important.txt | grep -oE "[0-9]+" | head -1 || echo "0")
IMPORTANT_FAILED=$(grep -oE "[0-9]+ failed" /tmp/important.txt | grep -oE "[0-9]+" | head -1 || echo "0")
IMPORTANT_TOTAL=$((IMPORTANT_PASSED + IMPORTANT_FAILED))

UI_PASSED=$(grep -oE "[0-9]+ passed" /tmp/ui.txt | grep -oE "[0-9]+" | head -1 || echo "0")
UI_FAILED=$(grep -oE "[0-9]+ failed" /tmp/ui.txt | grep -oE "[0-9]+" | head -1 || echo "0")

# Display report
echo "║ Tier 1 (Critical): "
if [ $CRITICAL_EXIT -eq 0 ]; then
    echo "║   ✅ $CRITICAL_PASSED passed, 0 failed (100%)"
else
    echo "║   ❌ $CRITICAL_PASSED passed, $CRITICAL_FAILED failed"
fi

echo "║"
echo "║ Tier 2 (Important):"
if [ $IMPORTANT_TOTAL -gt 0 ]; then
    PASS_RATE=$((IMPORTANT_PASSED * 100 / IMPORTANT_TOTAL))
    if [ $PASS_RATE -ge 95 ]; then
        echo "║   ✅ $IMPORTANT_PASSED/$IMPORTANT_TOTAL passed (${PASS_RATE}%)"
    else
        echo "║   ⚠️  $IMPORTANT_PASSED/$IMPORTANT_TOTAL passed (${PASS_RATE}% - below 95%)"
    fi
fi

echo "║"
echo "║ Tier 3 (UI):"
echo "║   ℹ️  $UI_PASSED passed, $UI_FAILED failed (informational)"

echo "╚════════════════════════════════════════════════════════════╝"

# Exit with error if critical tests failed
exit $CRITICAL_EXIT
```

**Make executable:**
```bash
chmod +x scripts/test-health-report.sh
```

---

## Phase 5: Validation & Rollout (5-10 min)

### Task 5.1: Test the New System

**Run validation checks:**

```bash
# 1. Verify all tier scripts work
npm run test:smoke
npm run test:critical
npm run test:important
npm run test:ui

# 2. Verify deployment script integration
./scripts/deploy-qual.sh --dry-run  # If supported

# 3. Run health report
./scripts/test-health-report.sh

# 4. Verify coverage threshold
npm run test:coverage:critical
```

**Expected Results:**
- ✅ Smoke tests complete in <15 seconds
- ✅ Critical tests complete in <60 seconds
- ✅ Critical tests have 100% pass rate
- ✅ Important tests have 95%+ pass rate
- ✅ Deployment script shows tiered results
- ℹ️ UI tests may have failures (acceptable)

### Task 5.2: Update CI/CD Pipeline (if applicable)

**For GitHub Actions (`.github/workflows/test.yml`):**

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    timeout-minutes: 2
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:smoke

  critical-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:critical
      - name: Fail if critical tests fail
        if: failure()
        run: exit 1

  important-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:important
      - name: Warn if pass rate below 95%
        if: failure()
        run: echo "::warning::Important tests below 95% - consider fixing"

  ui-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    continue-on-error: true  # Don't block on UI test failures
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ui
```

---

## Success Criteria

**All tasks complete when:**

- [x] All test files categorized into 3 tiers
- [x] Test tier documentation created (`docs/TEST_TIERS.md`)
- [x] New test scripts added to package.json
- [x] All tier scripts verified working
- [x] Deployment script updated with tiered execution
- [x] Smoke test added to pre-deployment
- [x] Test health monitoring script created
- [x] Testing strategy documented
- [x] CI/CD pipeline updated (if applicable)
- [x] Deployment succeeds with new system

**Quality Gates:**
- ✅ Critical tests run in <60 seconds
- ✅ Critical tests have 100% pass rate
- ✅ Important tests have 95%+ pass rate
- ✅ Deployment only blocks on critical test failures
- ✅ UI test failures don't block deployment
- ✅ Clear visibility into test health by tier

---

## Expected Time Breakdown

| Phase | Tasks | Estimated | Actual |
|-------|-------|-----------|--------|
| Audit | Categorize tests | 10-15 min | |
| Implementation | Add test scripts | 15-20 min | |
| Deployment | Update deploy script | 15-20 min | |
| Documentation | Docs + monitoring | 10 min | |
| Validation | Test & rollout | 5-10 min | |
| **TOTAL** | **55-75 min** | |

---

## Troubleshooting

### Issue: Test patterns don't match expected tests

**Diagnosis:**
```bash
# Check what tests match each pattern
npm run test:critical -- --listTests
npm run test:important -- --listTests
npm run test:ui -- --listTests
```

**Solution:**
Adjust patterns in package.json to match your project structure:
```json
"test:critical": "jest --testPathPattern='(YOUR_PATTERN_HERE)'"
```

---

### Issue: Critical tests take too long (>60 seconds)

**Diagnosis:**
```bash
# Find slow tests
npm run test:critical -- --verbose | grep "PASS\|FAIL"
```

**Solution:**
1. Move slow tests to "important" tier
2. Optimize test setup/teardown
3. Use `--maxWorkers=1` for consistency
4. Mock expensive operations

---

### Issue: Deployment script fails with new test structure

**Diagnosis:**
```bash
# Test deployment script sections individually
bash -x scripts/deploy-qual.sh 2>&1 | grep -A 5 "test:critical"
```

**Solution:**
1. Ensure npm scripts exist before calling them
2. Check exit code handling: `if [ $? -ne 0 ]`
3. Verify timeout values are reasonable
4. Test error handling: `handle_error` function exists

---

### Issue: Can't determine pass rate percentages

**Diagnosis:**
```bash
# Check test output format
npm run test:important 2>&1 | grep -E "passed|failed|total"
```

**Solution:**
Update parsing logic to match your test runner's output:
```bash
# For Jest
TOTAL=$(grep -oE "[0-9]+ total" /tmp/output.txt | grep -oE "[0-9]+" || echo "0")
PASSED=$(grep -oE "[0-9]+ passed" /tmp/output.txt | grep -oE "[0-9]+" || echo "0")

# For other test runners, adjust regex accordingly
```

---

## Project-Specific Adaptations

### For Manylla (React Native + Web)
- Critical: `(encryption|sync.*service|auth|storage|inviteCode)`
- Important: `(Profile|services|validation|context|hooks)`
- UI: `(components/Common|components/Navigation|components/Forms)`

### For StackMap (Code Mapping Tool)
- Critical: `(parser|analyzer|file.*|git.*)`
- Important: `(mapper|indexer|search)`
- UI: `(components|ui|renderer)`

### For SmilePile (Android/Kotlin)
Replace npm scripts with Gradle tasks:
```kotlin
// android/app/build.gradle.kts
tasks.register("testCritical") {
    dependsOn("testDebugUnitTest")
    doLast {
        exec {
            commandLine("./gradlew", "test",
                "--tests", "*Photo*",
                "--tests", "*Storage*",
                "--tests", "*Database*"
            )
        }
    }
}
```

---

## Next Steps After Completion

1. **Monitor Critical Test Health (Week 1)**
   - Run `scripts/test-health-report.sh` daily
   - Track critical test failures immediately

2. **Reduce Skipped Tests (Month 1)**
   - Unskip 5-10 tests per week
   - Move to appropriate tier
   - Fix or remove permanently broken tests

3. **Improve Coverage (Month 2)**
   - Add coverage threshold to important tests: 70%+
   - Add coverage threshold to UI tests: 50%+

4. **Refine Tiers (Month 3)**
   - Review tier assignments based on failure patterns
   - Move flaky tests to appropriate tier
   - Add new critical tests as features are added

---

## Related Documentation

- [Testing Strategy](../../docs/TESTING_STRATEGY.md) - Created by this prompt
- [Test Tiers](../../docs/TEST_TIERS.md) - Created by this prompt
- [Deployment Guide](../../docs/DEPLOYMENT.md) - Updated by this prompt
- [Team Agreements](../../docs/TEAM_AGREEMENTS.md) - May need updates

---

*Generated: 2025-10-02*
*Atlas Framework: Standard Workflow*
*Estimated Time: 55-75 minutes*
*Applies to: Manylla, StackMap, SmilePile*
