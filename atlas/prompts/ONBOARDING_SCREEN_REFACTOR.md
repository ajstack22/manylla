# Atlas Prompt: Refactor OnboardingScreen.js for Cognitive Complexity

**Generated:** 2025-10-03
**Workflow:** Atlas Standard (5 phases)
**Priority:** CRITICAL
**Estimated Effort:** 2-3 hours

## 🎯 Objective

Reduce cognitive complexity in `src/screens/Onboarding/OnboardingScreen.js` from 37 to ≤15 to meet SonarCloud quality threshold.

**File Stats:**
- **Lines of Code:** 857
- **Current Complexity:** 37
- **Target Complexity:** ≤15
- **SonarCloud Rule:** javascript:S3776

## 📋 Problem Analysis

The OnboardingScreen component is a monolithic 857-line file with high cognitive complexity due to:

1. **Multiple responsibilities in one component:**
   - Form state management (step navigation, input handling)
   - Photo upload handling (web vs mobile, validation, processing)
   - Date formatting and validation
   - Profile creation logic
   - Storage operations
   - Error handling

2. **Complex conditional rendering:**
   - Multi-step wizard (4 steps)
   - Platform-specific logic (web vs mobile)
   - Nested conditionals for validation

3. **Inline event handlers:**
   - Photo picker logic embedded in component
   - Form validation scattered throughout
   - Complex save operations

## 🔧 Refactoring Strategy

### Phase 1: Extract Custom Hooks (Reduces state complexity)

Create separate hooks for distinct concerns:

**1.1 `useOnboardingForm.js`**
- Manages step navigation state
- Handles form field state (name, DOB, photo)
- Provides validation helpers
- Estimated complexity reduction: ~8 points

**1.2 `usePhotoUpload.js`**
- Handles photo picker logic (web/mobile)
- Photo validation
- Processing state management
- Estimated complexity reduction: ~10 points

**1.3 `useDateFormatter.js`**
- Date input formatting (MM/DD/YYYY)
- Date validation
- Estimated complexity reduction: ~3 points

### Phase 2: Extract UI Components (Reduces render complexity)

Break down the monolithic render into smaller components:

**2.1 `OnboardingStep1.js` - Welcome Screen**
- Ellie mascot display
- Welcome message
- "Get Started" button

**2.2 `OnboardingStep2.js` - Profile Form**
- Name input
- Date of birth input
- Photo upload section
- Form validation display

**2.3 `OnboardingStep3.js` - Category Selection**
- Category grid display
- Selection handling

**2.4 `OnboardingStep4.js` - Completion**
- Summary display
- Finish button

**2.5 `PhotoUploadSection.js`**
- Photo preview
- Upload/remove buttons
- Error display
- Processing indicator

**2.6 `DateInput.js`**
- Formatted date input field
- Platform-specific handling
- Validation feedback

### Phase 3: Extract Business Logic (Reduces method complexity)

Create utility functions/services:

**3.1 `onboardingValidation.js`**
```javascript
- validateName(name)
- validateDateOfBirth(date)
- validatePhoto(file)
- validateStep(stepNumber, formData)
```

**3.2 `profileCreation.js`**
```javascript
- createInitialProfile(formData)
- saveProfile(profile)
- handleProfileError(error)
```

**3.3 `photoProcessing.js`**
```javascript
- processWebPhoto(file)
- processMobilePhoto(result)
- validateImageFile(file)
```

### Phase 4: Simplify Main Component

After extraction, the main `OnboardingScreen.js` should become a thin orchestration layer:

```javascript
const OnboardingScreen = ({ onComplete, onShowPrivacy }) => {
  const { colors } = useTheme();
  const form = useOnboardingForm();
  const photo = usePhotoUpload();
  const dateFormatter = useDateFormatter();

  const handleComplete = async () => {
    const profile = await createProfile(form.data, photo.data);
    await saveProfile(profile);
    onComplete(profile);
  };

  return (
    <OnboardingStepContainer step={form.step}>
      {form.step === 0 && <OnboardingStep1 onNext={form.nextStep} />}
      {form.step === 1 && (
        <OnboardingStep2
          form={form}
          photo={photo}
          dateFormatter={dateFormatter}
          onNext={form.nextStep}
        />
      )}
      {form.step === 2 && <OnboardingStep3 onNext={form.nextStep} />}
      {form.step === 3 && <OnboardingStep4 onComplete={handleComplete} />}
    </OnboardingStepContainer>
  );
};
```

**Target complexity:** ~8-10 points

## 📁 Proposed File Structure

```
src/screens/Onboarding/
├── OnboardingScreen.js                 # Main orchestrator (simplified)
├── hooks/
│   ├── useOnboardingForm.js           # Form state & navigation
│   ├── usePhotoUpload.js              # Photo handling
│   └── useDateFormatter.js            # Date formatting
├── components/
│   ├── OnboardingStep1.js             # Welcome screen
│   ├── OnboardingStep2.js             # Profile form
│   ├── OnboardingStep3.js             # Category selection
│   ├── OnboardingStep4.js             # Completion
│   ├── PhotoUploadSection.js          # Photo upload UI
│   ├── DateInput.js                   # Date input field
│   └── OnboardingStepContainer.js     # Wrapper for steps
└── utils/
    ├── onboardingValidation.js        # Validation logic
    ├── profileCreation.js             # Profile creation
    └── photoProcessing.js             # Photo processing
```

## ✅ Acceptance Criteria

1. **Complexity Reduction**
   - [ ] Main component complexity ≤15
   - [ ] Each extracted component complexity ≤15
   - [ ] Each custom hook complexity ≤10

2. **Functionality Preserved**
   - [ ] All 4 onboarding steps work identically
   - [ ] Photo upload works on web and mobile
   - [ ] Date formatting works correctly
   - [ ] Profile creation succeeds
   - [ ] Error handling preserved

3. **Testing**
   - [ ] All existing tests pass
   - [ ] Add tests for new custom hooks
   - [ ] Add tests for validation utilities
   - [ ] Smoke test onboarding flow

4. **Code Quality**
   - [ ] No TypeScript errors
   - [ ] ESLint passes
   - [ ] SonarCloud reports complexity ≤15
   - [ ] No console.logs in production code

## 🚀 Atlas Standard Workflow

### Phase 1: Research (30 min)
- [ ] Read and understand full OnboardingScreen.js file
- [ ] Map out all state variables and their usage
- [ ] Identify all event handlers and their complexity
- [ ] Document current step flow and transitions
- [ ] List all platform-specific logic branches

### Phase 2: Plan (30 min)
- [ ] Prioritize extraction order (hooks first, then components)
- [ ] Design custom hook APIs
- [ ] Sketch component prop interfaces
- [ ] Plan test strategy for extracted code
- [ ] Identify potential breaking points

### Phase 3: Implement (60-90 min)
**Iteration 1: Extract Custom Hooks**
- [ ] Create useOnboardingForm hook
- [ ] Create usePhotoUpload hook
- [ ] Create useDateFormatter hook
- [ ] Test hooks in isolation

**Iteration 2: Extract Components**
- [ ] Create step components (1-4)
- [ ] Create PhotoUploadSection
- [ ] Create DateInput
- [ ] Create OnboardingStepContainer

**Iteration 3: Extract Utilities**
- [ ] Create onboardingValidation.js
- [ ] Create profileCreation.js
- [ ] Create photoProcessing.js

**Iteration 4: Simplify Main Component**
- [ ] Refactor OnboardingScreen to use extracted code
- [ ] Remove inline logic
- [ ] Simplify render method

### Phase 4: Review (30 min)
- [ ] Run smoke tests on onboarding flow
- [ ] Check SonarCloud complexity metrics
- [ ] Verify all existing tests pass
- [ ] Manual testing: web and mobile (if available)
- [ ] Code review for maintainability

### Phase 5: Deploy (15 min)
- [ ] Update release notes
- [ ] Commit with descriptive message
- [ ] Deploy to qual
- [ ] Verify onboarding works in qual environment
- [ ] Run SonarCloud scan

## 📝 Implementation Notes

### Key Considerations:

1. **Preserve Platform Logic:**
   - Photo picker differs between web/mobile
   - Date input handling differs
   - Ensure platform checks remain correct

2. **State Management:**
   - Keep form state simple and flat
   - Avoid prop drilling - use hooks effectively
   - Maintain step navigation state at top level

3. **Error Handling:**
   - Preserve existing error messages
   - Keep error state management clear
   - Ensure errors display in correct locations

4. **Performance:**
   - Memoize expensive computations
   - Use React.memo for step components if needed
   - Avoid unnecessary re-renders

5. **Backward Compatibility:**
   - OnboardingScreen API must not change
   - Props: onComplete, onShowPrivacy
   - Behavior must be identical to users

### Testing Strategy:

1. **Unit Tests:**
   - Test each custom hook independently
   - Test validation utilities
   - Test photo processing utilities

2. **Integration Tests:**
   - Test step navigation flow
   - Test form submission with valid data
   - Test error cases

3. **Manual Testing:**
   - Complete onboarding flow on web
   - Test photo upload (web file picker)
   - Test date input formatting
   - Test validation errors display

## 🔗 Related Files

**Files to Review:**
- `src/utils/platform.js` - Platform detection logic
- `src/utils/unifiedCategories.js` - Category data
- `src/services/storage/storageService.js` - Storage operations
- `src/context/ThemeContext.tsx` - Theme usage

**Similar Patterns:**
- Look at other multi-step forms in the app
- Check how other screens handle photo uploads
- Review form validation patterns used elsewhere

## 📊 Success Metrics

- **Complexity Reduction:** 37 → ≤15 (59% reduction)
- **File Count:** 1 → 13 files (organized by responsibility)
- **Lines per File:** 857 → avg ~100 lines per file
- **Maintainability:** High (single responsibility per file)
- **Testability:** High (isolated logic, easier to test)

## ⚠️ Risks & Mitigation

**Risk 1: Breaking existing functionality**
- Mitigation: Extensive testing, preserve exact behavior
- Fallback: Keep original file in git history

**Risk 2: Photo upload regression**
- Mitigation: Test web file picker thoroughly
- Note: Mobile photo picker not yet implemented (TECH DEBT)

**Risk 3: Performance degradation**
- Mitigation: Use React profiler, memoization
- Monitor: Re-render counts in step transitions

**Risk 4: Increased complexity from over-abstraction**
- Mitigation: Keep components simple, avoid premature optimization
- Principle: Extract only what's needed to reduce complexity

---

**Priority:** High - This is the largest complexity issue remaining in production code

**Estimated Impact:**
- Code quality: +++
- Maintainability: +++
- Testability: +++
- Performance: = (neutral, may improve slightly)

**Recommended Next Session:** Dedicate 2-3 hours focused time for this refactoring
