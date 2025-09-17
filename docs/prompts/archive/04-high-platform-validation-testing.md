# Platform Migration Validation & Testing Suite

**Priority**: 04-high
**Status**: Ready
**Assignee**: Developer/QA
**Peer Review**: Required

**Issue**: Need comprehensive validation and testing to ensure platform migration is complete and successful

## Context
After platform migration, we need thorough validation to ensure no Platform.OS references remain, all functionality works across platforms, and no performance regressions occurred.

## Working Agreements Validation
- ✅ No TypeScript files will be created
- ✅ No .native.js or .web.js files  
- ✅ Build output remains in web/build/
- ✅ Pure JavaScript implementation

## Implementation

### Automated Validation Suite
**Location**: `scripts/platform-validation/validate-all.sh`

```bash
#!/bin/bash

echo "🔍 Running complete platform validation suite..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check test results
check_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
    ERRORS=$((ERRORS + 1))
  fi
}

# Function to warn
warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# 1. Check for remaining Platform.OS
echo "1️⃣  Checking for Platform.OS references..."
PLATFORM_OS=$(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l)
check_result $([ "$PLATFORM_OS" -eq 0 ]; echo $?) "No Platform.OS references found ($PLATFORM_OS)"

# 2. Check for old Platform.select
echo "2️⃣  Checking for old Platform.select..."
OLD_SELECT=$(grep -r "Platform\.select" src/ --include="*.js" | grep -v "platform\.select" | wc -l)
check_result $([ "$OLD_SELECT" -eq 0 ]; echo $?) "No old Platform.select found ($OLD_SELECT)"

# 3. Check all files import platform correctly
echo "3️⃣  Checking platform imports..."
FILES_WITH_PLATFORM=$(grep -r "platform\." src/ --include="*.js" --exclude="*/platform.js" -l | wc -l)
FILES_WITH_IMPORT=$(grep -r "import.*platform.*from.*@platform" src/ --include="*.js" -l | wc -l)

if [ "$FILES_WITH_PLATFORM" -ne "$FILES_WITH_IMPORT" ]; then
  warn "Files using platform without import: $((FILES_WITH_PLATFORM - FILES_WITH_IMPORT))"
fi

# 4. Check for .native.js or .web.js files
echo "4️⃣  Checking for platform-specific files..."
NATIVE_FILES=$(find src -name "*.native.js" -o -name "*.web.js" | wc -l)
check_result $([ "$NATIVE_FILES" -eq 0 ]; echo $?) "No .native.js or .web.js files ($NATIVE_FILES)"

# 5. Check for TypeScript files
echo "5️⃣  Checking for TypeScript files..."
TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
check_result $([ "$TS_FILES" -eq 0 ]; echo $?) "No TypeScript files ($TS_FILES)"

# 6. Build validation
echo "6️⃣  Validating web build..."
npm run build:web > /dev/null 2>&1
check_result $? "Web build successful"

# 7. Test suite
echo "7️⃣  Running test suite..."
npm test > /dev/null 2>&1
check_result $? "All tests passing"

# 8. Bundle size check
echo "8️⃣  Checking bundle size..."
if [ -f "scripts/platform-migration/reports/baseline-size.txt" ]; then
  BASELINE=$(cat scripts/platform-migration/reports/baseline-size.txt | awk '{print $1}' | sed 's/M//')
  CURRENT=$(du -sh web/build | awk '{print $1}' | sed 's/M//')
  
  # Calculate percentage increase
  if command -v bc &> /dev/null; then
    INCREASE=$(echo "scale=2; (($CURRENT - $BASELINE) / $BASELINE) * 100" | bc)
    if (( $(echo "$INCREASE > 5" | bc -l) )); then
      warn "Bundle size increased by ${INCREASE}% (baseline: ${BASELINE}M, current: ${CURRENT}M)"
    else
      echo -e "${GREEN}✅ Bundle size acceptable (${INCREASE}% change)${NC}"
    fi
  fi
fi

# Summary
echo ""
echo "📊 Validation Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Platform validation PASSED${NC}"
  exit 0
else
  echo -e "${RED}❌ Platform validation FAILED${NC}"
  exit 1
fi
```

### Platform-Specific Testing
**Location**: `scripts/platform-validation/test-platforms.js`

```javascript
#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testWeb() {
  console.log('🌐 Testing Web Platform...');
  
  try {
    // Start web server
    const webProcess = exec('npm run web');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test web endpoints
    const tests = [
      'http://localhost:3000',
      'http://localhost:3000/api/sync_health.php'
    ];
    
    for (const url of tests) {
      try {
        await execPromise(`curl -f ${url}`);
        console.log(`  ✅ ${url} accessible`);
      } catch (error) {
        console.error(`  ❌ ${url} failed`);
      }
    }
    
    // Kill web process
    webProcess.kill();
    
  } catch (error) {
    console.error('Web test failed:', error);
    return false;
  }
  
  return true;
}

async function testAndroid() {
  console.log('🤖 Testing Android Platform...');
  
  try {
    // Check if emulator is running
    const { stdout } = await execPromise('adb devices');
    
    if (!stdout.includes('emulator')) {
      console.log('  ⚠️  No Android emulator running, skipping');
      return true;
    }
    
    // Build Android
    console.log('  Building Android app...');
    await execPromise('cd android && ./gradlew assembleDebug');
    
    // Install and test
    console.log('  Installing on emulator...');
    await execPromise('adb install -r android/app/build/outputs/apk/debug/app-debug.apk');
    
    // Launch app
    await execPromise('adb shell am start -n com.manyllamobile/.MainActivity');
    
    // Check for crashes
    await new Promise(resolve => setTimeout(resolve, 3000));
    const { stdout: logs } = await execPromise('adb logcat -d | grep "FATAL EXCEPTION"');
    
    if (logs) {
      console.error('  ❌ Android app crashed');
      return false;
    }
    
    console.log('  ✅ Android app running');
    
  } catch (error) {
    console.error('Android test failed:', error);
    return false;
  }
  
  return true;
}

async function testiOS() {
  console.log('🍎 Testing iOS Platform...');
  
  // Check if on macOS
  if (process.platform !== 'darwin') {
    console.log('  ⚠️  Not on macOS, skipping iOS tests');
    return true;
  }
  
  try {
    // Build iOS
    console.log('  Building iOS app...');
    await execPromise('cd ios && xcodebuild -workspace ManyllaMobile.xcworkspace -scheme ManyllaMobile -configuration Debug -sdk iphonesimulator -derivedDataPath build');
    
    console.log('  ✅ iOS build successful');
    
  } catch (error) {
    console.error('iOS test failed:', error);
    return false;
  }
  
  return true;
}

async function runAllTests() {
  console.log('🧪 Running platform-specific tests...\n');
  
  const results = {
    web: await testWeb(),
    android: await testAndroid(),
    ios: await testiOS()
  };
  
  console.log('\n📊 Test Results:');
  Object.entries(results).forEach(([platform, passed]) => {
    console.log(`  ${platform}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  process.exit(allPassed ? 0 : 1);
}

runAllTests();
```

### Visual Regression Testing
**Location**: `scripts/platform-validation/visual-regression.js`

```javascript
#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  console.log('📸 Capturing screenshots for visual regression...');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotDir = 'scripts/platform-validation/screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // Test scenarios
  const scenarios = [
    { name: 'home', url: 'http://localhost:3000' },
    { name: 'profile', url: 'http://localhost:3000/profiles' },
    { name: 'settings', url: 'http://localhost:3000/settings' },
  ];
  
  // Viewport sizes
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];
  
  for (const scenario of scenarios) {
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto(scenario.url, { waitUntil: 'networkidle2' });
      
      const filename = `${scenario.name}-${viewport.name}.png`;
      await page.screenshot({
        path: path.join(screenshotDir, filename),
        fullPage: true
      });
      
      console.log(`  ✅ Captured ${filename}`);
    }
  }
  
  await browser.close();
  console.log('📸 Screenshots captured successfully');
}

// Run if puppeteer is installed
try {
  require.resolve('puppeteer');
  captureScreenshots();
} catch(e) {
  console.log('⚠️  Puppeteer not installed, skipping visual regression');
  console.log('  Install with: npm install --save-dev puppeteer');
}
```

### Performance Testing
**Location**: `scripts/platform-validation/performance-test.js`

```javascript
#!/usr/bin/env node

const { performance } = require('perf_hooks');
const fs = require('fs');

console.log('⚡ Running performance tests...');

// Test import performance
const testImportPerformance = () => {
  const start = performance.now();
  require('../../src/utils/platform');
  const end = performance.now();
  
  console.log(`  Platform module load time: ${(end - start).toFixed(2)}ms`);
  return end - start;
};

// Test function performance
const testFunctionPerformance = () => {
  const platform = require('../../src/utils/platform');
  const iterations = 10000;
  
  // Test select function
  const selectStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    platform.select({
      ios: 'ios',
      android: 'android',
      web: 'web',
      default: 'default'
    });
  }
  const selectEnd = performance.now();
  
  // Test shadow function
  const shadowStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    platform.shadow(4);
  }
  const shadowEnd = performance.now();
  
  console.log(`  platform.select (${iterations}x): ${(selectEnd - selectStart).toFixed(2)}ms`);
  console.log(`  platform.shadow (${iterations}x): ${(shadowEnd - shadowStart).toFixed(2)}ms`);
  
  return {
    select: selectEnd - selectStart,
    shadow: shadowEnd - shadowStart
  };
};

// Test memory usage
const testMemoryUsage = () => {
  const used = process.memoryUsage();
  
  console.log('  Memory usage:');
  for (let key in used) {
    console.log(`    ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  
  return used;
};

// Run all tests
const results = {
  importTime: testImportPerformance(),
  functionPerformance: testFunctionPerformance(),
  memoryUsage: testMemoryUsage()
};

// Save results
fs.writeFileSync(
  'scripts/platform-validation/performance-results.json',
  JSON.stringify(results, null, 2)
);

console.log('\n✅ Performance tests complete');
```

### Integration Test Suite
**Location**: `src/utils/__tests__/platform-integration.test.js`

```javascript
import platform from '../platform';
import { render } from '@testing-library/react-native';
import React from 'react';
import { View, Text, Modal, ScrollView } from 'react-native';

describe('Platform Integration Tests', () => {
  describe('Component Integration', () => {
    it('should render with platform-specific styles', () => {
      const TestComponent = () => (
        <View style={platform.shadow(4)}>
          <Text style={platform.font('bold', 16)}>Test</Text>
        </View>
      );
      
      const { getByText } = render(<TestComponent />);
      expect(getByText('Test')).toBeTruthy();
    });
    
    it('should configure modal correctly', () => {
      const TestModal = () => (
        <Modal {...platform.modalConfig()} visible={true}>
          <Text>Modal Content</Text>
        </Modal>
      );
      
      const { getByText } = render(<TestModal />);
      expect(getByText('Modal Content')).toBeTruthy();
    });
    
    it('should configure ScrollView correctly', () => {
      const TestScrollView = () => (
        <ScrollView {...platform.scrollView()}>
          <Text>Scrollable Content</Text>
        </ScrollView>
      );
      
      const { getByText } = render(<TestScrollView />);
      expect(getByText('Scrollable Content')).toBeTruthy();
    });
  });
  
  describe('API Integration', () => {
    it('should return correct API URL', () => {
      const url = platform.apiBaseUrl();
      expect(url).toBeTruthy();
      expect(typeof url).toBe('string');
    });
    
    it('should provide fetch configuration', () => {
      const config = platform.fetchConfig();
      expect(config.headers).toBeDefined();
      expect(config.headers['Content-Type']).toBe('application/json');
    });
  });
  
  describe('Feature Detection', () => {
    it('should detect all required features', () => {
      const features = [
        'supportsCamera',
        'supportsShare',
        'supportsClipboard',
        'supportsPrint'
      ];
      
      features.forEach(feature => {
        expect(typeof platform[feature]).toBe('boolean');
      });
    });
  });
});
```

### Validation Report Generator
**Location**: `scripts/platform-validation/generate-report.sh`

```bash
#!/bin/bash

echo "📄 Generating validation report..."

REPORT_FILE="scripts/platform-validation/validation-report.md"

cat > $REPORT_FILE << EOF
# Platform Migration Validation Report
Generated: $(date)

## Code Analysis
- Platform.OS references: $(grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" | wc -l)
- Platform.select (old): $(grep -r "Platform\.select" src/ --include="*.js" | grep -v "platform\.select" | wc -l)
- Files using platform: $(grep -r "platform\." src/ --include="*.js" --exclude="*/platform.js" -l | wc -l)
- Platform imports: $(grep -r "import.*platform.*from.*@platform" src/ --include="*.js" -l | wc -l)

## File Structure
- .native.js files: $(find src -name "*.native.js" | wc -l)
- .web.js files: $(find src -name "*.web.js" | wc -l)
- TypeScript files: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)

## Build Status
- Web build: $(npm run build:web > /dev/null 2>&1 && echo "✅ PASS" || echo "❌ FAIL")
- Bundle size: $(du -sh web/build 2>/dev/null | awk '{print $1}' || echo "N/A")

## Test Results
- Unit tests: $(npm test > /dev/null 2>&1 && echo "✅ PASS" || echo "❌ FAIL")
- Integration tests: Check test output

## Performance Metrics
$([ -f "scripts/platform-validation/performance-results.json" ] && cat scripts/platform-validation/performance-results.json || echo "No performance data available")

## Visual Regression
- Screenshots captured: $(ls scripts/platform-validation/screenshots/*.png 2>/dev/null | wc -l)

## Recommendations
1. Review any remaining Platform.OS references
2. Test on all target devices
3. Monitor bundle size changes
4. Check performance metrics
EOF

echo "✅ Report generated: $REPORT_FILE"
```

### Testing Checklist
- [ ] No Platform.OS references outside platform.js
- [ ] No old Platform.select usage
- [ ] All files import platform correctly
- [ ] No .native.js or .web.js files
- [ ] No TypeScript files
- [ ] Web build succeeds
- [ ] All unit tests pass
- [ ] Bundle size within acceptable range
- [ ] Platform-specific tests pass (web, iOS, Android)
- [ ] Visual regression screenshots captured
- [ ] Performance metrics acceptable
- [ ] Integration tests pass

### Success Criteria
- Zero Platform.OS references (except in platform.js)
- All tests passing
- Bundle size increase < 5%
- No runtime errors on any platform
- Performance metrics within baseline
- Visual regression tests show no unexpected changes

### Notes
- Run validation after each migration phase
- Keep performance baselines for comparison
- Visual regression requires manual review
- Consider adding E2E tests with Detox or Appium
- Report should be reviewed before deployment