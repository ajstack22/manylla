# Standardize @platform Alias Usage Across Codebase

**Priority**: Medium-High  
**Type**: Code Consistency Enhancement
**Status**: Draft

## Problem Statement

The codebase currently has mixed import patterns for the platform utility:
- Some files use `@platform` alias (34 files)
- Others use relative paths like `../utils/platform` or `../../utils/platform`
- This inconsistency causes ESLint/prettier conflicts and deployment issues

## Value Proposition

1. **Consistency**: Single import pattern across entire codebase
2. **Maintainability**: Easier to refactor and move files without breaking imports
3. **Developer Experience**: No need to calculate relative paths
4. **Tool Compatibility**: ESLint, prettier, and IDEs work better with aliases
5. **Reduced Errors**: No more incorrect relative path calculations

## Current State Analysis

```javascript
// Current mixed patterns:
import platform from "@platform";           // 34 files
import platform from "../utils/platform";   // ~15 files  
import platform from "../../utils/platform"; // ~12 files
```

## Proposed Implementation

### Phase 1: Verify Alias Configuration
Ensure all build tools support @platform:

```javascript
// webpack.config.js
alias: {
  '@platform': path.resolve(__dirname, 'src/utils/platform'),
}

// babel.config.js
alias: {
  '@platform': './src/utils/platform',
}

// metro.config.js
extraNodeModules: {
  '@platform': path.resolve(__dirname, 'src/utils/platform'),
}

// tsconfig.json / jsconfig.json
"paths": {
  "@platform": ["src/utils/platform"]
}
```

### Phase 2: Mass Migration Script

```javascript
// scripts/standardize-platform-imports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const standardizeImports = () => {
  const files = glob.sync('src/**/*.{js,jsx}');
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace all variations with @platform
    content = content.replace(
      /import platform from ["'](?:\.\.\/)+utils\/platform["'];?/g,
      'import platform from "@platform";'
    );
    
    fs.writeFileSync(file, content);
  });
};

standardizeImports();
```

### Phase 3: Update ESLint Rules

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: ['**/utils/platform'],
      message: 'Use @platform alias instead of relative imports'
    }]
  },
  settings: {
    'import/resolver': {
      'babel-module': {
        alias: {
          '@platform': './src/utils/platform'
        }
      }
    }
  }
};
```

## Implementation Steps

1. **Audit Current Usage**
   ```bash
   # Find all platform imports
   grep -r "import platform from" src/ --include="*.js" | 
     sed 's/.*import platform from //' | 
     sort | uniq -c
   ```

2. **Test Alias in All Environments**
   - Web build (webpack)
   - iOS build (Metro)
   - Android build (Metro)
   - Test runner (Jest)
   - IDE support (VSCode/WebStorm)

3. **Run Migration**
   ```bash
   node scripts/standardize-platform-imports.js
   npm run lint:fix
   npm run prettier:write
   npm test
   npm run build:web
   ```

4. **Update Documentation**
   - CONTRIBUTING.md with import guidelines
   - Developer onboarding docs
   - Code review checklist

## Benefits vs Relative Imports

| Aspect | @platform Alias | Relative Imports |
|--------|----------------|------------------|
| Consistency | ✅ Same everywhere | ❌ Varies by location |
| Refactoring | ✅ Move files freely | ❌ Update all imports |
| Readability | ✅ Clear and short | ❌ ../../../confusing |
| IDE Support | ✅ Full with config | ⚠️ Works but verbose |
| Build Tools | ✅ Configured once | ✅ No config needed |

## Success Criteria

- [ ] 100% of files use @platform alias
- [ ] Zero relative platform imports
- [ ] All build tools configured
- [ ] ESLint rule enforcing alias usage
- [ ] Documentation updated
- [ ] No build or runtime errors

## Risk Mitigation

1. **Gradual Migration**: Can be done file-by-file if needed
2. **Fallback**: Relative imports still work during transition
3. **Testing**: Comprehensive test suite before/after
4. **Backup**: Git history preserves original state

## Estimated Effort

- Configuration verification: 1 hour
- Migration script development: 1 hour
- Testing across platforms: 2 hours
- Documentation: 30 minutes

## Dependencies

- Webpack configuration access
- Babel configuration access
- Metro configuration access
- Team consensus on approach

## Alternative Consideration

If @platform alias proves problematic, consider:
1. Using `src/utils/platform` absolute imports
2. Re-exporting from `src/index.js`
3. Making platform a package in node_modules

## Related Work

- Platform consolidation migration (complete)
- Deployment script updates (see related draft)
- ESLint configuration improvements (see related draft)