#!/bin/bash
# =============================================================================
# Free Port - Quick port cleanup utility
# =============================================================================
# Simple wrapper around port-manager.sh for freeing specific ports
# Part of Manylla project automation suite
# =============================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PORT_MANAGER="$SCRIPT_DIR/port-manager.sh"

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

main() {
    if [[ $# -eq 0 ]]; then
        echo -e "${RED}❌ Error: Port number required${NC}"
        echo ""
        echo "Usage: $0 PORT [--force]"
        echo "Examples:"
        echo "  $0 3000          # Free port 3000 gracefully"
        echo "  $0 3000 --force  # Force free port 3000 (SIGKILL)"
        echo ""
        echo "For multiple ports or advanced options, use: $PORT_MANAGER help"
        exit 1
    fi

    local port="$1"
    local force_arg=""

    # Validate port number
    if ! [[ "$port" =~ ^[0-9]+$ ]] || [[ $port -lt 1 ]] || [[ $port -gt 65535 ]]; then
        echo -e "${RED}❌ Error: Invalid port number '$port'${NC}"
        echo "Port must be a number between 1 and 65535"
        exit 1
    fi

    # Check for force flag
    if [[ "${2:-}" == "--force" ]]; then
        force_arg="--force"
        echo -e "${YELLOW}⚠️  Using force mode (SIGKILL)${NC}"
    fi

    echo -e "${YELLOW}🔧 Freeing port $port...${NC}"
    echo ""

    # Use port-manager to clean the port
    if "$PORT_MANAGER" $force_arg clean "$port"; then
        echo ""
        echo -e "${GREEN}✅ Port $port is now free${NC}"
        exit 0
    else
        echo ""
        echo -e "${RED}❌ Failed to free port $port${NC}"
        echo "Try using --force option or check the port-manager log"
        exit 1
    fi
}

# Show help if requested
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    cat << EOF
Free Port - Quick port cleanup utility

USAGE:
    $0 PORT [--force]

ARGUMENTS:
    PORT        Port number to free (1-65535)

OPTIONS:
    --force     Use SIGKILL instead of SIGTERM (more aggressive)

EXAMPLES:
    $0 3000          # Gracefully free port 3000
    $0 3000 --force  # Force free port 3000 using SIGKILL
    $0 8080          # Free port 8080

NOTES:
    - This script will NOT terminate protected system processes
    - Use --force only when graceful termination fails
    - For multiple ports, use: $PORT_MANAGER clean

This is a simple wrapper around port-manager.sh for quick single-port cleanup.
For more advanced options, use: $PORT_MANAGER help
EOF
    exit 0
fi

main "$@"