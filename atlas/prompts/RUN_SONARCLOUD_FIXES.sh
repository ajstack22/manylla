#!/bin/bash

# Quick Start: Fix SonarCloud Critical & High Priority Issues
# This script helps execute the Atlas Standard workflow for SonarCloud fixes

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     SonarCloud Critical & High Priority Fixes             ║${NC}"
echo -e "${CYAN}║     Atlas Standard Workflow                               ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if [ ! -f "$HOME/.manylla-env" ]; then
    echo -e "${RED}❌ Error: ~/.manylla-env not found${NC}"
    echo "Please create it with: SONAR_TOKEN=\"your-token\""
    exit 1
fi

source "$HOME/.manylla-env"

if [ -z "$SONAR_TOKEN" ]; then
    echo -e "${RED}❌ Error: SONAR_TOKEN not set in ~/.manylla-env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# Phase 1: Research - Fetch Issues
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Phase 1: Research - Fetching SonarCloud Issues${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}→ Fetching bugs...${NC}"
curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/issues/search?componentKeys=ajstack22_manylla&types=BUG&statuses=OPEN,CONFIRMED&ps=100" | python3 -m json.tool > /tmp/sonarcloud-bugs.json

BUG_COUNT=$(cat /tmp/sonarcloud-bugs.json | jq '.total' 2>/dev/null || echo "0")
echo -e "${GREEN}  Found: $BUG_COUNT bugs${NC}"

echo -e "${YELLOW}→ Fetching critical/major code smells...${NC}"
curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/issues/search?componentKeys=ajstack22_manylla&types=CODE_SMELL&severities=CRITICAL,MAJOR&statuses=OPEN,CONFIRMED&ps=100" | python3 -m json.tool > /tmp/sonarcloud-code-smells.json

SMELL_COUNT=$(cat /tmp/sonarcloud-code-smells.json | jq '.total' 2>/dev/null || echo "0")
echo -e "${GREEN}  Found: $SMELL_COUNT critical/major code smells${NC}"

echo -e "${YELLOW}→ Fetching security hotspots...${NC}"
curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/hotspots/search?projectKey=ajstack22_manylla&statuses=TO_REVIEW&ps=100" | python3 -m json.tool > /tmp/sonarcloud-hotspots.json

HOTSPOT_COUNT=$(cat /tmp/sonarcloud-hotspots.json | jq '.hotspots | length' 2>/dev/null || echo "0")
echo -e "${GREEN}  Found: $HOTSPOT_COUNT security hotspots${NC}"

echo ""
echo -e "${GREEN}✅ Issue data fetched successfully${NC}"
echo ""

# Display summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Issue Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Bugs (P0 - Critical):${NC} $BUG_COUNT"
echo -e "${YELLOW}Code Smells (P1 - High):${NC} $SMELL_COUNT"
echo -e "${YELLOW}Security Hotspots (P1 - High):${NC} $HOTSPOT_COUNT"
echo ""
echo -e "${YELLOW}Total Issues to Address:${NC} $((BUG_COUNT + SMELL_COUNT + HOTSPOT_COUNT))"
echo ""

# Show top 5 bugs
if [ "$BUG_COUNT" -gt "0" ]; then
    echo -e "${RED}🐛 Top Bugs:${NC}"
    cat /tmp/sonarcloud-bugs.json | jq -r '.issues[] | "  - \(.message) [\(.component | split(":") | .[1])]"' | head -5
    echo ""
fi

# Show top 10 code smells
if [ "$SMELL_COUNT" -gt "0" ]; then
    echo -e "${YELLOW}🔧 Top Code Smells:${NC}"
    cat /tmp/sonarcloud-code-smells.json | jq -r '.issues[] | "  - \(.message) [\(.component | split(":") | .[1])]"' | head -10
    echo ""
fi

# Show all security hotspots
if [ "$HOTSPOT_COUNT" -gt "0" ]; then
    echo -e "${YELLOW}🔐 Security Hotspots:${NC}"
    cat /tmp/sonarcloud-hotspots.json | jq -r '.hotspots[] | "  - \(.message) [\(.component | split(":") | .[1])]"'
    echo ""
fi

# Provide next steps
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Next Steps${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Issue data saved to:${NC}"
echo "  - /tmp/sonarcloud-bugs.json"
echo "  - /tmp/sonarcloud-code-smells.json"
echo "  - /tmp/sonarcloud-hotspots.json"
echo ""
echo -e "${GREEN}Follow the Atlas Standard workflow:${NC}"
echo "  1. Review detailed prompt: atlas/prompts/fix-sonarcloud-critical-high-issues.md"
echo "  2. Start with Phase 1 (Research) - Already complete! ✅"
echo "  3. Continue to Phase 2 (Plan) - Create fix strategy"
echo "  4. Execute Phase 3 (Implement) - Fix issues systematically"
echo "  5. Complete Phase 4 (Review) - Verify all fixes"
echo "  6. Deploy Phase 5 (Deploy) - Release to production"
echo ""
echo -e "${YELLOW}To start fixing:${NC}"
echo "  cat atlas/prompts/fix-sonarcloud-critical-high-issues.md"
echo ""
echo -e "${YELLOW}To view issues in browser:${NC}"
echo "  open https://sonarcloud.io/project/issues?id=ajstack22_manylla"
echo ""

# Generate quick action plan
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Quick Action Plan${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${RED}Priority 1: Fix $BUG_COUNT Bug(s) [Blocks Quality Gate]${NC}"
if [ "$BUG_COUNT" -gt "0" ]; then
    cat /tmp/sonarcloud-bugs.json | jq -r '.issues[0] | "  File: \(.component | split(":") | .[1])\n  Line: \(.line)\n  Rule: \(.rule)\n  Message: \(.message)"'
fi
echo ""
echo -e "${YELLOW}Priority 2: Review $HOTSPOT_COUNT Security Hotspot(s)${NC}"
echo "  Determine: Safe to use / Needs mitigation / Needs replacement"
echo ""
echo -e "${YELLOW}Priority 3: Fix Top Critical Code Smells${NC}"
echo "  Focus on: Cognitive complexity, duplications, magic numbers"
echo ""
echo -e "${GREEN}Estimated time: 3-5 hours total${NC}"
echo ""

exit 0
