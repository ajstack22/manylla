#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Migration mappings - from Platform.OS/Platform.select to platform utility
const migrations = [
  // Basic Platform.OS replacements
  {
    pattern: /Platform\.OS === ['"](web|ios|android)['"](?!\s*\))/g,
    replacement: (match, platform) => {
      const platformMap = {
        'web': 'platform.isWeb',
        'ios': 'platform.isIOS', 
        'android': 'platform.isAndroid'
      };
      return platformMap[platform];
    },
    description: 'Replace Platform.OS === "platform" with platform.isPlatform'
  },
  
  {
    pattern: /Platform\.OS !== ['"](web|ios|android)['"](?!\s*\))/g,
    replacement: (match, platform) => {
      const platformMap = {
        'web': '!platform.isWeb',
        'ios': '!platform.isIOS', 
        'android': '!platform.isAndroid'
      };
      return platformMap[platform];
    },
    description: 'Replace Platform.OS !== "platform" with !platform.isPlatform'
  },

  // Special case for isMobile pattern
  {
    pattern: /Platform\.OS !== ['"]web['"]/g,
    replacement: 'platform.isMobile',
    description: 'Replace Platform.OS !== "web" with platform.isMobile'
  },

  // Platform.select replacements with simple select() helper
  {
    pattern: /Platform\.select\s*\(/g,
    replacement: 'platform.select(',
    description: 'Replace Platform.select( with platform.select('
  },

  // Common keyboard avoiding patterns
  {
    pattern: /behavior:\s*Platform\.OS === ['"]ios['"] \? ['"]padding['"] : ['"]height['"]/g,
    replacement: 'behavior: platform.keyboardAvoiding().behavior',
    description: 'Replace keyboard behavior pattern with platform.keyboardAvoiding().behavior'
  },

  {
    pattern: /keyboardVerticalOffset:\s*Platform\.OS === ['"]ios['"] \? 0 : (?:StatusBar\.currentHeight \|\| 24|24)/g,
    replacement: 'keyboardVerticalOffset: platform.keyboardAvoiding().keyboardVerticalOffset',
    description: 'Replace keyboard offset pattern with platform.keyboardAvoiding().keyboardVerticalOffset'
  },

  // Android-specific input patterns
  {
    pattern: /Platform\.OS === ['"]android['"] && \{ color: ['"]#000000?['"] \}/g,
    replacement: '...platform.textInput().androidTextColor',
    description: 'Replace Android black text color pattern'
  },

  {
    pattern: /placeholderTextColor=\{Platform\.OS === ['"]android['"] \? ['"]#999['"] : (?:undefined|colors\.text\.disabled)\}/g,
    replacement: 'placeholderTextColor={platform.textInputProps().placeholderTextColor}',
    description: 'Replace Android placeholder color pattern'
  },

  // Shadow/elevation patterns  
  {
    pattern: /Platform\.OS === ['"]android['"] \?\s*\{\s*elevation:\s*(\d+)\s*\}\s*:\s*\{[^}]*shadowColor[^}]*\}/g,
    replacement: (match, elevation) => `platform.shadow(${elevation})`,
    description: 'Replace shadow/elevation pattern with platform.shadow()'
  },

  // Font family patterns
  {
    pattern: /fontFamily:\s*Platform\.select\s*\(\s*\{\s*android:\s*['"]sans-serif['"],?\s*(?:ios:\s*['"]System['"],?\s*)?default:\s*['"]System['"],?\s*\}\s*\)/g,
    replacement: 'fontFamily: platform.font().fontFamily',
    description: 'Replace font family pattern with platform.font().fontFamily'
  },

  // ScrollView props patterns
  {
    pattern: /nestedScrollEnabled:\s*Platform\.OS === ['"]android['"]/g,
    replacement: 'nestedScrollEnabled: platform.scrollView().nestedScrollEnabled',
    description: 'Replace nestedScrollEnabled pattern'
  },

  {
    pattern: /removeClippedSubviews:\s*Platform\.OS === ['"]android['"]/g,
    replacement: 'removeClippedSubviews: platform.scrollView().removeClippedSubviews',
    description: 'Replace removeClippedSubviews pattern'
  },

  // Header height patterns
  {
    pattern: /height:\s*Platform\.OS === ['"]ios['"] \? 85 : 60/g,
    replacement: 'height: platform.tabBarHeight()',
    description: 'Replace tab bar height pattern'
  },

  {
    pattern: /paddingBottom:\s*Platform\.OS === ['"]ios['"] \? 20 : 8/g,
    replacement: 'paddingBottom: platform.select({ ios: 20, default: 8 })',
    description: 'Replace iOS padding pattern'
  },

  // API URL patterns
  {
    pattern: /Platform\.OS === ['"]web['"] \? ['"][^'"]*\/api['"] : ['"]https:\/\/[^'"]*\/api['"]/g,
    replacement: 'platform.apiBaseUrl()',
    description: 'Replace API URL pattern with platform.apiBaseUrl()'
  }
];

// Import statement patterns to add platform import
const importPatterns = [
  {
    pattern: /^import \{ ([^}]*Platform[^}]*) \} from ['"]react-native['"];$/gm,
    replacement: (match, imports) => {
      // Remove Platform from react-native imports
      const cleanImports = imports.split(',')
        .map(imp => imp.trim())
        .filter(imp => !imp.includes('Platform'))
        .join(', ');
      
      const reactNativeImport = cleanImports ? `import { ${cleanImports} } from 'react-native';` : '';
      const platformImport = `import platform from '../utils/platform';`;
      
      return reactNativeImport + (reactNativeImport ? '\\n' : '') + platformImport;
    },
    description: 'Add platform import and clean Platform from react-native import'
  },
  
  {
    pattern: /^import \{ Platform \} from ['"]react-native['"];$/gm,
    replacement: "import platform from '../utils/platform';",
    description: 'Replace standalone Platform import with platform import'
  }
];

function getRelativePlatformImportPath(filePath) {
  const srcDir = path.resolve('./src');
  const fileDir = path.dirname(filePath);
  const relativePath = path.relative(fileDir, path.join(srcDir, 'utils/platform'));
  
  // Normalize path separators for cross-platform compatibility
  return relativePath.replace(/\\\\/g, '/');
}

function migrateFile(filePath) {
  console.log(`\\n📁 Migrating: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let changes = [];

  // Skip if already using platform utility
  if (content.includes("from '../utils/platform'") || content.includes("from './utils/platform'")) {
    console.log('  ⏭️  Already migrated (platform import found)');
    return { changed: false, changes: [] };
  }

  // Skip if no Platform usage found
  if (!content.includes('Platform.')) {
    console.log('  ⏭️  No Platform usage found');
    return { changed: false, changes: [] };
  }

  // Apply import migrations first
  for (const migration of importPatterns) {
    const beforeImports = content;
    const relativePlatformPath = getRelativePlatformImportPath(filePath);
    
    content = content.replace(migration.pattern, (match, ...args) => {
      let result = migration.replacement;
      if (typeof result === 'function') {
        result = result(match, ...args);
      }
      // Fix the import path
      result = result.replace("../utils/platform", relativePlatformPath);
      return result;
    });
    
    if (content !== beforeImports) {
      changed = true;
      changes.push(migration.description);
      console.log(`  ✅ ${migration.description}`);
    }
  }

  // Add platform import if Platform usage exists but no import was added
  if (content.includes('Platform.') && !content.includes("from '" + getRelativePlatformImportPath(filePath) + "'")) {
    const importPath = getRelativePlatformImportPath(filePath);
    const importStatement = `import platform from '${importPath}';\\n`;
    
    // Find the last import statement
    const lines = content.split('\\n');
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement.slice(0, -2)); // Remove \\n
    content = lines.join('\\n');
    changed = true;
    changes.push('Added platform import');
    console.log('  ✅ Added platform import');
  }

  // Apply code migrations
  for (const migration of migrations) {
    const beforeCode = content;
    
    content = content.replace(migration.pattern, (match, ...args) => {
      let result = migration.replacement;
      if (typeof result === 'function') {
        result = result(match, ...args);
      }
      return result;
    });
    
    if (content !== beforeCode) {
      changed = true;
      changes.push(migration.description);
      console.log(`  ✅ ${migration.description}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  💾 File updated');
  } else {
    console.log('  ⏭️  No changes needed');
  }

  return { changed, changes };
}

function findJSFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!entry.includes('node_modules') && 
          !entry.includes('.git') && 
          !entry.includes('__tests__') &&
          entry !== 'build' &&
          entry !== 'dist') {
        files.push(...findJSFiles(fullPath));
      }
    } else if (entry.endsWith('.js') && !entry.includes('platform.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function main() {
  console.log('🚀 Starting Platform.OS migration to platform utility...');
  console.log('📋 This script will:');
  console.log('  - Replace Platform.OS === "platform" with platform.isPlatform');
  console.log('  - Replace Platform.select with platform.select');
  console.log('  - Add platform imports where needed');
  console.log('  - Migrate common platform patterns to utility functions');
  
  const srcDir = './src';
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found');
    process.exit(1);
  }

  const jsFiles = findJSFiles(srcDir);
  console.log(`\\n📊 Found ${jsFiles.length} JavaScript files to process\\n`);

  let totalChanged = 0;
  let totalChanges = 0;
  const changesSummary = {};

  for (const file of jsFiles) {
    const result = migrateFile(file);
    if (result.changed) {
      totalChanged++;
      totalChanges += result.changes.length;
      
      result.changes.forEach(change => {
        changesSummary[change] = (changesSummary[change] || 0) + 1;
      });
    }
  }

  console.log('\\n' + '='.repeat(60));
  console.log('📈 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${jsFiles.length}`);
  console.log(`Files changed: ${totalChanged}`);
  console.log(`Total changes: ${totalChanges}`);
  
  if (Object.keys(changesSummary).length > 0) {
    console.log('\\n📋 Changes by type:');
    Object.entries(changesSummary)
      .sort(([,a], [,b]) => b - a)
      .forEach(([change, count]) => {
        console.log(`  ${count}x ${change}`);
      });
  }

  if (totalChanged > 0) {
    console.log('\\n✅ Migration completed successfully!');
    console.log('\\n⚠️  IMPORTANT: Please run the following to verify:');
    console.log('  1. npm run build:web (check for build errors)');
    console.log('  2. node scripts/verify-platform-usage.js (check remaining usage)');
    console.log('  3. Test the app on all platforms');
  } else {
    console.log('\\n✅ No migration needed - all files are already using platform utility!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, migrations, importPatterns };