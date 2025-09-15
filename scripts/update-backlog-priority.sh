#!/bin/bash

# Update backlog priorities by reordering items in BACKLOG.md
# Usage: ./update-backlog-priority.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKLOG="processes/BACKLOG.md"

echo -e "${BLUE}📋 Current Backlog Status${NC}"
echo "========================="

# Count items by priority
P0_COUNT=$(grep -c "^\- \[S\|^\- \[B" $BACKLOG | head -n 20 | grep -A 5 "P0 - Critical" | tail -n +2 | wc -l || echo 0)
P1_COUNT=$(grep -c "^\- \[S\|^\- \[B" $BACKLOG | head -n 30 | grep -A 5 "P1 - High" | tail -n +2 | wc -l || echo 0)

echo ""
echo "P0 (Critical) items:"
grep "## 🔴 P0" -A 10 $BACKLOG | grep "^\- \[" || echo "  None"

echo ""
echo "P1 (High) items:"
grep "## 🟠 P1" -A 10 $BACKLOG | grep "^\- \[" || echo "  None"

echo ""
echo "P2 (Medium) items:"
grep "## 🟡 P2" -A 10 $BACKLOG | grep "^\- \[" || echo "  None"

echo ""
echo -e "${YELLOW}To change priorities:${NC}"
echo "1. Edit $BACKLOG"
echo "2. Move items between P0/P1/P2/P3 sections"
echo "3. Update status tags (ACTIVE, READY, BLOCKED)"
echo ""
echo "Quick commands:"
echo "  code $BACKLOG     # Open in VS Code"
echo "  vim $BACKLOG      # Open in vim"

# Generate summary
echo ""
echo -e "${GREEN}📊 Summary Report${NC}"
echo "================"

TOTAL_STORIES=$(grep -c "^\- \[S[0-9]" $BACKLOG || echo 0)
TOTAL_BUGS=$(grep -c "^\- \[B[0-9]" $BACKLOG || echo 0)
ACTIVE=$(grep -c "ACTIVE" $BACKLOG || echo 0)
BLOCKED=$(grep -c "BLOCKED" $BACKLOG || echo 0)
READY=$(grep -c "READY" $BACKLOG || echo 0)

echo "Total Stories: $TOTAL_STORIES"
echo "Total Bugs: $TOTAL_BUGS"
echo ""
echo "Status breakdown:"
echo "  Active: $ACTIVE"
echo "  Ready: $READY"
echo "  Blocked: $BLOCKED"

# Check for stale items (optional future feature)
echo ""
echo -e "${BLUE}🔍 Recommendations:${NC}"
if [ "$ACTIVE" -eq 0 ]; then
    echo "⚠️  No active items - assign work to developers"
fi
if [ "$BLOCKED" -gt 0 ]; then
    echo "⚠️  $BLOCKED blocked items - review dependencies"
fi

# Offer to open for editing
echo ""
read -p "Open BACKLOG.md for editing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code "$BACKLOG"
    elif command -v vim &> /dev/null; then
        vim "$BACKLOG"
    else
        echo "Please open $BACKLOG in your preferred editor"
    fi
fi