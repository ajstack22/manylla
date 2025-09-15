#!/bin/bash

# Create new bug with auto-incrementing ID
# Usage: ./create-bug.sh "Bug Title" "P0" "High"

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -lt 1 ]; then
    echo "Usage: $0 \"Bug Title\" [Priority] [Severity]"
    echo "Example: $0 \"App crashes on Android startup\" P0 Critical"
    echo "Severity: Critical|High|Medium|Low"
    exit 1
fi

TITLE="$1"
PRIORITY="${2:-P1}"  # Default to P1 for bugs
SEVERITY="${3:-Medium}"  # Default severity

# Get next bug ID from BACKLOG.md
NEXT_ID=$(grep "Next ID:" processes/BACKLOG.md | sed -E 's/.*B([0-9]+).*/\1/')
if [ -z "$NEXT_ID" ]; then
    NEXT_ID="001"
else
    # Increment and pad with zeros
    NEXT_ID=$(printf "%03d" $((10#$NEXT_ID + 1)))
fi

BUG_ID="B${NEXT_ID}"
FILENAME_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
FILENAME="${BUG_ID}-${FILENAME_TITLE}.md"
FILEPATH="processes/bugs/${FILENAME}"

# Create bug file
cat > "$FILEPATH" << EOF
# Bug ${BUG_ID}: ${TITLE}

## Overview
**Severity**: ${SEVERITY}
**Priority**: ${PRIORITY}
**Status**: OPEN
**Reported**: $(date +%Y-%m-%d)
**Reporter**: [Name/Role]

## Description
[Detailed description of the bug]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- **Platform**: [Web/iOS/Android/All]
- **Version**: [App version]
- **Device**: [Device/Browser info]
- **OS**: [OS version]

## Error Messages/Logs
\`\`\`
[Paste error messages or logs here]
\`\`\`

## Screenshots
[Attach screenshots if applicable]

## Impact Analysis
- **User Impact**: [None/Low/Medium/High/Critical]
- **Frequency**: [Rare/Occasional/Common/Always]
- **Workaround**: [Available/None]
- **Affected Users**: [Percentage or count]

## Root Cause Analysis
[Initial investigation findings]

## Proposed Fix
[Potential solution approach]

## Verification Steps
\`\`\`bash
# Commands to verify the bug
[command] # Current result: [error]
[command] # Expected result: [success]
\`\`\`

## Acceptance Criteria
- [ ] Bug no longer reproducible
- [ ] Root cause identified and fixed
- [ ] Tests added to prevent regression
- [ ] All platforms verified
- [ ] No new issues introduced

## Related Items
- Stories: [Related story IDs]
- Bugs: [Related bug IDs]
- PRs: [Related pull requests]

## Notes
[Additional context or investigation notes]

---
*Bug ID: ${BUG_ID}*
*Severity: ${SEVERITY}*
*Priority: ${PRIORITY}*
*Status: OPEN*
EOF

echo -e "${RED}🐛 Created bug ${BUG_ID}: ${TITLE}${NC}"
echo "File: ${FILEPATH}"

# Update BACKLOG.md
echo -e "${YELLOW}Updating BACKLOG.md...${NC}"

# Update next ID
sed -i '' "s/Next ID:.*B${NEXT_ID}/Next ID: S[0-9]\\+, B$(printf "%03d" $((10#$NEXT_ID + 1)))/" docs/development/BACKLOG.md

# Add severity emoji
SEVERITY_EMOJI=""
case $SEVERITY in
    Critical) SEVERITY_EMOJI="🔥" ;;
    High) SEVERITY_EMOJI="⚠️" ;;
    Medium) SEVERITY_EMOJI="⚡" ;;
    Low) SEVERITY_EMOJI="📌" ;;
esac

# Add to appropriate priority section
case $PRIORITY in
    P0)
        sed -i '' "/## 🔴 P0 - Critical/,/## 🟠/{
            /### Bugs/a\\
- [${BUG_ID}](bugs/${FILENAME}) - ${TITLE} ${SEVERITY_EMOJI} **${SEVERITY}**
        }" docs/development/BACKLOG.md
        ;;
    P1)
        sed -i '' "/## 🟠 P1 - High/,/## 🟡/{
            /### Bugs/a\\
- [${BUG_ID}](bugs/${FILENAME}) - ${TITLE} ${SEVERITY_EMOJI} **${SEVERITY}**
        }" docs/development/BACKLOG.md
        ;;
    P2)
        sed -i '' "/## 🟡 P2 - Medium/,/## 🟢/{
            /### Bugs/a\\
- [${BUG_ID}](bugs/${FILENAME}) - ${TITLE} ${SEVERITY_EMOJI} **${SEVERITY}**
        }" docs/development/BACKLOG.md
        ;;
    P3)
        sed -i '' "/## 🟢 P3 - Low/,/---/{
            /### Bugs/a\\
- [${BUG_ID}](bugs/${FILENAME}) - ${TITLE} ${SEVERITY_EMOJI} **${SEVERITY}**
        }" docs/development/BACKLOG.md
        ;;
esac

# Update metrics
TOTAL_BUGS=$(grep -c "^\- \[B[0-9]" docs/development/BACKLOG.md || echo 0)
sed -i '' "s/Total Bugs: [0-9]*/Total Bugs: $TOTAL_BUGS/" docs/development/BACKLOG.md

echo -e "${GREEN}✅ BACKLOG.md updated${NC}"
echo ""
echo "Next steps:"
echo "1. Edit ${FILEPATH} to add reproduction steps"
echo "2. Investigate root cause"
echo "3. Update priority/severity if needed"
echo "4. Assign to developer for fix"