#!/bin/bash

# Programmatic Story Creation with Details
# This script creates a story with detailed information without interactive prompts
# Usage: ./create-story-with-details.sh --title "Title" --priority P1 --type UI --description "..." [options]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default values
TITLE=""
PRIORITY="P2"
STORY_TYPE="FEATURE"
DESCRIPTION=""
BACKGROUND=""
REQUIREMENTS=""
SUCCESS_METRICS=""
EFFORT="M"
DEPENDENCIES="None"

# Type-specific defaults
PLATFORMS="All (Web, iOS, Android)"
USE_EXISTING="false"
RESPONSIVE="true"
USE_THEME="true"
MODAL_TYPE="Not a modal"
EARLY_INIT="false"
ACCESSIBILITY=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --title)
            TITLE="$2"
            shift 2
            ;;
        --priority)
            PRIORITY="$2"
            shift 2
            ;;
        --type)
            STORY_TYPE="$2"
            shift 2
            ;;
        --description)
            DESCRIPTION="$2"
            shift 2
            ;;
        --background)
            BACKGROUND="$2"
            shift 2
            ;;
        --requirements)
            REQUIREMENTS="$2"
            shift 2
            ;;
        --success-metrics)
            SUCCESS_METRICS="$2"
            shift 2
            ;;
        --effort)
            EFFORT="$2"
            shift 2
            ;;
        --dependencies)
            DEPENDENCIES="$2"
            shift 2
            ;;
        # UI-specific options
        --platforms)
            PLATFORMS="$2"
            shift 2
            ;;
        --use-existing)
            USE_EXISTING="$2"
            shift 2
            ;;
        --responsive)
            RESPONSIVE="$2"
            shift 2
            ;;
        --use-theme)
            USE_THEME="$2"
            shift 2
            ;;
        --modal-type)
            MODAL_TYPE="$2"
            shift 2
            ;;
        --early-init)
            EARLY_INIT="$2"
            shift 2
            ;;
        --accessibility)
            ACCESSIBILITY="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 --title \"Title\" --priority P1 --type UI [options]"
            echo ""
            echo "Required:"
            echo "  --title \"Story title\""
            echo ""
            echo "Optional:"
            echo "  --priority P0|P1|P2|P3 (default: P2)"
            echo "  --type FEATURE|UI|BACKEND|TESTING|BUGFIX|PERFORMANCE|DEPLOYMENT|SECURITY|DOCUMENTATION"
            echo "  --description \"Brief description\""
            echo "  --background \"Why this is needed\""
            echo "  --requirements \"Comma-separated list of requirements\""
            echo "  --success-metrics \"How to verify success\""
            echo "  --effort S|M|L|XL or hours (default: M)"
            echo "  --dependencies \"Story dependencies\""
            echo ""
            echo "UI-specific options:"
            echo "  --platforms \"Target platforms\""
            echo "  --use-existing true|false"
            echo "  --responsive true|false"
            echo "  --use-theme true|false"
            echo "  --modal-type \"Modal type or 'Not a modal'\""
            echo "  --early-init true|false"
            echo "  --accessibility \"Accessibility requirements\""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate required fields
if [ -z "$TITLE" ]; then
    echo -e "${RED}❌ Error: --title is required${NC}"
    exit 1
fi

# Auto-detect story type from title if not specified
if [ "$STORY_TYPE" = "FEATURE" ]; then
    if [[ "$TITLE" =~ [Uu][Ii]|[Mm]odal|[Dd]ialog|[Ff]orm|[Cc]omponent|[Dd]esign|[Tt]heme|[Ss]tyle|[Ll]ayout ]]; then
        STORY_TYPE="UI"
    elif [[ "$TITLE" =~ [Aa][Pp][Ii]|[Ss]ync|[Dd]atabase|[Bb]ackend|[Ss]erver|[Ee]ndpoint|[Ii]ntegration ]]; then
        STORY_TYPE="BACKEND"
    elif [[ "$TITLE" =~ [Tt]est|[Cc]overage|[Uu]nit|[Ii]ntegration|[Ee]2[Ee] ]]; then
        STORY_TYPE="TESTING"
    elif [[ "$TITLE" =~ [Bb]ug|[Ff]ix|[Ee]rror|[Ii]ssue|[Pp]roblem ]]; then
        STORY_TYPE="BUGFIX"
    elif [[ "$TITLE" =~ [Pp]erformance|[Oo]ptimiz|[Ss]peed|[Mm]emory|[Cc]ache ]]; then
        STORY_TYPE="PERFORMANCE"
    elif [[ "$TITLE" =~ [Dd]eploy|[Bb]uild|[Cc][Ii]|[Rr]elease|[Pp]ublish ]]; then
        STORY_TYPE="DEPLOYMENT"
    elif [[ "$TITLE" =~ [Pp]rivacy|[Ss]ecurity|[Ee]ncrypt|[Aa]uth|[Pp]ermission|[Cc]ompliance ]]; then
        STORY_TYPE="SECURITY"
    elif [[ "$TITLE" =~ [Dd]oc|[Rr]eadme|[Gg]uide|[Tt]utorial ]]; then
        STORY_TYPE="DOCUMENTATION"
    fi
fi

echo -e "${GREEN}📝 Creating story: $TITLE${NC}"
echo -e "Type: $STORY_TYPE, Priority: $PRIORITY"

# Create the story using the existing script
./scripts/create-story.sh "$TITLE" "$PRIORITY"

# Generate safe filename
SAFE_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Find the created story file
STORY_FILE=$(ls -t processes/backlog/S*-${SAFE_TITLE}.md 2>/dev/null | head -1)

if [ -z "$STORY_FILE" ]; then
    echo -e "${RED}❌ Could not find created story file${NC}"
    exit 1
fi

# Get story ID
STORY_ID=$(grep "Story ID:" "$STORY_FILE" | cut -d' ' -f3)

# Create enhanced content
TEMP_FILE=$(mktemp)

cat > "$TEMP_FILE" << EOF
# Story $STORY_ID: $TITLE

## Overview
${DESCRIPTION:-"Implementation of $TITLE"}

## Status
- **Priority**: $PRIORITY
- **Status**: READY
- **Created**: $(date +%Y-%m-%d)
- **Assigned**: Unassigned
- **Type**: $STORY_TYPE

## Background
${BACKGROUND:-"This story implements $TITLE to improve the application."}

## Requirements
EOF

# Add requirements
if [ -n "$REQUIREMENTS" ]; then
    IFS=',' read -ra REQ_ARRAY <<< "$REQUIREMENTS"
    for i in "${!REQ_ARRAY[@]}"; do
        echo "$((i+1)). ${REQ_ARRAY[$i]}" >> "$TEMP_FILE"
    done
else
    echo "1. Implement $TITLE functionality" >> "$TEMP_FILE"
    echo "2. Ensure cross-platform compatibility" >> "$TEMP_FILE"
    echo "3. Add appropriate tests" >> "$TEMP_FILE"
fi

# Add type-specific sections
if [ "$STORY_TYPE" = "UI" ]; then
    cat >> "$TEMP_FILE" << EOF

## UI/UX Specifications
- **Platforms**: $PLATFORMS
- **Uses Existing Components**: $USE_EXISTING
- **Responsive Design**: $RESPONSIVE
- **Manylla Theme**: $USE_THEME
- **Accessibility**: ${ACCESSIBILITY:-Standard WCAG 2.1 AA compliance}
- **Modal Type**: $MODAL_TYPE
- **Early Initialization Required**: $EARLY_INIT
EOF
fi

# Add success metrics
cat >> "$TEMP_FILE" << EOF

## Success Metrics
\`\`\`bash
# Verification commands
${SUCCESS_METRICS:-"# Add specific verification commands here"}
\`\`\`

## Implementation Guidelines
- Follow existing patterns in the codebase
- Ensure cross-platform compatibility  
- Update relevant documentation
- Add appropriate tests
- Use TypeScript for type safety
- Follow Manylla coding conventions

## Acceptance Criteria
- [ ] All requirements implemented
- [ ] All success metrics pass
- [ ] Tests written and passing
- [ ] All platforms verified (Web, iOS, Android)
- [ ] Documentation updated
- [ ] Code review completed
- [ ] No console errors or warnings

## Dependencies
$DEPENDENCIES

## Estimated Effort
**Total**: $EFFORT

## Notes
*Story created via create-story-with-details.sh*

---
*Story ID: $STORY_ID*
*Created: $(date +%Y-%m-%d)*
*Status: READY*
EOF

# Replace the story file
mv "$TEMP_FILE" "$STORY_FILE"

echo -e "${GREEN}✅ Story $STORY_ID created successfully${NC}"
echo -e "${GREEN}📄 File: $STORY_FILE${NC}"