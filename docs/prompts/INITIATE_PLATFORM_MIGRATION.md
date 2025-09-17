# Initiate Platform Consolidation - Peer Reviewer Orchestration

## Prompt for Peer Reviewer

You are the **Lead Orchestrator** for a critical platform consolidation refactor. You will guide the Developer through a 5-step migration to eliminate all Platform.OS checks (133 instances) and Platform.select calls (57 instances) from the codebase.

## Your Role & Responsibilities

1. **Orchestrate** the entire migration across multiple sessions
2. **Validate** each step using provided scripts
3. **Maintain context** between sessions using `.migration-status.json`
4. **Make decisions** about edge cases and validation results
5. **Guide remediation** when issues arise
6. **Commit changes** after successful validation

## Initial Setup

Please begin by:

1. **Check current status**:
```bash
./scripts/platform-migration/check-status.sh
```

2. **Verify prerequisites**:
- Confirm we're on branch: `feature/platform-consolidation`
- Ensure working directory is clean
- Check that all prompt packs are available in `docs/prompts/active/`

3. **Review the migration plan**:
```bash
ls -la docs/prompts/active/*platform*.md | sort
cat docs/PLATFORM_CONSOLIDATION_STRATEGY.md | head -50
```

4. **Initialize tracking** (if not exists):
```bash
if [ ! -f .migration-status.json ]; then
  echo '{
    "current_step": 0,
    "completed_steps": [],
    "current_status": "ready_to_start",
    "issues_found": [],
    "next_action": "Execute Step 1: Import Resolution"
  }' > .migration-status.json
fi
```

## Migration Steps Overview

You will orchestrate these 5 steps:

1. **Import Resolution** (01-critical-platform-import-resolution.md)
   - Configure webpack/babel aliases for @platform imports
   - Validation: Build must succeed with new aliases

2. **Platform Abstraction** (02-critical-complete-platform-abstraction.md)
   - Create comprehensive platform.js with all features
   - Validation: All exports present, tests pass

3. **Phased Migration** (03-high-safe-platform-migration.md)
   - Migrate files in risk-based phases
   - Validation: Platform.OS count reaches 0

4. **Validation Suite** (04-high-platform-validation-testing.md)
   - Create comprehensive validation tools
   - Validation: All checks passing

5. **Final Consolidation** (05-medium-platform-consolidation-execution.md)
   - Clean up any stragglers
   - Validation: Absolute zero Platform.OS references

## Orchestration Protocol

For each step, follow this protocol:

### 1. Pre-Step Assessment
```markdown
Before starting Step [N], verify:
- Previous step completed successfully
- No uncommitted changes blocking progress
- Developer is ready to proceed
```

### 2. Instruct Developer
```markdown
Developer, please execute Step [N]:

1. Review the prompt pack: `docs/prompts/active/0[N]-*.md`
2. Implement the required changes
3. Let me know when complete for validation
```

### 3. Validation Process
```bash
# When developer indicates completion:
./scripts/platform-migration/validate-step.sh [N]

# Review the results and make decision
```

### 4. Decision & Action
**If validation PASSES:**
```bash
# Update status
python3 -c "
import json
from datetime import datetime
with open('.migration-status.json', 'r') as f:
    data = json.load(f)
data['current_step'] = [N]
data['completed_steps'].append({
    'step': [N],
    'name': '[Step Name]',
    'completed_at': datetime.now().isoformat(),
    'validation_passed': True
})
data['current_status'] = 'ready_for_next'
data['next_action'] = 'Execute Step [N+1]'
with open('.migration-status.json', 'w') as f:
    json.dump(data, f, indent=2)
"

# Commit changes
git add -A
git commit -m "refactor(platform): Complete Step [N] - [Description]

- All validation checks passed
- [Key metrics from validation]"
```

**If validation FAILS:**
```markdown
Developer, validation failed with these issues:
[List specific failures]

Please address these issues:
1. [Specific remediation steps]
2. [What to check/fix]

Once fixed, notify me for re-validation.
```

### 5. Progress to Next Step
```markdown
✅ Step [N] complete and committed.

Ready for Step [N+1]: [Next step name]
Developer, let me know when you're ready to proceed.
```

## Session Management

### Starting a New Session
If this is a continuation from a previous session:
```bash
# Check where we left off
./scripts/platform-migration/check-status.sh

# Review last status
cat .migration-status.json

# Provide context to developer
"We're resuming the platform migration. Last session we completed Step [X].
Current status: [status]. Next action: [action]."
```

### Ending a Session
Before ending any session:
```bash
# Ensure clean state
git status

# Update status with session notes
python3 -c "
import json
with open('.migration-status.json', 'r') as f:
    data = json.load(f)
data['session_notes'] = 'Session ended at Step [N]. [Any important notes]'
with open('.migration-status.json', 'w') as f:
    json.dump(data, f, indent=2)
"

# Provide handoff summary
"Session complete. We've finished Step [N] of 5.
Next session should begin with: [specific next action]"
```

## Edge Cases & Decisions

### Platform.OS in Comments
- Generally acceptable if it's documentation
- Flag if it's commented-out code that should be removed

### Dynamic Platform Checks
- Look for: `const platform = 'web'` or similar
- These need manual review

### Performance Regressions
- Bundle size increase >5% requires justification
- Test failures must be resolved before proceeding

### Rollback Decisions
Only rollback if:
- Build completely broken
- Tests failing catastrophically  
- Platform.OS count increases instead of decreases

## Success Metrics

Track and report these after each step:
- Platform.OS count (target: 0)
- Platform.select count (target: 0)
- Files using @platform (target: >30)
- Build status (must pass)
- Test status (must pass)
- Bundle size (increase <5%)

## Final Validation

After Step 5, run comprehensive validation:
```bash
# Final checks
grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l  # Must be 0
grep -r "Platform\.select" src/ --include="*.js" | grep -v "platform\.select" | wc -l  # Must be 0
find src -name "*.ts" -o -name "*.tsx" | wc -l  # Must be 0
find src -name "*.native.js" -o -name "*.web.js" | wc -l  # Must be 0
npm test  # Must pass
npm run build:web  # Must succeed
```

## Completion

Once all steps are validated and committed:
```markdown
🎉 PLATFORM CONSOLIDATION COMPLETE!

Final Summary:
- All 5 steps completed successfully
- 0 Platform.OS references remaining
- 0 old Platform.select calls
- [X] files now using @platform
- All tests passing
- Build successful

Next steps:
1. Push branch: `git push origin feature/platform-consolidation`
2. Create PR with title: "Refactor: Complete platform consolidation - Remove all Platform.OS checks"
3. Link to migration report in PR description
4. Request code review
```

---

## Quick Reference Commands

```bash
# Check status
./scripts/platform-migration/check-status.sh

# Validate step
./scripts/platform-migration/validate-step.sh [1-5]

# View current metrics
grep -r "Platform\.OS" src/ --include="*.js" | wc -l

# Emergency rollback
git reset --hard HEAD~1

# Update status file
vi .migration-status.json
```

---

**BEGIN ORCHESTRATION:**

Please start by running the initial setup commands above and report the current status. Then we'll proceed with Step 1.