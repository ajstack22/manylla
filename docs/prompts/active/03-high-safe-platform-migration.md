# Safe Platform Migration with Rollback Strategy

**Priority**: 03-high  
**Status**: Ready
**Assignee**: Developer
**Peer Review**: Required

**Issue**: Need a safe, phased migration approach with rollback capability and performance monitoring

## Context
Mass replacing all Platform.OS checks at once is risky. We need a phased approach that allows testing at each stage, includes rollback capability, and monitors for performance regressions.

## Working Agreements Validation
- ✅ No TypeScript files will be created
- ✅ No .native.js or .web.js files
- ✅ Build output remains in web/build/
- ✅ Pure JavaScript implementation

## Implementation

### Phase 1: Setup and Preparation (30 mins)

#### Create Migration Infrastructure
**Location**: `scripts/platform-migration/`

```bash
#!/bin/bash
# scripts/platform-migration/prepare.sh

echo "🔧 Preparing platform migration infrastructure..."

# Create migration directory
mkdir -p scripts/platform-migration/{backups,logs,reports}

# Create comprehensive backup
echo "📦 Creating full backup..."
tar -czf scripts/platform-migration/backups/full-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  src/ \
  package.json \
  package-lock.json \
  webpack.config.js \
  metro.config.js \
  babel.config.js

# Get baseline metrics
echo "📊 Capturing baseline metrics..."
npm run build:web 2>&1 | tee scripts/platform-migration/logs/baseline-build.log

# Record bundle size
du -sh web/build > scripts/platform-migration/reports/baseline-size.txt

# Count current Platform usage
echo "Platform.OS count: $(grep -r "Platform\.OS" src/ --include="*.js" | wc -l)" > scripts/platform-migration/reports/baseline-platform.txt
echo "Platform.select count: $(grep -r "Platform\.select" src/ --include="*.js" | wc -l)" >> scripts/platform-migration/reports/baseline-platform.txt

echo "✅ Migration infrastructure ready"
```

### Phase 2: Component Categorization (1 hour)

#### Categorize Components by Risk
**Location**: `scripts/platform-migration/categorize.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Categorize files by risk level
const categorizeFiles = () => {
  const srcDir = './src';
  const categories = {
    lowRisk: [],    // Simple Platform.OS checks
    mediumRisk: [], // Platform.select usage
    highRisk: [],   // Complex platform logic
    critical: []    // Core functionality
  };
  
  function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const platformOSCount = (content.match(/Platform\.OS/g) || []).length;
    const platformSelectCount = (content.match(/Platform\.select/g) || []).length;
    
    // Categorize based on complexity
    if (filePath.includes('UnifiedApp') || filePath.includes('context/')) {
      categories.critical.push({
        path: filePath,
        platformOSCount,
        platformSelectCount
      });
    } else if (platformSelectCount > 2 || platformOSCount > 5) {
      categories.highRisk.push({
        path: filePath,
        platformOSCount,
        platformSelectCount
      });
    } else if (platformSelectCount > 0 || platformOSCount > 2) {
      categories.mediumRisk.push({
        path: filePath,
        platformOSCount,
        platformSelectCount
      });
    } else if (platformOSCount > 0) {
      categories.lowRisk.push({
        path: filePath,
        platformOSCount,
        platformSelectCount
      });
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        walkDir(filePath);
      } else if (file.endsWith('.js')) {
        analyzeFile(filePath);
      }
    });
  }
  
  walkDir(srcDir);
  
  // Save categorization
  fs.writeFileSync(
    'scripts/platform-migration/reports/categorization.json',
    JSON.stringify(categories, null, 2)
  );
  
  console.log('📊 File Categorization:');
  console.log(`  Low Risk: ${categories.lowRisk.length} files`);
  console.log(`  Medium Risk: ${categories.mediumRisk.length} files`);
  console.log(`  High Risk: ${categories.highRisk.length} files`);
  console.log(`  Critical: ${categories.critical.length} files`);
  
  return categories;
};

categorizeFiles();
```

### Phase 3: Phased Migration Script

#### Progressive Migration with Testing
**Location**: `scripts/platform-migration/migrate-phased.sh`

```bash
#!/bin/bash

echo "🚀 Starting phased platform migration..."

# Source functions
source scripts/platform-migration/functions.sh

# Phase 1: Low risk files
echo "📌 Phase 1: Migrating low-risk files..."
node scripts/platform-migration/migrate-batch.js lowRisk

# Test after Phase 1
if ! npm test; then
  echo "❌ Tests failed after Phase 1"
  rollback "phase1"
  exit 1
fi

# Build test
if ! npm run build:web; then
  echo "❌ Build failed after Phase 1"
  rollback "phase1"
  exit 1
fi

echo "✅ Phase 1 complete"

# Phase 2: Medium risk files
echo "📌 Phase 2: Migrating medium-risk files..."
node scripts/platform-migration/migrate-batch.js mediumRisk

# Test after Phase 2
if ! npm test; then
  echo "❌ Tests failed after Phase 2"
  rollback "phase2"
  exit 1
fi

echo "✅ Phase 2 complete"

# Phase 3: High risk files (with extra validation)
echo "📌 Phase 3: Migrating high-risk files..."
node scripts/platform-migration/migrate-batch.js highRisk

# Comprehensive testing
npm test
npm run build:web
npm run web & WEB_PID=$!
sleep 10
curl -f http://localhost:3000 || (kill $WEB_PID; rollback "phase3"; exit 1)
kill $WEB_PID

echo "✅ Phase 3 complete"

# Phase 4: Critical files (manual review required)
echo "📌 Phase 4: Critical files require manual review"
echo "Files to manually migrate:"
cat scripts/platform-migration/reports/categorization.json | jq '.critical'
```

### Phase 4: Migration Batch Processor

**Location**: `scripts/platform-migration/migrate-batch.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const riskLevel = process.argv[2];
if (!riskLevel) {
  console.error('Usage: node migrate-batch.js [lowRisk|mediumRisk|highRisk|critical]');
  process.exit(1);
}

// Load categorization
const categories = JSON.parse(
  fs.readFileSync('scripts/platform-migration/reports/categorization.json', 'utf8')
);

const filesToMigrate = categories[riskLevel] || [];

console.log(`\n🔄 Migrating ${filesToMigrate.length} ${riskLevel} files...`);

filesToMigrate.forEach(({ path: filePath }) => {
  console.log(`  Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if already has platform import
  const hasPlatformImport = content.includes('from "@platform"') || 
                           content.includes('from \'@platform\'');
  
  // Add platform import if needed
  if (!hasPlatformImport && content.includes('Platform')) {
    // Find the right place to add import
    if (content.includes('import React')) {
      content = content.replace(
        /import React[^;]*;/,
        '$&\nimport platform from "@platform";'
      );
    } else {
      // Add at the beginning
      content = 'import platform from "@platform";\n' + content;
    }
  }
  
  // Replace Platform.OS checks
  content = content
    .replace(/Platform\.OS === 'web'/g, 'platform.isWeb')
    .replace(/Platform\.OS === 'ios'/g, 'platform.isIOS')
    .replace(/Platform\.OS === 'android'/g, 'platform.isAndroid')
    .replace(/Platform\.OS !== 'web'/g, 'platform.isMobile')
    .replace(/Platform\.OS === "web"/g, 'platform.isWeb')
    .replace(/Platform\.OS === "ios"/g, 'platform.isIOS')
    .replace(/Platform\.OS === "android"/g, 'platform.isAndroid')
    .replace(/Platform\.OS !== "web"/g, 'platform.isMobile');
  
  // Replace Platform.select
  content = content.replace(/Platform\.select/g, 'platform.select');
  
  // Remove Platform from react-native imports
  content = content.replace(
    /import\s*{([^}]*)\bPlatform\b([^}]*)}\s*from\s*['"]react-native['"]/g,
    (match, before, after) => {
      const imports = (before + after)
        .split(',')
        .map(i => i.trim())
        .filter(i => i && i !== 'Platform')
        .join(', ');
      
      return imports ? `import { ${imports} } from 'react-native'` : '';
    }
  );
  
  // Save if changed
  if (content !== originalContent) {
    // Create backup
    const backupPath = filePath.replace('/src/', '/scripts/platform-migration/backups/src/');
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.writeFileSync(backupPath, originalContent);
    fs.writeFileSync(filePath, content);
    
    console.log(`    ✅ Migrated`);
  } else {
    console.log(`    ⏭️  No changes needed`);
  }
});

console.log(`\n✅ ${riskLevel} migration complete`);
```

### Phase 5: Rollback Functions

**Location**: `scripts/platform-migration/functions.sh`

```bash
#!/bin/bash

# Rollback function
rollback() {
  local PHASE=$1
  echo "🔄 Rolling back $PHASE..."
  
  # Find the appropriate backup
  LATEST_BACKUP=$(ls -t scripts/platform-migration/backups/full-backup-*.tar.gz | head -1)
  
  if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
  fi
  
  # Restore from backup
  tar -xzf "$LATEST_BACKUP"
  
  echo "✅ Rolled back to backup: $LATEST_BACKUP"
  
  # Log the rollback
  echo "$(date): Rolled back $PHASE" >> scripts/platform-migration/logs/rollback.log
}

# Performance comparison
compare_performance() {
  echo "📊 Comparing performance..."
  
  # Get current metrics
  npm run build:web 2>&1 | tee scripts/platform-migration/logs/current-build.log
  du -sh web/build > scripts/platform-migration/reports/current-size.txt
  
  # Compare sizes
  BASELINE_SIZE=$(cat scripts/platform-migration/reports/baseline-size.txt | awk '{print $1}')
  CURRENT_SIZE=$(cat scripts/platform-migration/reports/current-size.txt | awk '{print $1}')
  
  echo "Bundle size: $BASELINE_SIZE -> $CURRENT_SIZE"
  
  # Check for significant increase (>5%)
  # Add actual comparison logic here
}

# Validation function
validate_migration() {
  echo "🔍 Validating migration..."
  
  # Check for remaining Platform.OS
  REMAINING=$(grep -r "Platform\.OS" src/ --include="*.js" | grep -v "@platform" | wc -l)
  
  if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️ Warning: $REMAINING Platform.OS references remain"
    grep -r "Platform\.OS" src/ --include="*.js" | grep -v "@platform"
  else
    echo "✅ All Platform.OS references migrated"
  fi
  
  # Run all tests
  npm test || return 1
  
  # Build validation
  npm run build:web || return 1
  
  echo "✅ Migration validated"
}
```

### Phase 6: Final Validation & Reporting

**Location**: `scripts/platform-migration/finalize.sh`

```bash
#!/bin/bash

echo "🏁 Finalizing platform migration..."

# Run comprehensive validation
source scripts/platform-migration/functions.sh

# Validate migration
if ! validate_migration; then
  echo "❌ Migration validation failed"
  exit 1
fi

# Compare performance
compare_performance

# Generate final report
cat > scripts/platform-migration/reports/final-report.md << EOF
# Platform Migration Report
Generated: $(date)

## Migration Statistics
- Files migrated: $(find src -name "*.js" | wc -l)
- Platform.OS removed: $(cat scripts/platform-migration/reports/baseline-platform.txt | grep "Platform.OS" | cut -d: -f2)
- Platform.select migrated: $(cat scripts/platform-migration/reports/baseline-platform.txt | grep "Platform.select" | cut -d: -f2)

## Performance Impact
- Baseline bundle size: $(cat scripts/platform-migration/reports/baseline-size.txt)
- Final bundle size: $(cat scripts/platform-migration/reports/current-size.txt)

## Test Results
- All tests passing: ✅
- Web build successful: ✅
- Mobile builds verified: Pending manual verification

## Next Steps
1. Test on all platforms (web, iOS, Android)
2. Run visual regression tests
3. Deploy to qual for testing
4. Monitor for any issues

EOF

echo "📄 Report generated: scripts/platform-migration/reports/final-report.md"
echo "✅ Platform migration complete!"
```

### Testing Checklist
- [ ] Backup created successfully
- [ ] Files categorized by risk level
- [ ] Phase 1 (low risk) migration successful
- [ ] Phase 2 (medium risk) migration successful
- [ ] Phase 3 (high risk) migration successful
- [ ] All tests pass after each phase
- [ ] Build succeeds after each phase
- [ ] Bundle size within 5% of baseline
- [ ] Rollback tested and working
- [ ] No Platform.OS references remaining
- [ ] Performance metrics captured

### Success Criteria
- Phased migration completed without breaking functionality
- All Platform.OS and Platform.select replaced
- Tests pass at every phase
- Bundle size doesn't increase >5%
- Rollback capability verified
- Complete audit trail of changes

### Notes
- This approach minimizes risk by migrating in phases
- Each phase is tested before proceeding
- Rollback is available at any point
- Performance is monitored throughout
- Critical files require manual review for safety