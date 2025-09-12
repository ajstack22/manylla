#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check for any remaining direct Platform usage
function checkPlatformUsage(dir) {
  const files = fs.readdirSync(dir);
  let issues = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      issues = issues.concat(checkPlatformUsage(filePath));
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for Platform.OS
      if (content.includes('Platform.OS') && !filePath.includes('platform.js')) {
        issues.push(`Platform.OS found in ${filePath}`);
      }
      
      // Check for Platform.select from react-native
      if (content.includes("from 'react-native'") && content.includes('Platform')) {
        if (!filePath.includes('platform.js')) {
          issues.push(`Platform import from react-native in ${filePath}`);
        }
      }
    }
  });
  
  return issues;
}

const issues = checkPlatformUsage('./src');
if (issues.length > 0) {
  console.error('❌ Platform usage issues found:');
  issues.forEach(issue => console.error(`  - ${issue}`));
  process.exit(1);
} else {
  console.log('✅ No direct Platform usage found');
}