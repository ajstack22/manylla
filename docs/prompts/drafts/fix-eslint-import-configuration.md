# Fix ESLint Configuration for Modern Import Patterns

**Priority**: Medium
**Type**: Developer Experience Enhancement  
**Status**: Draft

## Problem Statement

ESLint's current configuration doesn't properly understand our import patterns, causing:
- False positives for import/first rule
- Incorrect autofix suggestions that break valid imports
- Conflicts between ESLint and our platform migration
- Developer frustration with CI/CD failures

## Value Proposition

1. **Accurate Linting**: Only flag real issues, not false positives
2. **Safe Autofix**: ESLint --fix won't break working code
3. **CI/CD Reliability**: Deployments won't fail due to linting issues
4. **Developer Productivity**: Less time fighting tools, more time coding
5. **Code Quality**: Focus on actual problems, not import order noise

## Current Issues Identified

```javascript
// ESLint thinks this is wrong (but it's correct):
import platform from "../utils/platform";  // Relative import
import React from "react";

// ESLint "fixes" to this (breaking the build):
import React from "react";
import platform from "../../utils/platform";  // Wrong path!
```

## Proposed Solution

### Option 1: Configure import/order Rule Properly

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'plugin:import/recommended'
  ],
  rules: {
    // Configure import order without breaking paths
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index'
      ],
      'pathGroups': [
        {
          'pattern': '@platform',
          'group': 'internal',
          'position': 'before'
        },
        {
          'pattern': '@/**',
          'group': 'internal'
        }
      ],
      'pathGroupsExcludedImportTypes': ['builtin'],
      'newlines-between': 'never',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],
    
    // Disable import/first if it's problematic
    'import/first': 'off',
    
    // Or configure it properly
    'import/first': ['error', 'absolute-first']
  },
  
  settings: {
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.jsx']
      },
      'babel-module': {
        'root': ['./src'],
        'alias': {
          '@platform': './src/utils/platform',
          '@utils': './src/utils',
          '@components': './src/components',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@context': './src/context'
        }
      }
    },
    'import/internal-regex': '^@/'
  }
};
```

### Option 2: Custom ESLint Plugin for Platform Imports

```javascript
// eslint-plugin-manylla/index.js
module.exports = {
  rules: {
    'platform-import': {
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            
            // Check for platform imports
            if (source.includes('utils/platform')) {
              if (source !== '@platform') {
                context.report({
                  node,
                  message: 'Use @platform alias instead of relative imports',
                  fix(fixer) {
                    return fixer.replaceText(
                      node.source,
                      '"@platform"'
                    );
                  }
                });
              }
            }
          }
        };
      }
    }
  }
};
```

### Option 3: Simplify with Prettier for Import Sorting

```javascript
// .prettierrc
{
  "importOrder": [
    "^react",
    "^react-native",
    "^@?\\w",
    "^@platform",
    "^@/",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}

// Use prettier-plugin-sort-imports
// npm install --save-dev @trivago/prettier-plugin-sort-imports
```

## Implementation Steps

1. **Audit Current ESLint Config**
   ```bash
   # Check current rules
   npx eslint --print-config src/App.js | grep -A 20 "import"
   
   # Find problem files
   npx eslint src/ --format json > eslint-report.json
   ```

2. **Install Required Packages**
   ```bash
   npm install --save-dev \
     eslint-plugin-import \
     eslint-import-resolver-babel-module \
     @trivago/prettier-plugin-sort-imports
   ```

3. **Update Configuration Files**
   - `.eslintrc.js` with new rules
   - `.prettierrc` with import sorting
   - `package.json` scripts for validation

4. **Test Configuration**
   ```bash
   # Test without fixing
   npm run lint
   
   # Test autofix safety
   npx eslint src/components/UnifiedApp.js --fix --dry-run
   
   # Verify no breaking changes
   npm run build:web
   ```

5. **Update CI/CD Pipeline**
   ```yaml
   # .github/workflows/ci.yml
   - name: Lint Check
     run: |
       npm run lint:check
       # Don't run autofix in CI
   ```

## Success Criteria

- [ ] No false positive import/first errors
- [ ] ESLint --fix doesn't break valid imports
- [ ] Deployment script works without manual fixes
- [ ] Clear import ordering rules documented
- [ ] Team consensus on import patterns

## Configuration Examples

### Before (Problematic)
```javascript
// Random import order, ESLint confused
import { useState } from 'react';
import platform from '../utils/platform';
import './styles.css';
import UnifiedApp from './UnifiedApp';
import React from 'react';
```

### After (Clean)
```javascript
// Clear, consistent order
import React, { useState } from 'react';
import platform from '@platform';
import UnifiedApp from './UnifiedApp';
import './styles.css';
```

## Rollback Plan

1. Keep backup of current `.eslintrc.js`
2. Can disable specific rules temporarily:
   ```bash
   npm run lint -- --rule 'import/first: off'
   ```

## Estimated Effort

- Research and planning: 2 hours
- Implementation: 2 hours
- Testing across codebase: 1 hour
- Documentation: 30 minutes

## Dependencies

- Agreement on import order preferences
- Decision on @platform vs relative imports
- Deployment script updates (coordinate timing)

## Alternative Approaches

1. **Disable Problematic Rules**: Quick fix but loses benefits
2. **Override in Files**: `/* eslint-disable import/first */`
3. **Custom Script**: Pre-commit hook to fix imports
4. **Different Linter**: Consider BiomeJS or OXC

## Related Work

- Platform migration (complete)
- @platform standardization (see draft)
- Deployment script updates (see draft)

## Notes

Consider running a team workshop on linting rules to get consensus on code style preferences. The tool should serve the team, not the other way around.