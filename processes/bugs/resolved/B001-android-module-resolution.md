# Android Platform Module Resolution Fix - Prompt Pack [RESOLVED]

## CRITICAL ISSUE [RESOLVED 2025-09-12]
Android builds are failing with module resolution errors for the @platform alias system that was recently implemented.

**Resolution**: Converted all @platform imports to relative paths and removed alias configuration from Metro and Babel configs.

## ERROR ANALYSIS

### Primary Error Pattern
```
E ReactNativeJS: Unable to resolve module @platform from /Users/adamstack/manylla/src/components/Toast/ThemedToast.js: 
@platform could not be found within the project or in these directories:
  node_modules
```

### Root Cause
The platform consolidation migration introduced @platform alias imports that work for web (webpack) but fail for React Native (Metro bundler). Files were initially migrated to use `@platform` imports, but later reverted to relative imports. However, Metro is caching the old version with @platform imports.

### Current State Verification
```bash
# Check import patterns (should be 0 @platform, all relative)
grep -r "@platform" src/ --include="*.js" | wc -l  # Returns: 0
grep -r "from.*utils/platform" src/ --include="*.js" | wc -l  # Returns: 59

# Config files exist and have aliases configured
ls -la metro.config.js babel.config.js  # Both exist with @platform configured
```

## SOLUTION REQUIREMENTS

### Immediate Actions Required

1. **Clear Metro Cache Completely**
```bash
# Kill any running Metro processes
pkill -f "react-native.*start"
pkill -f "metro"

# Clear all caches
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
rm -rf node_modules/.cache
npx react-native start --reset-cache
```

2. **Verify All Platform Imports Are Relative**
```bash
# This MUST return 0 - no @platform imports allowed
grep -r "@platform" src/ --include="*.js" | wc -l

# All imports should use relative paths
grep -r "from.*utils/platform" src/ --include="*.js" | head -5
# Should show: ../utils/platform or ./platform
```

3. **Remove Alias Configurations (They're Not Working)**
Since React Native Metro doesn't properly support the @platform alias and all files are already using relative imports, remove the alias configurations to prevent confusion:

**metro.config.js** - Remove extraNodeModules:
```javascript
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const config = {
  resetCache: true,
  watchFolders: [__dirname],
  // Remove the resolver.extraNodeModules section entirely
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

**babel.config.js** - Remove @platform alias:
```javascript
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        alias: {
          // Remove @platform line - keep other aliases if needed
          "@": "./src",
          "@components": "./src/components",
          // etc...
        },
      },
    ],
    "react-native-reanimated/plugin",
  ],
};
```

4. **Rebuild Android App**
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Restart Metro with clean cache
npx react-native start --reset-cache

# In another terminal, run Android
npx react-native run-android
```

## VERIFICATION STEPS

### 1. Check Metro Bundle Status
```bash
# Check if Metro is bundling without errors
curl http://localhost:8081/status
```

### 2. Monitor Android Logs
```bash
# Watch for any remaining module resolution errors
adb logcat -s ReactNativeJS:E
```

### 3. Test App Launch
```bash
# App should launch without red screen errors
adb shell am start -n com.manylla/.MainActivity
```

## PREVENTION MEASURES

### 1. Separate Build Configs
- **Web (Webpack)**: Can use aliases via webpack.config.js
- **React Native (Metro)**: Must use relative imports only

### 2. Import Pattern Rules
```javascript
// ✅ CORRECT for React Native
import platform from "../utils/platform";
import platform from "../../utils/platform";

// ❌ WRONG - Breaks React Native
import platform from "@platform";
```

### 3. Testing Protocol
Before deploying platform changes:
1. Test web: `npm run web`
2. Test iOS: `npx react-native run-ios`
3. Test Android: `npx react-native run-android`
4. All three must work before committing

## EXPECTED OUTCOME

After completing these steps:
1. Android app launches without module resolution errors
2. No @platform import errors in logs
3. Platform abstraction works via relative imports
4. Both web and mobile builds succeed

## ROLLBACK PLAN

If issues persist after fixes:
```bash
# Revert to last working commit
git log --oneline -10  # Find last working version
git checkout [commit-hash] -- src/
git checkout [commit-hash] -- metro.config.js babel.config.js

# Clear everything and rebuild
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

## CRITICAL NOTES

1. **DO NOT** use @platform imports in React Native - Metro doesn't support them properly
2. **ALWAYS** test all three platforms after import changes
3. **CLEAR CACHES** when switching between alias and relative imports
4. **KEEP** webpack.config.js aliases for web builds only

## SUCCESS METRICS

```bash
# All must pass:
adb logcat -d | grep "Unable to resolve module @platform" | wc -l  # Must be 0
grep -r "@platform" src/ --include="*.js" | wc -l  # Must be 0
curl -f http://localhost:8081/status  # Must return 200
```

---
*Generated: 2025-09-12*
*Issue: Android module resolution failure after platform consolidation*
*Priority: CRITICAL - Blocks Android development*
*Resolved: 2025-09-12 - Fixed in commit 43a0c8f*