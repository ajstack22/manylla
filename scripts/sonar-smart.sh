#!/bin/bash

# Smart SonarCloud Analysis - Conserves LOC quota
# Only analyzes changed files since last deployment

set -e

echo "🎯 Smart SonarCloud Analysis (Changed Files Only)"
echo "================================================="

# Configuration
LAST_DEPLOY_FILE=".last-sonar-analysis"
MAX_FILES_FOR_ANALYSIS=50  # Safety limit

# Check if this is first run
if [ ! -f "$LAST_DEPLOY_FILE" ]; then
    echo "⚠️  First analysis - analyzing critical paths only"

    # First run: Only analyze critical services and high-value components
    SONAR_INCLUSIONS="src/services/sync/**,src/context/**,src/components/Profile/**,src/components/Dialogs/**"

    echo "📁 Analyzing critical paths:"
    echo "   - Sync services (encryption, data sync)"
    echo "   - Context providers (state management)"
    echo "   - Profile components (core functionality)"
    echo "   - Dialog components (data entry)"
else
    # Get changed files since last analysis
    LAST_COMMIT=$(cat "$LAST_DEPLOY_FILE")
    echo "📊 Last analysis: $LAST_COMMIT"
    echo ""

    # Get list of changed source files
    CHANGED_FILES=$(git diff --name-only "$LAST_COMMIT" HEAD -- 'src/*.js' 'src/*.jsx' 'src/*.ts' 'src/*.tsx' 2>/dev/null | grep -v test || true)

    if [ -z "$CHANGED_FILES" ]; then
        echo "✅ No source files changed since last analysis"
        echo "💡 Skipping SonarCloud to conserve LOC quota"
        exit 0
    fi

    # Count changed files
    FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')

    echo "📝 Found $FILE_COUNT changed files:"
    echo "$CHANGED_FILES" | sed 's/^/   - /'
    echo ""

    # Safety check
    if [ "$FILE_COUNT" -gt "$MAX_FILES_FOR_ANALYSIS" ]; then
        echo "⚠️  Too many files changed ($FILE_COUNT > $MAX_FILES_FOR_ANALYSIS)"
        echo "   Running full analysis might exceed quota"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Analysis cancelled"
            exit 1
        fi
    fi

    # Convert file list to comma-separated inclusions
    SONAR_INCLUSIONS=$(echo "$CHANGED_FILES" | tr '\n' ',' | sed 's/,$//')
fi

# Calculate approximate LOC being analyzed
echo ""
echo "📏 Calculating lines of code to analyze..."
if [ -n "$SONAR_INCLUSIONS" ]; then
    # Count lines in included files
    FILES_TO_COUNT=$(echo "$SONAR_INCLUSIONS" | tr ',' '\n')
    TOTAL_LINES=0

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            LINES=$(wc -l < "$file" | tr -d ' ')
            TOTAL_LINES=$((TOTAL_LINES + LINES))
        fi
    done <<< "$FILES_TO_COUNT"

    echo "   Approximate LOC: $TOTAL_LINES"

    # Check monthly estimate
    ANALYSES_PER_MONTH=8  # Assuming ~2 per week
    MONTHLY_ESTIMATE=$((TOTAL_LINES * ANALYSES_PER_MONTH))
    echo "   Monthly estimate (at 2/week): $MONTHLY_ESTIMATE LOC"

    if [ "$MONTHLY_ESTIMATE" -gt 50000 ]; then
        echo ""
        echo "⚠️  WARNING: Estimated monthly usage exceeds free tier (50,000 LOC)"
        echo "   Consider reducing analysis frequency"
    fi
else
    echo "   Analyzing full codebase (first run)"
fi

# Run tests with coverage first
echo ""
echo "📊 Generating test coverage..."
npm run test:coverage

# Check for SONAR_TOKEN
if [ -z "$SONAR_TOKEN" ]; then
    echo ""
    echo "❌ SONAR_TOKEN not set"
    echo "   Add to ~/.zshrc: export SONAR_TOKEN='your-token'"
    exit 1
fi

# Run SonarCloud analysis with smart inclusions
echo ""
echo "☁️  Running SonarCloud analysis..."

if [ -n "$SONAR_INCLUSIONS" ]; then
    # Analyze only changed/selected files
    sonar-scanner \
        -Dsonar.token="$SONAR_TOKEN" \
        -Dsonar.inclusions="$SONAR_INCLUSIONS" \
        -Dsonar.projectVersion="$(git rev-parse --short HEAD)"
else
    # Full analysis (first run or fallback)
    sonar-scanner \
        -Dsonar.token="$SONAR_TOKEN" \
        -Dsonar.projectVersion="$(git rev-parse --short HEAD)"
fi

# Save current commit as last analysis point
git rev-parse HEAD > "$LAST_DEPLOY_FILE"

echo ""
echo "✅ Smart analysis completed!"
echo ""
echo "📊 View results at:"
echo "   https://sonarcloud.io/project/overview?id=ajstack22_manylla"
echo ""
echo "💡 Quota Saving Tips:"
echo "   - This analysis only scanned changed files"
echo "   - Run full analysis sparingly (monthly)"
echo "   - Use 'npm test' for daily development"

# Show quota usage reminder
echo ""
echo "📈 Check your usage at:"
echo "   https://sonarcloud.io/organizations/ajstack22/billing"