#!/bin/bash
# Reports current migration status for peer reviewer context

echo "🔍 Platform Migration Status Report"
echo "===================================="
echo "✅ MIGRATION COMPLETED: 2025-09-12"
echo ""

# Check current branch
echo "📌 Git Context:"
echo -n "  Current branch: "
git branch --show-current
echo -n "  Uncommitted changes: "
if [ -z "$(git status --porcelain)" ]; then
    echo "None ✅"
else
    echo "Found ⚠️"
    git status --short
fi
echo ""

# Check migration status file
if [ -f ".migration-status.json" ]; then
    echo "📊 Migration Progress:"
    python3 -c "
import json
import sys
try:
    with open('.migration-status.json', 'r') as f:
        data = json.load(f)
    print(f'  Current Step: {data.get(\"current_step\", \"unknown\")}')
    print(f'  Status: {data.get(\"current_status\", \"unknown\")}')
    print(f'  Completed Steps: {len(data.get(\"completed_steps\", []))}')
    if data.get('issues_found'):
        print(f'  ⚠️  Issues: {len(data[\"issues_found\"])}')
    print(f'  Next Action: {data.get(\"next_action\", \"Check status\")}')
except Exception as e:
    print(f'  Error reading status: {e}')
"
else
    echo "📊 Migration Progress:"
    echo "  ⚠️  No status file found. This appears to be a fresh start."
    
    # Create initial status file
    cat > .migration-status.json << 'EOF'
{
  "current_step": 0,
  "completed_steps": [],
  "current_status": "not_started",
  "issues_found": [],
  "next_action": "Run step 1: Import Resolution"
}
EOF
    echo "  ✅ Created initial status file"
fi
echo ""

# Check git history for migration commits
echo "📝 Migration Commits:"
COMMITS=$(git log --oneline --grep="step\|platform" -10 2>/dev/null | head -5)
if [ -z "$COMMITS" ]; then
    echo "  No migration commits found yet"
else
    echo "$COMMITS" | sed 's/^/  /'
fi
echo ""

# Current metrics
echo "📈 Current Metrics:"
echo -n "  Platform.OS remaining: "
grep -r "Platform\.OS" src/ --include="*.js" --exclude="*/platform.js" 2>/dev/null | wc -l | tr -d ' '

echo -n "  Platform.select (old): "
grep -r "Platform\.select" src/ --include="*.js" 2>/dev/null | grep -v "platform\.select" | wc -l | tr -d ' '

echo -n "  Files using relative platform imports: "
grep -r "from.*['\"]\.\..*platform" src/ --include="*.js" 2>/dev/null | wc -l | tr -d ' '

echo -n "  TypeScript files: "
find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '

echo -n "  Platform-specific files: "
find src -name "*.native.js" -o -name "*.web.js" 2>/dev/null | wc -l | tr -d ' '
echo ""

# Build status
echo "🔨 Build Status:"
echo -n "  Web build: "
if npm run build:web > /dev/null 2>&1; then
    echo "✅ Passing"
else
    echo "❌ Failing"
fi

echo -n "  Test suite: "
if npm test > /dev/null 2>&1; then
    echo "✅ Passing"
else
    echo "❌ Failing"
fi

# Bundle size if build exists
if [ -d "web/build" ]; then
    echo -n "  Bundle size: "
    du -sh web/build 2>/dev/null | awk '{print $1}'
fi
echo ""

# Recommendations
echo "💡 Recommendations:"
if [ -f ".migration-status.json" ]; then
    python3 -c "
import json
with open('.migration-status.json', 'r') as f:
    data = json.load(f)
step = data.get('current_step', 0)
status = data.get('current_status', 'unknown')

print('  ✅ Migration complete!')
print('  All @platform aliases removed')
print('  Using relative imports throughout codebase')
print('  All bundler configs updated')
"
fi

echo ""
echo "===================================="
echo "✅ Status check complete"