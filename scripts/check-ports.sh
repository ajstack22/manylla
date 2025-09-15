#!/bin/bash
# =============================================================================
# Check Ports - Quick port status checker
# =============================================================================
# Simple wrapper around port-manager.sh for checking port status
# Part of Manylla project automation suite
# =============================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PORT_MANAGER="$SCRIPT_DIR/port-manager.sh"

# Color codes
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

main() {
    echo -e "${YELLOW}🔍 Checking development ports...${NC}"
    echo ""

    if [[ $# -eq 0 ]]; then
        # Check default ports
        "$PORT_MANAGER" check
    else
        # Check specified ports
        "$PORT_MANAGER" check "$@"
    fi

    local exit_code=$?

    if [[ $exit_code -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}✅ All checked ports are free and ready for development${NC}"
    fi

    exit $exit_code
}

# Show help if requested
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    cat << EOF
Check Ports - Quick port status checker

USAGE:
    $0 [PORT|RANGE]

EXAMPLES:
    $0                  # Check default development ports
    $0 3000            # Check port 3000
    $0 3000:3010       # Check port range 3000-3010

This is a simple wrapper around port-manager.sh for quick port checking.
For more advanced options, use: $PORT_MANAGER help
EOF
    exit 0
fi

main "$@"