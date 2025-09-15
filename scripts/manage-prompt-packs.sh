#!/bin/bash

# Advanced prompt pack management with priority-storyID-title scheme
# Format: PP-SSS-title.md where:
#   PP = Priority (01-99)
#   SSS = Story ID (001-999) 
#   title = descriptive name
# Example: 01-042-fix-login-bug.md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ACTIVE_DIR="docs/prompts/active"
ARCHIVE_DIR="docs/prompts/archive"

# Check if we're in the right directory
if [ ! -d "$ACTIVE_DIR" ]; then
    echo -e "${RED}Error: $ACTIVE_DIR directory not found${NC}"
    echo "Please run from project root"
    exit 1
fi

# Function to get next available story ID
get_next_story_id() {
    local max_id=0
    
    # Check active directory
    shopt -s nullglob
    for file in "$ACTIVE_DIR"/*.md "$ARCHIVE_DIR"/*.md; do
        if [ -f "$file" ] && [[ $(basename "$file") =~ ^[0-9]{2}-([0-9]{3})- ]]; then
            local id=${BASH_REMATCH[1]}
            id=$((10#$id))  # Force base 10
            if [ $id -gt $max_id ]; then
                max_id=$id
            fi
        fi
    done
    
    echo $(printf "%03d" $((max_id + 1)))
}

# Function to extract components from filename
parse_filename() {
    local filename="$1"
    if [[ $filename =~ ^([0-9]{2})-([0-9]{3})-(.+)\.md$ ]]; then
        echo "${BASH_REMATCH[1]} ${BASH_REMATCH[2]} ${BASH_REMATCH[3]}"
    elif [[ $filename =~ ^([0-9]{2})-(.+)\.md$ ]]; then
        # Old format without story ID
        echo "${BASH_REMATCH[1]} XXX ${BASH_REMATCH[2]}"
    else
        echo "XX XXX $filename"
    fi
}

# Function to display current prompt packs
show_current_packs() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║              Current Active Prompt Packs                  ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ Pri │ Story │ Title                                        ║${NC}"
    echo -e "${BLUE}╟─────┼───────┼──────────────────────────────────────────────╢${NC}"
    
    for file in "$ACTIVE_DIR"/[0-9][0-9]-*.md; do
        if [ -f "$file" ]; then
            local basename=$(basename "$file")
            local parts=($(parse_filename "$basename"))
            printf "${BLUE}║${NC} %3s ${BLUE}│${NC} %5s ${BLUE}│${NC} %-44s ${BLUE}║${NC}\n" \
                "${parts[0]}" "${parts[1]}" "${parts[2]}"
        fi
    done | sort -n
    
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

# Function to create new prompt pack
create_new() {
    local title="$1"
    local priority="${2:-99}"
    
    if [ -z "$title" ]; then
        echo -e "${GREEN}Enter title for new prompt pack:${NC}"
        read -r title
        echo -e "${GREEN}Enter priority (1-99, default 99):${NC}"
        read -r priority
        priority=${priority:-99}
    fi
    
    # Clean the title
    title=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
    
    # Get next story ID
    local story_id=$(get_next_story_id)
    
    # Format priority
    priority=$(printf "%02d" "$priority")
    
    # Create filename
    local filename="${priority}-${story_id}-${title}.md"
    
    echo -e "${CYAN}Creating new prompt pack:${NC}"
    echo "  Priority: $priority"
    echo "  Story ID: $story_id"
    echo "  Title: $title"
    echo "  Filename: $filename"
    
    # Use the create script if it exists
    if [ -f "scripts/create-prompt-pack.sh" ]; then
        # Extract priority level name
        if [ "$priority" -le 10 ]; then
            level="01-critical"
        elif [ "$priority" -le 30 ]; then
            level="02-high"
        elif [ "$priority" -le 60 ]; then
            level="03-medium"
        else
            level="04-low"
        fi
        ./scripts/create-prompt-pack.sh "$level" "$title"
        # Rename to our format
        mv "$ACTIVE_DIR"/*"$title.md" "$ACTIVE_DIR/$filename" 2>/dev/null || true
    else
        touch "$ACTIVE_DIR/$filename"
    fi
    
    echo -e "${GREEN}✅ Created: $filename${NC}"
}

# Function to reprioritize a prompt pack
reprioritize() {
    local identifier="$1"
    local new_priority="$2"
    
    if [ -z "$identifier" ] || [ -z "$new_priority" ]; then
        show_current_packs
        echo ""
        echo -e "${GREEN}Enter story ID or current priority to move:${NC}"
        read -r identifier
        echo -e "${GREEN}Enter new priority (1-99):${NC}"
        read -r new_priority
    fi
    
    # Validate new priority
    if ! [[ "$new_priority" =~ ^[0-9]+$ ]] || [ "$new_priority" -lt 1 ] || [ "$new_priority" -gt 99 ]; then
        echo -e "${RED}Error: Priority must be between 1 and 99${NC}"
        exit 1
    fi
    
    new_priority=$(printf "%02d" "$new_priority")
    
    # Find the file to move
    local file_to_move=""
    for file in "$ACTIVE_DIR"/*.md; do
        if [ -f "$file" ]; then
            local basename=$(basename "$file")
            if [[ $basename =~ ^[0-9]{2}-0*${identifier}- ]] || [[ $basename =~ ^0*${identifier}- ]]; then
                file_to_move="$file"
                break
            fi
        fi
    done
    
    if [ -z "$file_to_move" ]; then
        echo -e "${RED}Error: Could not find prompt pack with identifier: $identifier${NC}"
        exit 1
    fi
    
    # Parse the file to move
    local parts=($(parse_filename "$(basename "$file_to_move")"))
    local old_priority="${parts[0]}"
    local story_id="${parts[1]}"
    local title="${parts[2]}"
    
    echo -e "${BLUE}Moving story $story_id from priority $old_priority to $new_priority${NC}"
    
    # Renumber other files
    for file in "$ACTIVE_DIR"/[0-9][0-9]-*.md; do
        if [ -f "$file" ] && [ "$file" != "$file_to_move" ]; then
            local basename=$(basename "$file")
            local parts=($(parse_filename "$basename"))
            local current_pri="${parts[0]}"
            local current_story="${parts[1]}"
            local current_title="${parts[2]}"
            
            current_pri=$((10#$current_pri))
            new_pri_num=$((10#$new_priority))
            
            if [ $current_pri -ge $new_pri_num ]; then
                local adjusted_pri=$(printf "%02d" $((current_pri + 1)))
                local new_name="${adjusted_pri}-${current_story}-${current_title}.md"
                echo "  Bumping $basename → $new_name"
                mv "$file" "$ACTIVE_DIR/TEMP_$new_name"
            fi
        fi
    done
    
    # Rename temp files
    for file in "$ACTIVE_DIR"/TEMP_*.md; do
        if [ -f "$file" ]; then
            mv "$file" "${file/TEMP_/}"
        fi
    done
    
    # Move our target file
    local new_name="${new_priority}-${story_id}-${title}.md"
    mv "$file_to_move" "$ACTIVE_DIR/$new_name"
    
    echo -e "${GREEN}✅ Reprioritization complete!${NC}"
}

# Function to migrate old format to new format
migrate_existing() {
    echo -e "${CYAN}Migrating existing files to new format...${NC}"
    
    local story_counter=1
    
    for file in "$ACTIVE_DIR"/[0-9][0-9]-*.md; do
        if [ -f "$file" ]; then
            local basename=$(basename "$file")
            
            # Skip if already in new format
            if [[ $basename =~ ^[0-9]{2}-[0-9]{3}- ]]; then
                echo "  ✓ $basename (already migrated)"
                continue
            fi
            
            # Parse old format
            if [[ $basename =~ ^([0-9]{2})-(.+)\.md$ ]]; then
                local priority="${BASH_REMATCH[1]}"
                local title="${BASH_REMATCH[2]}"
                local story_id=$(printf "%03d" $story_counter)
                local new_name="${priority}-${story_id}-${title}.md"
                
                echo "  Migrating: $basename → $new_name"
                mv "$file" "$ACTIVE_DIR/$new_name"
                ((story_counter++))
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Migration complete!${NC}"
}

# Main menu
main_menu() {
    echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       Prompt Pack Management System        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "1) Show current prompt packs"
    echo "2) Create new prompt pack"
    echo "3) Reprioritize existing pack"
    echo "4) Migrate to new naming scheme"
    echo "5) Exit"
    echo ""
    echo -e "${GREEN}Select option:${NC}"
    read -r option
    
    case $option in
        1) show_current_packs ;;
        2) create_new ;;
        3) reprioritize ;;
        4) migrate_existing ;;
        5) exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Parse command line arguments
case "${1:-}" in
    show|list|ls)
        show_current_packs
        ;;
    create|new)
        create_new "$2" "$3"
        show_current_packs
        ;;
    move|reprioritize|pri)
        reprioritize "$2" "$3"
        show_current_packs
        ;;
    migrate)
        migrate_existing
        show_current_packs
        ;;
    *)
        if [ -z "$1" ]; then
            main_menu
        else
            echo "Usage: $0 {show|create|move|migrate}"
            echo ""
            echo "Commands:"
            echo "  show              - Display current prompt packs"
            echo "  create <title> [priority] - Create new prompt pack"
            echo "  move <id> <priority>     - Change priority of existing pack"
            echo "  migrate           - Convert old naming to new scheme"
        fi
        ;;
esac