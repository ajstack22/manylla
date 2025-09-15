#!/bin/bash

# Interactive Story Creation Script
# This script asks relevant questions based on story type before creating the story

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to ask a question and get response
ask_question() {
    local question="$1"
    local var_name="$2"
    echo -e "${BLUE}❓ $question${NC}"
    read -r response
    eval "$var_name=\"$response\""
}

# Function to ask yes/no question
ask_yes_no() {
    local question="$1"
    local var_name="$2"
    while true; do
        echo -e "${BLUE}❓ $question (y/n)${NC}"
        read -r yn
        case $yn in
            [Yy]* ) eval "$var_name=true"; break;;
            [Nn]* ) eval "$var_name=false"; break;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

# Function to ask for multi-choice
ask_choice() {
    local question="$1"
    local var_name="$2"
    shift 2
    local options=("$@")
    
    echo -e "${BLUE}❓ $question${NC}"
    for i in "${!options[@]}"; do
        echo "  $((i+1)). ${options[$i]}"
    done
    
    while true; do
        read -r choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
            eval "$var_name=\"${options[$((choice-1))]}\""
            break
        else
            echo "Please enter a number between 1 and ${#options[@]}"
        fi
    done
}

echo -e "${GREEN}🚀 Interactive Story Creator${NC}"
echo "This script will help you create a well-defined story with all necessary details."
echo

# Basic Information
ask_question "What is the story title?" TITLE
ask_choice "What is the priority?" PRIORITY "P0 - Critical" "P1 - High" "P2 - Medium" "P3 - Low"

# Extract priority number
PRIORITY_NUM=$(echo "$PRIORITY" | cut -d' ' -f1)

# Detect story type
echo -e "\n${YELLOW}Analyzing story type...${NC}"
STORY_TYPE=""

# Check for keywords to determine type
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
else
    STORY_TYPE="FEATURE"
fi

echo -e "Detected story type: ${GREEN}$STORY_TYPE${NC}\n"

# Common questions
ask_question "Brief description (1-2 sentences):" DESCRIPTION
ask_question "Why is this needed? (Background/context):" BACKGROUND

# Type-specific questions
case "$STORY_TYPE" in
    "UI")
        echo -e "\n${YELLOW}UI/UX Specific Questions:${NC}"
        ask_choice "Which platforms?" PLATFORMS "All (Web, iOS, Android)" "Web only" "Mobile only (iOS, Android)" "iOS only" "Android only"
        ask_yes_no "Will this use existing components?" USE_EXISTING
        ask_yes_no "Does this need responsive design?" RESPONSIVE
        ask_yes_no "Should it follow Manylla theme (#F4E4C1)?" USE_THEME
        ask_question "Any specific accessibility requirements?" ACCESSIBILITY
        ask_choice "Modal type (if applicable)?" MODAL_TYPE "Not a modal" "Full screen" "Dialog overlay" "Bottom sheet" "Alert"
        ask_yes_no "Does this need to work before app initialization (e.g., from URL)?" EARLY_INIT
        ;;
        
    "BACKEND")
        echo -e "\n${YELLOW}Backend/API Specific Questions:${NC}"
        ask_yes_no "Does this involve the MySQL database?" USES_DB
        ask_yes_no "Does this involve encryption?" USES_ENCRYPTION
        ask_question "Which API endpoints are affected?" API_ENDPOINTS
        ask_yes_no "Does this need migration scripts?" NEEDS_MIGRATION
        ask_question "What are the security considerations?" SECURITY_NOTES
        ;;
        
    "TESTING")
        echo -e "\n${YELLOW}Testing Specific Questions:${NC}"
        ask_choice "Test type?" TEST_TYPE "Unit tests" "Integration tests" "E2E tests" "All types"
        ask_question "Which components/features to test?" TEST_TARGETS
        ask_question "Target coverage percentage?" COVERAGE_TARGET
        ask_yes_no "Include platform-specific tests?" PLATFORM_TESTS
        ;;
        
    "BUGFIX")
        echo -e "\n${YELLOW}Bug Fix Specific Questions:${NC}"
        ask_question "Steps to reproduce the bug?" REPRO_STEPS
        ask_question "Expected behavior?" EXPECTED
        ask_question "Actual behavior?" ACTUAL
        ask_choice "Severity?" SEVERITY "Critical - Blocks usage" "High - Major feature broken" "Medium - Feature degraded" "Low - Minor issue"
        ask_question "Which platforms affected?" AFFECTED_PLATFORMS
        ;;
        
    "PERFORMANCE")
        echo -e "\n${YELLOW}Performance Specific Questions:${NC}"
        ask_question "Current performance metrics?" CURRENT_METRICS
        ask_question "Target performance metrics?" TARGET_METRICS
        ask_question "Which operations are slow?" SLOW_OPERATIONS
        ask_yes_no "Is this affecting user experience?" AFFECTS_UX
        ;;
        
    "DEPLOYMENT")
        echo -e "\n${YELLOW}Deployment Specific Questions:${NC}"
        ask_choice "Target environment?" TARGET_ENV "Qual" "Production" "Both" "App Store" "Google Play"
        ask_yes_no "Requires database changes?" DB_CHANGES
        ask_yes_no "Requires server configuration?" SERVER_CONFIG
        ask_question "Any breaking changes?" BREAKING_CHANGES
        ;;
        
    "SECURITY")
        echo -e "\n${YELLOW}Security/Privacy Specific Questions:${NC}"
        ask_yes_no "Is this for compliance (COPPA, GDPR, etc)?" COMPLIANCE
        ask_yes_no "Does this handle sensitive data?" SENSITIVE_DATA
        ask_question "What data is being protected?" PROTECTED_DATA
        ask_yes_no "Does this need security review?" NEEDS_REVIEW
        ask_yes_no "Are there legal requirements?" LEGAL_REQUIREMENTS
        ;;
        
    "DOCUMENTATION")
        echo -e "\n${YELLOW}Documentation Specific Questions:${NC}"
        ask_choice "Documentation type?" DOC_TYPE "User guide" "Developer docs" "API docs" "README" "Process docs"
        ask_question "Target audience?" AUDIENCE
        ask_yes_no "Include code examples?" CODE_EXAMPLES
        ;;
        
    *)
        echo -e "\n${YELLOW}Feature Specific Questions:${NC}"
        ask_yes_no "Does this add new UI components?" HAS_UI
        ask_yes_no "Does this require backend changes?" HAS_BACKEND
        ask_yes_no "Does this affect existing features?" AFFECTS_EXISTING
        ask_question "What are the main user benefits?" USER_BENEFITS
        ;;
esac

# Common final questions
echo -e "\n${YELLOW}Final Details:${NC}"
ask_question "List key requirements (comma-separated):" REQUIREMENTS
ask_question "Success metrics (how to verify it works):" SUCCESS_METRICS
ask_question "Estimated effort (hours or S/M/L):" EFFORT
ask_yes_no "Any dependencies on other stories?" HAS_DEPENDENCIES
if [ "$HAS_DEPENDENCIES" = true ]; then
    ask_question "List dependencies (story IDs or descriptions):" DEPENDENCIES
fi

# Generate story filename
SAFE_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Create the story using the existing script
echo -e "\n${GREEN}Creating story with gathered information...${NC}"
./scripts/create-story.sh "$TITLE" "$PRIORITY_NUM"

# Find the created story file
STORY_FILE=$(ls -t processes/backlog/S*-${SAFE_TITLE}.md 2>/dev/null | head -1)

if [ -z "$STORY_FILE" ]; then
    echo -e "${RED}❌ Could not find created story file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found story file: $STORY_FILE${NC}"

# Now enhance the story with collected information
echo -e "${YELLOW}Enhancing story with collected details...${NC}"

# Create temporary file with enhanced content
TEMP_FILE=$(mktemp)

# Read the story ID from the file
STORY_ID=$(grep "Story ID:" "$STORY_FILE" | cut -d' ' -f3)

cat > "$TEMP_FILE" << EOF
# Story $STORY_ID: $TITLE

## Overview
$DESCRIPTION

## Status
- **Priority**: $PRIORITY_NUM
- **Status**: READY
- **Created**: $(date +%Y-%m-%d)
- **Assigned**: Unassigned
- **Type**: $STORY_TYPE

## Background
$BACKGROUND

## Requirements
EOF

# Add requirements
IFS=',' read -ra REQ_ARRAY <<< "$REQUIREMENTS"
for i in "${!REQ_ARRAY[@]}"; do
    echo "$((i+1)). ${REQ_ARRAY[$i]}" >> "$TEMP_FILE"
done

# Add type-specific sections
case "$STORY_TYPE" in
    "UI")
        cat >> "$TEMP_FILE" << EOF

## UI/UX Specifications
- **Platforms**: $PLATFORMS
- **Uses Existing Components**: $USE_EXISTING
- **Responsive Design**: $RESPONSIVE
- **Manylla Theme**: $USE_THEME
- **Accessibility**: ${ACCESSIBILITY:-N/A}
- **Modal Type**: $MODAL_TYPE
- **Early Initialization Required**: $EARLY_INIT
EOF
        ;;
    "BACKEND")
        cat >> "$TEMP_FILE" << EOF

## Technical Specifications
- **Database Changes**: $USES_DB
- **Encryption Required**: $USES_ENCRYPTION
- **API Endpoints**: ${API_ENDPOINTS:-N/A}
- **Migration Required**: $NEEDS_MIGRATION
- **Security Considerations**: ${SECURITY_NOTES:-N/A}
EOF
        ;;
    "BUGFIX")
        cat >> "$TEMP_FILE" << EOF

## Bug Details
### Steps to Reproduce
$REPRO_STEPS

### Expected Behavior
$EXPECTED

### Actual Behavior
$ACTUAL

### Severity
$SEVERITY

### Affected Platforms
$AFFECTED_PLATFORMS
EOF
        ;;
    "SECURITY")
        cat >> "$TEMP_FILE" << EOF

## Security Requirements
- **Compliance Required**: $COMPLIANCE
- **Sensitive Data**: $SENSITIVE_DATA
- **Protected Data**: ${PROTECTED_DATA:-N/A}
- **Security Review Required**: $NEEDS_REVIEW
- **Legal Requirements**: $LEGAL_REQUIREMENTS
EOF
        ;;
esac

# Add common sections
cat >> "$TEMP_FILE" << EOF

## Success Metrics
\`\`\`bash
# Verification commands
$SUCCESS_METRICS
\`\`\`

## Implementation Guidelines
- Follow existing patterns in the codebase
- Ensure cross-platform compatibility
- Update relevant documentation
- Add appropriate tests

## Acceptance Criteria
- [ ] All requirements implemented
- [ ] All success metrics pass
- [ ] Tests written and passing
- [ ] All platforms verified
- [ ] Documentation updated

## Dependencies
EOF

if [ "$HAS_DEPENDENCIES" = true ]; then
    echo "$DEPENDENCIES" >> "$TEMP_FILE"
else
    echo "None" >> "$TEMP_FILE"
fi

cat >> "$TEMP_FILE" << EOF

## Estimated Effort
**Total**: $EFFORT

## Notes
*Story automatically generated with interactive script*

---
*Story ID: $STORY_ID*
*Created: $(date +%Y-%m-%d)*
*Status: READY*
EOF

# Replace the story file with enhanced version
mv "$TEMP_FILE" "$STORY_FILE"

echo -e "${GREEN}✅ Story enhanced with collected information${NC}"
echo -e "${GREEN}📄 Story file: $STORY_FILE${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the generated story file"
echo "2. Make any additional edits as needed"
echo "3. Update priority in BACKLOG.md if needed"
echo "4. Assign to developer when ready to start"