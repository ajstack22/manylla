#!/bin/bash

# Create new story with auto-incrementing ID
# Usage: ./create-story.sh "Story Title" "P0"

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -lt 1 ]; then
    echo "Usage: $0 \"Story Title\" [Priority]"
    echo "Example: $0 \"Implement user authentication\" P1"
    exit 1
fi

TITLE="$1"
PRIORITY="${2:-P2}"  # Default to P2 if not specified

# Get next story ID from BACKLOG.md
NEXT_ID=$(grep "Next ID:" processes/BACKLOG.md | sed -E 's/.*S([0-9]+).*/\1/')
if [ -z "$NEXT_ID" ]; then
    NEXT_ID="001"
else
    # Increment and pad with zeros
    NEXT_ID=$(printf "%03d" $((10#$NEXT_ID + 1)))
fi

STORY_ID="S${NEXT_ID}"
FILENAME_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
FILENAME="${STORY_ID}-${FILENAME_TITLE}.md"
FILEPATH="processes/backlog/${FILENAME}"

# Create story file from template
cat > "$FILEPATH" << EOF
# Story ${STORY_ID}: ${TITLE}

## Overview
[Brief description of what needs to be implemented]

## Status
- **Priority**: ${PRIORITY}
- **Status**: READY
- **Created**: $(date +%Y-%m-%d)
- **Assigned**: Unassigned

## Background
[Context about why this is needed]

## Requirements
1. [Specific requirement]
2. [Specific requirement]
3. [Specific requirement]

## Success Metrics
\`\`\`bash
# Verification commands
[command] # Expected: [result]
[command] # Expected: [result]
\`\`\`

## Implementation Guidelines
- [Key consideration]
- [Technical approach]
- [Platform considerations]

## Acceptance Criteria
- [ ] All requirements implemented
- [ ] All success metrics pass
- [ ] Tests written and passing
- [ ] All platforms verified
- [ ] Documentation updated

## Technical Details
\`\`\`javascript
// Interface or key code structure
\`\`\`

## Dependencies
- [Prerequisite stories]
- [Required knowledge]

## Estimated Effort
- Research: [hours]
- Implementation: [hours]
- Testing: [hours]
- **Total**: [S/M/L]

## Notes
[Additional context]

---
*Story ID: ${STORY_ID}*
*Created: $(date +%Y-%m-%d)*
*Status: READY*
EOF

echo -e "${GREEN}✅ Created story ${STORY_ID}: ${TITLE}${NC}"
echo "File: ${FILEPATH}"

# Update BACKLOG.md
echo -e "${YELLOW}Updating BACKLOG.md...${NC}"

# Update next ID
sed -i '' "s/Next ID: S${NEXT_ID}/Next ID: S$(printf "%03d" $((10#$NEXT_ID + 1)))/" processes/BACKLOG.md

# Add to appropriate priority section
case $PRIORITY in
    P0)
        sed -i '' "/## 🔴 P0 - Critical/,/### Bugs/{
            /### Stories/a\\
- [${STORY_ID}](backlog/${FILENAME}) - ${TITLE} ✅ **READY**
        }" processes/BACKLOG.md
        ;;
    P1)
        sed -i '' "/## 🟠 P1 - High/,/### Bugs/{
            /### Stories/a\\
- [${STORY_ID}](backlog/${FILENAME}) - ${TITLE} ✅ **READY**
        }" processes/BACKLOG.md
        ;;
    P2)
        sed -i '' "/## 🟡 P2 - Medium/,/### Bugs/{
            /### Stories/a\\
- [${STORY_ID}](backlog/${FILENAME}) - ${TITLE} ✅ **READY**
        }" processes/BACKLOG.md
        ;;
    P3)
        sed -i '' "/## 🟢 P3 - Low/,/### Bugs/{
            /### Stories/a\\
- [${STORY_ID}](backlog/${FILENAME}) - ${TITLE} ✅ **READY**
        }" processes/BACKLOG.md
        ;;
esac

# Update metrics
TOTAL_STORIES=$(grep -c "^\- \[S[0-9]" processes/BACKLOG.md || echo 0)
sed -i '' "s/Total Stories: [0-9]*/Total Stories: $TOTAL_STORIES/" processes/BACKLOG.md

echo -e "${GREEN}✅ BACKLOG.md updated${NC}"
echo ""
echo "Next steps:"
echo "1. Edit ${FILEPATH} to add details"
echo "2. Update priority in BACKLOG.md if needed"
echo "3. Assign to developer when ready to start"