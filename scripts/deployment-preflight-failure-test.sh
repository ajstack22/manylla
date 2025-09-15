#!/bin/bash

# Manylla Deployment Pre-flight Checks - FAILURE TEST VERSION
# ===========================================================
#
# Test version that simulates various failure scenarios
# to demonstrate error handling and clear error messages

set -e
set -o pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Track overall status
CHECKS_PASSED=0
CHECKS_FAILED=0
START_TIME=$(date +%s)

# Navigate to project root
cd "$PROJECT_ROOT"

echo -e "${CYAN}🚀 Manylla Deployment Pre-flight Checks (FAILURE TEST)${NC}"
echo -e "${CYAN}=====================================================${NC}"
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

# Function to show error and exit
fail_check() {
    echo -e "${RED}❌ CRITICAL FAILURE: $1${NC}"
    echo -e "${RED}📋 ACTION REQUIRED: $2${NC}"
    echo
    echo -e "${RED}Pre-flight checks FAILED. Deployment aborted.${NC}"
    exit 1
}

# ============================================================================
# CHECK 1: Environment Variable Validation - SIMULATE FAILURES
# ============================================================================
echo -e "${BLUE}Check 1: Environment Variables (Simulated Failures)${NC}"
echo "─────────────────────────────────────────"

# Simulate missing .htaccess file
echo "  ❌ Required .htaccess.manylla-qual not found"
echo "  ❌ Web directory structure invalid"
echo "  ⚠️  NODE_ENV set to production for qual deployment"

fail_check "Environment validation failed" \
    "Create public/.htaccess.manylla-qual with proper Manylla paths"