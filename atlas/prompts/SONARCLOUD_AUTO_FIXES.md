# Atlas Auto-Generated: Fix SonarCloud Critical & High Priority Issues

**Generated:** 2025-10-03 12:48:09
**Workflow:** Atlas Standard (5 phases)
**Auto-generated:** Yes (from SonarCloud API)

## 🎯 Issues to Address

### Critical Issues (9)

#### 1. CODE_SMELL: Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allo
- **File:** `src/services/sync/manyllaEncryptionService.js:73`
- **Rule:** javascript:S3776
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

#### 2. CODE_SMELL: Unexpected `await` of a non-Promise (non-"Thenable") value.
- **File:** `src/services/sync/manyllaMinimalSyncServiceNative.js:371`
- **Rule:** javascript:S4123
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

#### 3. CODE_SMELL: Refactor this code to not nest functions more than 4 levels deep.
- **File:** `src/test/utils/component-test-utils.js:49`
- **Rule:** javascript:S2004
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

#### 4. CODE_SMELL: Refactor this function to reduce its Cognitive Complexity from 23 to the 15 allo
- **File:** `src/components/Profile/PhotoUpload.js:36`
- **Rule:** javascript:S3776
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

#### 5. CODE_SMELL: Refactor this function to reduce its Cognitive Complexity from 37 to the 15 allo
- **File:** `src/screens/Onboarding/OnboardingScreen.js:58`
- **Rule:** javascript:S3776
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

#### 6. CODE_SMELL: Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allo
- **File:** `src/services/sync/manyllaMinimalSyncServiceNative.js:509`
- **Rule:** javascript:S3776
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

#### 7. CODE_SMELL: Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allo
- **File:** `src/services/sync/manyllaMinimalSyncServiceNative.js:430`
- **Rule:** javascript:S3776
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

#### 8. CODE_SMELL: Refactor this function to not always return the same value.
- **File:** `src/utils/platformStyles.js:5`
- **Rule:** javascript:S3516
- **Severity:** BLOCKER
- **Type:** CODE_SMELL

#### 9. CODE_SMELL: Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allo
- **File:** `src/services/sync/manyllaMinimalSyncServiceWeb.js:109`
- **Rule:** javascript:S3776
- **Severity:** CRITICAL
- **Type:** CODE_SMELL

### High Priority Issues (348)

#### 1. BUG: This conditional operation returns the same value whether the condition is "true
- **File:** `src/components/Dialogs/index.js:3`
- **Rule:** javascript:S3923
- **Severity:** MAJOR

#### 2. SECURITY_HOTSPOT: Make sure the regex used here, which is vulnerable to super-linear runtime due t
- **File:** `src/components/Forms/HtmlRenderer.js:21`
- **Rule:** unknown
- **Severity:** MEDIUM

#### 3. SECURITY_HOTSPOT: Make sure the regex used here, which is vulnerable to super-linear runtime due t
- **File:** `src/components/Forms/MarkdownField.js:242`
- **Rule:** unknown
- **Severity:** MEDIUM

#### 4. SECURITY_HOTSPOT: Make sure the regex used here, which is vulnerable to super-linear runtime due t
- **File:** `src/components/Forms/SmartTextInput.js:82`
- **Rule:** unknown
- **Severity:** MEDIUM

#### 5. SECURITY_HOTSPOT: Make sure the regex used here, which is vulnerable to super-linear runtime due t
- **File:** `src/components/Forms/SmartTextInput.js:151`
- **Rule:** unknown
- **Severity:** MEDIUM

#### 6. SECURITY_HOTSPOT: Make sure the regex used here, which is vulnerable to super-linear runtime due t
- **File:** `src/utils/validation.js:300`
- **Rule:** unknown
- **Severity:** MEDIUM

#### 7. SECURITY_HOTSPOT: Make sure that using this pseudorandom number generator is safe here.
- **File:** `src/polyfills/getRandomValues.js:31`
- **Rule:** unknown
- **Severity:** MEDIUM

#### 8. CODE_SMELL: Extract this nested ternary operation into an independent statement.
- **File:** `src/components/Navigation/BottomToolbar.js:75`
- **Rule:** javascript:S3358
- **Severity:** MAJOR

#### 9. CODE_SMELL: 'size' is missing in props validation
- **File:** `src/components/Common/ManyllaLogo.js:6`
- **Rule:** javascript:S6774
- **Severity:** MAJOR

#### 10. CODE_SMELL: Extract this nested ternary operation into an independent statement.
- **File:** `src/context/ThemeContext.js:158`
- **Rule:** javascript:S3358
- **Severity:** MAJOR


## 📋 Execution Plan

**Use Atlas Standard workflow:**

### Phase 1: Research (15 min)
- Review each issue above
- Understand the root cause
- Check test coverage for affected areas

### Phase 2: Plan (15 min)
- Prioritize by impact (critical first)
- Identify dependencies between fixes
- Estimate effort for each fix

### Phase 3: Implement (1-3 hours)
- Fix critical issues first (blocks quality gate)
- Then address high priority issues
- Ensure tests pass after each fix
- Run: `npm run test:critical` and `npm run test:important`

### Phase 4: Review (20 min)
- Verify all fixes with local SonarCloud scan
- Run: `npm run sonar`
- Check quality gate status
- Ensure no regressions

### Phase 5: Deploy (20 min)
- Commit with proper message
- Deploy to qual: `./scripts/deploy-qual.sh`
- Verify quality gate: PASSING ✅

## ✅ Success Criteria

- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] Quality gate: PASSING
- [ ] All tests passing
- [ ] No regressions introduced

---

*Auto-generated by sonarcloud-to-atlas.sh*
*See: /tmp/sonar-needs-stories.json for full details*
