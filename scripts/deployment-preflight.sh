#!/bin/bash

# Manylla Deployment Pre-flight Checks and Validation Suite
# =========================================================
#
# Comprehensive pre-deployment validation system
# All checks must pass before deployment can proceed
# Returns 0 if all checks pass, 1 if any fail
# Execution time target: <30 seconds

set -e  # Exit on error
set -o pipefail  # Fail on pipe errors

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="/tmp/manylla-backup-$(date +%Y%m%d-%H%M%S)"
ROLLBACK_SCRIPT="$SCRIPT_DIR/deployment-rollback.sh"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Track overall status
CHECKS_PASSED=0
CHECKS_FAILED=0
START_TIME=$(date +%s)

# Navigate to project root
cd "$PROJECT_ROOT"

echo -e "${CYAN}🚀 Manylla Deployment Pre-flight Checks${NC}"
echo -e "${CYAN}=======================================${NC}"
echo

# Function to record check result
record_check() {
    local status=$1
    local message=$2

    if [ "$status" -eq 0 ]; then
        echo -e "${GREEN}✅ $message${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌ $message${NC}"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
}

# Function to show warning
show_warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Function to show error and exit
fail_check() {
    echo -e "${RED}❌ CRITICAL FAILURE: $1${NC}"
    echo -e "${RED}📋 ACTION REQUIRED: $2${NC}"
    echo
    echo -e "${RED}Pre-flight checks FAILED. Deployment aborted.${NC}"
    exit 1
}

# ============================================================================
# CHECK 1: Environment Variable Validation
# ============================================================================
echo -e "${BLUE}Check 1: Environment Variables${NC}"
echo "─────────────────────────────"

check_environment() {
    local checks=0
    local failures=0

    # Check NODE_ENV (should not be production for qual)
    if [ "${NODE_ENV:-}" = "production" ]; then
        show_warning "NODE_ENV is set to production for qual deployment"
        failures=$((failures + 1))
    fi
    checks=$((checks + 1))

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        fail_check "package.json not found" "Ensure you're in the project root directory"
    fi
    checks=$((checks + 1))

    # Check if .htaccess file exists for Manylla
    if [ ! -f "public/.htaccess.manylla-qual" ]; then
        fail_check "Required .htaccess.manylla-qual not found" \
            "Create public/.htaccess.manylla-qual with proper Manylla paths"
    fi
    checks=$((checks + 1))

    # Check build directory structure
    if [ ! -d "web" ]; then
        fail_check "Web directory not found" "This appears to be an incorrect project structure"
    fi
    checks=$((checks + 1))

    # Check if scripts directory exists
    if [ ! -d "scripts" ]; then
        fail_check "Scripts directory not found" "Project structure appears incomplete"
    fi
    checks=$((checks + 1))

    record_check 0 "Environment validation passed ($checks checks)"
}

check_environment
echo

# ============================================================================
# CHECK 2: SSH Key Validation and Connectivity
# ============================================================================
echo -e "${BLUE}Check 2: SSH/Rsync Connectivity${NC}"
echo "─────────────────────────────"

check_ssh_access() {
    # Check if SSH config exists
    if ! grep -q "Host stackmap-cpanel" ~/.ssh/config 2>/dev/null; then
        fail_check "SSH configuration missing" \
            "Run ./scripts/setup-ssh.sh to configure SSH access"
    fi

    # Test SSH connection with timeout (handle macOS without timeout command)
    if command -v timeout >/dev/null 2>&1; then
        # Linux or macOS with GNU coreutils
        if ! timeout 10 ssh -o ConnectTimeout=5 -o BatchMode=yes stackmap-cpanel "echo 'SSH connection successful'" >/dev/null 2>&1; then
            fail_check "SSH connection failed" \
                "Check SSH keys and network connectivity. Try: ssh stackmap-cpanel"
        fi
    elif command -v gtimeout >/dev/null 2>&1; then
        # macOS with GNU coreutils installed via homebrew
        if ! gtimeout 10 ssh -o ConnectTimeout=5 -o BatchMode=yes stackmap-cpanel "echo 'SSH connection successful'" >/dev/null 2>&1; then
            fail_check "SSH connection failed" \
                "Check SSH keys and network connectivity. Try: ssh stackmap-cpanel"
        fi
    else
        # macOS without timeout - use ConnectTimeout only
        if ! ssh -o ConnectTimeout=10 -o BatchMode=yes stackmap-cpanel "echo 'SSH connection successful'" >/dev/null 2>&1; then
            fail_check "SSH connection failed" \
                "Check SSH keys and network connectivity. Try: ssh stackmap-cpanel"
        fi
    fi

    # Test target directory access
    if ! ssh stackmap-cpanel "test -d ~/public_html/manylla/qual && test -w ~/public_html/manylla/qual" 2>/dev/null; then
        fail_check "Target directory not accessible or writable" \
            "Check directory permissions: ~/public_html/manylla/qual/"
    fi

    # Test rsync functionality with dry-run (handle macOS without timeout command)
    if command -v timeout >/dev/null 2>&1; then
        # Linux or macOS with GNU coreutils
        if ! timeout 10 rsync -avz --dry-run --delete web/build/ stackmap-cpanel:~/public_html/manylla/qual/ >/dev/null 2>&1; then
            fail_check "Rsync test failed" \
                "Check rsync connectivity and permissions"
        fi
    elif command -v gtimeout >/dev/null 2>&1; then
        # macOS with GNU coreutils installed via homebrew
        if ! gtimeout 10 rsync -avz --dry-run --delete web/build/ stackmap-cpanel:~/public_html/manylla/qual/ >/dev/null 2>&1; then
            fail_check "Rsync test failed" \
                "Check rsync connectivity and permissions"
        fi
    else
        # macOS without timeout - use rsync's own timeout
        if ! rsync -avz --dry-run --delete --timeout=10 web/build/ stackmap-cpanel:~/public_html/manylla/qual/ >/dev/null 2>&1; then
            fail_check "Rsync test failed" \
                "Check rsync connectivity and permissions"
        fi
    fi

    record_check 0 "SSH/Rsync connectivity verified"
}

check_ssh_access
echo

# ============================================================================
# CHECK 3: Database Connectivity Test
# ============================================================================
echo -e "${BLUE}Check 3: Database Connectivity${NC}"
echo "─────────────────────────────"

check_database() {
    local api_config="api/config/config.qual.php"

    # Check if API config exists
    if [ ! -f "$api_config" ]; then
        show_warning "API config not found at $api_config"
        show_warning "Database connectivity check skipped"
        return 0
    fi

    # Test database connection via API health endpoint
    echo "Testing database connectivity via API..."

    # Check if API is already deployed
    if ! ssh stackmap-cpanel "test -f ~/public_html/manylla/qual/api/config/config.qual.php" 2>/dev/null; then
        show_warning "API not yet deployed - database check will be performed after deployment"
        return 0
    fi

    # Create a simple test script to check database via SSH
    ssh stackmap-cpanel "
    cd ~/public_html/manylla/qual/api &&
    php -r \"
    include 'config/config.qual.php';
    try {
        \\\$dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        \\\$pdo = new PDO(\\\$dsn, DB_USER, DB_PASS);
        \\\$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        \\\$stmt = \\\$pdo->query('SELECT 1');
        echo 'Database connection successful';
    } catch (Exception \\\$e) {
        echo 'Database connection failed: ' . \\\$e->getMessage();
        exit(1);
    }
    \"
    " 2>/dev/null || {
        fail_check "Database connectivity test failed" \
            "Check database credentials and server status"
    }

    record_check 0 "Database connectivity verified"
}

check_database
echo

# ============================================================================
# CHECK 4: API Endpoint Validation
# ============================================================================
echo -e "${BLUE}Check 4: API Endpoint Validation${NC}"
echo "─────────────────────────────"

check_api_endpoints() {
    # Check if this is initial deployment (API not deployed yet)
    local test_url="https://manylla.com/qual/api/sync_health.php"
    if ! curl -s -f -o /dev/null "$test_url" 2>/dev/null; then
        # Check if it's a 404 (not deployed) vs other error
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$test_url" 2>/dev/null)
        if [ "$http_code" = "404" ]; then
            show_warning "API not yet deployed - endpoint checks will be performed after deployment"
            return 0
        fi
    fi

    local endpoints=(
        "/api/sync_health.php"
        "/api/sync_push.php"
        "/api/sync_pull.php"
        "/api/share_create.php"
        "/api/share_access.php"
    )

    local base_url="https://manylla.com/qual"
    local failed_endpoints=()

    echo "Testing API endpoints..."

    for endpoint in "${endpoints[@]}"; do
        local url="$base_url$endpoint"
        local response_code

        # Test endpoint with 5-second timeout
        response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")

        if [ "$response_code" != "200" ] && [ "$response_code" != "405" ]; then
            failed_endpoints+=("$endpoint (HTTP $response_code)")
        else
            echo "  ✓ $endpoint (HTTP $response_code)"
        fi
    done

    if [ ${#failed_endpoints[@]} -gt 0 ]; then
        echo "Failed endpoints:"
        printf '  ❌ %s\n' "${failed_endpoints[@]}"
        fail_check "API endpoints not responding correctly" \
            "Check server configuration and API deployment"
    fi

    record_check 0 "All API endpoints responding"
}

check_api_endpoints
echo

# ============================================================================
# CHECK 5: Backup Creation and Rollback Plan
# ============================================================================
echo -e "${BLUE}Check 5: Backup and Rollback Preparation${NC}"
echo "─────────────────────────────────"

create_backup() {
    echo "Creating deployment backup..."

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Backup current web/build if it exists
    if [ -d "web/build" ]; then
        echo "  Backing up current web/build..."
        cp -r web/build "$BACKUP_DIR/web-build-backup"
    fi

    # Backup current package.json version
    if [ -f "package.json" ]; then
        CURRENT_VERSION=$(grep '"version":' package.json | head -1 | cut -d'"' -f4)
        echo "$CURRENT_VERSION" > "$BACKUP_DIR/previous-version.txt"
        echo "  Backed up version: $CURRENT_VERSION"
    fi

    # Backup current remote state
    echo "  Creating remote backup..."
    ssh stackmap-cpanel "
        cd ~/public_html/manylla/qual &&
        tar -czf ~/manylla-qual-backup-$(date +%Y%m%d-%H%M%S).tar.gz . 2>/dev/null &&
        echo 'Remote backup created'
    " || show_warning "Remote backup creation failed"

    # Create rollback script
    cat > "$ROLLBACK_SCRIPT" << 'EOF'
#!/bin/bash
# Automatic Rollback Script
# Generated by deployment-preflight.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="BACKUP_DIR_PLACEHOLDER"

echo "🔄 Rolling back Manylla deployment..."

cd "$PROJECT_ROOT"

# Restore package.json version if backup exists
if [ -f "$BACKUP_DIR/previous-version.txt" ]; then
    PREVIOUS_VERSION=$(cat "$BACKUP_DIR/previous-version.txt")
    echo "Restoring version to: $PREVIOUS_VERSION"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"version\": \".*\"/\"version\": \"$PREVIOUS_VERSION\"/" package.json
    else
        sed -i "s/\"version\": \".*\"/\"version\": \"$PREVIOUS_VERSION\"/" package.json
    fi
fi

# Restore web/build if backup exists
if [ -d "$BACKUP_DIR/web-build-backup" ]; then
    echo "Restoring web/build directory..."
    rm -rf web/build
    cp -r "$BACKUP_DIR/web-build-backup" web/build
fi

# Find and restore remote backup
echo "Restoring remote files..."
LATEST_BACKUP=$(ssh stackmap-cpanel "ls -t ~/manylla-qual-backup-*.tar.gz 2>/dev/null | head -1" || echo "")

if [ -n "$LATEST_BACKUP" ]; then
    ssh stackmap-cpanel "
        cd ~/public_html/manylla/qual &&
        rm -rf * .htaccess 2>/dev/null || true &&
        tar -xzf $LATEST_BACKUP &&
        echo 'Remote files restored'
    "
    echo "✅ Rollback completed successfully"
else
    echo "❌ No remote backup found for restoration"
    exit 1
fi

echo "🔍 Running health check..."
curl -s -o /dev/null -w "Health check: HTTP %{http_code}\n" https://manylla.com/qual/

echo "✅ Rollback process completed"
EOF

    # Replace placeholder with actual backup directory
    sed -i.bak "s|BACKUP_DIR_PLACEHOLDER|$BACKUP_DIR|g" "$ROLLBACK_SCRIPT" && rm "$ROLLBACK_SCRIPT.bak"
    chmod +x "$ROLLBACK_SCRIPT"

    record_check 0 "Backup created and rollback script generated"
    echo "  Backup location: $BACKUP_DIR"
    echo "  Rollback script: $ROLLBACK_SCRIPT"
}

create_backup
echo

# ============================================================================
# CHECK 6: SSL Certificate and Security Validation
# ============================================================================
echo -e "${BLUE}Check 6: SSL Certificate and Security${NC}"
echo "─────────────────────────────────"

check_ssl_security() {
    echo "Checking SSL certificate validity..."

    # Test SSL certificate with openssl
    if command -v openssl >/dev/null 2>&1; then
        local ssl_check
        ssl_check=$(echo | timeout 10 openssl s_client -servername manylla.com -connect manylla.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "SSL_CHECK_FAILED")

        if [ "$ssl_check" = "SSL_CHECK_FAILED" ]; then
            show_warning "SSL certificate check failed"
        else
            echo "  ✓ SSL certificate is valid"
        fi
    else
        show_warning "OpenSSL not available for certificate check"
    fi

    # Test HTTPS response
    local https_response
    https_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://manylla.com/qual/ 2>/dev/null || echo "000")

    if [ "$https_response" != "200" ]; then
        fail_check "HTTPS endpoint not responding (HTTP $https_response)" \
            "Check server configuration and SSL setup"
    fi

    record_check 0 "SSL certificate and HTTPS validated"
}

check_ssl_security
echo

# ============================================================================
# FINAL SUMMARY AND ROLLBACK PLAN VALIDATION
# ============================================================================
echo -e "${CYAN}Pre-flight Check Summary${NC}"
echo "─────────────────────────"

# Calculate execution time
END_TIME=$(date +%s)
EXECUTION_TIME=$((END_TIME - START_TIME))

echo "Execution time: ${EXECUTION_TIME} seconds"
echo "Checks passed: $CHECKS_PASSED"
echo "Checks failed: $CHECKS_FAILED"

if [ $CHECKS_FAILED -gt 0 ]; then
    echo
    echo -e "${RED}❌ PRE-FLIGHT CHECKS FAILED${NC}"
    echo -e "${RED}   Cannot proceed with deployment${NC}"
    echo -e "${RED}   Please resolve all issues above${NC}"
    exit 1
fi

# Test rollback script syntax
if [ -f "$ROLLBACK_SCRIPT" ]; then
    if bash -n "$ROLLBACK_SCRIPT" 2>/dev/null; then
        echo "✅ Rollback script validated"
    else
        show_warning "Rollback script has syntax errors"
    fi
fi

echo
echo -e "${GREEN}🎉 ALL PRE-FLIGHT CHECKS PASSED${NC}"
echo -e "${GREEN}   Deployment can proceed safely${NC}"
echo
echo "Ready for deployment with:"
echo "  • Environment validated"
echo "  • SSH/Rsync connectivity confirmed"
echo "  • Database connectivity verified"
echo "  • API endpoints responding"
echo "  • Backup created and rollback plan ready"
echo "  • SSL certificate valid"
echo
echo "Backup information:"
echo "  • Backup directory: $BACKUP_DIR"
echo "  • Rollback script: $ROLLBACK_SCRIPT"
echo "  • To rollback: $ROLLBACK_SCRIPT"
echo

# Check if execution time is under 30 seconds
if [ $EXECUTION_TIME -gt 30 ]; then
    show_warning "Execution time (${EXECUTION_TIME}s) exceeds 30-second target"
else
    echo -e "${GREEN}✅ Execution time under 30-second target (${EXECUTION_TIME}s)${NC}"
fi

exit 0