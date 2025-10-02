# Atlas Workflow Command Reference

Quick reference for invoking Atlas workflows in Claude Code.

---

## Quick Workflow (5-10 minutes)

**When to use:**
- 1 file changed
- No logic changes
- Zero risk

**Command:**
```
[TASK]. Use Atlas Quick workflow.
```

**Examples:**
```
Fix typo in error message. Use Atlas Quick workflow.
Change primary color to #FF5733. Use Atlas Quick workflow.
Update copyright year in footer. Use Atlas Quick workflow.
```

---

## Standard Workflow (30-60 minutes) ⭐ DEFAULT

**When to use:**
- 2-5 files changed
- Some logic changes
- Low-medium risk
- Most bug fixes
- Small features

**Command:**
```
[TASK]. Use Atlas Standard workflow.
```

**Examples:**
```
Fix null pointer when uploading photo without category. Use Atlas Standard workflow.
Add confirmation dialog before deleting photos. Use Atlas Standard workflow.
Extract photo validation logic into utility class. Use Atlas Standard workflow.
```

---

## Full Workflow (2-4 hours)

**When to use:**
- 6+ files changed
- Complex logic
- High risk
- Security implications
- Cross-platform features
- New modules

**Command:**
```
[TASK]. Use Atlas Full workflow.
```

**Examples:**
```
Implement dark mode with theme persistence across all platforms. Use Atlas Full workflow.
Add cloud backup with encryption and restore capability. Use Atlas Full workflow.
Migrate from localStorage to MySQL with zero-knowledge sync. Use Atlas Full workflow.
```

---

## Not Sure Which Tier?

**Use Standard workflow.** It's the right choice for 80% of tasks.

---

## Escalation

If Claude discovers the task is more complex than expected:

```
Escalating to [Standard|Full] workflow. [REASON]
```

Claude will restart from Phase 1 of the new tier.

---

## Agent-Only Commands (Advanced)

**Launch specific agent:**
```
Launch [agent-type] agent to [TASK].
```

**Available agents:**
- `developer` - Planning & implementation
- `product-manager` - Story creation & validation
- `peer-reviewer` - Quality & edge case review
- `devops` - Deployment & quality gates
- `security` - Security auditing

**Example:**
```
Launch security agent to audit authentication implementation for vulnerabilities.
```

---

## Deployment Command

Every workflow tier ends with deployment:
```bash
./scripts/deploy-qual.sh
```

**Never bypass this.** It enforces:
- Test execution
- Linting
- Security checks
- Quality gates

---

## Documentation Links

- [QUICK_START.md](QUICK_START.md) - Complete beginner guide
- [docs/WORKFLOW_TIERS.md](docs/WORKFLOW_TIERS.md) - Decision matrix
- [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md) - Full 9-phase details
- [LLM_ORCHESTRATOR_GUIDE.md](LLM_ORCHESTRATOR_GUIDE.md) - Claude's role

---

## Cheat Sheet

| Task | Command |
|------|---------|
| Typo fix | `Fix [typo]. Use Atlas Quick workflow.` |
| Bug fix | `Fix [bug]. Use Atlas Standard workflow.` |
| Small feature | `Add [feature]. Use Atlas Standard workflow.` |
| Epic feature | `Implement [epic]. Use Atlas Full workflow.` |
| Security audit | `Launch security agent to audit [component].` |
| Code review | `Launch peer-reviewer agent to review [code].` |

---

**Remember:** Claude is the orchestrator. You just say what you want, Claude does the work.
