# Platform Consolidation - Git Strategy & Execution Plan

## Overview
Major refactor to eliminate all direct Platform.OS checks (133 instances) and Platform.select calls (57 instances) by centralizing platform logic into a single abstraction layer.

## Git Branch Strategy

### Branch Structure
```
main
  └── feature/platform-consolidation
       ├── Step 1: Import resolution (commit)
       ├── Step 2: Platform.js creation (commit)  
       ├── Step 3: Phased migration (commit)
       ├── Step 4: Validation suite (commit)
       └── Step 5: Final execution (commit)
```

### Branch Creation
```bash
# Ensure main is clean and up to date
git checkout main
git pull origin main
git status  # Should show clean working tree

# Create feature branch
git checkout -b feature/platform-consolidation

# Verify branch
git branch --show-current  # Should show: feature/platform-consolidation
```

## Execution Plan

### Pre-Migration Checklist
- [ ] Main branch is clean
- [ ] All current work committed
- [ ] Feature branch created
- [ ] Team notified of major refactor
- [ ] 4-hour block scheduled
- [ ] NODE_OPTIONS configured: `export NODE_OPTIONS=--max-old-space-size=8192`

### Step-by-Step Execution

#### Step 1: Import Resolution Setup (15 mins)
**Prompt Pack**: `01-critical-platform-import-resolution.md`
```bash
# After implementation
git add -A
git commit -m "build: Configure webpack/babel aliases for platform imports

- Add @platform alias to webpack.config.js
- Configure metro.config.js for React Native
- Update babel.config.js with module resolver
- Install babel-plugin-module-resolver

This enables clean imports like 'import platform from @platform'
instead of relative paths."
```

#### Step 2: Create Platform Abstraction (30 mins)
**Prompt Pack**: `02-critical-complete-platform-abstraction.md`
```bash
git add -A
git commit -m "feat: Create complete platform abstraction layer

- Add src/utils/platform.js with all platform detection
- Include feature flags for all capabilities
- Add helper functions for styles, components, API
- Include clipboard, share, print functionality
- Add performance monitoring utilities

Platform.js now handles ALL platform differences centrally."
```

#### Step 3: Phased Migration (2-3 hours)
**Prompt Pack**: `03-high-safe-platform-migration.md`
```bash
# Commit after each phase for rollback points
git add -A
git commit -m "refactor(phase1): Migrate low-risk files to platform abstraction

- Migrate X files with simple Platform.OS checks
- All tests passing
- Build successful"

git add -A  
git commit -m "refactor(phase2): Migrate medium-risk files to platform abstraction

- Migrate Y files with Platform.select usage
- All tests passing
- Build successful"

git add -A
git commit -m "refactor(phase3): Migrate high-risk files to platform abstraction

- Migrate Z critical files with complex platform logic
- All tests passing
- Build successful"
```

#### Step 4: Validation Suite (30 mins)
**Prompt Pack**: `04-high-platform-validation-testing.md`
```bash
git add -A
git commit -m "test: Add comprehensive platform migration validation

- Add validation scripts to verify migration
- Create performance benchmarking
- Add visual regression tests
- Generate migration report

Validation confirms 0 Platform.OS references remain."
```

#### Step 5: Final Consolidation (Optional)
**Prompt Pack**: `05-medium-platform-consolidation-execution.md`
```bash
# Only if needed for any remaining cleanup
git add -A
git commit -m "refactor: Complete platform consolidation

- Remove any remaining Platform references
- Clean up unused imports
- Final validation passing

RESULT: 0 Platform.OS, 0 old Platform.select remaining"
```

## Validation Checkpoints

### After Each Step
```bash
# Run validation
npm test
npm run build:web

# Check for remaining Platform.OS
grep -r "Platform\.OS" src/ --include="*.js" | wc -l  # Should decrease each step

# Verify no TypeScript files
find src -name "*.ts" -o -name "*.tsx" | wc -l  # Must be 0

# Check bundle size
du -sh web/build/
```

### Final Validation
```bash
# Complete validation
grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l  # Must be 0
grep -r "Platform\.select" src/ --include="*.js" | grep -v "platform\.select" | wc -l  # Must be 0
npm test  # All passing
npm run build:web  # Successful
```

## Rollback Strategy

### If Issues at Any Step
```bash
# Rollback to previous commit
git reset --hard HEAD~1

# Or rollback to specific step
git log --oneline  # Find commit hash
git reset --hard <commit-hash>

# Nuclear option - abandon branch
git checkout main
git branch -D feature/platform-consolidation
```

### If Migration Succeeds
```bash
# Push branch to remote
git push origin feature/platform-consolidation

# Create Pull Request
# Title: "Refactor: Complete platform consolidation - Remove all Platform.OS checks"
# Description: Link to this strategy doc and migration report

# After PR approval and testing
git checkout main
git merge feature/platform-consolidation
git push origin main
```

## Success Metrics

### Must Pass Before Merge
- ✅ 0 Platform.OS references (except in platform.js)
- ✅ 0 old Platform.select calls
- ✅ All tests passing
- ✅ Web build successful
- ✅ Bundle size increase < 5%
- ✅ No TypeScript files
- ✅ No .native.js or .web.js files

### Performance Targets
- Platform.js load time < 50ms
- No increase in initial render time
- Memory usage stable

## Risk Mitigation

### Backup Strategy
```bash
# Before starting
tar -czf backup-before-platform-$(date +%Y%m%d-%H%M%S).tar.gz src/

# Can also push to a backup branch
git checkout -b backup/pre-platform-consolidation
git push origin backup/pre-platform-consolidation
git checkout feature/platform-consolidation
```

### Communication Plan
1. Notify team before starting major refactor
2. Update team after each major step
3. Request code review after Step 3 (before final validation)
4. Announce completion with metrics

## Timeline

### Estimated Duration: 4 hours
- Step 1: 15 minutes
- Step 2: 30 minutes  
- Step 3: 2-3 hours
- Step 4: 30 minutes
- Step 5: 15 minutes (if needed)
- Buffer: 30 minutes

### Optimal Execution Window
- Start early in day (9-10 AM)
- Not on Friday (in case of issues)
- When team is available for questions
- After current sprint work is complete

## Post-Migration Tasks

### After Successful Merge
1. Delete feature branch locally and remotely
2. Archive migration scripts to `/archive/platform-migration/`
3. Update CLAUDE.md with new platform approach
4. Document lessons learned
5. Monitor for any issues in production

### Documentation Updates
- Update developer onboarding docs
- Add platform.js usage examples
- Update component guidelines
- Create migration retrospective

## Emergency Contacts

If issues arise during migration:
1. Check this strategy document
2. Review prompt packs for specific guidance
3. Use rollback strategy if blocked
4. Commit progress even if partial

---

## Quick Start Commands

```bash
# Start migration
git checkout main
git pull
git checkout -b feature/platform-consolidation

# After each step
git add -A
git commit -m "feat: [description]"

# Validate progress
grep -r "Platform\.OS" src/ --include="*.js" | wc -l

# If issues
git reset --hard HEAD~1

# When complete
git push origin feature/platform-consolidation
# Create PR on GitHub
```

---

*Last Updated: 2025-09-11*
*Prompt Packs: Located in `/docs/prompts/active/`*
*Execution Order: 01-critical → 02-critical → 03-high → 04-high → 05-medium*