# Peer Review Validation Protocol for Platform Migration

## Overview
This protocol enables AI-assisted continuous validation across multiple sessions with intelligent toll gates and context preservation.

## The Hybrid AI-Script Validation Model

### Why Peer Reviewer > Pure Automation
1. **Context Preservation** - Remembers what was done in previous sessions
2. **Intelligent Decisions** - Handles edge cases scripts can't anticipate
3. **Guided Remediation** - Provides specific fixes when validation fails
4. **Adaptive Validation** - Can modify approach based on findings
5. **Cross-Session Continuity** - Picks up where last session ended

## Session Handoff Protocol

### At Session Start
```markdown
# Session Context Check
Peer Reviewer, please verify our migration status:

1. Run: `./scripts/platform-migration/check-status.sh`
2. Review: `git log --oneline -10`
3. Check: `cat .migration-status.json`
4. Report: Which step are we on and what remains
```

### Migration Status Tracking
**File**: `.migration-status.json`
```json
{
  "current_step": 3,
  "completed_steps": [
    {
      "step": 1,
      "name": "Import Resolution",
      "completed_at": "2025-09-11T10:30:00Z",
      "validation_passed": true,
      "commit": "abc123"
    },
    {
      "step": 2,
      "name": "Platform.js Creation",
      "completed_at": "2025-09-11T11:15:00Z",
      "validation_passed": true,
      "commit": "def456"
    }
  ],
  "current_status": "migrating",
  "issues_found": [],
  "next_action": "Run step 3 migration"
}
```

## Peer Reviewer Validation Framework

### For Each Step Completion
```markdown
Peer Reviewer, please validate step [N]:

1. **Automated Checks**:
   - Run: `./scripts/platform-migration/validate-step.sh [N]`
   - Capture and analyze output
   
2. **Code Review**:
   - Review changed files: `git diff HEAD~1`
   - Check for antipatterns
   - Verify architectural compliance
   
3. **Intelligent Validation**:
   - Are there any Platform.OS stragglers that regex might miss?
   - Do the changes maintain backward compatibility?
   - Are there performance implications?
   
4. **Edge Case Analysis**:
   - Check platform-specific code in comments
   - Verify dynamic platform checks
   - Look for indirect platform dependencies
   
5. **Decision & Documentation**:
   - Update `.migration-status.json`
   - Commit if passed
   - Document issues if failed
```

## Validation Script Library

### Status Check Script
**File**: `scripts/platform-migration/check-status.sh`
```bash
#!/bin/bash
# Reports current migration status

echo "🔍 Platform Migration Status"
echo "============================"

# Check migration status file
if [ -f ".migration-status.json" ]; then
    echo "📊 Migration Status:"
    cat .migration-status.json | python3 -m json.tool
else
    echo "⚠️  No migration status found. Starting fresh."
fi

# Check current step from git
echo ""
echo "📝 Git History:"
git log --oneline -5 | grep -E "step [0-9]" || echo "No migration commits found"

# Check remaining Platform.OS
echo ""
echo "📈 Progress Metrics:"
echo -n "  Platform.OS remaining: "
grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l

echo -n "  Files using @platform: "
grep -r "from.*@platform" src/ --include="*.js" | wc -l

echo -n "  Build status: "
npm run build:web > /dev/null 2>&1 && echo "✅ Passing" || echo "❌ Failing"
```

### Comprehensive Validation Script
**File**: `scripts/platform-migration/validate-comprehensive.sh`
```bash
#!/bin/bash
# Comprehensive validation for peer reviewer

STEP=$1
REPORT_FILE="validation-report-step-$STEP.md"

echo "# Validation Report - Step $STEP" > $REPORT_FILE
echo "Generated: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to add to report
report() {
    echo "$1" >> $REPORT_FILE
    echo "$1"
}

report "## Automated Checks"

# Platform.OS count
COUNT=$(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l)
report "- Platform.OS references: $COUNT"

# Platform.select count
COUNT=$(grep -r "Platform\.select" src/ --include="*.js" | grep -v "platform\.select" | wc -l)
report "- Old Platform.select: $COUNT"

# TypeScript check
COUNT=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
report "- TypeScript files: $COUNT"

# Build test
report ""
report "## Build Status"
if npm run build:web > /dev/null 2>&1; then
    report "✅ Web build: PASSING"
else
    report "❌ Web build: FAILING"
fi

# Test suite
report ""
report "## Test Status"
if npm test > /dev/null 2>&1; then
    report "✅ Test suite: PASSING"
else
    report "❌ Test suite: FAILING"
    report "Failed tests:"
    npm test 2>&1 | grep -A 2 "FAIL" >> $REPORT_FILE
fi

# Bundle size
report ""
report "## Performance Metrics"
SIZE=$(du -sh web/build 2>/dev/null | awk '{print $1}')
report "- Bundle size: $SIZE"

# Git changes
report ""
report "## Files Changed"
git diff --stat HEAD~1 >> $REPORT_FILE

report ""
report "## Recommendation"
if [ $COUNT -eq 0 ]; then
    report "✅ Step $STEP appears complete. Recommend approval."
else
    report "⚠️  Issues found. Review required."
fi

echo ""
echo "📄 Report saved to: $REPORT_FILE"
```

### Rollback Script
**File**: `scripts/platform-migration/rollback.sh`
```bash
#!/bin/bash
# Safe rollback to previous step

echo "🔄 Platform Migration Rollback"
echo "==============================="

# Show recent commits
echo "Recent migration commits:"
git log --oneline -10 | grep -E "step [0-9]" | head -5

echo ""
read -p "Rollback to previous step? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Get last migration commit
    LAST_COMMIT=$(git log --oneline | grep -E "step [0-9]" | head -1 | awk '{print $1}')
    
    if [ -z "$LAST_COMMIT" ]; then
        echo "❌ No migration commits found"
        exit 1
    fi
    
    echo "Rolling back to before: $(git log --oneline -1 $LAST_COMMIT)"
    git reset --hard "$LAST_COMMIT~1"
    
    # Update status file
    if [ -f ".migration-status.json" ]; then
        # Decrement current_step in JSON
        python3 -c "
import json
with open('.migration-status.json', 'r') as f:
    data = json.load(f)
data['current_step'] = max(1, data.get('current_step', 1) - 1)
data['current_status'] = 'rolled_back'
with open('.migration-status.json', 'w') as f:
    json.dump(data, f, indent=2)
"
    fi
    
    echo "✅ Rollback complete"
else
    echo "❌ Rollback cancelled"
fi
```

## Peer Reviewer Prompts

### Initial Session Assessment
```markdown
You are the Peer Reviewer for a platform consolidation migration.

First, assess our current status:
1. Run: `./scripts/platform-migration/check-status.sh`
2. Review the output and `.migration-status.json`
3. Identify which step we're on and what work remains

Report your findings and recommend next actions.
```

### Step Validation
```markdown
The developer has completed Step [N] of the platform migration.

Your validation tasks:
1. Run: `./scripts/platform-migration/validate-comprehensive.sh [N]`
2. Review the validation report
3. Manually inspect any concerning patterns
4. Run additional spot checks as needed
5. Make a pass/fail decision

If PASSED:
- Update `.migration-status.json`
- Commit the changes with appropriate message
- Indicate readiness for next step

If FAILED:
- Document specific issues found
- Provide remediation steps
- Update `.migration-status.json` with issues
- Do not commit
```

### Cross-Session Handoff
```markdown
You are resuming peer review duties from a previous session.

Please:
1. Run: `./scripts/platform-migration/check-status.sh`
2. Review `.migration-status.json` for context
3. Check for any uncommitted changes: `git status`
4. Review the last validation report if it exists
5. Summarize where we are and what needs to happen next
```

## Continuous Validation Rules

### Toll Gates (Must Pass to proceed)
1. **Step 1 → 2**: Webpack builds successfully with aliases
2. **Step 2 → 3**: Platform.js has all required exports
3. **Step 3 → 4**: <5 Platform.OS references remaining
4. **Step 4 → 5**: Validation suite exists and runs
5. **Step 5 → Complete**: 0 Platform.OS, 0 TypeScript files

### Quality Gates (Warnings but can proceed)
- Bundle size increase <5%
- Test coverage maintained
- No new console.logs
- No commented platform code

## Session Management Best Practices

### Starting a Session
1. Always check status first
2. Verify branch is correct
3. Check for uncommitted changes
4. Review last session's notes

### Ending a Session
1. Commit or stash all changes
2. Update `.migration-status.json`
3. Document any blockers
4. Leave notes for next session

### Handoff Notes Format
```markdown
## Session Handoff - [Date]

### Completed
- [What was accomplished]

### Current State
- Step: [N]
- Status: [migrating/blocked/complete]
- Branch: feature/platform-consolidation

### Blockers
- [Any issues preventing progress]

### Next Actions
- [Specific next steps]

### Notes
- [Any important context for next session]
```

## Benefits of This Approach

1. **Resilient to Interruptions** - Can pause and resume anytime
2. **Audit Trail** - Complete history of decisions
3. **Intelligent Validation** - AI understands context beyond scripts
4. **Progressive Refinement** - Each session builds on previous
5. **Collaborative** - Multiple people can contribute across sessions

## Emergency Procedures

### If Validation Keeps Failing
```bash
# Peer Reviewer should run:
./scripts/platform-migration/rollback.sh

# Then investigate root cause:
git diff HEAD~1 | head -100
npm test -- --verbose
npm run build:web -- --verbose
```

### If Context is Lost
```bash
# Reconstruct from git history:
git log --oneline --grep="step" -20
git show --stat HEAD~1
cat .migration-status.json

# Peer Reviewer can rebuild context and continue
```

---

*This protocol enables multi-session, AI-assisted migration with intelligent validation and continuous context preservation.*