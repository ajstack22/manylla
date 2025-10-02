# Atlas Quick Start Guide

## How to Use Atlas in Manylla

### Step 1: Choose Your Tier

```
Trivial change (1 file, no logic)?     → Quick (2 phases, 5-10 min)
Standard task (2-5 files, some logic)? → Standard (5 phases, 30-60 min) ⭐
Complex feature (6+ files, high risk)? → Full (9 phases, 2-4 hours)
```

### Step 2: Tell Claude

Use these exact phrases to trigger Atlas workflows:

**Quick Workflow:**
```
"[TASK]. Use Atlas Quick workflow."
```
Example: "Fix typo in welcome message. Use Atlas Quick workflow."

**Standard Workflow:** ⭐ Most common
```
"[TASK]. Use Atlas Standard workflow."
```
Example: "Fix null pointer in photo upload. Use Atlas Standard workflow."

**Full Workflow:**
```
"[TASK]. Use Atlas Full workflow."
```
Example: "Implement multi-photo batch upload. Use Atlas Full workflow."

---

## What Happens Next

### Quick Workflow
1. **Claude makes the change** (finds code, edits, verifies)
2. **Claude deploys** (runs `./scripts/deploy-qual.sh`)

### Standard Workflow
1. **Claude researches** (finds all related files, understands patterns)
2. **Claude plans** (designs approach, lists changes)
3. **Claude implements** (makes changes, adds tests)
4. **Claude reviews** (checks for edge cases, security)
5. **Claude deploys** (runs tests, deploys via script)

### Full Workflow
1. **Claude researches** (deep codebase exploration)
2. **Claude creates story** (formal requirements, acceptance criteria)
3. **Claude plans** (technical design, file-by-file plan)
4. **Claude adversarial reviews** (security audit, edge cases)
5. **Claude implements** (parallel coding when possible)
6. **Claude tests** (functional + UI verification)
7. **Claude validates** (confirms acceptance criteria)
8. **Claude cleans up** (organizes documentation)
9. **Claude deploys** (quality gates + deployment)

---

## Key Principles

### 1. Claude is the Orchestrator
- Claude executes all commands
- Claude runs all scripts
- You review and approve
- You never run commands manually (unless you want to)

### 2. Evidence is Created Automatically
Claude creates evidence as it works:
- Research findings
- Implementation logs
- Test results
- Validation reports

### 3. Deployment is Always Last
Every tier ends with:
```bash
./scripts/deploy-qual.sh
```
This ensures:
- Tests pass
- Linting passes
- Security checks pass
- Quality gates enforced

---

## Decision Flowchart

```
Task received
    │
    ├─ Affects 1 file + no logic? ────────────────────► Quick
    │
    ├─ Affects 2-5 files + some logic? ───────────────► Standard ⭐
    │
    ├─ Affects 6+ files OR complex logic? ────────────► Full
    │
    └─ Not sure? ─────────────────────────────────────► Standard (safe default)
```

---

## Examples by Category

### Quick Workflow Examples
- "Change button color to blue. Use Atlas Quick workflow."
- "Update copyright year in footer. Use Atlas Quick workflow."
- "Fix typo in error message. Use Atlas Quick workflow."
- "Update API endpoint URL. Use Atlas Quick workflow."

### Standard Workflow Examples
- "Fix crash when uploading photo without category. Use Atlas Standard workflow."
- "Add confirmation dialog before deleting profile. Use Atlas Standard workflow."
- "Extract validation logic into utility function. Use Atlas Standard workflow."
- "Fix sync button not updating after successful sync. Use Atlas Standard workflow."

### Full Workflow Examples
- "Implement dark mode with theme persistence. Use Atlas Full workflow."
- "Add cloud backup with encryption and restore. Use Atlas Full workflow."
- "Migrate database from localStorage to MySQL. Use Atlas Full workflow."
- "Implement biometric authentication for app access. Use Atlas Full workflow."

---

## Escalation

If Claude discovers mid-task that:
- Scope is larger than expected
- Security concerns emerge
- More files affected than thought

Claude will say:
```
"Escalating to [TIER] workflow. [REASON]"
```

Then restart from Phase 1 of the new tier.

---

## Documentation References

Need more detail?
- **Decision matrix**: [atlas/docs/WORKFLOW_TIERS.md](WORKFLOW_TIERS.md)
- **Full 9-phase workflow**: [atlas/docs/AGENT_WORKFLOW.md](AGENT_WORKFLOW.md)
- **Claude's role**: [atlas/LLM_ORCHESTRATOR_GUIDE.md](../LLM_ORCHESTRATOR_GUIDE.md)
- **Proven patterns**: [atlas/docs/ATLAS_SUCCESS_PATTERNS.md](ATLAS_SUCCESS_PATTERNS.md)
- **Distribution guide**: [atlas/DISTRIBUTION.md](../DISTRIBUTION.md)

---

## That's It!

**Quick Start:**
1. Choose tier (Quick/Standard/Full)
2. Tell Claude: "[TASK]. Use Atlas [TIER] workflow."
3. Claude does the work
4. You review and approve

**Default for 80% of tasks:** Standard workflow

**Remember:** Claude is the orchestrator. You never need to run commands unless you want to.