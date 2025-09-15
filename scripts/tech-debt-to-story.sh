#!/bin/bash

# Tech Debt to Story Converter
# Converts a tech debt draft into an actionable story
# Usage: ./tech-debt-to-story.sh processes/tech-debt/drafts/[draft-file].md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if draft file provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No draft file provided${NC}"
    echo "Usage: $0 processes/tech-debt/drafts/[draft-file].md"
    exit 1
fi

DRAFT_FILE="$1"

# Check if file exists
if [ ! -f "$DRAFT_FILE" ]; then
    echo -e "${RED}Error: Draft file not found: $DRAFT_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Converting tech debt draft to story...${NC}"

# Extract information from draft using grep and sed
TOPIC=$(grep "^# Tech Debt Draft:" "$DRAFT_FILE" | sed 's/# Tech Debt Draft: //')
DATE=$(date +%Y-%m-%d)
DISCOVERY_DATE=$(grep "^- \*\*Date\*\*:" "$DRAFT_FILE" | sed 's/- \*\*Date\*\*: //')
DISCOVERED_DURING=$(grep "^- \*\*Discovered During\*\*:" "$DRAFT_FILE" | sed 's/- \*\*Discovered During\*\*: //')
PRIORITY=$(grep "^- \*\*Urgency\*\*:" "$DRAFT_FILE" | sed 's/- \*\*Urgency\*\*: //')

# Extract sections
PROBLEM=$(awk '/## Problem Description/,/## Impact Analysis/' "$DRAFT_FILE" | sed '1d;$d')
IMPACT=$(awk '/## Impact Analysis/,/## Proposed Solution/' "$DRAFT_FILE" | sed '1d;$d')
SOLUTION=$(awk '/## Proposed Solution/,/## Acceptance Criteria/' "$DRAFT_FILE" | sed '1d;$d')
CRITERIA=$(awk '/## Acceptance Criteria/,/## Effort Estimate/' "$DRAFT_FILE" | sed '1d;$d')
EFFORT=$(awk '/## Effort Estimate/,/## Priority Scoring/' "$DRAFT_FILE" | sed '1d;$d')

# Generate story filename
STORY_NAME=$(echo "$TOPIC" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
STORY_FILE="processes/stories/tech-debt/${STORY_NAME}.md"

# Create tech-debt stories directory if it doesn't exist
mkdir -p processes/stories/tech-debt

# Create the story file
cat > "$STORY_FILE" << EOF
# Story: Fix ${TOPIC}

## Overview
${PROBLEM}

## Background
- **Originally discovered**: ${DISCOVERY_DATE:-$DATE}
- **During**: ${DISCOVERED_DURING:-Development}
- **Current state**: Issue identified and documented

${IMPACT}

## Requirements
${CRITERIA}

## Success Metrics
\`\`\`bash
# TODO: Add specific verification commands
# Example commands to verify the fix:
# grep -r "pattern" src/ --include="*.js" | wc -l  # Should return 0
# npm run test:[component]  # Should pass
# npm run build:web  # Should succeed without warnings
\`\`\`

## Implementation Guidelines
${SOLUTION}

### Specific Steps
1. Research current implementation
2. Design solution approach
3. Implement fix with tests
4. Verify on all platforms
5. Update documentation

## Risk Mitigation
- Test thoroughly on all platforms (web, iOS, Android)
- Create rollback plan before implementation
- Review with team before major changes

## Technical Details
\`\`\`javascript
// TODO: Add example code structure or interface if applicable
\`\`\`

## Effort Breakdown
${EFFORT}

## Acceptance Criteria
${CRITERIA}
- [ ] All platforms tested and working
- [ ] No regressions introduced
- [ ] Documentation updated
- [ ] Tests added/updated

## Dependencies
- Review current implementation
- Understand impact on related components
- Coordinate with team if affects shared code

## Notes
- Converted from tech debt draft: ${DATE}
- Original discovery: ${DISCOVERY_DATE:-$DATE}
- Draft file: ${DRAFT_FILE}

---
*Story created: ${DATE}*
*Status: Ready for implementation*
*Priority: ${PRIORITY:-P2}*
EOF

echo -e "${GREEN}✅ Story created successfully!${NC}"
echo -e "Story file: ${STORY_FILE}"
echo ""
echo "Next steps:"
echo "1. Review and refine the generated story"
echo "2. Add specific verification commands"
echo "3. Assign to developer for implementation"
echo "4. Move draft to completed: mv \"$DRAFT_FILE\" \"processes/tech-debt/completed/\""

# Ask if user wants to move draft to completed
read -p "Move draft to completed? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mv "$DRAFT_FILE" "processes/tech-debt/completed/"
    echo -e "${GREEN}Draft moved to completed folder${NC}"
fi

# Ask if user wants to open the story for editing
read -p "Open story for editing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code "$STORY_FILE"
    elif command -v vim &> /dev/null; then
        vim "$STORY_FILE"
    else
        echo "Please open $STORY_FILE in your preferred editor"
    fi
fi