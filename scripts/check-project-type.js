#!/usr/bin/env node

/**
 * This script validates project type and provides correct commands
 * Run this if you're unsure how to start the dev server
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🔍 MANYLLA PROJECT TYPE CHECKER');
console.log('='.repeat(60));

// Get project root - when run via npm scripts, cwd is the project root
const projectRoot = process.cwd();

// Check for key files that identify project type
const checks = {
  'webpack.config.js': '✅ Webpack config found',
  'index.web.js': '✅ Web entry point found',
  'App.js': '✅ React Native App.js found',
  'src/index.js': '❌ CRA index.js NOT found (good!)',
  'PROJECT_TYPE': '✅ Project type identifier found'
};

console.log('\n📁 Project Structure Check:');
for (const [file, message] of Object.entries(checks)) {
  const exists = fs.existsSync(path.join(projectRoot, file));
  if (file === 'src/index.js') {
    // For CRA index, NOT existing is good
    console.log(exists ? '❌ WARNING: ' + file + ' exists (unexpected!)' : message);
  } else {
    console.log(exists ? message : '❌ Missing: ' + file);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📱 PROJECT TYPE: React Native + Web (Unified Codebase)');
console.log('🔧 Web Build Tool: Webpack (NOT Create React App!)');
console.log('='.repeat(60));

console.log('\n🚀 CORRECT COMMANDS:');
console.log('├─ Web Development:    npm run web');
console.log('│  (Opens http://localhost:3000)');
console.log('├─ Mobile (iOS/Android): npm start');
console.log('│  (Starts React Native Metro bundler)');
console.log('└─ Build for Production: npm run build:web');

console.log('\n⚠️  NEVER USE THESE:');
console.log('├─ ❌ npx react-scripts start');
console.log('├─ ❌ npm run start:web');
console.log('└─ ❌ yarn start (unless for React Native)');

console.log('\n💡 Quick Test:');
console.log('Run this to start web dev: npm run web');
console.log('='.repeat(60) + '\n');

// Exit with success
process.exit(0);