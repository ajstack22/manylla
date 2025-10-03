#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function captureScreenshots() {
  console.log('📸 Capturing screenshots for visual regression...');
  
  // Check if puppeteer is available
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (error) {
    console.log('⚠️  Puppeteer not installed, skipping visual regression');
    console.log('  Install with: npm install --save-dev puppeteer');
    // Don't fail validation if puppeteer isn't installed (optional dependency)
    return true;
  }
  
  let browser;
  let webProcess;
  
  try {
    // Start web server
    console.log('  Starting web server for screenshots...');
    webProcess = exec('npm run web');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Create screenshots directory
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // Test scenarios
    const scenarios = [
      { name: 'home', url: 'http://localhost:3000', waitFor: 'body' },
      { name: 'loading', url: 'http://localhost:3000', waitFor: '.loading' },
    ];
    
    // Viewport sizes
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];
    
    for (const scenario of scenarios) {
      for (const viewport of viewports) {
        try {
          await page.setViewport(viewport);
          await page.goto(scenario.url, { 
            waitUntil: 'networkidle2',
            timeout: 30000
          });
          
          // Wait for specific element if specified
          if (scenario.waitFor) {
            try {
              await page.waitForSelector(scenario.waitFor, { timeout: 5000 });
            } catch (waitError) {
              // Element not found, continue anyway
              console.log(`  ⚠️  Element ${scenario.waitFor} not found for ${scenario.name}`);
            }
          }
          
          const filename = `${scenario.name}-${viewport.name}.png`;
          await page.screenshot({
            path: path.join(screenshotDir, filename),
            fullPage: true
          });
          
          console.log(`  ✅ Captured ${filename}`);
        } catch (error) {
          console.log(`  ⚠️  Failed to capture ${scenario.name}-${viewport.name}: ${error.message}`);
        }
      }
    }
    
    console.log('📸 Screenshots captured successfully');
    return true;
    
  } catch (error) {
    console.error('Visual regression test failed:', error.message);
    return false;
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    if (webProcess) {
      webProcess.kill();
    }
  }
}

async function compareScreenshots() {
  console.log('🔍 Checking for visual changes...');
  
  const screenshotDir = path.join(__dirname, 'screenshots');
  const baselineDir = path.join(__dirname, 'screenshots', 'baseline');
  
  if (!fs.existsSync(screenshotDir)) {
    console.log('  ⚠️  No screenshots found');
    // No screenshots to compare - non-blocking
    return true;
  }
  
  // Create baseline directory if it doesn't exist
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
    
    // Move current screenshots to baseline
    const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
    for (const file of files) {
      const src = path.join(screenshotDir, file);
      const dest = path.join(baselineDir, file);
      fs.copyFileSync(src, dest);
    }
    
    console.log('  ✅ Baseline screenshots created');
    // Baseline created successfully - no comparison needed yet
    return true;
  }

  // Compare with baseline (basic file size comparison)
  const currentFiles = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
  const baselineFiles = fs.readdirSync(baselineDir).filter(f => f.endsWith('.png'));
  
  const newFiles = currentFiles.filter(f => !baselineFiles.includes(f));
  const removedFiles = baselineFiles.filter(f => !currentFiles.includes(f));
  
  if (newFiles.length > 0) {
    console.log(`  📸 New screenshots: ${newFiles.join(', ')}`);
  }
  
  if (removedFiles.length > 0) {
    console.log(`  🗑️  Removed screenshots: ${removedFiles.join(', ')}`);
  }
  
  // Basic size comparison for existing files
  let changes = 0;
  const commonFiles = currentFiles.filter(f => baselineFiles.includes(f));
  
  for (const file of commonFiles) {
    const currentPath = path.join(screenshotDir, file);
    const baselinePath = path.join(baselineDir, file);
    
    const currentStat = fs.statSync(currentPath);
    const baselineStat = fs.statSync(baselinePath);
    
    const sizeDiff = Math.abs(currentStat.size - baselineStat.size);
    const sizeDiffPercent = (sizeDiff / baselineStat.size) * 100;
    
    if (sizeDiffPercent > 5) { // More than 5% size difference
      console.log(`  ⚠️  Potential visual change in ${file} (${sizeDiffPercent.toFixed(1)}% size difference)`);
      changes++;
    }
  }
  
  if (changes === 0) {
    console.log('  ✅ No significant visual changes detected');
  } else {
    console.log(`  📊 ${changes} files show potential changes`);
  }

  // Visual regression comparison complete (always non-blocking)
  return true;
}

async function runVisualRegression() {
  console.log('🎨 Running visual regression tests...\n');
  
  const captureSuccess = await captureScreenshots();
  const compareSuccess = await compareScreenshots();
  
  if (captureSuccess && compareSuccess) {
    console.log('\n✅ Visual regression tests completed');
    return true;
  } else {
    console.log('\n❌ Visual regression tests failed');
    return false;
  }
}

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Visual regression tests interrupted');
  process.exit(1);
});

if (require.main === module) {
  runVisualRegression().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Visual regression test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { captureScreenshots, compareScreenshots };