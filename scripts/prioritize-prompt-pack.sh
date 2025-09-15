#!/bin/bash

# Script to add or reprioritize prompt packs with automatic renumbering
# Usage: ./scripts/prioritize-prompt-pack.sh <filename> <new-priority>
# Example: ./scripts/prioritize-prompt-pack.sh my-new-feature.md 3
# This will insert at position 3 and renumber everything after

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "docs/prompts/active" ]; then
    echo -e "${RED}Error: docs/prompts/active directory not found${NC}"
    echo "Please run from project root"
    exit 1
fi

# Function to display current prompt packs
show_current_packs() {
    echo -e "${BLUE}Current Active Prompt Packs:${NC}"
    echo "──────────────────────────────"
    
    # List all numbered prompt packs
    for file in docs/prompts/active/[0-9][0-9]-*.md; do
        if [ -f "$file" ]; then
            basename "$file"
        fi
    done | sort -n
    
    echo "──────────────────────────────"
}

# Function to extract priority number from filename
get_priority() {
    echo "$1" | sed 's/^0*//' | cut -d'-' -f1
}

# Function to extract the name part after the priority
get_name_part() {
    echo "$1" | sed 's/^[0-9][0-9]-//'
}

# Main logic
main() {
    # Check arguments
    if [ $# -lt 2 ]; then
        echo -e "${YELLOW}Usage: $0 <filename> <new-priority-number>${NC}"
        echo -e "${YELLOW}Example: $0 fix-bug.md 3${NC}"
        echo ""
        show_current_packs
        echo ""
        echo -e "${GREEN}Enter filename (without number prefix):${NC}"
        read -r filename
        echo -e "${GREEN}Enter desired priority (1-99):${NC}"
        read -r priority
    else
        filename="$1"
        priority="$2"
    fi
    
    # Validate priority is a number
    if ! [[ "$priority" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}Error: Priority must be a number${NC}"
        exit 1
    fi
    
    # Validate priority is in range
    if [ "$priority" -lt 1 ] || [ "$priority" -gt 99 ]; then
        echo -e "${RED}Error: Priority must be between 1 and 99${NC}"
        exit 1
    fi
    
    # Remove any existing number prefix from filename
    clean_filename=$(echo "$filename" | sed 's/^[0-9][0-9]-//')
    
    # Format priority with leading zero
    formatted_priority=$(printf "%02d" "$priority")
    
    # Check if file exists (either with or without number)
    source_file=""
    if [ -f "docs/prompts/active/$filename" ]; then
        source_file="docs/prompts/active/$filename"
    elif [ -f "docs/prompts/active/$clean_filename" ]; then
        source_file="docs/prompts/active/$clean_filename"
    else
        # Check if it exists with any number prefix
        for f in docs/prompts/active/[0-9][0-9]-"$clean_filename"; do
            if [ -f "$f" ]; then
                source_file="$f"
                break
            fi
        done
    fi
    
    # If file doesn't exist, it might be a new file
    if [ -z "$source_file" ]; then
        echo -e "${YELLOW}File not found. Creating new prompt pack: ${formatted_priority}-${clean_filename}${NC}"
        # You could create a template here if desired
        touch "docs/prompts/active/${formatted_priority}-${clean_filename}"
        source_file="docs/prompts/active/${formatted_priority}-${clean_filename}"
    fi
    
    # Get all existing numbered files
    existing_files=()
    while IFS= read -r -d '' file; do
        if [ -f "$file" ] && [ "$file" != "$source_file" ]; then
            existing_files+=("$(basename "$file")")
        fi
    done < <(find docs/prompts/active -maxdepth 1 -name "[0-9][0-9]-*.md" -print0 | sort -z)
    
    # Renumber files that need to shift
    echo -e "${BLUE}Renumbering prompt packs...${NC}"
    
    # First pass: rename to temporary names to avoid conflicts
    temp_renames=()
    for file in "${existing_files[@]}"; do
        current_priority=$(echo "$file" | cut -d'-' -f1 | sed 's/^0*//')
        name_part=$(get_name_part "$file")
        
        # If current priority >= new priority, increment it
        if [ "$current_priority" -ge "$priority" ]; then
            new_priority=$((current_priority + 1))
            new_priority_formatted=$(printf "%02d" "$new_priority")
            temp_name="TEMP_${new_priority_formatted}-${name_part}"
            
            echo "  Moving $file → temporary"
            mv "docs/prompts/active/$file" "docs/prompts/active/$temp_name"
            temp_renames+=("$temp_name:${new_priority_formatted}-${name_part}")
        fi
    done
    
    # Second pass: rename from temporary to final names
    for rename in "${temp_renames[@]}"; do
        temp_name="${rename%%:*}"
        final_name="${rename##*:}"
        echo "  Finalizing → $final_name"
        mv "docs/prompts/active/$temp_name" "docs/prompts/active/$final_name"
    done
    
    # Now rename our target file to its new priority
    if [ -f "$source_file" ]; then
        new_name="${formatted_priority}-${clean_filename}"
        if [ "$source_file" != "docs/prompts/active/$new_name" ]; then
            echo -e "${GREEN}Setting ${clean_filename} to priority ${priority}${NC}"
            mv "$source_file" "docs/prompts/active/$new_name"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}✅ Reprioritization complete!${NC}"
    echo ""
    show_current_packs
}

# Run main function
main "$@"