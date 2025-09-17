# Update Deployment Script for Platform Migration Patterns

**Priority**: High
**Type**: DevOps Enhancement
**Status**: Draft

## Problem Statement

The current deployment script (`scripts/deploy-qual.sh`) includes ESLint autofix functionality that incorrectly modifies import paths for our new platform migration patterns. This causes build failures during deployment as the script "fixes" correct import paths to incorrect ones.

## Value Proposition

1. **Eliminate Manual Intervention**: Currently requires bypassing the official deployment script
2. **Prevent Build Failures**: Autofix breaking correct imports causes deployment failures
3. **Maintain Code Quality**: Keep validation checks while respecting new patterns
4. **Team Efficiency**: Developers can use standard deployment process without workarounds

## Current Issues

- ESLint autofix changes `import platform from "../utils/platform"` to incorrect paths
- Script doesn't understand relative import patterns vs @platform alias
- Prettier formatting conflicts with new import structure
- No awareness of platform migration completion

## Proposed Implementation

### Option 1: Intelligent Autofix (Recommended)
```bash
# Add platform migration awareness
PLATFORM_MIGRATION_COMPLETE=true

# Skip autofix for platform imports
if [ "$PLATFORM_MIGRATION_COMPLETE" = true ]; then
    EXCLUDE_PATTERN="--ignore-pattern '**/platform.js'"
fi

# Run prettier with exclusions
npx prettier --write "src/**/*.{js,jsx}" $EXCLUDE_PATTERN
```

### Option 2: Configurable Autofix
```bash
# Add environment variable control
SKIP_AUTOFIX=${SKIP_AUTOFIX:-false}

if [ "$SKIP_AUTOFIX" != "true" ]; then
    npx prettier --write "src/**/*.{js,jsx}"
fi
```

### Option 3: Smart Import Detection
```javascript
// Add to deployment validation
const checkImports = () => {
  const platformImports = findFiles('**/platform')
  const hasAlias = platformImports.some(f => f.includes('@platform'))
  const hasRelative = platformImports.some(f => f.includes('../utils/platform'))
  
  if (hasAlias && hasRelative) {
    console.warn('Mixed import patterns detected')
  }
}
```

## Implementation Steps

1. **Audit Current Script**
   - Identify all autofix locations
   - Document current validation rules
   - List conflicting patterns

2. **Add Migration Detection**
   ```bash
   # Check if migration is complete
   PLATFORM_COUNT=$(grep -r "Platform\.OS" src/ --exclude-dir="__tests__" | wc -l)
   if [ "$PLATFORM_COUNT" -eq "0" ]; then
     PLATFORM_MIGRATION_COMPLETE=true
   fi
   ```

3. **Update Validation Rules**
   - Respect @platform imports
   - Allow relative platform imports
   - Skip conflicting autofixes

4. **Add Deployment Flags**
   ```bash
   ./scripts/deploy-qual.sh --skip-import-fix
   ./scripts/deploy-qual.sh --platform-aware
   ```

## Success Criteria

- [ ] Deployment script works without manual intervention
- [ ] No incorrect import path modifications
- [ ] All validation checks still run
- [ ] Build succeeds on first attempt
- [ ] Documentation updated with new options

## Rollback Plan

Keep original script as `deploy-qual-legacy.sh` during transition period.

## Estimated Effort

- Implementation: 2-3 hours
- Testing: 1 hour
- Documentation: 30 minutes

## Dependencies

- Platform migration must be complete
- Team agreement on import patterns (@platform vs relative)

## Notes

Consider this alongside the "@platform alias standardization" draft for a comprehensive solution.