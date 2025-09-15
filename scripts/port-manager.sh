#!/bin/bash
# =============================================================================
# Port Manager - Automated port management and cleanup tool
# =============================================================================
# Detects port conflicts, identifies processes, and safely terminates them
# Supports interactive mode, batch operations, and custom port ranges
# Part of Manylla project automation suite
# =============================================================================

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly LOG_FILE="$PROJECT_ROOT/port-manager.log"

# Default ports to check (common development ports)
readonly DEFAULT_PORTS=(3000 3001 8080 8081 5000 5001 4000 4001 9000 9001)

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Critical system processes that should NEVER be killed
readonly PROTECTED_PROCESSES=(
    "systemd"
    "kernel_task"
    "launchd"
    "WindowServer"
    "Finder"
    "Safari"
    "Chrome"
    "firefox"
    "loginwindow"
    "sshd"
    "ssh"
)

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"

    case "$level" in
        "ERROR")
            echo -e "${RED}❌ $message${NC}" >&2
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${GREEN}ℹ️  $message${NC}"
            ;;
        "DEBUG")
            if [[ "${DEBUG:-}" == "1" ]]; then
                echo -e "${CYAN}🔍 $message${NC}"
            fi
            ;;
    esac
}

# Initialize log file
init_logging() {
    mkdir -p "$(dirname "$LOG_FILE")"
    log "INFO" "Port Manager started - PID: $$"
}

# Check if a port is in use and get process information
check_port() {
    local port="$1"
    local result

    if command -v lsof >/dev/null 2>&1; then
        # Use lsof (more detailed, works on macOS and Linux)
        result=$(lsof -i ":$port" -t 2>/dev/null || true)
    elif command -v netstat >/dev/null 2>&1; then
        # Fallback to netstat (less detailed but more universal)
        result=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 || true)
    else
        log "ERROR" "Neither lsof nor netstat available for port checking"
        return 1
    fi

    if [[ -n "$result" ]]; then
        echo "$result"
        return 0
    else
        return 1
    fi
}

# Get detailed process information for a PID
get_process_info() {
    local pid="$1"
    local process_info

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        process_info=$(ps -p "$pid" -o pid,ppid,user,command 2>/dev/null || echo "Process not found")
    else
        # Linux
        process_info=$(ps -p "$pid" -o pid,ppid,user,cmd 2>/dev/null || echo "Process not found")
    fi

    echo "$process_info"
}

# Check if a process is protected (critical system process)
is_protected_process() {
    local pid="$1"
    local process_name

    if [[ "$OSTYPE" == "darwin"* ]]; then
        process_name=$(ps -p "$pid" -o comm= 2>/dev/null | xargs basename 2>/dev/null || echo "unknown")
    else
        process_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
    fi

    for protected in "${PROTECTED_PROCESSES[@]}"; do
        if [[ "$process_name" == *"$protected"* ]]; then
            return 0
        fi
    done

    return 1
}

# Show what processes are using specific ports
show_port_usage() {
    local ports=("$@")
    local found_processes=0

    echo -e "${BLUE}🔍 Port Usage Report${NC}"
    echo "=========================="

    for port in "${ports[@]}"; do
        local pids
        if pids=$(check_port "$port"); then
            found_processes=1
            echo -e "${YELLOW}Port $port:${NC}"

            # Handle multiple PIDs (space or newline separated)
            for pid in $pids; do
                if [[ "$pid" =~ ^[0-9]+$ ]]; then
                    local process_info
                    process_info=$(get_process_info "$pid")
                    echo "  PID: $pid"
                    echo "  $process_info"

                    if is_protected_process "$pid"; then
                        echo -e "  ${RED}⚠️  PROTECTED PROCESS - Will not terminate${NC}"
                    fi
                    echo ""
                fi
            done
        fi
    done

    if [[ $found_processes -eq 0 ]]; then
        echo -e "${GREEN}✅ All specified ports are free${NC}"
    fi

    return $found_processes
}

# Kill process using a specific port
kill_port_process() {
    local port="$1"
    local force="${2:-false}"
    local signal="TERM"

    if [[ "$force" == "true" ]]; then
        signal="KILL"
    fi

    local pids
    if ! pids=$(check_port "$port"); then
        log "INFO" "Port $port is already free"
        return 0
    fi

    log "INFO" "Attempting to free port $port"

    for pid in $pids; do
        if [[ ! "$pid" =~ ^[0-9]+$ ]]; then
            continue
        fi

        if is_protected_process "$pid"; then
            log "WARN" "Skipping protected process PID $pid on port $port"
            continue
        fi

        local process_info
        process_info=$(get_process_info "$pid")
        log "INFO" "Killing PID $pid ($signal): $process_info"

        if kill -"$signal" "$pid" 2>/dev/null; then
            log "INFO" "Successfully sent $signal signal to PID $pid"

            # Wait for process to terminate
            local max_wait=5
            local count=0
            while kill -0 "$pid" 2>/dev/null && [[ $count -lt $max_wait ]]; do
                sleep 1
                ((count++))
            done

            if kill -0 "$pid" 2>/dev/null; then
                if [[ "$signal" == "TERM" ]]; then
                    log "WARN" "Process $pid did not terminate gracefully, trying SIGKILL"
                    kill -KILL "$pid" 2>/dev/null || true
                    sleep 1
                fi
            fi

            if ! kill -0 "$pid" 2>/dev/null; then
                log "INFO" "Successfully freed port $port (PID $pid terminated)"
            else
                log "ERROR" "Failed to terminate PID $pid on port $port"
                return 1
            fi
        else
            log "ERROR" "Failed to send $signal signal to PID $pid"
            return 1
        fi
    done

    return 0
}

# Clean up all default development ports
cleanup_all_ports() {
    local force="${1:-false}"
    local failed_ports=()

    log "INFO" "Starting cleanup of all default development ports"
    echo -e "${BLUE}🧹 Cleaning up all development ports...${NC}"

    for port in "${DEFAULT_PORTS[@]}"; do
        if check_port "$port" >/dev/null; then
            echo -e "Cleaning port ${YELLOW}$port${NC}..."
            if ! kill_port_process "$port" "$force"; then
                failed_ports+=("$port")
            fi
        fi
    done

    if [[ ${#failed_ports[@]} -eq 0 ]]; then
        echo -e "${GREEN}✅ All ports cleaned successfully${NC}"
        log "INFO" "All ports cleaned successfully"
        return 0
    else
        echo -e "${RED}❌ Failed to clean ports: ${failed_ports[*]}${NC}"
        log "ERROR" "Failed to clean ports: ${failed_ports[*]}"
        return 1
    fi
}

# Interactive port cleanup
interactive_cleanup() {
    echo -e "${BLUE}🤖 Interactive Port Cleanup${NC}"
    echo "==============================="

    # Show current port usage
    if ! show_port_usage "${DEFAULT_PORTS[@]}"; then
        echo -e "${GREEN}✅ No ports in use. Nothing to clean up.${NC}"
        return 0
    fi

    echo ""
    echo "Options:"
    echo "1) Clean all development ports"
    echo "2) Clean specific port"
    echo "3) Force clean all (SIGKILL)"
    echo "4) Show detailed process info"
    echo "5) Exit"

    read -p "Choose an option (1-5): " choice

    case "$choice" in
        1)
            cleanup_all_ports false
            ;;
        2)
            read -p "Enter port number: " port
            if [[ "$port" =~ ^[0-9]+$ ]] && [[ $port -ge 1 ]] && [[ $port -le 65535 ]]; then
                kill_port_process "$port" false
            else
                echo -e "${RED}❌ Invalid port number${NC}"
                return 1
            fi
            ;;
        3)
            echo -e "${YELLOW}⚠️  This will force kill processes (SIGKILL)${NC}"
            read -p "Are you sure? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                cleanup_all_ports true
            fi
            ;;
        4)
            for port in "${DEFAULT_PORTS[@]}"; do
                if pids=$(check_port "$port"); then
                    echo -e "\n${YELLOW}Detailed info for port $port:${NC}"
                    for pid in $pids; do
                        if [[ "$pid" =~ ^[0-9]+$ ]]; then
                            get_process_info "$pid"
                        fi
                    done
                fi
            done
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            return 1
            ;;
    esac
}

# Scan a range of ports
scan_port_range() {
    local start_port="$1"
    local end_port="$2"
    local used_ports=()

    echo -e "${BLUE}🔍 Scanning ports $start_port-$end_port...${NC}"

    for ((port=start_port; port<=end_port; port++)); do
        if check_port "$port" >/dev/null; then
            used_ports+=("$port")
        fi
    done

    if [[ ${#used_ports[@]} -eq 0 ]]; then
        echo -e "${GREEN}✅ No ports in use in range $start_port-$end_port${NC}"
        return 0
    else
        echo -e "${YELLOW}📊 Found ${#used_ports[@]} ports in use:${NC}"
        show_port_usage "${used_ports[@]}"
        return 1
    fi
}

# Performance test for port scanning
performance_test() {
    echo -e "${BLUE}⚡ Performance Test${NC}"
    echo "=================="

    local start_time
    start_time=$(date +%s.%N)

    # Test port scanning speed
    local test_ports=(3000 3001 8080 8081 5000)
    for port in "${test_ports[@]}"; do
        check_port "$port" >/dev/null || true
    done

    local end_time
    end_time=$(date +%s.%N)
    local duration
    duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "< 0.1")

    echo "✅ Scanned ${#test_ports[@]} ports in ${duration}s"

    # Test cleanup speed
    start_time=$(date +%s.%N)
    show_port_usage "${DEFAULT_PORTS[@]}" >/dev/null
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "< 0.1")

    echo "✅ Generated port report in ${duration}s"
}

# Kill common development servers
kill_dev_servers() {
    local common_dev_commands=(
        "webpack-dev-server"
        "webpack serve"
        "react-scripts start"
        "next dev"
        "vite"
        "npm run dev"
        "npm run start"
        "npm run web"
        "node.*dev"
        "nodemon"
    )

    echo -e "${BLUE}🔄 Killing common development servers...${NC}"

    local killed_any=false

    for cmd_pattern in "${common_dev_commands[@]}"; do
        local pids
        if [[ "$OSTYPE" == "darwin"* ]]; then
            pids=$(pgrep -f "$cmd_pattern" 2>/dev/null || true)
        else
            pids=$(pgrep -f "$cmd_pattern" 2>/dev/null || true)
        fi

        if [[ -n "$pids" ]]; then
            for pid in $pids; do
                if [[ "$pid" =~ ^[0-9]+$ ]] && ! is_protected_process "$pid"; then
                    local process_info
                    process_info=$(get_process_info "$pid")
                    echo "Killing development server: $process_info"
                    kill -TERM "$pid" 2>/dev/null || true
                    killed_any=true
                fi
            done
        fi
    done

    if [[ "$killed_any" == "true" ]]; then
        sleep 2
        echo -e "${GREEN}✅ Development servers terminated${NC}"
    else
        echo -e "${GREEN}✅ No development servers found${NC}"
    fi
}

# Show help
show_help() {
    cat << EOF
Port Manager - Automated port management and cleanup tool

USAGE:
    $0 [OPTIONS] [COMMAND]

COMMANDS:
    check                   Check port usage for default development ports
    check PORT              Check specific port
    check START:END         Check port range
    clean                   Clean all default development ports
    clean PORT              Clean specific port
    clean-all              Clean all development ports (alias for clean)
    force-clean            Force clean all ports using SIGKILL
    interactive            Interactive cleanup mode
    kill-dev-servers       Kill common development server processes
    scan START END         Scan port range and show usage
    performance-test       Run performance benchmarks
    help                   Show this help message

OPTIONS:
    --force                Use SIGKILL instead of SIGTERM
    --verbose              Enable verbose logging
    --debug                Enable debug output
    --quiet                Minimal output

EXAMPLES:
    $0 check                    # Check default development ports
    $0 check 3000              # Check if port 3000 is in use
    $0 check 3000:3010         # Check port range 3000-3010
    $0 clean 3000              # Free port 3000
    $0 clean                   # Free all default development ports
    $0 force-clean             # Force clean all ports
    $0 interactive             # Interactive mode
    $0 kill-dev-servers        # Kill development servers
    $0 scan 8000 8100          # Scan ports 8000-8100

DEFAULT PORTS CHECKED:
    ${DEFAULT_PORTS[*]}

LOG FILE:
    $LOG_FILE

EOF
}

# Main function
main() {
    init_logging

    local force=false
    local verbose=false
    local quiet=false

    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force=true
                shift
                ;;
            --verbose)
                verbose=true
                shift
                ;;
            --debug)
                export DEBUG=1
                shift
                ;;
            --quiet)
                quiet=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            check)
                shift
                if [[ $# -gt 0 ]]; then
                    local target="$1"
                    if [[ "$target" == *":"* ]]; then
                        # Port range
                        local start_port="${target%:*}"
                        local end_port="${target#*:}"
                        scan_port_range "$start_port" "$end_port"
                    else
                        # Single port
                        if show_port_usage "$target"; then
                            exit 1
                        else
                            exit 0
                        fi
                    fi
                else
                    # Default ports
                    if show_port_usage "${DEFAULT_PORTS[@]}"; then
                        exit 1
                    else
                        exit 0
                    fi
                fi
                exit $?
                ;;
            clean|clean-all)
                shift
                if [[ $# -gt 0 ]]; then
                    # Specific port
                    kill_port_process "$1" "$force"
                else
                    # All ports
                    cleanup_all_ports "$force"
                fi
                exit $?
                ;;
            force-clean)
                cleanup_all_ports true
                exit $?
                ;;
            interactive)
                interactive_cleanup
                exit $?
                ;;
            kill-dev-servers)
                kill_dev_servers
                exit $?
                ;;
            scan)
                shift
                if [[ $# -lt 2 ]]; then
                    echo -e "${RED}❌ Scan requires start and end port${NC}"
                    exit 1
                fi
                scan_port_range "$1" "$2"
                exit $?
                ;;
            performance-test)
                performance_test
                exit $?
                ;;
            help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Unknown command: $1${NC}"
                echo "Use '$0 help' for usage information"
                exit 1
                ;;
        esac
    done

    # Default action if no command specified
    echo -e "${BLUE}🔍 Port Manager - Default Action${NC}"
    echo "================================="

    if show_port_usage "${DEFAULT_PORTS[@]}"; then
        echo ""
        echo "Use '$0 interactive' for guided cleanup"
        echo "Use '$0 clean' to free all development ports"
        echo "Use '$0 help' for more options"
        exit 1
    else
        exit 0
    fi
}

# Run main function with all arguments
main "$@"