# PM Role & Critical Learnings

## Core Responsibility
Manage development workflow, prioritize work, ensure quality standards.

## New Backlog Management Process
```bash
# Manage work priorities
cat processes/BACKLOG.md                         # Review current priorities
./scripts/update-backlog-priority.sh                    # Reorder work items

# Create new work items
./scripts/create-story.sh "Title" P1                    # Create prioritized story
./scripts/create-bug.sh "Bug" P0 Critical              # Log critical bug

# Convert tech debt to stories
./scripts/tech-debt-to-story.sh drafts/debt.md         # Prioritize tech debt

# Epic management
cat processes/EPIC_REVIEW_PROCESS.md  # Multi-story coordination
```

## Critical Commands & Metrics
```bash
# Architecture compliance (MUST BE ZERO)
find src -name "*.tsx" -o -name "*.ts" | wc -l          # Must be 0
find src -name "*.native.*" -o -name "*.web.*" | wc -l  # Must be 0

# Quality gates
grep -r "TODO\|FIXME" src/ --include="*.js" | wc -l     # Max 20
grep -r "console\.log" src/ --include="*.js" | wc -l    # Max 5
npm run build:web                                        # Must pass
```

## Decision Authority
**CAN**: Work priorities, acceptance, deployment timing, peer review needs
**CANNOT**: Architecture changes, production deploy, feature removal

## Critical Learnings (Prevent These Mistakes)

### 1. Duplicate Components Kill Productivity
**MISTAKE**: OnboardingScreen.js + OnboardingWizard.js = demo mode bug
**PREVENTION**: Regular duplicate audits after refactors
**COMMAND**: `find src -name "*.js" | xargs basename | sort | uniq -d`

### 2. Build Directory Confusion Breaks Deployments
**MISTAKE**: Both `build/` and `web/build/` existed
**CORRECT**: `web/build/` is the ONLY build output (Webpack config)
**PREVENTION**: Remove obsolete directories immediately

### 3. String "default" as Photo Value = Production 404s
**MISTAKE**: Using "default" string for empty photo
**CORRECT**: Use `null` for empty values
**PREVENTION**: Never use strings that could be URLs

### 4. Priority Number Conflicts = Workflow Chaos
**MISTAKE**: Multiple 03-medium packs
**CORRECT**: Unique numbers ALWAYS (01, 02, 03, never duplicate)
**PREVENTION**: Check before creating: `ls prompts/active/` (if using prompts)

### 5. Documentation Debt = 30% Waste
**PATTERN**: Phase transitions leave obsolete docs
**PREVENTION**: Audit after major changes, archive aggressively

### 6. Root Directory Clutter = Developer Confusion
**PATTERN**: Test/migration scripts accumulate
**PREVENTION**: Move to archive after use: `mv script.js archive/`

### 7. Platform-Specific Files = Architecture Violation
**MISTAKE**: `.native.js` or `.web.js` files
**CORRECT**: Use Platform.select() in single `.js` file
**VALIDATION**: Must always return 0 files

### 8. Deployment Without Validation = Production Issues
**SUCCESS**: deploy-qual.sh caught ALL issues
**REQUIREMENT**: Never bypass validation checks

### 9. Parallel Work = 30% Efficiency Gain
**SUCCESS**: Admin + Dev + PR working simultaneously
**KEY**: Clear role boundaries, no overlapping files

### 10. Photo Input Validation Critical
**IMPLEMENTATION REQUIRED**:
- File type: JPEG, PNG, GIF, WebP only
- Size limit: 5MB max
- Error messaging required
- Platform fallbacks needed

## Proven Patterns

### Prompt Pack Naming (if using story system)
```
PP-SSS-title.md where:
PP = Priority (01-99) - changes with reprioritization
SSS = Story ID (001-999) - permanent identifier
```

### Emergency Response
```bash
# Production issue
./scripts/create-prompt-pack.sh 01-critical fix-production-bug
# Immediate assignment to Developer
# Fast-track peer review
# Deploy immediately after validation
```

### Backup Before Destruction
```bash
# ALWAYS before cleanup
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz target/
rm -rf target/
```

## Working Agreements (Non-Negotiable)
- NO TypeScript files (JavaScript only)
- NO platform-specific files (.native/.web)
- NO Material-UI imports
- Build output: `web/build/` NOT `build/`
- Primary color: #A08670 NOT #8B7355
- Unique priority numbers ALWAYS

## Quick Status Check
```bash
# Run this before any deployment
find src -name "*.tsx" -o -name "*.ts" | wc -l
find src -name "*.native.*" -o -name "*.web.*" | wc -l
grep -r "console\.log" src/ | wc -l
npm run build:web
```

All must pass or work is not complete.

---
*Last Updated: 2025.09.11*