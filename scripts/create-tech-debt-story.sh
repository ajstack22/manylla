#!/bin/bash

# Create tech debt story automatically from deployment warnings
# Usage: ./create-tech-debt-story.sh "title" "priority" "type" "details"

TITLE="$1"
PRIORITY="${2:-P3}"  # Default to P3 (Low)
TYPE="${3:-TECH_DEBT}"
DETAILS="${4:-No additional details provided}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# Generate next story ID - get the actual next available ID
NEXT_ID=$(grep "Next ID:" processes/BACKLOG.md | sed 's/.*Next ID: S\([0-9]*\).*/\1/')
if [ -z "$NEXT_ID" ]; then
    # If can't parse, find the highest existing story ID and add 1
    HIGHEST=$(ls processes/backlog/S*.md 2>/dev/null | sed 's/.*\/S\([0-9]*\)-.*/\1/' | sort -n | tail -1)
    if [ -n "$HIGHEST" ]; then
        NEXT_ID=$((HIGHEST + 1))
    else
        NEXT_ID="001"
    fi
fi

STORY_ID="S$(printf "%03d" $NEXT_ID)"
FILENAME="processes/backlog/${STORY_ID}-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -d '[:punct:]' | head -c 50).md"

# Create story file
cat > "$FILENAME" << EOF
# ${STORY_ID} - ${TITLE}

**Status**: Not Started
**Type**: Tech Debt (Auto-Generated)
**Priority**: ${PRIORITY}
**Created**: ${TIMESTAMP}
**Source**: Deployment Quality Check

## Context
This story was automatically generated during deployment due to quality warnings that didn't block deployment but should be addressed.

## Issue Details
${DETAILS}

## Implementation
1. Review the specific warnings/issues identified
2. Fix the root causes
3. Verify no new issues introduced
4. Update tests if applicable

## Success Criteria
- [ ] All identified issues resolved
- [ ] No regression in functionality
- [ ] Deployment script passes without this warning

## Notes
- Auto-generated from deploy-qual.sh on ${TIMESTAMP}
- Non-blocking issue that should be addressed in future sprint

---
*Story ID: ${STORY_ID}*
*Auto-Generated: ${TIMESTAMP}*
EOF

# Update BACKLOG.md
# First, increment the next ID
NEW_NEXT_ID=$((NEXT_ID + 1))
sed -i '' "s/Next ID: S[0-9]*/Next ID: S$(printf "%03d" $NEW_NEXT_ID)/" processes/BACKLOG.md

# Add to appropriate priority section
if [ "$PRIORITY" = "P3" ]; then
    # Add to P3 section
    sed -i '' "/## 🟢 P3 - Low/,/### Bugs/{
        /### Stories/a\\
- [${STORY_ID}](backlog/$(basename "$FILENAME")) - ${TITLE} ✅ **READY** (Auto-Generated)
    }" processes/BACKLOG.md
elif [ "$PRIORITY" = "P2" ]; then
    # Add to P2 section
    sed -i '' "/## 🟡 P2 - Medium/,/### Bugs/{
        /### Stories/a\\
- [${STORY_ID}](backlog/$(basename "$FILENAME")) - ${TITLE} ✅ **READY** (Auto-Generated)
    }" processes/BACKLOG.md
fi

echo "✅ Created story ${STORY_ID}: ${TITLE}"
echo "   File: ${FILENAME}"