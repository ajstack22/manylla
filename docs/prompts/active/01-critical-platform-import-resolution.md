# Fix Platform Import Path Resolution for Consolidation

**Priority**: 01-critical
**Status**: Ready
**Assignee**: Developer
**Peer Review**: Required

**Issue**: The platform consolidation mass-replace script will break imports due to incorrect relative paths

## Context
The current platform consolidation plan uses a sed script that adds `import platform from "../utils/platform"` to all files. This assumes all files are one level deep from src/, which is incorrect. Files in deeper directories like `src/components/Forms/` need `../../utils/platform`.

## Working Agreements Validation
- ✅ No TypeScript files will be created
- ✅ No .native.js or .web.js files
- ✅ Build output remains in web/build/
- ✅ Pure JavaScript implementation

## Implementation

### Prerequisites
1. Backup current state: `tar -czf backup-before-import-fix-$(date +%Y%m%d-%H%M%S).tar.gz src/`
2. Ensure webpack.config.js is accessible for modifications

### Solution: Use Webpack Alias for Clean Imports

#### Step 1: Configure Webpack Alias
**Location**: `webpack.config.js`

```javascript
// Add to resolve section
resolve: {
  alias: {
    '@platform': path.resolve(__dirname, 'src/utils/platform'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@context': path.resolve(__dirname, 'src/context'),
  },
  extensions: ['.web.js', '.js', '.json'],
}
```

#### Step 2: Update Metro Config for React Native
**Location**: `metro.config.js`

```javascript
// Add resolver configuration
module.exports = {
  resolver: {
    extraNodeModules: {
      '@platform': path.resolve(__dirname, 'src/utils/platform'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@context': path.resolve(__dirname, 'src/context'),
    },
  },
  // ... rest of config
};
```

#### Step 3: Create babel.config.js Module Resolver
**Location**: `babel.config.js`

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@platform': './src/utils/platform',
          '@utils': './src/utils',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@context': './src/context',
        },
      },
    ],
  ],
};
```

#### Step 4: Install Required Babel Plugin
```bash
npm install --save-dev babel-plugin-module-resolver
```

#### Step 5: Update Mass Replace Script
**Location**: Create `scripts/fix-platform-imports.sh`

```bash
#!/bin/bash

echo "🔧 Fixing platform imports with aliases..."

# Create backup
tar -czf backup-imports-$(date +%Y%m%d-%H%M%S).tar.gz src/

# Update all files that use Platform
find src -name "*.js" -type f | while read file; do
  # Check if file uses Platform
  if grep -q "import.*{.*Platform.*}.*from.*'react-native'" "$file"; then
    echo "Processing: $file"
    
    # Add platform import after React import
    sed -i '' '/^import React/a\
import platform from "@platform";
' "$file"
    
    # Remove Platform from react-native import
    sed -i '' "s/import.*{.*Platform.*}.*from.*'react-native'/import { Dimensions, StatusBar } from 'react-native'/g" "$file"
  fi
done

# Replace all Platform.OS references
find src -name "*.js" -exec sed -i '' \
  "s/Platform\.OS === 'web'/platform.isWeb/g; \
   s/Platform\.OS === 'ios'/platform.isIOS/g; \
   s/Platform\.OS === 'android'/platform.isAndroid/g; \
   s/Platform\.OS !== 'web'/platform.isMobile/g; \
   s/Platform\.select/platform.select/g" {} \;

echo "✅ Import paths fixed with aliases"
```

### Validation Steps

1. **Build Verification**:
```bash
npm run build:web
# Should complete without errors
```

2. **Import Resolution Test**:
```bash
# Check that all imports resolve
grep -r "@platform" src/ --include="*.js" | wc -l
# Should match number of files using platform
```

3. **Metro Bundler Test**:
```bash
npx react-native start --reset-cache
# Should start without resolution errors
```

### Testing Checklist
- [ ] Webpack build succeeds with alias configuration
- [ ] Metro bundler resolves @platform imports
- [ ] All Platform.OS references replaced successfully
- [ ] No broken imports in any component
- [ ] Web dev server starts without errors
- [ ] Mobile builds complete successfully

### Rollback Plan
```bash
# If issues occur:
tar -xzf backup-imports-*.tar.gz
git checkout -- webpack.config.js metro.config.js babel.config.js
npm install  # Reset node_modules if needed
```

### Success Criteria
- All files can import platform using `import platform from '@platform'`
- No relative path issues regardless of file depth
- Both web and mobile builds succeed
- Zero import resolution errors

### Notes
- Using @ prefix for aliases is a common convention
- This approach scales better than relative paths
- Easier to refactor and move files in the future
- IDE autocomplete will work with proper jsconfig.json setup