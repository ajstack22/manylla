# Adversarial Story Review Framework

## OVERVIEW
This framework implements a two-agent adversarial review process for story implementation using Claude's Task tool. The main session acts as a Project Manager, coordinating between specialized Developer and Peer Reviewer Task tool instances to ensure thorough implementation and validation.

## FRAMEWORK STRUCTURE

### Project Manager Role (Main Session)
The Project Manager:
1. Launches Developer Task tool instance with story requirements
2. Reviews Developer's implementation report
3. Launches Peer Reviewer Task tool instance for validation
4. Coordinates iterations between Developer and Reviewer
5. Tracks overall progress and ensures completion

### Phase 1: Developer Implementation (Task Tool Instance)
The Developer Task tool receives:
1. The story/prompt pack
2. Their role definition
3. Clear success criteria
4. Autonomously implements the solution

### Phase 2: Peer Review (Task Tool Instance)
The Peer Reviewer Task tool:
1. **TRACES IMPORT CHAINS** - Verifies the modified component is actually used
2. **VALIDATES TEST COVERAGE** - Ensures tests exist and coverage increased by ≥10%
3. Validates EVERY requirement independently
4. Tests all edge cases
5. Verifies no regressions
6. REJECTS if ANY requirement fails OR test coverage doesn't improve
7. Provides detailed feedback report with coverage metrics

### Phase 3: Iteration (Coordinated by Project Manager)
Project Manager coordinates iterations:
1. Passes Reviewer feedback to new Developer Task instance
2. Continues until Peer Reviewer gives FULL APPROVAL
3. Maintains context between Task tool invocations

## THE PROMPT TEMPLATES

### For Project Manager (Main Session)

```markdown
# Project Manager: Coordinating Adversarial Review

You are the Project Manager coordinating between Developer and Peer Reviewer Task tool instances.

## YOUR WORKFLOW:

1. **Launch Developer Task**:
   - Use Task tool with subagent_type: "general-purpose"
   - Provide story requirements and role definition
   - Wait for implementation report

2. **Review Developer Output**:
   - Summarize what was implemented
   - Note any tech debt identified
   - Prepare implementation for review

3. **Launch Peer Reviewer Task**:
   - Use Task tool with subagent_type: "general-purpose"
   - Provide implementation details and review criteria
   - Wait for validation report

4. **Handle Review Results**:
   - If APPROVED: Mark story complete
   - If REJECTED: Launch new Developer Task with fixes needed
   - Track iteration count

5. **Maintain Progress**:
   - Use TodoWrite to track review cycles
   - Document decisions made
   - Ensure all requirements met
```

### For Developer Task Instance

```markdown
# Developer Task: Story Implementation

## YOUR MISSION
You are an autonomous Developer agent. Implement the following story completely and provide a detailed report.

## STORY TO IMPLEMENT
[INSERT STORY/PROMPT PACK HERE]

## YOUR ROLE CONTEXT
[INSERT DEVELOPER ROLE DEFINITION HERE]

## DELIVERABLES
Provide a comprehensive report including:
1. Implementation approach taken
2. All files created/modified with full paths
3. **TEST COVERAGE METRICS** - Before/after percentages
4. **NEW TESTS CREATED** - List all test files added/modified
5. Verification commands executed with results
6. Any edge cases handled
7. Tech debt discovered (if any)
8. Statement of completion confidence (0-100%)

## TESTING REQUIREMENTS
- **MANDATORY**: Add tests for ALL new code
- **COVERAGE INCREASE**: Minimum +10% coverage per story
- **UPDATE EXISTING**: Fix/update any broken tests
- **RUN TEST SUITE**: Include `npm test` and `npm run test:coverage` results

## IMPORTANT
- Work autonomously to completion
- Test thoroughly before reporting done
- Document any assumptions made
- Return a structured report for review
```

### For Peer Reviewer Task Instance

```markdown
# Peer Reviewer Task: Adversarial Validation

## YOUR MISSION
You are an adversarial Peer Reviewer. Rigorously validate this implementation and find ANY reason to reject it.

## IMPLEMENTATION TO REVIEW
[INSERT DEVELOPER'S REPORT HERE]

## ORIGINAL REQUIREMENTS
[INSERT STORY REQUIREMENTS HERE]

## YOUR ROLE CONTEXT
[INSERT PEER REVIEWER ROLE DEFINITION HERE]

## VALIDATION PROCESS
1. **VERIFY TEST COVERAGE FIRST**
   ```bash
   # Check current coverage
   npm run test:coverage
   # Compare with previous coverage
   # MUST show ≥10% improvement OR maintain 100%
   ```
2. **TRACE COMPONENT USAGE**
   ```bash
   # Find where component is imported
   grep -r "ComponentName" src/ --include="*.js" | grep import
   # Verify it's actually used in the render tree
   grep -r "<ComponentName" src/ --include="*.js"
   # Check App.js imports specifically
   grep "import.*ComponentName" App.js
   ```
3. **VALIDATE TEST QUALITY**
   ```bash
   # Check for new test files
   git status | grep test
   # Run specific test suites
   npm test -- ComponentName.test.js
   # Verify tests are meaningful (not just coverage padding)
   ```
4. Run ALL verification commands independently
5. Check EVERY requirement from the story
6. Test edge cases the developer might have missed
7. Look for any regressions introduced
8. Verify no shortcuts were taken

## OUTPUT FORMAT
```
🔴 REJECTED: [Title]
or
✅ APPROVED: [Title]

Evidence:
- [Command]: [Result]
- [Command]: [Result]

Requirements Checklist:
□ Test Coverage: [PASS/FAIL - Current: X%, Required: Previous+10% or 100%]
□ Test Quality: [PASS/FAIL - Meaningful tests, not padding]
□ Test Suite Passes: [PASS/FAIL - npm test result]
□ Requirement 1: [PASS/FAIL - Evidence]
□ Requirement 2: [PASS/FAIL - Evidence]
□ Requirement 3: [PASS/FAIL - Evidence]

[If REJECTED]
Required Fixes:
1. [Specific fix needed with file/line]
2. [Specific fix needed with file/line]
```

## IMPORTANT
- Trust NOTHING - verify everything
- Be specific about failures
- Provide reproducible evidence
```

### For Iteration Developer Task

```markdown
# Developer Task: Address Review Feedback

## YOUR MISSION
Fix the specific issues identified by peer review.

## PREVIOUS IMPLEMENTATION
[Summary of what was done]

## REJECTION FEEDBACK
[INSERT PEER REVIEWER'S REJECTION DETAILS]

## YOUR TASKS
Address EACH required fix:
[List specific fixes needed]

## DELIVERABLES
1. Evidence each fix was applied
2. Verification commands showing fixes work
3. Confirmation no regressions introduced
4. Updated completion confidence

## IMPORTANT
- Focus ONLY on the required fixes
- Don't introduce new changes
- Test the specific failure cases
```

## SUCCESS CRITERIA
Story is ONLY complete when Peer Reviewer outputs:
✅ APPROVED with:
- ALL requirements checked
- Test coverage increased by ≥10% (or maintained at 100%)
- All tests passing
- No test quality issues
```

## TEST COVERAGE ENFORCEMENT

### Coverage Requirements by Story Type
1. **New Features**: Must include comprehensive tests (+10% minimum)
2. **Bug Fixes**: Must include regression tests (+5% minimum)
3. **Refactoring**: Must maintain or improve existing coverage
4. **Legacy Code Updates**: Must add tests for modified code (+10% minimum)
5. **Critical Systems**: Target 80%+ coverage for security/data handling

### Test Quality Standards
- **Meaningful Assertions**: Tests must validate behavior, not just execute code
- **Edge Cases**: Include boundary conditions and error paths
- **Integration Tests**: Test component interactions, not just units
- **Mocking Strategy**: Proper mocks for external dependencies
- **Performance**: Tests complete in reasonable time (<10s per file)

### Coverage Tracking
```bash
# Track coverage over time
echo "$(date): $(npm run test:coverage | grep 'All files')" >> coverage-history.log

# Ensure continuous improvement
if [ $(current_coverage) -lt $(previous_coverage) ]; then
  echo "❌ Coverage decreased - REJECTION"
  exit 1
fi
```

## EXAMPLE USAGE

### Project Manager Coordination Example:

```markdown
# As Project Manager in Main Session:

## Step 1: Launch Developer Task
User: "Implement story S015 for platform migration"

PM: I'll coordinate the adversarial review process. First, launching the Developer Task tool...

[Uses Task tool with prompt including story requirements and developer role]

## Step 2: Review Developer Output
Developer Task Reports: "Implementation complete. Modified 15 files, all tests passing, 95% confidence"

PM: Developer has completed initial implementation. Now launching Peer Reviewer to validate...

## Step 3: Launch Peer Reviewer Task
[Uses Task tool with developer's report and review criteria]

## Step 4: Handle Review Result
Peer Reviewer Reports: "🔴 REJECTED - 3 files still using relative imports"

PM: Peer review found issues. Launching Developer Task to address fixes...

[Uses Task tool with specific fixes needed]

## Step 5: Iteration Complete
Developer Task Reports: "All fixes applied, 100% confidence"
Peer Reviewer Reports: "✅ APPROVED - All requirements met"

PM: Story S015 successfully completed after 2 review cycles.
```

### Developer Task Instance Example:

```markdown
# Developer Task Prompt:

You are an autonomous Developer agent. Implement this story:

## Story: Complete @platform Alias Migration

Requirements:
1. All files use @platform imports (0 relative imports to platform)
2. ESLint passes with @platform imports
3. All three platforms build successfully
4. No regression in existing functionality

## Your Role:
- Focus on efficiency and getting it done
- You may use migration scripts if available
- Test on at least web platform

## Report Format:
### Implementation Summary
- Files modified: [count]
- Migration approach: [description]
- Commands run: [list]
- Test results: [summary]
- Completion confidence: [0-100%]
```

### Peer Reviewer Task Instance Example:

```markdown
# Peer Reviewer Task Prompt:

You are an adversarial Peer Reviewer. Validate this implementation:

## Developer's Report:
- Modified 15 files to use @platform imports
- Ran migration script successfully
- Web build passes
- 95% confidence

## Requirements to Validate:
1. ALL files use @platform (not just 15)
2. ESLint must pass
3. ALL THREE platforms must build
4. No regressions

## Your Mission:
Run these checks yourself:
- `grep -r "from.*\.\./.*platform" src/`
- `npm run lint`
- `npm run build:web && npx react-native run-ios && npx react-native run-android`
- Test key features still work

Report: REJECTED or APPROVED with evidence
```

## KEY PRINCIPLES

### For the Project Manager (Main Session)
1. **Maintain context** - Track what's been tried across iterations
2. **Use TodoWrite** - Track review cycles and requirements
3. **Be specific** - Provide clear, detailed prompts to Task instances
4. **Document outcomes** - Summarize what each Task accomplishes
5. **Coordinate efficiently** - Run Tasks in parallel when possible

### For the Developer Task Instance
1. **Work autonomously** - Complete the entire task without asking questions
2. **Show your work** - Provide command outputs in your report
3. **Test thoroughly** - Don't claim untested success
4. **Document changes** - List every file modified with paths
5. **Handle edge cases** - Don't ignore platform differences

### For the Peer Reviewer Task Instance
1. **Trust nothing** - Verify every claim independently
2. **Run commands yourself** - Don't accept the developer's word
3. **Check for regressions** - Test existing features still work
4. **Be specific** - Provide exact commands that fail
5. **Demand evidence** - Reject vague claims with specific reasons

## COMMON REJECTION PATTERNS

### 🔴 Wrong Component Modified
```
REJECTED: Modified component not actually used
Evidence: grep "import.*ProfileEditDialog" App.js - No results
Actual: App.js imports ProfileEditForm from UnifiedApp.js
Required Fix: Modify ProfileEditForm, not ProfileEditDialog
```

### 🔴 Incomplete Implementation
```
REJECTED: Requirement 3 of 5 not implemented
Evidence: Feature X still using old pattern
Required Fix: Migrate Feature X to new pattern
```

### 🔴 Failed Verification
```
REJECTED: Build fails on platform Y
Evidence: npm run build:ios - Error at line 47
Required Fix: Fix iOS-specific import issue
```

### 🔴 Regression Introduced
```
REJECTED: Existing feature Z broken
Evidence: Test suite failing - 3 tests
Required Fix: Restore compatibility while maintaining new changes
```

### 🔴 Insufficient Test Coverage
```
REJECTED: Test coverage only increased by 3% (required: 10%)
Evidence: Previous: 45%, Current: 48%
Required Fix: Add tests for uncovered functions in ComponentX
```

### 🔴 No Tests for New Code
```
REJECTED: New feature added without any tests
Evidence: git diff shows new functions, no test files created
Required Fix: Create ComponentX.test.js with full coverage
```

### 🔴 Test Quality Issues
```
REJECTED: Tests are padding, not validating behavior
Evidence: Test only checks if component renders, no interaction tests
Required Fix: Add meaningful assertions and user interaction tests
```

### 🔴 Broken Test Suite
```
REJECTED: Existing tests now failing
Evidence: npm test - 5 failures in unrelated components
Required Fix: Fix regression in test environment or mocks
```

## CUSTOMIZATION POINTS

### 1. Severity Levels
Add to Peer Reviewer role:
- **CRITICAL**: Blocks all functionality
- **MAJOR**: Breaks key features  
- **MINOR**: Cosmetic or edge cases

### 2. Performance Requirements
Add metrics:
- Build time must not increase >10%
- Bundle size must not increase >5%
- Runtime performance unchanged

### 3. Code Quality Gates
- **TEST COVERAGE: Must increase by ≥10% OR maintain 100%**
- **TEST SUITE: All tests must pass (npm test)**
- **NEW CODE: Must have corresponding tests**
- **LEGACY CODE: Update tests when modifying**
- ESLint: 0 errors
- Prettier: All files formatted
- TypeScript: No type errors
- Tests: All passing with improved coverage

## AUTOMATION POSSIBILITIES

### Future Enhancement: Scripted Validation
```bash
#!/bin/bash
# scripts/validate-story-requirements.sh

echo "=== AUTOMATED STORY VALIDATION ==="

# Requirement 1: Check imports
PLATFORM_IMPORTS=$(grep -r "from.*@platform" src/ | wc -l)
RELATIVE_IMPORTS=$(grep -r "from.*\.\./.*platform" src/ | wc -l)

if [ "$PLATFORM_IMPORTS" -gt 50 ] && [ "$RELATIVE_IMPORTS" -eq 0 ]; then
  echo "✅ Import requirement met"
else
  echo "❌ Import requirement failed"
  echo "  @platform imports: $PLATFORM_IMPORTS (expected >50)"
  echo "  Relative imports: $RELATIVE_IMPORTS (expected 0)"
  exit 1
fi

# Continue for other requirements...
```

## TEMPLATE VARIABLES

When using this framework, replace:
- `[INSERT STORY/PROMPT PACK HERE]` - Your specific story
- `[INSERT DEVELOPER ROLE DEFINITION HERE]` - Developer context
- `[INSERT PEER REVIEWER ROLE DEFINITION HERE]` - Reviewer context
- `[REQUIREMENTS]` - Specific story requirements
- `[SUCCESS METRICS]` - Measurable success criteria

## BENEFITS OF TASK TOOL APPROACH

1. **Parallel execution** - Developer and Reviewer can work independently
2. **Clear separation** - Each Task instance has a focused role
3. **Better context management** - Project Manager maintains overall state
4. **Reduced token usage** - Task instances only see what they need
5. **Scalability** - Can run multiple stories through review simultaneously
6. **Auditability** - Each Task produces a clear report
7. **Prevents shortcuts** - Reviewer independently validates everything
8. **Creates documentation** - Review process documents what was tested

## WHEN TO USE THIS FRAMEWORK

### Good Candidates:
- Platform-wide changes (migrations, refactoring)
- Critical features (authentication, data handling)
- Performance optimizations
- Security implementations
- Architecture changes
- **ANY story that modifies production code**
- **Legacy code updates (perfect opportunity to add tests)**

### Test Coverage Expectations:
- **New Features**: Start with 60%+ coverage target
- **Core Services**: Target 80%+ coverage
- **Utilities**: Target 90%+ coverage
- **UI Components**: Target 50%+ coverage
- **Security/Encryption**: Target 95%+ coverage

### Not Necessary For:
- Simple bug fixes
- Documentation updates
- Style/formatting changes
- Adding comments
- Minor UI tweaks

## PRACTICAL TIPS FOR PROJECT MANAGERS

### Launching Task Tools Effectively

```bash
# Example of launching Developer and Reviewer in parallel when appropriate
# (Only when you have both the story and the implementation ready)

# Sequential approach (typical):
1. Launch Developer Task → Wait for report
2. Launch Reviewer Task → Wait for validation
3. If rejected, launch Fix Task → Repeat

# Parallel approach (when revisiting):
1. Launch Fix Task AND Prepare Review Task simultaneously
2. Coordinate results when both complete
```

### Using TodoWrite for Tracking

```markdown
## Review Cycle Todos:
- [ ] Launch Developer Task for S015 implementation
- [ ] Review Developer report and prepare for validation
- [ ] Launch Peer Reviewer Task for validation
- [ ] Handle review feedback (approve or iterate)
- [ ] Document tech debt discovered
- [ ] Update story status in BACKLOG.md
```

### Handling Task Tool Failures

If a Task instance fails or times out:
1. Extract any partial work completed
2. Create a new Task with remaining work
3. Provide context about what was already done
4. Consider breaking into smaller sub-tasks

### Optimizing Token Usage

1. **Don't include entire codebase** - Only relevant files
2. **Summarize previous attempts** - Don't paste full history
3. **Use references** - "As implemented in previous task" vs full code
4. **Extract key findings** - Pull out important discoveries for next Task

---

*This framework ensures thorough implementation and review of complex stories through coordinated Task tool instances with adversarial validation.*