#!/bin/bash
# =============================================================================
# Kill Dev Servers - Development server cleanup utility
# =============================================================================
# Terminates common development server processes and frees development ports
# Part of Manylla project automation suite
# =============================================================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PORT_MANAGER="$SCRIPT_DIR/port-manager.sh"

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

main() {
    local clean_ports=true
    local force=false
    local interactive=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-ports)
                clean_ports=false
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --interactive)
                interactive=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Unknown option: $1${NC}"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    echo -e "${BLUE}🔄 Development Server Cleanup${NC}"
    echo "==============================="
    echo ""

    if [[ "$interactive" == "true" ]]; then
        run_interactive_cleanup
    else
        run_automatic_cleanup "$clean_ports" "$force"
    fi
}

run_automatic_cleanup() {
    local clean_ports="$1"
    local force="$2"

    # Step 1: Kill development server processes
    echo -e "${YELLOW}Step 1: Terminating development server processes...${NC}"
    local force_arg=""
    if [[ "$force" == "true" ]]; then
        force_arg="--force"
    fi

    "$PORT_MANAGER" $force_arg kill-dev-servers

    echo ""

    # Step 2: Clean development ports if requested
    if [[ "$clean_ports" == "true" ]]; then
        echo -e "${YELLOW}Step 2: Cleaning development ports...${NC}"

        if [[ "$force" == "true" ]]; then
            "$PORT_MANAGER" force-clean
        else
            "$PORT_MANAGER" clean
        fi
    else
        echo -e "${YELLOW}Step 2: Skipping port cleanup (--no-ports specified)${NC}"
    fi

    echo ""
    echo -e "${GREEN}✅ Development server cleanup complete${NC}"
}

run_interactive_cleanup() {
    echo "What would you like to clean up?"
    echo ""
    echo "1) Kill dev servers only"
    echo "2) Kill dev servers + clean ports"
    echo "3) Force kill everything (SIGKILL)"
    echo "4) Show what's running first"
    echo "5) Exit"
    echo ""

    read -p "Choose an option (1-5): " choice

    case "$choice" in
        1)
            echo ""
            "$PORT_MANAGER" kill-dev-servers
            ;;
        2)
            echo ""
            "$PORT_MANAGER" kill-dev-servers
            echo ""
            "$PORT_MANAGER" clean
            ;;
        3)
            echo ""
            echo -e "${YELLOW}⚠️  This will force kill processes (SIGKILL)${NC}"
            read -p "Are you sure? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                "$PORT_MANAGER" --force kill-dev-servers
                echo ""
                "$PORT_MANAGER" force-clean
            else
                echo "Cancelled."
                exit 0
            fi
            ;;
        4)
            echo ""
            "$PORT_MANAGER" check
            echo ""
            echo "Now choose cleanup action:"
            run_interactive_cleanup
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            exit 1
            ;;
    esac

    echo ""
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

show_help() {
    cat << EOF
Kill Dev Servers - Development server cleanup utility

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --no-ports      Don't clean ports, only kill server processes
    --force         Use SIGKILL instead of SIGTERM (more aggressive)
    --interactive   Interactive mode with guided cleanup options
    --help, -h      Show this help message

EXAMPLES:
    $0                    # Kill dev servers and clean ports
    $0 --no-ports        # Kill dev servers only
    $0 --force           # Force kill servers and ports
    $0 --interactive     # Interactive guided cleanup

WHAT THIS SCRIPT DOES:
    1. Identifies and terminates common development server processes:
       - webpack-dev-server, webpack serve
       - react-scripts start
       - next dev
       - vite
       - npm run dev/start/web
       - node dev processes
       - nodemon

    2. Optionally cleans development ports:
       - 3000, 3001, 8080, 8081, 5000, 5001, 4000, 4001, 9000, 9001

SAFETY:
    - Will NOT terminate protected system processes
    - Uses graceful termination (SIGTERM) by default
    - Provides confirmation for destructive operations

This script combines process termination and port cleanup for complete
development environment reset.

For more granular control, use the individual tools:
    $PORT_MANAGER help
    $SCRIPT_DIR/free-port.sh --help
    $SCRIPT_DIR/check-ports.sh --help
EOF
}

# Show help if no arguments and script called with --help
if [[ $# -eq 0 ]] && [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    show_help
    exit 0
fi

main "$@"