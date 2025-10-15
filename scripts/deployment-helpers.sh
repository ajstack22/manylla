#!/bin/bash

# Manylla Deployment Helper Functions
# Shared utilities for all deployment scripts
#
# Source this file in deployment scripts:
#   source "$(dirname "$0")/deployment-helpers.sh"

# Colors (export for use in other scripts)
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export RED='\033[0;31m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export NC='\033[0m'

# Validation Functions

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate Node.js version
validate_node_version() {
    local MIN_NODE_VERSION=18

    if ! command_exists node; then
        echo -e "${RED}❌ Error: Node.js not found${NC}"
        return 1
    fi

    local NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
        echo -e "${RED}❌ Error: Node.js version must be >= $MIN_NODE_VERSION${NC}"
        echo "   Current version: $(node -v)"
        return 1
    fi

    echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
    return 0
}

# Validate npm version
validate_npm_version() {
    if ! command_exists npm; then
        echo -e "${RED}❌ Error: npm not found${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"
    return 0
}

# Check if in git repository
validate_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Not in a git repository${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Git repository detected${NC}"
    return 0
}

# Check for uncommitted changes
check_git_status() {
    local ALLOW_UNCOMMITTED="${ALLOW_UNCOMMITTED:-false}"

    if [ "$ALLOW_UNCOMMITTED" = "true" ]; then
        echo -e "${YELLOW}⚠️  Skipping git status check (ALLOW_UNCOMMITTED=true)${NC}"
        return 0
    fi

    if ! git diff-index --quiet HEAD --; then
        echo -e "${RED}❌ Error: Uncommitted changes detected${NC}"
        echo "   Commit your changes before deploying"
        echo "   Or set ALLOW_UNCOMMITTED=true to override (not recommended)"
        git status --short
        return 1
    fi

    echo -e "${GREEN}✅ No uncommitted changes${NC}"
    return 0
}

# Validate SSH connection
validate_ssh_connection() {
    local SERVER="$1"

    if [ -z "$SERVER" ]; then
        echo -e "${RED}❌ Error: No server specified${NC}"
        return 1
    fi

    echo -e "${BLUE}🔍 Testing SSH connection to $SERVER...${NC}"

    if ! ssh "$SERVER" "echo 'SSH OK'" > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Cannot connect to server '$SERVER'${NC}"
        echo "   Please check your SSH configuration"
        return 1
    fi

    echo -e "${GREEN}✅ SSH connection to $SERVER successful${NC}"
    return 0
}

# Validate directory exists
validate_directory_exists() {
    local DIR="$1"
    local LABEL="${2:-Directory}"

    if [ ! -d "$DIR" ]; then
        echo -e "${RED}❌ Error: $LABEL not found: $DIR${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ $LABEL exists: $DIR${NC}"
    return 0
}

# Validate file exists
validate_file_exists() {
    local FILE="$1"
    local LABEL="${2:-File}"

    if [ ! -f "$FILE" ]; then
        echo -e "${RED}❌ Error: $LABEL not found: $FILE${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ $LABEL exists: $FILE${NC}"
    return 0
}

# Check for required environment variable
validate_env_var() {
    local VAR_NAME="$1"
    local VAR_VALUE="${!VAR_NAME}"

    if [ -z "$VAR_VALUE" ]; then
        echo -e "${RED}❌ Error: Required environment variable not set: $VAR_NAME${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Environment variable set: $VAR_NAME${NC}"
    return 0
}

# Validate release notes updated
validate_release_notes() {
    local VERSION="$1"

    if [ -z "$VERSION" ]; then
        echo -e "${YELLOW}⚠️  No version specified, skipping release notes check${NC}"
        return 0
    fi

    if ! grep -q "$VERSION" docs/RELEASE_NOTES.md 2>/dev/null; then
        echo -e "${RED}❌ Error: Version $VERSION not found in docs/RELEASE_NOTES.md${NC}"
        echo "   Please update release notes before deploying"
        return 1
    fi

    echo -e "${GREEN}✅ Release notes updated for version $VERSION${NC}"
    return 0
}

# Validate health endpoint
validate_health_endpoint() {
    local URL="$1"
    local EXPECTED_ENV="${2:-}"

    echo -e "${BLUE}🔍 Checking health endpoint: $URL${NC}"

    local RESPONSE=$(curl -s "$URL" 2>/dev/null || echo "")

    if [ -z "$RESPONSE" ]; then
        echo -e "${RED}❌ Health endpoint not responding${NC}"
        return 1
    fi

    local STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    local ENV=$(echo "$RESPONSE" | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)

    if [ "$STATUS" != "healthy" ]; then
        echo -e "${RED}❌ Health check failed: status=$STATUS${NC}"
        return 1
    fi

    if [ -n "$EXPECTED_ENV" ] && [ "$ENV" != "$EXPECTED_ENV" ]; then
        echo -e "${RED}❌ Environment mismatch: expected=$EXPECTED_ENV, got=$ENV${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Health check passed: status=$STATUS, environment=$ENV${NC}"
    return 0
}

# Create backup
create_backup() {
    local SERVER="$1"
    local SOURCE_PATH="$2"
    local BACKUP_NAME="$3"

    echo -e "${BLUE}💾 Creating backup: $BACKUP_NAME${NC}"

    ssh "$SERVER" "
        cd $(dirname "$SOURCE_PATH") && \
        tar -czf ~/$BACKUP_NAME.tar.gz $(basename "$SOURCE_PATH") 2>/dev/null
    " || {
        echo -e "${RED}❌ Backup failed${NC}"
        return 1
    }

    local BACKUP_SIZE=$(ssh "$SERVER" "ls -lh ~/$BACKUP_NAME.tar.gz | awk '{print \$5}'")
    echo -e "${GREEN}✅ Backup created: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)${NC}"

    return 0
}

# Display deployment banner
deployment_banner() {
    local TIER="$1"
    local VERSION="${2:-}"

    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║        MANYLLA DEPLOYMENT - $TIER                               " | head -c 66 && echo "║"
    if [ -n "$VERSION" ]; then
        echo "║        Version: $VERSION                                        " | head -c 66 && echo "║"
    fi
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Display step header
step_header() {
    local STEP_NUM="$1"
    local TOTAL_STEPS="$2"
    local DESCRIPTION="$3"

    echo
    echo -e "${CYAN}─────────────────────────────────────────────────────────────────${NC}"
    echo -e "${CYAN}Step $STEP_NUM/$TOTAL_STEPS: $DESCRIPTION${NC}"
    echo -e "${CYAN}─────────────────────────────────────────────────────────────────${NC}"
}

# Display success message
deployment_success() {
    local TIER="$1"
    local URL="$2"
    local VERSION="${3:-}"

    echo
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}         DEPLOYMENT SUCCESSFUL - $TIER                          ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo
    if [ -n "$VERSION" ]; then
        echo -e "${GREEN}✅ Version: $VERSION${NC}"
    fi
    echo -e "${GREEN}✅ URL: $URL${NC}"
    echo
}

# Display error message
deployment_error() {
    local MESSAGE="$1"

    echo
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}         DEPLOYMENT FAILED                                      ${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${RED}❌ $MESSAGE${NC}"
    echo
}

# Confirm action
confirm_action() {
    local PROMPT="$1"
    local EXPECTED="${2:-YES}"

    read -p "$PROMPT" RESPONSE

    if [ "$RESPONSE" != "$EXPECTED" ]; then
        return 1
    fi

    return 0
}

# Run command with status indicator
run_with_status() {
    local DESCRIPTION="$1"
    shift
    local COMMAND="$@"

    echo -e "${BLUE}▶ $DESCRIPTION${NC}"

    if eval "$COMMAND"; then
        echo -e "${GREEN}  ✅ Success${NC}"
        return 0
    else
        echo -e "${RED}  ❌ Failed${NC}"
        return 1
    fi
}

# Export all functions
export -f command_exists
export -f validate_node_version
export -f validate_npm_version
export -f validate_git_repo
export -f check_git_status
export -f validate_ssh_connection
export -f validate_directory_exists
export -f validate_file_exists
export -f validate_env_var
export -f validate_release_notes
export -f validate_health_endpoint
export -f create_backup
export -f deployment_banner
export -f step_header
export -f deployment_success
export -f deployment_error
export -f confirm_action
export -f run_with_status
