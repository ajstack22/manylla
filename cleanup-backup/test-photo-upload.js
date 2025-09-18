#!/usr/bin/env node

/**
 * Test script to verify PhotoUpload component integration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing PhotoUpload Component Integration...\n');

// Test 1: Check if all required files exist
console.log('✅ Test 1: Checking required files...');
const requiredFiles = [
  'src/components/Profile/PhotoUpload.js',
  'src/services/photoService.js',
  'src/utils/imageUtils.js',
  'src/components/Common/ImagePicker.js',
  'src/components/Profile/ProfileEditDialog.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check if PhotoUpload is imported in ProfileEditDialog
console.log('\n✅ Test 2: Checking PhotoUpload import...');
const dialogContent = fs.readFileSync(
  path.join(__dirname, 'src/components/Profile/ProfileEditDialog.js'),
  'utf8'
);

if (dialogContent.includes('import PhotoUpload from "./PhotoUpload"')) {
  console.log('  ✓ PhotoUpload is imported correctly');
} else {
  console.log('  ✗ PhotoUpload import not found');
  allFilesExist = false;
}

// Test 3: Check if PhotoUpload is used in the dialog
console.log('\n✅ Test 3: Checking PhotoUpload usage...');
if (dialogContent.includes('<PhotoUpload')) {
  console.log('  ✓ PhotoUpload component is used in dialog');

  // Extract the usage
  const match = dialogContent.match(/<PhotoUpload[^>]*\/>/s);
  if (match) {
    console.log('  ✓ Component props:');
    console.log('    ' + match[0].replace(/\n/g, '\n    '));
  }
} else {
  console.log('  ✗ PhotoUpload component not found in dialog');
  allFilesExist = false;
}

// Test 4: Check for potential issues
console.log('\n✅ Test 4: Checking for potential issues...');
const photoUploadContent = fs.readFileSync(
  path.join(__dirname, 'src/components/Profile/PhotoUpload.js'),
  'utf8'
);

// Check for gap property (not supported in all RN versions)
if (photoUploadContent.includes('gap:')) {
  console.log('  ⚠️  Warning: gap property found (may not be supported)');
} else {
  console.log('  ✓ No gap property issues');
}

// Check for proper theme usage
if (photoUploadContent.includes('colors.error')) {
  console.log('  ⚠️  Warning: colors.error reference found (may not exist in theme)');
} else {
  console.log('  ✓ No undefined theme properties');
}

// Test 5: Build test
console.log('\n✅ Test 5: Testing build...');
const { execSync } = require('child_process');
try {
  execSync('npm run build:web', { stdio: 'pipe' });
  console.log('  ✓ Build completed successfully');
} catch (error) {
  console.log('  ✗ Build failed:', error.message);
  allFilesExist = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('✅ All tests passed! PhotoUpload component is properly integrated.');
  console.log('\nNext steps:');
  console.log('1. Open the app in browser: http://localhost:3000');
  console.log('2. Navigate to a profile and click Edit');
  console.log('3. The PhotoUpload component should appear at the top of the dialog');
} else {
  console.log('❌ Some tests failed. Please review the issues above.');
}