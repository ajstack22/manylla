# Git Commit Conventions

## Overview
This document defines the commit message conventions for the Manylla and StackMap projects. Following these conventions ensures consistency, improves readability of git history, and enables automated tooling.

## Commit Message Format
Every commit message must follow this format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Examples
```
feat(sync): Add 60-second pull interval for cloud sync
fix(android): Resolve gesture handler initialization on Android
docs(readme): Update deployment instructions for qual environment
chore(deps): Update Material-UI to v7.0.1
refactor(platform): Migrate from @platform alias to relative imports
```

## Commit Types

### Primary Types (Most Common)
- **feat**: New feature or significant enhancement
  - Example: `feat(profile): Add bulk export functionality`
- **fix**: Bug fix or issue resolution
  - Example: `fix(ios): Correct keyboard dismissal behavior`
- **docs**: Documentation changes only
  - Example: `docs(api): Add endpoint specifications`
- **chore**: Maintenance tasks, dependency updates, tooling changes
  - Example: `chore(webpack): Update build configuration`
- **refactor**: Code restructuring without changing functionality
  - Example: `refactor(components): Extract shared dialog logic`

### Secondary Types
- **style**: Code formatting, whitespace, semicolons (no logic changes)
  - Example: `style(forms): Apply consistent indentation`
- **test**: Adding or updating tests
  - Example: `test(sync): Add encryption service unit tests`
- **perf**: Performance improvements
  - Example: `perf(render): Implement memo for expensive calculations`
- **build**: Build system or deployment script changes
  - Example: `build(android): Update gradle configuration`
- **ci**: CI/CD pipeline changes
  - Example: `ci(github): Add automated security scanning`
- **revert**: Reverting a previous commit
  - Example: `revert: feat(sync): Add 60-second pull interval`

## Scope
The scope should indicate the area of the codebase affected:

### Common Scopes
- **platform**: Cross-platform compatibility changes
- **android**: Android-specific changes
- **ios**: iOS-specific changes
- **web**: Web-specific changes
- **sync**: Sync system and cloud storage
- **profile**: Profile management features
- **forms**: Form components and inputs
- **theme**: Theming and styling
- **api**: Backend API changes
- **deps**: Dependencies
- **security**: Security-related changes
- **a11y**: Accessibility improvements

## Subject Rules
1. **Use imperative mood**: "Add feature" not "Added feature" or "Adds feature"
2. **Don't capitalize first letter**: `fix bug` not `Fix bug`
3. **No period at the end**: `fix bug` not `fix bug.`
4. **Maximum 50 characters**: Be concise but descriptive
5. **Complete the sentence**: "This commit will... [your subject]"

## Version Commits
Deployment commits follow a special format:
```
v<version>: <description>
```
Example: `v2025.09.12.3: Technical Debt Cleanup - S006 Complete`

These are automatically created by the deployment script.

## Story/Bug References
When working on tracked items from the backlog:

```
<type>(<scope>): <subject> [S###]
<type>(<scope>): <subject> [B###]
```

Examples:
```
feat(android): Implement native navigation [S004]
fix(sync): Resolve data corruption on network timeout [B021]
```

## Multi-line Commits
For complex changes requiring explanation:

```
refactor(platform): Complete migration to relative imports

- Remove all @platform alias usage
- Update webpack and babel configurations
- Fix remaining TypeScript path mappings
- Validate all imports resolve correctly

Breaking Change: Requires clean install after pulling
```

## Breaking Changes
Mark breaking changes clearly in the footer:

```
feat(api): Restructure sync endpoints

BREAKING CHANGE: sync_push endpoint now requires version parameter
Migration: Add version: "2.0" to all sync_push calls
```

## Work in Progress (WIP)
For commits that shouldn't be deployed:

```
WIP: <type>(<scope>): <subject>
```

Example: `WIP: feat(sharing): Partial implementation of QR code sharing`

## Merge Commits
Let Git generate standard merge commit messages:
```
Merge branch 'feature/android-support' into main
```

## Collaborative Commits
When pair programming or getting AI assistance:

```
feat(sync): Implement conflict resolution

Co-authored-by: Adam Stack <adam@stackmap.ai>
Co-authored-by: Claude <claude@anthropic.com>
```

## Common Anti-patterns to Avoid

### ❌ Bad Examples
- `Fixed bug` - Too vague, no type or scope
- `Update code` - Meaningless
- `FINALLY WORKS!!!` - Emotional, not descriptive
- `misc changes` - Too broad
- `feat: Added new feature.` - Capitalized, has period, past tense

### ✅ Good Examples
- `fix(ios): Resolve header overlap on iPhone 14 Pro`
- `feat(sync): Add retry logic for network failures`
- `docs(readme): Update deployment instructions`
- `chore(deps): Bump react-native to 0.72.4`
- `refactor(forms): Extract validation logic to custom hook`

## Commit Frequency Guidelines

### Commit Often
- After completing each logical unit of work
- Before switching context or taking breaks
- After getting tests to pass
- After successful refactoring

### Don't Commit
- Broken code (unless marked as WIP)
- Debugging console.logs (clean them up first)
- Large chunks of unrelated changes (split them up)
- Generated files that should be gitignored

## Enforcement & Automation

### Pre-commit Validation
The deployment script validates commit readiness:
- No uncommitted changes
- Lint and TypeScript checks pass
- Security vulnerabilities resolved
- Console.logs and TODOs within limits

### Commit Message Template
Set up a template for consistency:
```bash
git config --local commit.template .gitmessage
```

### Git Aliases for Common Operations
```bash
git config --local alias.feat "commit -m 'feat:'"
git config --local alias.fix "commit -m 'fix:'"
git config --local alias.docs "commit -m 'docs:'"
git config --local alias.chore "commit -m 'chore:'"
```

## Benefits of Following These Conventions

1. **Readable History**: Easy to understand what changed and why
2. **Automated Changelog**: Generate release notes from commits
3. **Easier Reviews**: Clear commit intent speeds up PR reviews
4. **Bisect Friendly**: Find breaking changes quickly
5. **Team Alignment**: Everyone speaks the same language
6. **Professional**: Shows attention to detail and craftsmanship

## Quick Reference Card

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
chore:    Maintenance/tooling
refactor: Code restructuring
style:    Formatting only
test:     Test changes
perf:     Performance improvement
build:    Build system changes
ci:       CI/CD changes
revert:   Revert previous commit

Format: <type>(<scope>): <subject>
Rules:  Imperative mood, lowercase, no period, <50 chars
```

## Release Notes Requirements

### MANDATORY: Proactive Release Notes Updates
**Every feature, fix, or change MUST have corresponding release notes:**

1. **Update IMMEDIATELY**: Don't wait to be asked - update docs/RELEASE_NOTES.md as you work
2. **Always Ready**: Release notes should be ready to commit alongside your code changes
3. **No Deployment Without Notes**: Deployment script will reject if release notes are missing
4. **Format Required**:
   - Summary of what changed
   - Why the change was made
   - Any breaking changes or migration steps
   - Technical details if relevant

### Example Workflow
```bash
# 1. Make your code changes
# 2. IMMEDIATELY update release notes
echo "## Version PENDING - $(date +%Y-%m-%d)" >> docs/RELEASE_NOTES.md
# 3. Add your changes to the pending version
# 4. Commit both code AND release notes together
git add src/ docs/RELEASE_NOTES.md
git commit -m "feat(component): Add new feature with release notes"
```

## Integration with Development Process

This convention integrates with:
- Story implementation (S### references)
- Bug tracking (B### references)
- Deployment process (version commits)
- Code review process (clear intentions)
- **Release notes generation (MUST be updated proactively)**

Remember: Good commit messages and up-to-date release notes are a gift to your future self and your teammates!