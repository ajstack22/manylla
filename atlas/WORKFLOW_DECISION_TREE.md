# Atlas Workflow Decision Tree

Use this simple decision tree to choose the right workflow tier for your task.

---

## Start Here

```
┌─────────────────────────────────────┐
│  I have a task to complete          │
└─────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ How many      │
         │ files will    │──── 1 file ─────┐
         │ change?       │                 │
         └───────────────┘                 ▼
                 │                  ┌──────────────┐
                 │                  │ Is it just   │
             2-5 files              │ text/config? │── Yes ──► QUICK
                 │                  │ (no logic)   │
                 ▼                  └──────────────┘
         ┌───────────────┐                 │
         │ Involves      │                 │
         │ complex       │── No ───► STANDARD     No
         │ logic or      │                 │
         │ new patterns? │                 ▼
         └───────────────┘          STANDARD
                 │
                Yes
                 │
                 ▼
         ┌───────────────┐
         │ 6+ files OR   │
         │ security OR   │── Yes ──► FULL
         │ cross-platform│
         └───────────────┘
                 │
                 No
                 │
                 ▼
            STANDARD
```

---

## Quick Reference Table

| Question | Quick | Standard | Full |
|----------|-------|----------|------|
| Files changed? | 1 | 2-5 | 6+ |
| Logic changes? | ❌ | ✅ Some | ✅✅ Complex |
| New patterns? | ❌ | Maybe | ✅ |
| Security impact? | ❌ | Low | ✅ High |
| Cross-platform? | ❌ | ❌ | ✅ |
| Time needed? | 5-10 min | 30-60 min | 2-4 hours |

---

## Decision Prompts

### Is it Quick?

**Ask yourself:**
- [ ] Only 1 file changes
- [ ] No logic changes (just text, config, or constants)
- [ ] Zero risk of breaking anything
- [ ] Existing tests already cover it

**If all YES** → Use **Quick** workflow

---

### Is it Full?

**Ask yourself:**
- [ ] Changes 6+ files OR creates new module
- [ ] Complex state management or logic
- [ ] Security/encryption involved
- [ ] Cross-platform coordination needed
- [ ] Requires formal requirements doc

**If any YES** → Use **Full** workflow

---

### Default to Standard

**If neither Quick nor Full** → Use **Standard** workflow

This covers ~80% of tasks:
- Bug fixes
- Small features
- Refactoring
- Test additions
- Most day-to-day work

---

## Visual Examples

### Quick Workflow
```
Task: Fix typo in error message
Files: 1 (ErrorMessages.js)
Logic: None
Risk: Zero
→ QUICK (5-10 min)
```

### Standard Workflow
```
Task: Add confirmation dialog before delete
Files: 2-3 (PhotoGallery.js, DeleteDialog.js, tests)
Logic: Some (dialog state, event handling)
Risk: Low (isolated feature)
→ STANDARD (30-60 min)
```

### Full Workflow
```
Task: Implement dark mode
Files: 8+ (theme files, all components, tests)
Logic: Complex (theme context, persistence, detection)
Risk: High (affects entire UI)
Cross-platform: Yes (web + mobile)
→ FULL (2-4 hours)
```

---

## Special Cases

### Escalation Mid-Task

If you start with **Quick** or **Standard** and discover:
- More files affected than expected
- Security concerns emerge
- Cross-platform issues appear

**Claude will escalate:**
```
"Escalating to [TIER] workflow. [REASON]"
```

Then restart from Phase 1 of the new tier.

---

### Emergency Fixes

**Production is down?**
- Use **Quick** workflow
- Skip some validation (with user approval)
- Fix fast, validate after

**Security vulnerability?**
- Use **Full** workflow
- Never skip security review
- Get peer review even under pressure

---

## Tier Breakdown

### Quick (2 Phases)
1. Make Change
2. Deploy

### Standard (5 Phases)
1. Research
2. Plan
3. Implement
4. Review
5. Deploy

### Full (9 Phases)
1. Research
2. Story Creation
3. Planning
4. Adversarial Review
5. Implementation
6. Testing
7. Validation
8. Clean-up
9. Deployment

---

## Command Format

Once you've chosen your tier:

```
[TASK DESCRIPTION]. Use Atlas [TIER] workflow.
```

**Examples:**
- "Fix typo in welcome screen. Use Atlas Quick workflow."
- "Add photo delete confirmation. Use Atlas Standard workflow."
- "Implement biometric auth. Use Atlas Full workflow."

---

## When in Doubt

**Ask Claude:**
```
"Should I use Quick, Standard, or Full workflow for [TASK]?"
```

Claude will analyze and recommend the appropriate tier.

**Or default to Standard** - It's the safe choice for 80% of tasks.

---

## Documentation Links

- [QUICK_START.md](QUICK_START.md) - Complete beginner guide
- [WORKFLOW_COMMANDS.md](WORKFLOW_COMMANDS.md) - Command cheat sheet
- [docs/WORKFLOW_TIERS.md](docs/WORKFLOW_TIERS.md) - Detailed tier guide
- [README.md](README.md) - Atlas overview

---

**TL;DR:** Not sure? Use **Standard** workflow. It's the right choice 80% of the time.
