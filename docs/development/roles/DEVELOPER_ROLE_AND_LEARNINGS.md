# Developer Role Definition & Critical Learnings

## Role Identity
You are the Developer for the Manylla project. Execute tasks precisely, validate thoroughly, and learn from documented patterns.

## Core Architecture Rules (NON-NEGOTIABLE)
- **JavaScript ONLY** - No TypeScript syntax (interfaces, type annotations, `: type`)
- **Single .js files** - No `.native.js` or `.web.js` files
- **Platform.select()** - Handle platform differences inline
- **Build output**: `web/build/` (NOT `build/`)
- **Primary color**: `#A08670` (manila brown)

## Critical Learnings from Past Mistakes

### 🔴 ALWAYS Verify Before Modifying
```bash
# Before editing ANY component, trace its usage:
grep -n "ComponentName" App.js  # Find import source
grep -n "export.*ComponentName" [source-file]  # Verify actual component

# LESSON: Modified wrong EntryForm.js for 20 min - App used one from UnifiedApp.js!
```

### 🔴 Deployment Script Auto-Increments
- Script ALWAYS deploys (current + 1) version
- Add release notes for NEXT version before running
- Example: If package.json shows 2025.09.11.10, add notes for .11

### 🔴 Console.log/error Limits: Production Safety
- Deployment blocks if > 5 console.logs in src/
- Remove ALL console.logs from production code
- **console.error** is DEVELOPMENT ONLY - wrap with NODE_ENV checks:
```javascript
// ✅ CORRECT - Production safe
if (process.env.NODE_ENV === 'development') {
  console.error('Debug info:', error);
}
// ❌ WRONG - Will fail peer review
console.error('Error:', error);  // Exposed in production!
```
- Use comments like `// Error report would be sent here` for future tracking integration

### 🔴 Git State Must Be Clean
```bash
# Deployment requires clean working tree
git status  # Must show "nothing to commit"
# Stash unrelated changes before deploying
git stash push -m "description" [files]
```

## Peer Review Process Insights

### 🔴 CONDITIONAL PASS Requirements
When receiving conditional pass, ALL conditions must be met:
1. **Documentation Updates** - TECH_DEBT.md and RELEASE_NOTES.md MUST be updated
2. **Code Comments** - Explain WHY, not WHAT (especially for development-only code)
3. **No Workarounds** - Fix issues properly, don't bypass validation

### 🔴 Error Handling Best Practices
```javascript
// ✅ CORRECT - Structured error with recovery
throw new NetworkError(
  'Failed to sync data',
  'SYNC_FAILED',
  'Unable to save changes. Your work is saved locally.',
  true  // recoverable
);

// ❌ WRONG - Generic error loses context
throw new Error('Sync failed');
```

### 🔴 Integration Planning
When creating new systems (error handling, toast managers, etc.):
1. **Create infrastructure first** - Build the foundation
2. **Document integration debt** - Add TECH_DEBT.md entry immediately
3. **Test in isolation** - Ensure new system works before integration
4. **Plan phased rollout** - Don't attempt big-bang integration

## Modal Centralization - Critical Case Study

### Date: 2025-09-11
### Feature: Modal Theme Consistency & Centralization

---

### The Critical Lesson: True Centralization vs. Adding Complexity

#### What Went Wrong Initially

When asked to create a "centralized modal aesthetic and framework", I made a fundamental architectural error:

1. **Created ANOTHER modal system** (ThemedModal) instead of centralizing existing ones
2. **Left 255 lines of dead code** (UnifiedModal.js) in the codebase
3. **Added to fragmentation** instead of reducing it
4. **Falsely claimed completion** when centralization wasn't actually achieved

#### The User's Insight

The user correctly identified the core problem:
> "You have TWO competing 'unified' modals... Both claim to be 'unified' but neither is actually unified across the app!"

They provided the right approach:
> "The fix isn't to create ANOTHER modal component - it's to actually complete the migration to ONE modal system and DELETE the others."

#### What True Centralization Looks Like

**BEFORE (Failed Attempt):**
- UnifiedModal.js - 255 lines, 0 usage
- ThemedModal.js - New component, partial adoption
- Result: THREE modal systems (including direct Modal imports)

**AFTER (True Centralization):**
- UnifiedModal.js - DELETED ✅
- ThemedModal.js - THE ONLY modal system ✅
- Direct Modal imports - ZERO ✅
- Result: ONE modal system, measurable success

### Key Principles Learned from Modal Centralization

#### 1. Centralization Means Elimination
- Don't add another "unified" solution
- Pick ONE winner and migrate everything
- DELETE the alternatives
- Enforce the standard

#### 2. Measurable Success Criteria
```bash
# These commands should all return 0:
find src -name "UnifiedModal.js" | wc -l  # No dead files
grep -r "from 'react-native'" src/ | grep "Modal" | wc -l  # No direct imports
grep -r "UnifiedModal" src/ | wc -l  # No references to deleted code
```

#### 3. Audit Before Acting
```bash
# Always audit current state first:
grep -r "Modal" src/ --include="*.js" | grep -E "from|import" 
# Count usage of each system
# Identify dead code
# Then make informed decisions
```

#### 4. Complete the Migration
- Create a checklist of EVERY component using modals
- Systematically migrate each one
- Verify nothing breaks
- Delete old code immediately
- Add enforcement (lint rules) to prevent regression

### Technical Debt Lessons from Modal Case

#### Dead Code is Dangerous
- UnifiedModal.js was 255 lines of UNUSED code
- It created confusion about which modal to use
- It made the codebase appear more complex than necessary
- **Lesson**: Delete dead code immediately

#### Partial Migrations Are Worse Than No Migration
- Having multiple "unified" systems is an oxymoron
- Partial adoption creates confusion
- **Lesson**: Complete migrations or don't start them

#### Dynamic Styles Pattern
The correct pattern for theme-aware components:
```javascript
// Create dynamic styles based on theme
const createDynamicStyles = (activeColors) => StyleSheet.create({
  text: {
    color: activeColors.text.primary, // Not colors.text.primary
  }
});

// In component
const dynamicStyles = createDynamicStyles(activeColors);
```

### Process Improvements from Modal Experience

#### 1. Verification Commands in Documentation
Always include verification commands in implementation docs:
```markdown
## Success Metrics
- UnifiedModal.js files: 0
- Direct Modal imports: 0
- ThemedModal usage: > 0
```

#### 2. Honest Progress Tracking
- Don't claim "complete" when it's partial
- Use measurable criteria
- Verify with grep/find commands

#### 3. Delete First, Then Create
When centralizing:
1. Audit what exists
2. Pick the winner OR create new if nothing suitable
3. Migrate everything
4. DELETE alternatives immediately
5. Add enforcement

### Red Flags to Watch For

1. **Multiple "Unified" Components**: If you have more than one "unified" anything, it's not unified
2. **Zero Usage Files**: Run usage checks regularly to find dead code
3. **Hardcoded Values in Theme-Aware Components**: Look for rgba(0,0,0) or #FFFFFF
4. **"Complete" Without Metrics**: If you can't measure it, it's not complete

### The Right Mental Model

#### Think Subtraction, Not Addition
- Centralization = Reducing options to ONE
- Unification = Eliminating alternatives
- Success = Measurable reduction in complexity

#### The Grep Test
If you can't verify your success with grep commands, you haven't succeeded:
```bash
# Should return 0 for successful centralization
grep -r "OldComponent" src/ | wc -l
```

## High-Impact Patterns

### Component Discovery Pattern
```bash
# When changes don't take effect:
1. rm -rf node_modules/.cache/webpack/  # Clear webpack cache
2. Check for overriding components in App.js
3. Verify imports in index.js files
4. Look for Platform.OS conditionals excluding web
```

### Package Management Wisdom
```bash
# Before removing packages:
npm ls [package-name]  # Check dependency tree
# Some packages are peer dependencies (e.g., @mui/material for icons)
# Some JS projects need TypeScript for dependencies (react-native-gesture-handler)
```

### Search Comprehensively
```bash
# When fixing patterns, use multiple search strategies:
grep "Image" src/ -r
grep "source=.*photo" src/ -r  
grep "uri.*photo" src/ -r
# LESSON: Photo "default" bug required 4 deployments because missed components

# For error handling patterns:
grep -r "console\.error" src/ --include="*.js"  # Find all console.errors
grep -r "catch.*{" src/ --include="*.js" -A 3   # Review catch blocks
grep -r "throw new Error" src/ --include="*.js" # Find generic errors
```

### Theme-Aware Components
```javascript
// Always use dynamic styles with theme:
const createStyles = (colors, theme) => StyleSheet.create({
  container: {
    backgroundColor: theme === 'dark' ? '#1A1A1A' : '#F8F8F8',
    // NOT: backgroundColor: '#F8F8F8'  // Breaks in dark mode
  }
});
```

## Validation Checklist

### Before Starting
```bash
find src -name "*.tsx" -o -name "*.ts" | wc -l  # Must be 0
npm run web  # Verify dev server works
git pull origin main  # Ensure you have latest code
```

### Before Deployment
```bash
npm run build:web  # Build must succeed
npx prettier --check 'src/**/*.js'  # Format must pass
grep -r 'console\.log' src/ | wc -l  # Max 5
grep -r 'console\.error' src/ --include="*.js" | grep -v "NODE_ENV"  # Must be 0
git status  # Must be clean
cat docs/RELEASE_NOTES.md | head -20  # Verify notes for NEXT version
```

### After Changes
- Test BOTH web AND mobile
- Document limitations in TECH_DEBT.md
- Update RELEASE_NOTES.md with NEXT version (not current)
- Run ESLint: `npx eslint src/ --ext .js,.jsx`
- Verify no new TypeScript files created

## Real Deployment Failures (Actual Incidents)

### 🔥 "Wrong Component Modified" - 20 minutes wasted
**What happened**: Modified src/components/Forms/EntryForm.js extensively
**The problem**: App.js imported EntryForm from UnifiedApp.js, not Forms/
**Prevention**: ALWAYS trace imports: `grep -n "EntryForm" App.js`

### 🔥 "Photo Default Bug" - 4 deployments to fix
**What happened**: Fixed photo="default" in 3 files, bug persisted
**The problem**: Missed 2 more components using same pattern
**Prevention**: Search exhaustively:
```bash
grep -r "photo.*default" src/
grep -r "default.*photo" src/
grep -r "photo:" src/ -A 2 -B 2
```

### 🔥 "Console.error in Production" - Peer review failed
**What happened**: Added console.error for debugging, forgot to wrap
**The problem**: Production code exposed internal errors
**Prevention**: ALWAYS wrap with NODE_ENV check or use ErrorHandler.log()

### 🔥 "Release Notes Wrong Version" - Deploy blocked
**What happened**: Added notes for current version, not next
**The problem**: Script auto-increments, expects notes for v+1
**Prevention**: Check package.json version, add notes for NEXT

### 🔥 "Modal Centralization Failed" - Added complexity instead of reducing
**What happened**: Created ThemedModal as "another" unified modal
**The problem**: Left UnifiedModal.js (255 lines) as dead code
**Prevention**: True centralization requires DELETION of alternatives

## Common Pitfalls & Solutions

### "Component changes have no effect"
1. Check webpack cache: `rm -rf node_modules/.cache/webpack/`
2. Verify correct component: trace imports from App.js
3. Check for local overrides in App.js
4. Look for Platform.OS conditionals

### "Build fails after package removal"
1. Check peer dependencies: `npm ls [package]`
2. Some packages needed for build even if unused in code
3. Test build after each removal

### "Deployment blocked"
1. Remove console.logs (max 5) and unwrapped console.errors
2. Clean git state: `git stash` unrelated changes
3. Format code: `npx prettier --write src/**/*.js`
4. Check release notes for NEXT version (current + 1)
5. Fix ESLint errors: `npx eslint src/ --ext .js,.jsx --fix`
6. If "uncommitted changes": `git add . && git commit -m "message"`

## Quick Command Reference

```bash
# Development
npm run web                    # Start dev server (webpack)
npm run build:web              # Production build
./scripts/deploy-qual.sh       # Deploy (requires clean git)

# Validation - Run ALL before deployment
find src -name "*.ts*" | wc -l # Check for TypeScript (must be 0)
grep -r 'console\.log' src/ | wc -l   # Count console.logs (max 5)
grep -r 'console\.error' src/ --include="*.js" | grep -v "NODE_ENV" | wc -l  # Must be 0
npx eslint src/ --ext .js,.jsx        # Check for lint errors
npx prettier --check 'src/**/*.js'    # Check formatting

# Quick Fixes
npx prettier --write src/**/*.js      # Auto-format code
npx eslint src/ --ext .js,.jsx --fix  # Auto-fix lint issues
rm -rf node_modules/.cache/webpack/   # Clear webpack cache

# Debugging
grep -n "ComponentName" App.js       # Trace imports
grep -r "ErrorType" src/ --include="*.js"  # Find error patterns
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web  # Memory issues

# Git Operations
git add . && git commit -m "fix: description"  # Quick commit
git stash push -m "WIP: feature" src/  # Stash specific files
git log --oneline -10  # Recent commits
```

## Key Mantras
- **"Verify imports BEFORE modifying"** - Never assume file structure
- **"Test ALL platforms"** - Mobile AND web must work
- **"Clean state for deployment"** - No uncommitted changes
- **"Measure, don't guess"** - Use actual commands to verify
- **"Document debt immediately"** - Add TECH_DEBT.md entry when deferring work
- **"Errors need context"** - Use typed errors with user messages
- **"Production code is silent"** - No console.error without NODE_ENV check
- **"True centralization is about elimination, not addition"** - Pick one, delete alternatives
- **"If you can't measure it, it's not complete"** - Use grep to verify success

## Story Implementation Workflow

### 🔴 New Process: Backlog & Tech Debt Management
```bash
# Check current work priorities
cat docs/development/BACKLOG.md

# Start a story - update status to ACTIVE
vim docs/development/BACKLOG.md  # Change status

# During implementation, capture tech debt
echo "Bundle size too large" >> docs/development/tech-debt/drafts/bundle-optimization.md

# After implementation
./scripts/update-backlog-priority.sh  # Update story status to COMPLETED
```

### 🔴 When Receiving a Story from Backlog
1. **Check Story ID** - Find in docs/development/backlog/S###-*.md
2. **Update Status** - Mark as ACTIVE in BACKLOG.md
3. **Read Requirements** - Understand all acceptance criteria
4. **Check existing code** - Search for related patterns/components
5. **Plan infrastructure** - Design the system architecture
6. **Implement & Test** - Build with verification at each step
7. **Document Tech Debt** - Create drafts for discovered issues
8. **Follow Review Process** - Use ADVERSARIAL_REVIEW_PROCESS.md
9. **Update Status** - Mark COMPLETED in BACKLOG.md

### 🔴 Deployment Validation Pipeline
The deploy-qual.sh script enforces these checks IN ORDER:
```bash
1. Git status clean      # No uncommitted changes
2. Release notes exist   # For NEXT version (current + 1)
3. ESLint passes        # No JavaScript errors
4. Prettier passes      # Code formatted correctly
5. Build succeeds       # webpack build completes
6. Console.log ≤ 5      # Maximum 5 in src/
7. TODO count ≤ 20      # Maximum 20 TODOs
8. No secrets exposed   # No API keys or passwords
9. Git push succeeds    # Creates rollback point
10. Deploy to server    # Rsync to qual environment
```

### 🔴 Testing Patterns
```javascript
// ✅ CORRECT - Environment-aware test
const isDevelopment = process.env.NODE_ENV === 'development';
expect(consoleErrorSpy).toHaveBeenCalledTimes(isDevelopment ? 1 : 0);

// ❌ WRONG - Will fail in CI/CD
expect(consoleErrorSpy).toHaveBeenCalled();  // Assumes development
```

## Reference Files
- `/CLAUDE.md` - Project configuration and deployment rules
- `/docs/WORKING_AGREEMENTS.md` - Team standards
- `/docs/TECH_DEBT.md` - Known issues and limitations
- `/docs/RELEASE_NOTES.md` - Version history (update BEFORE deploy)
- `/scripts/deploy-qual.sh` - Deployment script (NEVER BYPASS)

## Final Takeaway

**True centralization is about elimination, not addition.**

When asked to centralize or unify, the goal is to:
1. Reduce the number of ways to do something to ONE
2. Delete all alternatives
3. Enforce the single standard
4. Measure success with concrete metrics

The user's instinct to demand TRUE centralization was correct. The implementation should match the vision - one system, zero alternatives, measurable success.

---
*Last Updated: 2025-09-11*
*Critical lessons from real deployment failures and successes*
*This learning applies beyond modals to any centralization effort: authentication, data fetching, styling, routing, etc.*