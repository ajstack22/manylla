# Atlas Quick Reference Card

One-page reference for daily use.

---

## Workflow Command Format

```
[TASK DESCRIPTION]. Use Atlas [TIER] workflow.
```

---

## Choose Your Tier

| Files | Time | Tier | Example |
|-------|------|------|---------|
| 1 | 5-10 min | **Quick** | "Fix typo. Use Atlas Quick workflow." |
| 2-5 | 30-60 min | **Standard** ⭐ | "Fix login bug. Use Atlas Standard workflow." |
| 6+ | 2-4 hours | **Full** | "Add dark mode. Use Atlas Full workflow." |

**Not sure? → Use Standard**

---

## Workflow Phases

### Quick (2 phases)
1. Make Change
2. Deploy

### Standard (5 phases) ⭐ Most Common
1. Research
2. Plan
3. Implement
4. Review
5. Deploy

### Full (9 phases)
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

## Available Agents

Launch with: `Launch [agent] agent to [task]`

- **developer** - Planning & implementation
- **product-manager** - Story creation & validation
- **peer-reviewer** - Quality & edge case review
- **devops** - Deployment & quality gates
- **security** - Security auditing

---

## Common Commands

**Trivial change:**
```
"Change button color to blue. Use Atlas Quick workflow."
```

**Bug fix:**
```
"Fix null pointer in photo upload. Use Atlas Standard workflow."
```

**Feature:**
```
"Add confirmation dialog before delete. Use Atlas Standard workflow."
```

**Epic:**
```
"Implement offline mode with sync. Use Atlas Full workflow."
```

**Security audit:**
```
Launch security agent to audit authentication system.
```

**Code review:**
```
Launch peer-reviewer agent to review PhotoGallery implementation.
```

---

## Decision Flowchart

```
1 file + no logic? ────────────► Quick
2-5 files + some logic? ───────► Standard ⭐
6+ files OR high complexity? ──► Full
Not sure? ─────────────────────► Standard
```

---

## Quality Gates (Always Enforced)

Every workflow ends with:
```bash
./scripts/deploy-qual.sh
```

This ensures:
- ✅ Tests pass
- ✅ Linting passes
- ✅ Security checks pass
- ✅ No excessive TODOs/console.logs

**Never bypass quality gates.**

---

## Documentation Quick Links

- [QUICK_START.md](QUICK_START.md) - Full guide
- [WORKFLOW_COMMANDS.md](WORKFLOW_COMMANDS.md) - More examples
- [WORKFLOW_DECISION_TREE.md](WORKFLOW_DECISION_TREE.md) - Visual guide
- [INDEX.md](INDEX.md) - Navigate all docs

---

## Key Principles

1. **Claude is the orchestrator** - You tell Claude what to do, Claude executes everything
2. **Evidence is automatic** - Claude creates documentation as it works
3. **Default to Standard** - Right choice for 80% of tasks
4. **Quality gates enforced** - Tests and validation always run
5. **Escalate if needed** - Claude will escalate to higher tier if complexity increases

---

## Escalation

If Claude says:
```
"Escalating to [TIER] workflow. [REASON]"
```

Claude will restart from Phase 1 of the new tier.

---

## Typical Usage

```
You:    "Fix the sync button not updating after successful sync.
         Use Atlas Standard workflow."

Claude: [Executes 5 phases automatically]
        Phase 1: Research - Finding sync button implementation...
        Phase 2: Plan - Designing state update approach...
        Phase 3: Implement - Making changes and adding tests...
        Phase 4: Review - Checking for edge cases...
        Phase 5: Deploy - Running tests and deploying...

        ✅ Complete. Deployed to qual.
```

---

## Emergency Situations

**Production down:**
- Use Quick workflow
- Fix fast, validate after
- Document what happened

**Security vulnerability:**
- Use Full workflow
- Never skip security review
- Get peer review even under pressure

---

## Anti-Patterns

❌ Don't Do:
- "Run Atlas workflow for typo fix" (overkill - use Quick)
- Skip deployment phase (always deploy)
- Manually run commands (let Claude orchestrate)
- Use Full for simple tasks (wastes time)

✅ Do Instead:
- "Fix typo. Use Atlas Quick workflow."
- Always let workflow complete with deployment
- Let Claude run all commands
- Use Standard for most work, Full only when needed

---

## Success Metrics

| Tier | Target Time | Pass If |
|------|-------------|---------|
| Quick | < 15 min | Change deployed, tests pass |
| Standard | 30-60 min | Feature complete, peer reviewed |
| Full | 2-4 hours | Acceptance criteria met, zero defects |

---

**Print this card. Keep it handy. Reference often.**

---

*Atlas Lite: 20% of the code. 100% of the value. 0% of the bloat.*
