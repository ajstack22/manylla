# Atlas Documentation Index

Complete navigation guide for the Atlas Framework.

---

## 🚀 Getting Started (Start Here!)

| Document | Purpose | Who It's For |
|----------|---------|--------------|
| [QUICK_START.md](QUICK_START.md) ⭐ | Step-by-step guide with examples | **Everyone** - Start here |
| [REFERENCE_CARD.md](REFERENCE_CARD.md) 📄 | One-page quick reference | Print & keep handy |
| [WORKFLOW_COMMANDS.md](WORKFLOW_COMMANDS.md) | Command reference cheat sheet | Quick lookup during work |
| [WORKFLOW_DECISION_TREE.md](WORKFLOW_DECISION_TREE.md) | Visual decision tree | When unsure which tier to use |
| [SETUP_SUMMARY.md](SETUP_SUMMARY.md) | What was set up & how to verify | Post-installation check |
| [README.md](README.md) | Atlas overview and philosophy | Understanding the system |

---

## 📚 Core Documentation

### Workflow Guides

| Document | Purpose |
|----------|---------|
| [docs/WORKFLOW_TIERS.md](docs/WORKFLOW_TIERS.md) | Detailed tier selection matrix |
| [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md) | Full 9-phase workflow details |
| [docs/WORKFLOW_USAGE.md](docs/WORKFLOW_USAGE.md) | How to use workflows effectively |
| [docs/ATLAS_SUCCESS_PATTERNS.md](docs/ATLAS_SUCCESS_PATTERNS.md) | Proven patterns from production |
| [docs/ATLAS_WORKFLOW_DIAGRAM.md](docs/ATLAS_WORKFLOW_DIAGRAM.md) | Visual workflow representations |

### LLM/Claude Integration

| Document | Purpose |
|----------|---------|
| [LLM_ORCHESTRATOR_GUIDE.md](LLM_ORCHESTRATOR_GUIDE.md) | How Claude acts as orchestrator |
| [DISTRIBUTION.md](DISTRIBUTION.md) | How to use Atlas in other projects |
| [MIGRATION_NOTES.md](MIGRATION_NOTES.md) | Notes on migrating to Atlas Lite |

---

## 🛠️ Templates & Examples

### Templates

| Document | Purpose |
|----------|---------|
| [templates/README.md](templates/README.md) | Template overview |
| [templates/01_EVIDENCE_TEMPLATES.md](templates/01_EVIDENCE_TEMPLATES.md) | Evidence documentation patterns |
| [templates/BUG_REPORT_TEMPLATE.md](templates/BUG_REPORT_TEMPLATE.md) | Bug report format |
| [templates/PULL_REQUEST_TEMPLATE.md](templates/PULL_REQUEST_TEMPLATE.md) | PR standards |

### Real-World Examples

| Document | Purpose |
|----------|---------|
| [examples/smilepile-migration/README.md](examples/smilepile-migration/README.md) | Cross-platform migration case study |
| [examples/smilepile-migration/stories/](examples/smilepile-migration/stories/) | Production stories from real project |
| [examples/smilepile-migration/android_feature_burndown/](examples/smilepile-migration/android_feature_burndown/) | Feature analysis examples |

---

## 🏗️ Legacy/Reference

### Core Scripts (Reference Only - Agent-driven now)

| Document | Purpose |
|----------|---------|
| [core/DEPRECATION_NOTICE.md](core/DEPRECATION_NOTICE.md) | **READ THIS** - Why scripts are deprecated |
| [core/atlas_workflow.py](core/atlas_workflow.py) | Legacy Python workflow script |
| [core/atlas_research.py](core/atlas_research.py) | Legacy research script |
| [core/atlas_story.py](core/atlas_story.py) | Legacy story creation script |
| [core/atlas_adversarial.py](core/atlas_adversarial.py) | Legacy review script |
| [core/atlas_checkpoint.py](core/atlas_checkpoint.py) | Legacy checkpoint management |

**Note:** These scripts are maintained for reference but superseded by agent-driven workflow.

---

## 📋 Quick Navigation by Task

### "I want to..."

**...get started with Atlas**
→ [QUICK_START.md](QUICK_START.md)

**...know which workflow to use**
→ [WORKFLOW_DECISION_TREE.md](WORKFLOW_DECISION_TREE.md)

**...see command examples**
→ [WORKFLOW_COMMANDS.md](WORKFLOW_COMMANDS.md)

**...understand the full 9-phase workflow**
→ [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md)

**...learn tier selection criteria**
→ [docs/WORKFLOW_TIERS.md](docs/WORKFLOW_TIERS.md)

**...see how Claude orchestrates**
→ [LLM_ORCHESTRATOR_GUIDE.md](LLM_ORCHESTRATOR_GUIDE.md)

**...use Atlas in another project**
→ [DISTRIBUTION.md](DISTRIBUTION.md)

**...see real-world examples**
→ [examples/smilepile-migration/README.md](examples/smilepile-migration/README.md)

**...learn proven patterns**
→ [docs/ATLAS_SUCCESS_PATTERNS.md](docs/ATLAS_SUCCESS_PATTERNS.md)

**...create evidence docs**
→ [templates/01_EVIDENCE_TEMPLATES.md](templates/01_EVIDENCE_TEMPLATES.md)

---

## 🎯 Quick Reference Cards

### Workflow Tiers

| Tier | Files | Time | Use For |
|------|-------|------|---------|
| **Quick** | 1 | 5-10 min | Trivial changes (typos, config) |
| **Standard** ⭐ | 2-5 | 30-60 min | Most tasks (bugs, small features) |
| **Full** | 6+ | 2-4 hours | Complex features (epics, security) |

### Command Format

```
[TASK]. Use Atlas [Quick|Standard|Full] workflow.
```

### Available Agents

Located in `.claude/agents/` (project root):
- `developer` - Planning & implementation
- `product-manager` - Story creation & validation
- `peer-reviewer` - Quality & edge case review
- `devops` - Deployment & quality gates
- `security` - Security auditing

---

## 📖 Reading Order

### For New Users

1. [QUICK_START.md](QUICK_START.md) - Get oriented
2. [WORKFLOW_COMMANDS.md](WORKFLOW_COMMANDS.md) - Learn commands
3. [WORKFLOW_DECISION_TREE.md](WORKFLOW_DECISION_TREE.md) - Choose tiers
4. [docs/WORKFLOW_TIERS.md](docs/WORKFLOW_TIERS.md) - Deep dive on tiers

### For Deep Understanding

1. [README.md](README.md) - Philosophy and overview
2. [LLM_ORCHESTRATOR_GUIDE.md](LLM_ORCHESTRATOR_GUIDE.md) - How Claude works
3. [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md) - Full workflow
4. [docs/ATLAS_SUCCESS_PATTERNS.md](docs/ATLAS_SUCCESS_PATTERNS.md) - Patterns
5. [examples/smilepile-migration/README.md](examples/smilepile-migration/README.md) - Real case

### For Distribution/Setup

1. [DISTRIBUTION.md](DISTRIBUTION.md) - Setup guide
2. [MIGRATION_NOTES.md](MIGRATION_NOTES.md) - Migration notes
3. [templates/](templates/) - Available templates

---

## 🔍 Document Status

| Status | Meaning |
|--------|---------|
| ⭐ | Recommended starting point |
| 🆕 | Recently added/updated |
| 📦 | Legacy/reference only |
| 🚧 | Work in progress |

---

## 📞 Help & Support

**Can't find what you need?**

1. Check [QUICK_START.md](QUICK_START.md) first
2. Use [WORKFLOW_COMMANDS.md](WORKFLOW_COMMANDS.md) for commands
3. Review [WORKFLOW_DECISION_TREE.md](WORKFLOW_DECISION_TREE.md) for tier selection
4. Ask Claude: "How do I [TASK] using Atlas?"

**Found a problem or have a suggestion?**
- Update the relevant documentation
- Share successful patterns in [docs/ATLAS_SUCCESS_PATTERNS.md](docs/ATLAS_SUCCESS_PATTERNS.md)

---

## 🎓 Atlas Philosophy

From [README.md](README.md):

> "The Atlas system succeeds not because of rigid process, but because it combines structure with pragmatism, documentation with action, and sequential phases with parallel execution."

**20% of the code. 100% of the value. 0% of the bloat.**

---

## 📄 License

MIT - Use it, modify it, share what works.

---

**Last Updated:** 2025-10-02
**Atlas Version:** Lite (Pragmatic Edition)
