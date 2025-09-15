#!/bin/bash

# SonarCloud Quota Monitor for Multi-Project Usage
# Helps manage 50,000 LOC/month across Manylla and StackMap

echo "📊 SonarCloud Quota Calculator"
echo "=============================="
echo ""

# Count lines in Manylla
echo "📁 Manylla Project:"
MANYLLA_JS=$(find src -name "*.js" -o -name "*.jsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
MANYLLA_TS=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
MANYLLA_TOTAL=$((MANYLLA_JS + MANYLLA_TS))
echo "   JavaScript: $(printf "%'d" $MANYLLA_JS) LOC"
echo "   TypeScript: $(printf "%'d" $MANYLLA_TS) LOC"
echo "   Total: $(printf "%'d" $MANYLLA_TOTAL) LOC"
echo ""

# Estimate StackMap (if path available)
STACKMAP_PATH="../stackmap"  # Adjust this path
if [ -d "$STACKMAP_PATH" ]; then
    echo "📁 StackMap Project:"
    STACKMAP_TOTAL=$(find "$STACKMAP_PATH/src" -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "   Total: $(printf "%'d" $STACKMAP_TOTAL) LOC"
    echo ""
else
    echo "📁 StackMap Project: (path not found, using estimate)"
    STACKMAP_TOTAL=30000  # Estimated
    echo "   Estimated: $(printf "%'d" $STACKMAP_TOTAL) LOC"
    echo ""
fi

# Calculate combined usage
COMBINED_TOTAL=$((MANYLLA_TOTAL + STACKMAP_TOTAL))
echo "🔢 Combined Projects:"
echo "   Total: $(printf "%'d" $COMBINED_TOTAL) LOC per analysis"
echo ""

# Free tier calculation
FREE_TIER_LIMIT=50000
echo "💰 Free Tier Analysis (50,000 LOC/month):"
echo ""

# Calculate how many analyses possible
ANALYSES_PER_MONTH=$((FREE_TIER_LIMIT / COMBINED_TOTAL))
echo "   Full analyses possible: $ANALYSES_PER_MONTH times/month"

if [ "$ANALYSES_PER_MONTH" -lt 1 ]; then
    echo "   ⚠️  WARNING: Projects exceed single analysis limit!"
    echo "   You'll need to alternate between projects"
else
    ANALYSES_PER_WEEK=$((ANALYSES_PER_MONTH / 4))
    echo "   Frequency: ~$ANALYSES_PER_WEEK times/week"
fi

echo ""
echo "📅 Recommended Strategy:"
echo ""

if [ "$COMBINED_TOTAL" -gt 40000 ]; then
    echo "   ❌ Both projects are too large for regular analysis"
    echo ""
    echo "   Option 1: Alternate monthly"
    echo "   - Month 1: Focus on Manylla"
    echo "   - Month 2: Focus on StackMap"
    echo ""
    echo "   Option 2: Selective analysis"
    echo "   - Use smart analysis (changed files only)"
    echo "   - Run: ./scripts/sonar-smart.sh"
    echo ""
    echo "   Option 3: Upgrade to paid"
    echo "   - ~$10/month for unlimited LOC"
    echo "   - Analyze both projects freely"
elif [ "$COMBINED_TOTAL" -gt 25000 ]; then
    echo "   ⚠️  Limited analysis budget"
    echo ""
    echo "   - Run analysis 1-2 times per month MAX"
    echo "   - Use before major deployments only"
    echo "   - Use smart analysis for patches"
    echo "   - Consider paid tier for regular use"
else
    echo "   ✅ Within reasonable limits"
    echo ""
    echo "   - Can analyze weekly if needed"
    echo "   - Use smart analysis for daily work"
    echo "   - Full analysis before deployments"
fi

echo ""
echo "💡 Quota-Saving Commands:"
echo ""
echo "   # Smart analysis (changed files only)"
echo "   ./scripts/sonar-smart.sh"
echo ""
echo "   # Skip SonarCloud, just run tests"
echo "   npm test"
echo ""
echo "   # Check current month's usage"
echo "   open https://sonarcloud.io/organizations/ajstack22/billing"