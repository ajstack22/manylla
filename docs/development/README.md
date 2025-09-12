# Manylla Development Framework

## 📁 Structure Overview

```
docs/development/
├── processes/          # Development workflows and methodologies
├── stories/           # Individual implementation tasks
├── epics/            # Collections of related stories
├── roles/            # Team role definitions and responsibilities
└── templates/        # Reusable templates for stories/epics
```

## 🚀 Quick Start Guide

### For a Single Story
1. Copy `templates/story-template.md`
2. Fill in requirements and success metrics
3. Apply `processes/ADVERSARIAL_REVIEW_PROCESS.md`
4. Iterate until approved

### For an Epic (Multiple Stories)
1. Copy `templates/epic-template.md`
2. Break down into individual stories
3. Apply `processes/EPIC_REVIEW_PROCESS.md`
4. Validate both story-level and epic-level

## 📋 Process Documentation

### Core Processes

#### 1. [Adversarial Review Process](processes/ADVERSARIAL_REVIEW_PROCESS.md)
**Purpose**: Rigorous validation of individual story implementations
**When to use**: Any non-trivial story requiring quality assurance
**Key feature**: Developer vs Peer Reviewer adversarial validation

#### 2. [Epic Review Process](processes/EPIC_REVIEW_PROCESS.md)
**Purpose**: Manage multi-story implementations with integration validation
**When to use**: Large features requiring multiple coordinated stories
**Key feature**: Story-level + Epic-level validation

## 👥 Role Definitions

### Primary Roles
- **[Developer](roles/DEVELOPER_ROLE_AND_LEARNINGS.md)** - Implements stories
- **[Peer Reviewer](roles/PEER_REVIEWER_ROLE_AND_LEARNINGS.md)** - Validates implementations
- **[PM](roles/PM_ROLE_AND_LEARNINGS.md)** - Defines epics and priorities
- **[Admin](roles/ADMIN_ROLE_AND_LEARNINGS.md)** - System configuration

### Platform Specialists
- **[Web Platform Expert](roles/WEB_PLATFORM_EXPERT_ROLE.md)**
- **[iOS Platform Expert](roles/IOS_PLATFORM_EXPERT_ROLE.md)**
- **[Android Platform Expert](roles/ANDROID_PLATFORM_EXPERT_ROLE.md)**
- **[UI/UX Specialist](roles/UI_UX_SPECIALIST_ROLE.md)**

## 📝 How to Use This Framework

### Step 1: Define Your Work

#### For a Story:
```markdown
1. Identify if it's a single story or part of an epic
2. Use templates/story-template.md
3. Define clear requirements and success metrics
4. Include verification commands
```

#### For an Epic:
```markdown
1. Use templates/epic-template.md
2. Break down into 3-7 stories
3. Define story dependencies
4. Set epic-level success criteria
```

### Step 2: Select Your Process

| Work Type | Process to Use | Review Style |
|-----------|---------------|--------------|
| Single Story | ADVERSARIAL_REVIEW_PROCESS | Developer → Peer Reviewer |
| Epic (Multi-Story) | EPIC_REVIEW_PROCESS | Per-Story + Integration |
| Bug Fix | Direct implementation | Simple verification |
| Documentation | Direct implementation | Proofreading only |

### Step 3: Execute with Roles

```markdown
1. **Developer** receives story/epic
2. **Developer** implements following role guidelines
3. **Peer Reviewer** validates adversarially
4. Iterate until approved
5. For epics: **PM/Lead** performs final integration review
```

### Step 4: Document Outcomes

```markdown
- Update story/epic with completion status
- Document any technical debt in TECH_DEBT.md
- Update RELEASE_NOTES.md if user-facing
- Archive completed stories/epics
```

## 🎯 Success Metrics

### Story Success
- ✅ All requirements implemented
- ✅ All verification commands pass
- ✅ Peer Reviewer approved
- ✅ No regressions introduced

### Epic Success
- ✅ All stories individually approved
- ✅ Integration tests pass
- ✅ Epic-level criteria met
- ✅ Performance maintained

## 🔄 Workflow Examples

### Example 1: Platform Migration (Epic)
```
Epic: Platform Consolidation
├── Story 1: Create platform abstraction
├── Story 2: Migrate to @platform imports
├── Story 3: Configure build tools
└── Story 4: Create validation suite

Process: EPIC_REVIEW_PROCESS
Each story: ADVERSARIAL_REVIEW_PROCESS
```

### Example 2: Bug Fix (Single Story)
```
Story: Fix Android module resolution
Process: ADVERSARIAL_REVIEW_PROCESS
Roles: Developer + Peer Reviewer
```

### Example 3: New Feature (Epic)
```
Epic: User Authentication
├── Story 1: Database schema
├── Story 2: API endpoints
├── Story 3: UI components
└── Story 4: Integration tests

Process: EPIC_REVIEW_PROCESS
```

## 📊 Process Selection Matrix

| Complexity | Duration | Team Size | Recommended Process |
|------------|----------|-----------|-------------------|
| Low | < 1 day | 1 person | Direct implementation |
| Medium | 1-3 days | 1-2 people | ADVERSARIAL_REVIEW |
| High | 3-10 days | 2-4 people | EPIC_REVIEW |
| Very High | > 10 days | 4+ people | EPIC_REVIEW + Planning |

## 🛠️ Tools and Automation

### Validation Scripts
```bash
# Story validation
./scripts/validate-story-[name].sh

# Epic validation
./scripts/validate-epic-[name].sh

# General validation
npm run lint
npm run test
npm run build:all
```

### Templates Location
- `templates/story-template.md` - Single story definition
- `templates/epic-template.md` - Multi-story epic definition
- `templates/story-with-review-example.md` - Complete example

## 📚 Current Active Work

### Stories
- [Platform Alias Migration](stories/platform-alias-migration.md)
- [Android Module Resolution Fix](stories/android-module-resolution-fix.md)

### Epics
- (Add active epics here)

## 🔍 Best Practices

### For Stories
1. **Be specific** - Vague requirements lead to rejection
2. **Include verification** - Commands that prove success
3. **Consider edge cases** - Especially platform differences
4. **Document assumptions** - Avoid misunderstandings

### For Epics
1. **Right-size stories** - Not too big, not too small
2. **Define dependencies** - Clear sequencing
3. **Test integration** - Stories must work together
4. **Plan rollback** - Always have an escape route

### For Reviews
1. **Be adversarial** - Try to find failures
2. **Demand evidence** - No claims without proof
3. **Check regressions** - Ensure nothing broke
4. **Be specific** - Exact commands and outputs

## 🚨 Common Pitfalls

### Story Pitfalls
- ❌ Requirements too vague
- ❌ No success metrics defined
- ❌ Missing platform testing
- ❌ No verification commands

### Epic Pitfalls
- ❌ Stories too tightly coupled
- ❌ No integration testing
- ❌ Missing rollback plan
- ❌ Unclear dependencies

### Review Pitfalls
- ❌ Accepting claims without evidence
- ❌ Not testing all platforms
- ❌ Missing regression checks
- ❌ Approving incomplete work

## 📈 Continuous Improvement

This framework evolves based on learnings:
1. Document failures in role LEARNINGS sections
2. Update templates based on patterns
3. Add new processes as needed
4. Refine success metrics

---

*Framework Version: 1.0*
*Last Updated: 2025-09-12*
*Maintained by: Development Team*

**Remember**: The goal is quality through rigorous validation, not speed through shortcuts.