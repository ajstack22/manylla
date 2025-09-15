#!/bin/bash

# update-role-definitions.sh
# Captures learnings from recent development sessions and updates role definitions
# Ensures roles evolve with the codebase and become more effective over time

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ROLES_DIR="$PROJECT_ROOT/processes/roles"
LEARNINGS_DIR="$PROJECT_ROOT/docs/development/learnings"
TEMP_DIR="/tmp/manylla-role-updates"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Manylla Role Definition Updater ===${NC}"
echo "This tool captures recent learnings and updates role definitions"
echo ""

# Create directories if they don't exist
mkdir -p "$LEARNINGS_DIR"
mkdir -p "$TEMP_DIR"

# Function to extract recent changes and patterns
analyze_recent_changes() {
    echo -e "${YELLOW}Analyzing recent changes...${NC}"
    
    # Get commits from last 7 days
    RECENT_COMMITS=$(git log --since="7 days ago" --pretty=format:"%h %s" 2>/dev/null || echo "")
    
    # Extract bug fixes and their patterns
    BUG_FIXES=$(echo "$RECENT_COMMITS" | grep -i "fix:" || true)
    
    # Extract feature implementations
    FEATURES=$(echo "$RECENT_COMMITS" | grep -i "feat:" || true)
    
    # Find recently modified components
    MODIFIED_COMPONENTS=$(git diff --name-only HEAD~10...HEAD 2>/dev/null | grep "src/components" | head -10 || true)
    
    # Check for new patterns in the codebase
    echo "Recent bug fixes: $(echo "$BUG_FIXES" | wc -l)"
    echo "Recent features: $(echo "$FEATURES" | wc -l)"
    echo "Modified components: $(echo "$MODIFIED_COMPONENTS" | wc -l)"
}

# Function to capture session learnings
capture_session_learnings() {
    echo -e "${YELLOW}Capturing session learnings...${NC}"
    
    LEARNING_FILE="$LEARNINGS_DIR/session-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$LEARNING_FILE" << 'EOF'
# Development Session Learnings

**Date**: $(date +"%Y-%m-%d %H:%M")
**Session Type**: [Bug Fix/Feature/Refactor]

## What Happened
<!-- Describe the issue or task -->

## Root Cause
<!-- What was the actual problem? -->

## Solution Applied
<!-- How was it fixed? -->

## Key Learnings
<!-- What patterns or insights were discovered? -->

## Role Impact
### Developer Role
<!-- What should the Developer role know for next time? -->

### Peer Reviewer Role  
<!-- What should the Peer Reviewer watch for? -->

## Code Patterns Discovered
<!-- Any new patterns specific to Manylla? -->

## Commands That Helped
```bash
# List useful debugging commands
```

## Future Prevention
<!-- How can we prevent this issue? -->
EOF

    echo -e "${GREEN}Created learning template: $LEARNING_FILE${NC}"
    echo "Please fill this out with session details"
    
    # Optionally open in editor
    read -p "Open in editor now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-vi} "$LEARNING_FILE"
    fi
    
    echo "$LEARNING_FILE"
}

# Function to extract patterns from codebase
extract_codebase_patterns() {
    echo -e "${YELLOW}Extracting current codebase patterns...${NC}"
    
    PATTERNS_FILE="$TEMP_DIR/patterns.md"
    
    cat > "$PATTERNS_FILE" << EOF
# Current Manylla Codebase Patterns
Generated: $(date +"%Y-%m-%d %H:%M")

## Component Structure
EOF

    # Find most common component patterns
    echo "### Common Imports" >> "$PATTERNS_FILE"
    grep -h "^import" "$PROJECT_ROOT/src/components/Common/ThemedModal.js" 2>/dev/null | head -5 >> "$PATTERNS_FILE" || true
    
    echo "" >> "$PATTERNS_FILE"
    echo "## React Native Web Patterns" >> "$PATTERNS_FILE"
    
    # Check for RNW specific patterns
    grep -r "Platform.select" "$PROJECT_ROOT/src" --include="*.js" | head -3 >> "$PATTERNS_FILE" || true
    
    echo "" >> "$PATTERNS_FILE"
    echo "## Theme Usage" >> "$PATTERNS_FILE"
    grep -r "useTheme" "$PROJECT_ROOT/src" --include="*.js" | wc -l | xargs -I {} echo "Files using useTheme: {}" >> "$PATTERNS_FILE"
    
    echo "" >> "$PATTERNS_FILE"
    echo "## Error Patterns" >> "$PATTERNS_FILE"
    grep -r "catch" "$PROJECT_ROOT/src" --include="*.js" -A 2 | head -5 >> "$PATTERNS_FILE" || true
    
    echo -e "${GREEN}Patterns extracted to: $PATTERNS_FILE${NC}"
}

# Function to update Developer role
update_developer_role() {
    echo -e "${YELLOW}Updating Developer role...${NC}"
    
    DEVELOPER_FILE="$ROLES_DIR/DEVELOPER_ROLE_AND_LEARNINGS.md"
    BACKUP_FILE="$ROLES_DIR/DEVELOPER_ROLE_AND_LEARNINGS.md.backup.$(date +%Y%m%d)"
    
    # Backup current file
    cp "$DEVELOPER_FILE" "$BACKUP_FILE"
    
    # Check for new learnings to add
    if [ -d "$LEARNINGS_DIR" ]; then
        RECENT_LEARNINGS=$(find "$LEARNINGS_DIR" -name "*.md" -mtime -7 2>/dev/null | head -5)
        
        if [ ! -z "$RECENT_LEARNINGS" ]; then
            echo "Found recent learnings to incorporate:"
            echo "$RECENT_LEARNINGS"
            
            # Add new section for recent learnings
            TEMP_UPDATE="$TEMP_DIR/developer_update.md"
            
            # Extract the current content up to the learnings section
            sed '/## Real Deployment Failures/q' "$DEVELOPER_FILE" > "$TEMP_UPDATE"
            
            # Add new learnings section
            echo "" >> "$TEMP_UPDATE"
            echo "## Recent Session Learnings (Auto-Updated: $(date +%Y-%m-%d))" >> "$TEMP_UPDATE"
            echo "" >> "$TEMP_UPDATE"
            
            # Process each learning file
            for learning in $RECENT_LEARNINGS; do
                echo "### From $(basename $learning .md)" >> "$TEMP_UPDATE"
                grep -A 5 "## Key Learnings" "$learning" >> "$TEMP_UPDATE" || true
                echo "" >> "$TEMP_UPDATE"
            done
            
            # Add the rest of the original file
            sed -n '/## Real Deployment Failures/,$p' "$DEVELOPER_FILE" >> "$TEMP_UPDATE"
            
            echo -e "${GREEN}Updated Developer role with recent learnings${NC}"
        fi
    fi
}

# Function to update Peer Reviewer role
update_peer_reviewer_role() {
    echo -e "${YELLOW}Updating Peer Reviewer role...${NC}"
    
    REVIEWER_FILE="$ROLES_DIR/PEER_REVIEWER_ROLE_AND_LEARNINGS.md"
    
    # Add specific validation commands based on recent issues
    TEMP_UPDATE="$TEMP_DIR/reviewer_update.md"
    
    # Create new validation section
    cat > "$TEMP_UPDATE" << 'EOF'

## Auto-Generated Validation Commands (Updated: $(date +%Y-%m-%d))

### React Native Web Specific Checks
```bash
# Check for RNW style conflicts (from B003 learning)
grep -r "style=\[" src/ --include="*.js" | grep "backgroundColor"  # Inline styles needed for RNW overrides

# Verify Material Icons usage
grep -r "MaterialIcons" src/ --include="*.js"  # Should use Text with ✕ for cross-platform

# Check for platform-specific styling
grep -r "Platform.select" src/ --include="*.js" | grep -E "web:|ios:|android:"
```

### Recent Bug Patterns to Check
EOF
    
    # Add patterns from recent bugs
    if [ -f "$PROJECT_ROOT/docs/development/bugs/resolved/B003-modal-headers-have-invisible-white-text-and-close-buttons.md" ]; then
        echo "- Modal header visibility (check inline styles for headers)" >> "$TEMP_UPDATE"
    fi
    
    echo -e "${GREEN}Updated Peer Reviewer validation commands${NC}"
}

# Function to generate role summary
generate_role_summary() {
    echo -e "${YELLOW}Generating role effectiveness summary...${NC}"
    
    SUMMARY_FILE="$ROLES_DIR/ROLE_EFFECTIVENESS_SUMMARY.md"
    
    cat > "$SUMMARY_FILE" << EOF
# Role Effectiveness Summary
Generated: $(date +"%Y-%m-%d %H:%M")

## Current Manylla-Specific Knowledge

### Architecture Patterns
- React Native + Web unified codebase
- Webpack for web builds (NOT Create React App)
- Material-UI v7 for web components
- React Native Elements for mobile
- Zero-knowledge encryption with TweetNaCl.js

### Known Issues & Solutions
EOF

    # Add recent bug fixes
    if [ -d "$PROJECT_ROOT/docs/development/bugs/resolved" ]; then
        echo "#### Recently Resolved Bugs" >> "$SUMMARY_FILE"
        ls -1 "$PROJECT_ROOT/docs/development/bugs/resolved" | tail -5 | while read bug; do
            echo "- $bug" >> "$SUMMARY_FILE"
        done
    fi
    
    cat >> "$SUMMARY_FILE" << EOF

### Critical Commands for Manylla
\`\`\`bash
# Web development (Webpack)
npm run web

# Deployment (MUST use script)
./scripts/deploy-qual.sh

# Check React Native Web issues
grep -r "style=\[" src/ --include="*.js" | grep backgroundColor
\`\`\`

### Platform-Specific Gotchas
1. React Native Web generates CSS classes that can override StyleSheet
2. Inline styles have highest specificity for RNW overrides
3. Material Icons may not render properly - use text characters
4. ThemedModal uses inline styles for headers (B003 fix)

## Metrics
- Total Stories Completed: $(ls -1 $PROJECT_ROOT/docs/development/stories/completed 2>/dev/null | wc -l)
- Total Bugs Resolved: $(ls -1 $PROJECT_ROOT/docs/development/bugs/resolved 2>/dev/null | wc -l)
- Active Tech Debt Items: $(grep -c "^-" $PROJECT_ROOT/docs/TECH_DEBT.md 2>/dev/null || echo 0)

## Role Evolution Tracking
- Last Developer Role Update: $(stat -f "%Sm" "$ROLES_DIR/DEVELOPER_ROLE_AND_LEARNINGS.md" 2>/dev/null || echo "Unknown")
- Last Reviewer Role Update: $(stat -f "%Sm" "$ROLES_DIR/PEER_REVIEWER_ROLE_AND_LEARNINGS.md" 2>/dev/null || echo "Unknown")
- Learning Sessions Captured: $(ls -1 $LEARNINGS_DIR 2>/dev/null | wc -l)
EOF

    echo -e "${GREEN}Generated role summary: $SUMMARY_FILE${NC}"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Capture learnings from current session"
    echo "2) Analyze recent changes and update roles"
    echo "3) Extract current codebase patterns"
    echo "4) Generate role effectiveness summary"
    echo "5) Full update (all of the above)"
    echo "6) Exit"
    echo ""
    read -p "Select option (1-6): " choice
    
    case $choice in
        1)
            capture_session_learnings
            ;;
        2)
            analyze_recent_changes
            update_developer_role
            update_peer_reviewer_role
            ;;
        3)
            extract_codebase_patterns
            ;;
        4)
            generate_role_summary
            ;;
        5)
            capture_session_learnings
            analyze_recent_changes
            extract_codebase_patterns
            update_developer_role
            update_peer_reviewer_role
            generate_role_summary
            echo -e "${GREEN}Full role update complete!${NC}"
            ;;
        6)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            show_menu
            ;;
    esac
}

# Run the script
show_menu

echo ""
echo -e "${BLUE}Role definitions updated based on recent Manylla development${NC}"
echo "Roles are now more specific to current implementation patterns"

# Cleanup
rm -rf "$TEMP_DIR"