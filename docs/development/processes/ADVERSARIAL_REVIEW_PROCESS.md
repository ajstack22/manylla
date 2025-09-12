# Adversarial Story Review Framework

## OVERVIEW
This framework implements a two-agent adversarial review process for story implementation. A Developer implements the story, then a Peer Reviewer rigorously validates it, rejecting until all requirements are met.

## FRAMEWORK STRUCTURE

### Phase 1: Developer Implementation
The Developer receives:
1. The story/prompt pack
2. Their role definition
3. Clear success criteria

### Phase 2: Peer Review
The Peer Reviewer:
1. Validates EVERY requirement
2. Tests all edge cases
3. Verifies no regressions
4. REJECTS if ANY requirement fails

### Phase 3: Iteration
Process repeats until Peer Reviewer gives FULL APPROVAL

## THE PROMPT TEMPLATE

```markdown
# Story Implementation with Adversarial Review

## INSTRUCTIONS FOR CLAUDE

You will simulate TWO distinct agents with opposing goals:

### AGENT 1: DEVELOPER
- **Goal**: Implement the story requirements efficiently
- **Mindset**: Solution-focused, may take shortcuts
- **Output**: Working implementation

### AGENT 2: PEER REVIEWER  
- **Goal**: Find ANY reason to reject the implementation
- **Mindset**: Adversarial, suspicious, demanding proof
- **Output**: REJECTED or APPROVED with evidence

## PROCESS

### ROUND 1: INITIAL IMPLEMENTATION

**DEVELOPER**, implement this story:

[INSERT STORY/PROMPT PACK HERE]

Using this role context:
[INSERT DEVELOPER ROLE DEFINITION HERE]

Provide:
1. Your implementation approach
2. Code changes with file paths
3. Verification commands run
4. Statement of completion
5. **Tech debt identified** (if any):
   ```markdown
   ### Tech Debt Discovered
   - **Item 1**: [Brief description] (Priority: P0-P3, Effort: S/M/L)
   - **Item 2**: [Brief description] (Priority: P0-P3, Effort: S/M/L)
   [Save as draft in docs/development/tech-debt/drafts/]
   ```

---

### ROUND 2: PEER REVIEW

**PEER REVIEWER**, validate the implementation:

Using this role context:
[INSERT PEER REVIEWER ROLE DEFINITION HERE]

You MUST:
1. Run verification commands (don't trust the developer)
2. Check EVERY requirement from the story
3. Test edge cases
4. Look for regressions
5. Verify no shortcuts were taken

Output format:
```
🔴 REJECTED: [Title]
or
✅ APPROVED: [Title]

Evidence:
- [Command]: [Result]
- [Command]: [Result]

Requirements Checklist:
□ Requirement 1: [PASS/FAIL - Evidence]
□ Requirement 2: [PASS/FAIL - Evidence]
□ Requirement 3: [PASS/FAIL - Evidence]

Tech Debt Identified (if any):
- **Item**: [Description] (Priority: P0-P3, Impact: High/Med/Low)
- **Item**: [Description] (Priority: P0-P3, Impact: High/Med/Low)

[If REJECTED]
Required Fixes:
1. [Specific fix needed]
2. [Specific fix needed]
```

### ROUND 3+: ITERATION

If REJECTED, **DEVELOPER** must:
1. Address EACH required fix
2. Show evidence of fixes
3. Re-run verification

**PEER REVIEWER** then re-validates with same rigor.

Continue until APPROVED.

## SUCCESS CRITERIA
Story is ONLY complete when Peer Reviewer outputs:
✅ APPROVED with ALL requirements checked
```

## EXAMPLE USAGE

### For Platform Migration Story:

```markdown
# Platform Alias Migration - Adversarial Review

## DEVELOPER ROLE
[Paste from DEVELOPER_ROLE_AND_LEARNINGS.md]

## PEER REVIEWER ROLE  
[Paste from PEER_REVIEWER_ROLE_AND_LEARNINGS.md]

## STORY TO IMPLEMENT

### Complete @platform Alias Migration

Requirements:
1. All files use @platform imports (0 relative imports to platform)
2. ESLint passes with @platform imports
3. All three platforms build successfully
4. No regression in existing functionality

Success Metrics:
- `grep -r "from.*@platform" src/ | wc -l` returns ~60
- `grep -r "from.*\.\./.*platform" src/ | wc -l` returns 0
- `npm run build:web` succeeds
- `npx react-native run-ios` succeeds
- `npx react-native run-android` succeeds

[Rest of story details...]
```

## KEY PRINCIPLES

### For the Developer
1. **Show your work** - Provide command outputs
2. **Test thoroughly** - Don't claim untested success
3. **Document changes** - List every file modified
4. **Handle edge cases** - Don't ignore platform differences

### For the Peer Reviewer
1. **Trust nothing** - Verify every claim
2. **Run commands yourself** - Don't accept screenshots
3. **Check for regressions** - Test existing features
4. **Be specific** - Provide exact commands that fail
5. **Demand evidence** - Reject vague claims

## COMMON REJECTION PATTERNS

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

### 🔴 Insufficient Testing
```
REJECTED: No evidence of Android testing
Evidence: No adb logcat output provided
Required Fix: Test on Android and provide logs
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
- ESLint: 0 errors
- Prettier: All files formatted
- TypeScript: No type errors
- Tests: All passing

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

## BENEFITS OF THIS APPROACH

1. **Catches shortcuts** - Developer can't claim false completion
2. **Forces verification** - Evidence required for approval
3. **Improves quality** - Adversarial review finds edge cases
4. **Creates documentation** - Review process documents what was tested
5. **Prevents regressions** - Reviewer checks existing functionality

## WHEN TO USE THIS FRAMEWORK

### Good Candidates:
- Platform-wide changes (migrations, refactoring)
- Critical features (authentication, data handling)
- Performance optimizations
- Security implementations
- Architecture changes

### Not Necessary For:
- Simple bug fixes
- Documentation updates
- Style/formatting changes
- Adding comments
- Minor UI tweaks

---

*This framework ensures thorough implementation and review of complex stories through adversarial validation.*