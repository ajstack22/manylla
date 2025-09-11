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

## Story Implementation Workflow

### 🔴 When Receiving a Story/Prompt Pack
1. **Read COMPLETELY** - Understand all requirements before starting
2. **Check existing code** - Search for related patterns/components
3. **Plan infrastructure** - Design the system architecture
4. **Create tests first** - Write tests to validate implementation
5. **Implement core** - Build the main functionality
6. **Document debt** - Add TECH_DEBT.md for deferred integration
7. **Update release notes** - Add entry for NEXT version

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

---
*Last Updated: 2025-09-11*
*Critical lessons from real deployment failures and successes*