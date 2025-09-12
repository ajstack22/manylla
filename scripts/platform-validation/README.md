# Platform Validation Suite

A comprehensive testing and validation suite for the platform consolidation migration.

## Overview

This validation suite ensures that the platform migration from direct `Platform.OS` usage to centralized platform utilities is complete and working correctly across all platforms (Web, iOS, Android). 

**Migration Status**: ✅ COMPLETED (2025-09-12)
- All @platform aliases have been removed
- Platform-specific imports now use relative paths
- All bundler configurations updated

## Scripts

### Core Validation Scripts

#### `validate-all.sh`
Main validation script that checks:
- ✅ Zero Platform.OS references outside platform.js
- ✅ Zero old Platform.select usage  
- ✅ All files using platform utilities have proper imports
- ✅ Zero .native.js or .web.js files
- ✅ Zero TypeScript files
- ✅ Web build succeeds
- ✅ All tests pass
- ✅ Bundle size within acceptable range
- ✅ Platform utilities structure is correct

**Usage**: `./scripts/platform-validation/validate-all.sh`

#### `test-platforms.js`
Platform-specific testing script that validates:
- 🌐 Web platform functionality 
- 📱 Metro bundler operation
- 🤖 Android build (if environment available)
- 🍎 iOS build (if on macOS with Xcode)

**Usage**: `./scripts/platform-validation/test-platforms.js`

#### `performance-test.js`
Performance validation script that measures:
- ⚡ Module import performance
- 🔧 Function execution performance
- 💾 Memory usage
- 📦 Bundle size analysis
- 📱 React Native bundle metrics (when available)

**Usage**: `./scripts/platform-validation/performance-test.js`

#### `visual-regression.js`
Visual testing script that captures:
- 📸 Screenshots across multiple viewports (mobile, tablet, desktop)
- 🔍 Baseline comparison for visual changes
- 📊 Visual regression detection

**Usage**: `./scripts/platform-validation/visual-regression.js`

**Note**: Requires `puppeteer` to be installed: `npm install --save-dev puppeteer`

#### `generate-report.sh`
Comprehensive report generator that creates:
- 📄 Detailed validation report in Markdown format
- 📊 Executive summary with pass/fail status
- 📈 Performance metrics analysis
- 🔍 Code quality assessment
- 📋 Actionable recommendations

**Usage**: `./scripts/platform-validation/generate-report.sh`

#### `run-all-tests.sh`
Master test runner that executes all validation scripts in sequence and provides:
- 🚀 Complete validation pipeline
- 📊 Overall success/failure status
- 📋 Actionable next steps
- 🎯 Deployment readiness assessment

**Usage**: `./scripts/platform-validation/run-all-tests.sh`

## Quick Start

### Full Validation Suite
```bash
# Run complete validation suite
./scripts/platform-validation/run-all-tests.sh
```

### Individual Tests
```bash
# Core validation only
./scripts/platform-validation/validate-all.sh

# Performance tests only  
./scripts/platform-validation/performance-test.js

# Platform-specific tests only
./scripts/platform-validation/test-platforms.js

# Generate report only
./scripts/platform-validation/generate-report.sh
```

## Integration Tests

The suite includes comprehensive integration tests in:
- `src/utils/__tests__/platform-integration.test.js`

These tests validate:
- ✅ Component integration with platform utilities
- ✅ API configuration across platforms
- ✅ Feature detection accuracy
- ✅ Style system consistency
- ✅ Platform selection logic
- ✅ Performance characteristics
- ✅ Error handling

## Success Criteria

### Critical (Must Pass)
- ✅ Zero Platform.OS references outside platform.js
- ✅ Zero old Platform.select usage
- ✅ All files use relative imports for platform utilities
- ✅ Zero platform-specific files (.native.js, .web.js)
- ✅ Zero TypeScript files
- ✅ Web build succeeds
- ✅ All tests pass

### Warnings (Should Fix)
- ⚠️ High number of console.log statements
- ⚠️ High number of TODO comments
- ⚠️ Bundle size increase > 5%
- ⚠️ Performance regression > 20%

## Reports and Artifacts

The validation suite generates several artifacts:

- `validation-report.md` - Comprehensive validation report
- `performance-results.json` - Performance metrics
- `performance-baseline.json` - Performance baseline for comparison
- `screenshots/` - Visual regression screenshots
- `screenshots/baseline/` - Baseline screenshots for comparison

## Troubleshooting

### Common Issues

#### "Platform.OS references found"
```bash
# Find remaining references
grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" --exclude="*/__tests__/*"

# These should be converted to use platform utilities:
# Platform.OS === 'web' → platform.isWeb
# Platform.OS === 'ios' → platform.isIOS
# Platform.OS === 'android' → platform.isAndroid
```

#### "Files use platform without import"
```bash
# Find files missing imports
grep -r "platform\." src/ --include="*.js" --exclude="*/platform.js" -l | \
xargs -I {} sh -c 'grep -L "import.*platform.*from.*['\''"]\.\..*platform" "{}"'

# Add import to these files:
# Example: import platform from '../utils/platform';
```

#### "Web build failed"
```bash
# Check build output
npm run build:web

# Common issues:
# - Platform migration completed (check webpack.config.js for confirmation)
# - Babel configuration issues
# - Module resolution problems
```

#### "Tests failing"
```bash
# Run tests individually
npm test src/utils/__tests__/platform.test.js
npm test src/utils/__tests__/platform-integration.test.js

# Common issues:
# - Jest configuration for React Native modules
# - Missing platform utilities
# - Import resolution problems
```

## Dependencies

### Required
- Node.js
- npm/yarn
- React Native CLI (for mobile testing)

### Optional
- `puppeteer` (for visual regression testing)
- Android Studio + emulator (for Android testing)
- Xcode + simulator (for iOS testing, macOS only)

## Configuration

The validation suite uses these configuration files:
- `webpack.config.js` - Web build configuration
- `metro.config.js` - React Native bundler configuration
- `babel.config.js` - Babel transformation configuration
- `jest.config.js` - Test runner configuration

## Continuous Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Platform Validation
  run: ./scripts/platform-validation/run-all-tests.sh
  
- name: Upload Validation Report
  uses: actions/upload-artifact@v3
  with:
    name: validation-report
    path: scripts/platform-validation/validation-report.md
```

## Support

For issues with the validation suite:
1. Check this README for common solutions
2. Review the generated validation report for specific issues
3. Run individual scripts to isolate problems
4. Check project configuration files for correct setup

---

*Platform Validation Suite v1.0 - Part of Manylla Platform Consolidation Migration*