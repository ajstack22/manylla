# 🚀 SonarCloud Setup for StackMap

*Complete guide to integrate SonarCloud code quality analysis into StackMap's deployment pipeline*

## Overview

Since StackMap is now **public on GitHub**, you get **UNLIMITED** SonarCloud analysis for free! This guide will help you integrate the same automated code quality checks that Manylla uses.

## Prerequisites

✅ **Already Done**:
- StackMap repository is public
- SonarCloud project already created (you did this with Manylla)
- You have your SonarCloud token

🔧 **You Need**:
- 10 minutes for setup
- Your SonarCloud token (same one you use for Manylla)

## Step 1: Install SonarCloud Scanner

```bash
# If not already installed from Manylla setup:
npm install -g sonarqube-scanner
```

## Step 2: Create SonarCloud Configuration

Create `sonar-project.properties` in StackMap root:

```properties
# SonarCloud Configuration for StackMap
# Organization and project identifiers
sonar.organization=ajstack22
sonar.projectKey=ajstack22_stackmap
sonar.projectName=StackMap

# Source code configuration
sonar.sources=src
sonar.sourceEncoding=UTF-8

# Test coverage (if you have tests)
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.js,**/*.spec.js,**/test/**,**/tests/**,**/__tests__/**,**/node_modules/**,**/coverage/**,**/build/**

# Files to exclude from analysis
sonar.exclusions=**/node_modules/**,**/coverage/**,**/build/**,**/*.test.js,**/*.spec.js

# SonarCloud host
sonar.host.url=https://sonarcloud.io

# JavaScript/TypeScript specific settings
sonar.javascript.file.suffixes=.js,.jsx
sonar.typescript.file.suffixes=.ts,.tsx

# Duplication exclusions
sonar.cpd.exclusions=**/*.test.js,**/*.spec.js
```

## Step 3: Create Analysis Scripts

### Basic Analysis Script
Create `scripts/sonar-analysis.sh`:

```bash
#!/bin/bash

# SonarCloud Analysis Script for StackMap
set -e

echo "🔍 SonarCloud Code Quality Analysis for StackMap"
echo "================================================"

# Check if SONAR_TOKEN is set
if [ -z "$SONAR_TOKEN" ]; then
    echo "⚠️  SONAR_TOKEN not set"
    echo "Set it with: export SONAR_TOKEN='your-token'"
    exit 1
fi

# Run tests with coverage (if applicable)
if [ -f "package.json" ] && grep -q "test:coverage" package.json; then
    echo "📊 Generating test coverage..."
    npm run test:coverage || echo "⚠️  No test coverage available"
fi

# Run SonarCloud analysis
echo "☁️  Sending analysis to SonarCloud..."
sonar-scanner \
  -Dsonar.token="$SONAR_TOKEN" \
  -Dsonar.projectVersion="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

echo "✅ Analysis complete!"
echo "📊 View results at: https://sonarcloud.io/project/overview?id=ajstack22_stackmap"
```

### Smart Analysis Script (Optional - for large codebases)
Create `scripts/sonar-smart.sh`:

```bash
#!/bin/bash

# Smart SonarCloud Analysis - Only analyzes changed files
# Great for StackMap since it's a larger codebase

set -e

echo "🎯 Smart SonarCloud Analysis (Changed Files Only)"
echo "================================================"

LAST_DEPLOY_FILE=".last-sonar-analysis"

# Check for changes since last analysis
if [ ! -f "$LAST_DEPLOY_FILE" ]; then
    echo "First analysis - analyzing core components only"
    SONAR_INCLUSIONS="src/services/**,src/components/**"
else
    LAST_COMMIT=$(cat "$LAST_DEPLOY_FILE")
    CHANGED_FILES=$(git diff --name-only "$LAST_COMMIT" HEAD -- 'src/*.js' 'src/*.jsx' | tr '\n' ',')

    if [ -z "$CHANGED_FILES" ]; then
        echo "✅ No changes since last analysis"
        exit 0
    fi

    SONAR_INCLUSIONS="$CHANGED_FILES"
fi

# Run analysis
sonar-scanner \
  -Dsonar.token="$SONAR_TOKEN" \
  -Dsonar.inclusions="$SONAR_INCLUSIONS"

# Save checkpoint
git rev-parse HEAD > "$LAST_DEPLOY_FILE"
echo "✅ Smart analysis complete!"
```

Make scripts executable:
```bash
chmod +x scripts/sonar-analysis.sh
chmod +x scripts/sonar-smart.sh  # if created
```

## Step 4: Secure Token Storage

Create a secure token file (same as Manylla):

```bash
# Option 1: Use the same token file for both projects
# (Already done if you followed Manylla setup)
echo 'SONAR_TOKEN="your-token-here"' > ~/.manylla-env

# Option 2: Create StackMap-specific file
echo 'SONAR_TOKEN="your-token-here"' > ~/.stackmap-env
chmod 600 ~/.stackmap-env
```

## Step 5: Update Package.json

Add these scripts to StackMap's `package.json`:

```json
"scripts": {
  // ... existing scripts ...
  "sonar": "./scripts/sonar-analysis.sh",
  "sonar:smart": "./scripts/sonar-smart.sh",
  "quality": "npm run sonar"
}
```

## Step 6: Integrate with Deployment Script

Add to your StackMap deployment script (e.g., `deploy-qual.sh` or equivalent):

```bash
# Add near the top of your deployment script
# Load SonarCloud token
if [ -f "$HOME/.manylla-env" ]; then
    source "$HOME/.manylla-env"
elif [ -f "$HOME/.stackmap-env" ]; then
    source "$HOME/.stackmap-env"
fi

# Add as a validation step (before or after other checks)
echo "🔍 Step X: SonarCloud Code Quality Analysis"
echo "────────────────────────────────"

if [ -n "$SONAR_TOKEN" ]; then
    echo "Running code quality analysis..."

    # For StackMap (PUBLIC repo = unlimited analysis!)
    ./scripts/sonar-analysis.sh || {
        echo "⚠️  SonarCloud analysis failed (non-blocking)"
        echo "Continuing with deployment..."
    }

    echo "✓ Code quality check completed"
else
    echo "ℹ️  SonarCloud token not found. Skipping analysis."
    echo "   To enable: echo 'SONAR_TOKEN=\"your-token\"' > ~/.stackmap-env"
fi
```

## Step 7: Configure .gitignore

Add to StackMap's `.gitignore`:

```gitignore
# SonarCloud
.scannerwork/
.sonar/
.last-sonar-analysis

# Environment files
.env
*.env
```

## 🎉 That's It!

### Testing Your Setup

```bash
# Test SonarCloud connection
npm run sonar

# For development (if using smart analysis)
npm run sonar:smart

# During deployment
./deploy-qual.sh  # Or your deployment script
```

### View Your Results

StackMap Dashboard: https://sonarcloud.io/project/overview?id=ajstack22_stackmap

## 💡 StackMap-Specific Benefits

Since StackMap is **PUBLIC**, you get:
- ✅ **UNLIMITED** lines of code analysis per month
- ✅ Can run analysis on every commit
- ✅ Can enable automatic analysis if desired
- ✅ PR decoration on GitHub
- ✅ All premium features for free

### Recommended Settings for StackMap

1. **Run on every deployment** (no quota limits!)
2. **Consider enabling Automatic Analysis**:
   - Go to SonarCloud → Administration → Analysis Method
   - Turn ON Automatic Analysis
   - Every push to GitHub gets analyzed automatically

3. **Add Quality Gate Badge** to README:
   ```markdown
   [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ajstack22_stackmap&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ajstack22_stackmap)
   ```

## Differences from Manylla Setup

| Aspect | Manylla (Private) | StackMap (Public) |
|--------|------------------|-------------------|
| **LOC Limit** | 50,000/month | UNLIMITED |
| **Analysis Frequency** | Conservative | As often as you want |
| **Smart Analysis** | Required | Optional |
| **Automatic Analysis** | Disabled | Can enable |
| **Cost** | Free (limited) | Free (unlimited) |

## Troubleshooting

### "Project not found"
- Verify project key in `sonar-project.properties` matches SonarCloud
- Should be: `ajstack22_stackmap`

### "Token not authorized"
- Make sure token has access to both projects
- Or generate a StackMap-specific token

### "Analysis failing"
- Check if Automatic Analysis is conflicting (disable one)
- Verify source paths in configuration

## Support Files

All scripts and configuration from this guide are available in Manylla repo:
- Copy from: `/Users/adamstack/manylla/scripts/sonar-*.sh`
- Adapt paths and project keys for StackMap

---

*Created for StackMap integration - 2025-09-15*
*Based on Manylla's SonarCloud implementation*