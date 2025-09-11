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

### 🔴 Console.log Limit: Maximum 5
- Deployment blocks if > 5 console.logs in src/
- Remove ALL console.logs from production code
- Use comments like `// Error report would be sent here`

### 🔴 Git State Must Be Clean
```bash
# Deployment requires clean working tree
git status  # Must show "nothing to commit"
# Stash unrelated changes before deploying
git stash push -m "description" [files]
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
```

### Before Deployment
```bash
npm run build:web  # Build must succeed
npx prettier --check 'src/**/*.js'  # Format must pass
grep -r 'console\.log' src/ | wc -l  # Max 5
git status  # Must be clean
```

### After Changes
- Test BOTH web AND mobile
- Document limitations in TECH_DEBT.md
- Update RELEASE_NOTES.md

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
1. Remove console.logs (max 5)
2. Clean git state: `git stash` unrelated changes
3. Format code: `npx prettier --write src/**/*.js`
4. Check release notes for NEXT version

## Quick Command Reference

```bash
# Development
npm run web                    # Start dev server (webpack)
npm run build:web              # Production build
./scripts/deploy-qual.sh       # Deploy (requires clean git)

# Validation
find src -name "*.ts*" | wc -l # Check for TypeScript
grep -r 'console\.log' src/    # Find console.logs
npx prettier --write src/**/*.js  # Format code

# Debugging
rm -rf node_modules/.cache/webpack/  # Clear webpack cache
grep -n "ComponentName" App.js       # Trace imports
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web  # Memory issues
```

## Key Mantras
- **"Verify imports BEFORE modifying"** - Never assume file structure
- **"Test ALL platforms"** - Mobile AND web must work
- **"Clean state for deployment"** - No uncommitted changes
- **"Measure, don't guess"** - Use actual commands to verify

## Reference Files
- `/CLAUDE.md` - Project configuration
- `/docs/WORKING_AGREEMENTS.md` - Team standards
- `/docs/TECH_DEBT.md` - Known issues and limitations

---
*Last Updated: 2025-09-11*
*Critical lessons from real deployment failures and successes*