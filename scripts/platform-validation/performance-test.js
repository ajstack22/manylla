#!/usr/bin/env node

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

console.log('⚡ Running performance tests...');

// Test import performance
const testImportPerformance = () => {
  console.log('📦 Testing module import performance...');
  
  // Test platform module import
  const start = performance.now();
  try {
    require('../../src/utils/platform');
    const end = performance.now();
    const importTime = end - start;
    console.log(`  Platform module load time: ${importTime.toFixed(2)}ms`);
    return { importTime };
  } catch (error) {
    console.error(`  ❌ Platform module import failed: ${error.message}`);
    return { importTime: -1 };
  }
};

// Test function performance
const testFunctionPerformance = () => {
  console.log('🔧 Testing function performance...');
  
  try {
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
    const selectTime = selectEnd - selectStart;
    
    // Test shadow function
    const shadowStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      platform.shadow(4);
    }
    const shadowEnd = performance.now();
    const shadowTime = shadowEnd - shadowStart;
    
    // Test font function
    const fontStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      platform.font('bold', 16);
    }
    const fontEnd = performance.now();
    const fontTime = fontEnd - fontStart;
    
    console.log(`  platform.select (${iterations}x): ${selectTime.toFixed(2)}ms`);
    console.log(`  platform.shadow (${iterations}x): ${shadowTime.toFixed(2)}ms`);
    console.log(`  platform.font (${iterations}x): ${fontTime.toFixed(2)}ms`);
    
    return {
      select: selectTime,
      shadow: shadowTime,
      font: fontTime
    };
    
  } catch (error) {
    console.error(`  ❌ Function performance test failed: ${error.message}`);
    return { select: -1, shadow: -1, font: -1 };
  }
};

// Test memory usage
const testMemoryUsage = () => {
  console.log('💾 Testing memory usage...');
  
  const used = process.memoryUsage();
  
  console.log('  Memory usage:');
  for (let key in used) {
    console.log(`    ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  
  return used;
};

// Test bundle size
const testBundleSize = () => {
  console.log('📦 Testing bundle size...');
  
  const buildPath = path.join(__dirname, '../../web/build');
  
  if (!fs.existsSync(buildPath)) {
    console.log('  ⚠️  Build directory not found, run npm run build:web first');
    return null;
  }
  
  // Calculate total build size
  const calculateDirSize = (dirPath) => {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += calculateDirSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  };
  
  const totalSize = calculateDirSize(buildPath);
  const sizeInMB = totalSize / (1024 * 1024);
  
  console.log(`  Total bundle size: ${sizeInMB.toFixed(2)} MB`);
  
  // Check specific file sizes
  const staticPath = path.join(buildPath, 'static');
  if (fs.existsSync(staticPath)) {
    const jsPath = path.join(staticPath, 'js');
    const cssPath = path.join(staticPath, 'css');
    
    let jsSize = 0;
    let cssSize = 0;
    
    if (fs.existsSync(jsPath)) {
      jsSize = calculateDirSize(jsPath) / (1024 * 1024);
      console.log(`  JavaScript size: ${jsSize.toFixed(2)} MB`);
    }
    
    if (fs.existsSync(cssPath)) {
      cssSize = calculateDirSize(cssPath) / (1024 * 1024);
      console.log(`  CSS size: ${cssSize.toFixed(2)} MB`);
    }
    
    return {
      total: sizeInMB,
      javascript: jsSize,
      css: cssSize
    };
  }
  
  return {
    total: sizeInMB,
    javascript: 0,
    css: 0
  };
};

// Test React Native bundle metrics (if available)
const testRNBundleMetrics = async () => {
  console.log('📱 Testing React Native bundle metrics...');
  
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // Check if Metro is available
    const indexPath = path.join(__dirname, '../../index.js');
    if (!fs.existsSync(indexPath)) {
      console.log('  ⚠️  React Native entry point not found, skipping');
      return null;
    }
    
    // Try to generate bundle stats (this is approximate)
    try {
      // eslint-disable-next-line no-unused-vars
      const { stdout } = await execAsync('npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output temp-bundle.js --sourcemap-output temp-bundle.map --reset-cache');
      
      // Check generated bundle size
      const bundlePath = path.join(process.cwd(), 'temp-bundle.js');
      if (fs.existsSync(bundlePath)) {
        const stats = fs.statSync(bundlePath);
        const bundleSize = stats.size / (1024 * 1024);
        console.log(`  React Native bundle size: ${bundleSize.toFixed(2)} MB`);
        
        // Clean up
        fs.unlinkSync(bundlePath);
        const mapPath = path.join(process.cwd(), 'temp-bundle.map');
        if (fs.existsSync(mapPath)) {
          fs.unlinkSync(mapPath);
        }
        
        return { bundleSize };
      }
    } catch (bundleError) {
      console.log('  ⚠️  Could not generate React Native bundle metrics');
      return null;
    }
    
  } catch (error) {
    console.log('  ⚠️  React Native metrics unavailable');
    return null;
  }
};

// Compare with baseline
const compareWithBaseline = (results) => {
  console.log('📊 Comparing with baseline...');
  
  const baselineFile = path.join(__dirname, 'performance-baseline.json');
  
  if (!fs.existsSync(baselineFile)) {
    // Create baseline
    fs.writeFileSync(baselineFile, JSON.stringify(results, null, 2));
    console.log('  ✅ Baseline performance metrics created');
    return;
  }
  
  try {
    const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    
    // Compare import time
    if (baseline.importTime && results.importTime) {
      const diff = ((results.importTime - baseline.importTime) / baseline.importTime) * 100;
      if (diff > 20) {
        console.log(`  ⚠️  Import time increased by ${diff.toFixed(1)}%`);
      } else if (diff < -10) {
        console.log(`  ✅ Import time improved by ${Math.abs(diff).toFixed(1)}%`);
      } else {
        console.log(`  ✅ Import time stable (${diff.toFixed(1)}% change)`);
      }
    }
    
    // Compare function performance
    if (baseline.functionPerformance && results.functionPerformance) {
      const functions = ['select', 'shadow', 'font'];
      for (const func of functions) {
        if (baseline.functionPerformance[func] && results.functionPerformance[func]) {
          const diff = ((results.functionPerformance[func] - baseline.functionPerformance[func]) / baseline.functionPerformance[func]) * 100;
          if (diff > 50) {
            console.log(`  ⚠️  ${func} function performance decreased by ${diff.toFixed(1)}%`);
          } else {
            console.log(`  ✅ ${func} function performance stable (${diff.toFixed(1)}% change)`);
          }
        }
      }
    }
    
    // Compare bundle size
    if (baseline.bundleSize && results.bundleSize) {
      const diff = ((results.bundleSize.total - baseline.bundleSize.total) / baseline.bundleSize.total) * 100;
      if (diff > 5) {
        console.log(`  ⚠️  Bundle size increased by ${diff.toFixed(1)}%`);
      } else if (diff < -2) {
        console.log(`  ✅ Bundle size decreased by ${Math.abs(diff).toFixed(1)}%`);
      } else {
        console.log(`  ✅ Bundle size stable (${diff.toFixed(1)}% change)`);
      }
    }
    
  } catch (error) {
    console.log(`  ⚠️  Could not compare with baseline: ${error.message}`);
  }
};

// Run all tests
const runPerformanceTests = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    importTime: testImportPerformance().importTime,
    functionPerformance: testFunctionPerformance(),
    memoryUsage: testMemoryUsage(),
    bundleSize: testBundleSize(),
    rnBundleMetrics: await testRNBundleMetrics()
  };
  
  // Save results
  const resultsPath = path.join(__dirname, 'performance-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${resultsPath}`);
  
  // Compare with baseline
  compareWithBaseline(results);
  
  console.log('\n✅ Performance tests complete');
  
  // Return success if no major performance regressions
  const hasRegressions = results.importTime < 0 || 
                        results.functionPerformance.select < 0 ||
                        results.functionPerformance.shadow < 0 ||
                        results.functionPerformance.font < 0;
  
  return !hasRegressions;
};

if (require.main === module) {
  runPerformanceTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Performance test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runPerformanceTests };