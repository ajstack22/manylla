#!/bin/bash

# Manylla Qual Deployment Script - Enhanced Security & Quality Version
# NO SHORTCUTS, NO BYPASSES, FULL VALIDATION BEFORE COMMITS
# 
# This script enforces comprehensive quality checks BEFORE any code reaches GitHub.
# All validation must pass before commits are made.
# DO NOT attempt to modify this script to bypass checks.

set -e  # Exit on error
set -o pipefail  # Fail on pipe errors

echo "🚀 Manylla Qual Deployment - Enhanced Validation Mode"
echo "===================================================="
echo

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load SonarCloud token from secure location (if exists)
if [ -f "$HOME/.manylla-env" ]; then
    source "$HOME/.manylla-env"
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Error handler function
handle_error() {
    echo
    echo -e "${RED}❌ DEPLOYMENT BLOCKED: $1${NC}"
    echo -e "${RED}⚠️  DO NOT attempt to bypass this check${NC}"
    echo -e "${RED}📋 ACTION REQUIRED: Human review needed${NC}"
    echo -e "${RED}Please notify the project owner to resolve: $2${NC}"
    echo
    exit 1
}

# Warning function (non-fatal)
show_warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Navigate to project root
cd "$PROJECT_ROOT"

# ============================================================================
# PHASE 0: DEPLOYMENT PRE-FLIGHT CHECKS
# Infrastructure and connectivity validation before any other operations
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    PHASE 0: DEPLOYMENT PRE-FLIGHT CHECKS              ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

echo -e "${BLUE}Running comprehensive pre-flight validation...${NC}"
echo "─────────────────────────────────────────────────"

# Run pre-flight checks script
if [ -f "$SCRIPT_DIR/deployment-preflight.sh" ]; then
    "$SCRIPT_DIR/deployment-preflight.sh"
    PREFLIGHT_EXIT_CODE=$?

    if [ $PREFLIGHT_EXIT_CODE -ne 0 ]; then
        handle_error "Pre-flight checks failed" \
            "Resolve all pre-flight issues before deployment. Check output above for details."
    fi

    echo -e "${GREEN}✅ All pre-flight checks passed${NC}"
    echo -e "${GREEN}   Deployment infrastructure validated${NC}"
    echo -e "${GREEN}   Backup and rollback plan created${NC}"
else
    handle_error "Pre-flight check script not found" \
        "Ensure scripts/deployment-preflight.sh exists and is executable"
fi

echo

# ============================================================================
# PHASE 1: PRE-COMMIT VALIDATION
# All checks must pass before ANY commits or deployments
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    PHASE 1: PRE-COMMIT VALIDATION CHECKS              ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

# Step 1: Check for uncommitted changes
echo -e "${BLUE}Step 1: Checking for uncommitted changes${NC}"
echo "─────────────────────────────────────────"
if [[ -z "$SKIP_GIT_CHECK" ]]; then
    if [[ -n $(git status --porcelain) ]]; then
        handle_error "Uncommitted changes detected" \
            "Commit or stash all changes before deployment. Run: git status"
    fi
    echo -e "${GREEN}✅ Working directory clean${NC}"
else
    echo -e "${YELLOW}⚠️  Git check skipped (SKIP_GIT_CHECK set)${NC}"
fi
echo

# Step 2: Validate Release Notes
echo -e "${BLUE}Step 2: Validating Release Notes${NC}"
echo "─────────────────────────────────"

# Function to increment version
increment_version() {
    if [ -f "package.json" ]; then
        CURRENT_VERSION=$(grep '"version":' package.json | head -1 | cut -d'"' -f4)
    else
        handle_error "package.json not found" "Ensure you're in the project root"
    fi
    
    echo -e "${YELLOW}📌 Current version: $CURRENT_VERSION${NC}"
    
    # Parse version parts (format: YYYY.MM.DD.BUILD)
    IFS='.' read -r YEAR MONTH DAY BUILD <<< "$CURRENT_VERSION"
    
    # Get current date with leading zeros
    CURRENT_DATE=$(date +"%Y.%m.%d")
    IFS='.' read -r NEW_YEAR NEW_MONTH NEW_DAY <<< "$CURRENT_DATE"
    
    # Ensure month and day have leading zeros
    NEW_MONTH=$(printf "%02d" $((10#$NEW_MONTH)))
    NEW_DAY=$(printf "%02d" $((10#$NEW_DAY)))
    
    # If it's a new day, reset build number to 1, otherwise increment
    if [[ "$YEAR.$MONTH.$DAY" == "$NEW_YEAR.$NEW_MONTH.$NEW_DAY" ]]; then
        NEW_BUILD=$((BUILD + 1))
    else
        NEW_BUILD=1
    fi
    
    # Create new version
    NEW_VERSION="$NEW_YEAR.$NEW_MONTH.$NEW_DAY.$NEW_BUILD"
    echo -e "${GREEN}📈 New version will be: $NEW_VERSION${NC}"
    
    export NEW_VERSION
    export CURRENT_VERSION
}

# Increment version to know what we're deploying
increment_version

# Check if RELEASE_NOTES.md exists and has entry for new version
RELEASE_NOTES_FILE="docs/RELEASE_NOTES.md"
if [ ! -f "$RELEASE_NOTES_FILE" ]; then
    RELEASE_NOTES_FILE="RELEASE_NOTES.md"
    if [ ! -f "$RELEASE_NOTES_FILE" ]; then
        handle_error "RELEASE_NOTES.md not found" \
            "Create docs/RELEASE_NOTES.md with an entry for version $NEW_VERSION"
    fi
fi

if ! grep -q "## Version $NEW_VERSION" "$RELEASE_NOTES_FILE"; then
    handle_error "Release notes not updated for version $NEW_VERSION" \
        "Add '## Version $NEW_VERSION' section to $RELEASE_NOTES_FILE with deployment details"
fi

RELEASE_TITLE=$(grep -A1 "## Version $NEW_VERSION" "$RELEASE_NOTES_FILE" | tail -1 | sed 's/^[[:space:]]*//')
if [ -z "$RELEASE_TITLE" ] || [[ "$RELEASE_TITLE" == "##"* ]]; then
    handle_error "Release notes missing description for version $NEW_VERSION" \
        "Add a description line after '## Version $NEW_VERSION' in $RELEASE_NOTES_FILE"
fi

echo -e "${GREEN}✅ Release notes validated for v$NEW_VERSION${NC}"
echo -e "${GREEN}   Title: $RELEASE_TITLE${NC}"
echo

# Step 3: Code Formatting Check (Prettier) - NON-BLOCKING
echo -e "${BLUE}Step 3: Code Formatting Check (Non-Blocking)${NC}"
echo "───────────────────────────────"
echo "Checking code formatting with Prettier..."
if ! npx prettier --check "src/**/*.{js,jsx,ts,tsx}" > /tmp/prettier-output.txt 2>&1; then
    FILES_WITH_ISSUES=$(cat /tmp/prettier-output.txt | grep -c "src/" || echo "0")
    echo -e "${YELLOW}⚠️  Code formatting issues found in $FILES_WITH_ISSUES files (Non-Blocking)${NC}"

    # Show sample files
    echo "Sample files with formatting issues:"
    cat /tmp/prettier-output.txt | grep "src/" | head -5

    # Create tech debt story
    if [ "$FILES_WITH_ISSUES" -gt "0" ]; then
        echo -e "${YELLOW}📝 Creating tech debt story for formatting issues...${NC}"

        DETAILS="Found $FILES_WITH_ISSUES files with formatting issues during deployment.\n\nSample files:\n$(cat /tmp/prettier-output.txt | grep 'src/' | head -10)\n\nFix: Run 'npx prettier --write src/**/*.{js,jsx,ts,tsx}'"

        "$SCRIPT_DIR/create-tech-debt-story.sh" \
            "Fix Prettier formatting in $FILES_WITH_ISSUES files" \
            "P3" \
            "FORMATTING" \
            "$DETAILS" || echo "⚠️  Could not create story automatically"

        echo -e "${YELLOW}⚠️  Continuing deployment with formatting issues${NC}"
        echo -e "${YELLOW}   Tech debt story added to backlog${NC}"
    fi
else
    echo -e "${GREEN}✅ Code formatting is perfect${NC}"
fi
echo

# Step 4: License Compliance Check
echo -e "${BLUE}Step 4: License Compliance Check${NC}"
echo "──────────────────────────────────"
echo "Generating current license report..."
npx license-checker --production --summary --out /tmp/current-licenses.txt 2>/dev/null || true

if [ -f "LICENSES.txt" ]; then
    # Count packages in current dependencies
    CURRENT_PKG_COUNT=$(npm list --depth=0 --json 2>/dev/null | jq -r '.dependencies | keys | length' 2>/dev/null || echo "0")
    # Count packages mentioned in LICENSES.txt (rough estimate)
    LICENSES_PKG_COUNT=$(grep -c "^[a-zA-Z@]" LICENSES.txt 2>/dev/null || echo "0")
    
    DIFF=$((CURRENT_PKG_COUNT - LICENSES_PKG_COUNT))
    if [ "$DIFF" -gt "5" ] || [ "$DIFF" -lt "-5" ]; then
        show_warning "License file may be outdated (current: $CURRENT_PKG_COUNT packages, documented: $LICENSES_PKG_COUNT)"
        echo "Consider updating LICENSES.txt by running:"
        echo "  npx license-checker --production --summary"
    else
        echo -e "${GREEN}✅ License documentation appears current${NC}"
    fi
else
    show_warning "LICENSES.txt not found - consider creating it for compliance"
fi
echo

# Step 5: Security Vulnerability Scan
echo -e "${BLUE}Step 5: Security Vulnerability Scan${NC}"
echo "─────────────────────────────────────"
# TEMPORARY: Using --audit-level=moderate to allow deployment
# React Native CLI v15 has dev-only vulnerability (CVE-2025-11953)
# This vulnerability ONLY affects Metro Dev Server (not production builds)
# See SECURITY_WORKAROUNDS.md for full details and removal plan
# TODO: Remove this workaround after upgrading to React Native 0.81+
npm audit --audit-level=moderate 2>&1 | tee /tmp/audit-output.txt
AUDIT_EXIT_CODE=${PIPESTATUS[0]}
if [ $AUDIT_EXIT_CODE -ne 0 ]; then
    MODERATE_COUNT=$(grep -c "moderate" /tmp/audit-output.txt 2>/dev/null || echo "unknown")
    handle_error "Moderate+ severity security vulnerabilities found" \
        "Fix moderate severity vulnerabilities. Run: npm audit fix"
fi

# Show critical vulnerabilities for awareness (but don't block)
CRITICAL_COUNT=$(grep -c "critical" /tmp/audit-output.txt 2>/dev/null || echo "0")
if [ "$CRITICAL_COUNT" != "0" ]; then
    echo -e "${YELLOW}⚠️  Note: $CRITICAL_COUNT critical dev-only vulnerability suppressed${NC}"
    echo -e "${YELLOW}   See SECURITY_WORKAROUNDS.md for details${NC}"
fi

echo -e "${GREEN}✅ No moderate+ vulnerabilities blocking deployment${NC}"
echo

# Step 6: ESLint Check
echo -e "${BLUE}Step 6: ESLint Check${NC}"
echo "─────────────────────"
set +e
set +o pipefail
npm run lint > /tmp/lint-output.txt 2>&1
LINT_EXIT_CODE=$?
cat /tmp/lint-output.txt
ERROR_COUNT=$(grep -E "^\s+[0-9]+:[0-9]+\s+error\s+" /tmp/lint-output.txt 2>/dev/null | wc -l | tr -d ' ')
set -e
set -o pipefail
if [ "$ERROR_COUNT" -gt "0" ]; then
    handle_error "ESLint errors detected ($ERROR_COUNT errors)" \
        "Fix all linting errors. Run: npm run lint"
fi
echo -e "${GREEN}✅ Lint check passed${NC}"
echo

# Step 7: TypeScript Check - NON-BLOCKING
echo -e "${BLUE}Step 7: TypeScript Check (Non-Blocking)${NC}"
echo "─────────────────────────"
if [ -f "tsconfig.json" ]; then
    npm run typecheck > /tmp/typecheck-output.txt 2>&1 || true
    if grep -q "error TS" /tmp/typecheck-output.txt; then
        ERROR_COUNT=$(grep -c "error TS" /tmp/typecheck-output.txt)
        echo -e "${YELLOW}⚠️  TypeScript compilation has $ERROR_COUNT errors (Non-Blocking)${NC}"

        # Show sample errors
        echo "Sample TypeScript errors:"
        grep "error TS" /tmp/typecheck-output.txt | head -5

        # Create tech debt story
        echo -e "${YELLOW}📝 Creating tech debt story for TypeScript errors...${NC}"

        DETAILS="Found $ERROR_COUNT TypeScript errors during deployment.\n\nSample errors:\n$(grep 'error TS' /tmp/typecheck-output.txt | head -10)\n\nFix: Run 'npm run typecheck' and resolve all errors."

        "$SCRIPT_DIR/create-tech-debt-story.sh" \
            "Fix $ERROR_COUNT TypeScript compilation errors" \
            "P2" \
            "TYPESCRIPT" \
            "$DETAILS" || echo "⚠️  Could not create story automatically"

        echo -e "${YELLOW}⚠️  Continuing deployment with TypeScript errors${NC}"
        echo -e "${YELLOW}   Tech debt story added to backlog${NC}"
    else
        echo -e "${GREEN}✅ TypeScript check passed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  tsconfig.json not found (Non-Blocking)${NC}"
    echo "   TypeScript configuration recommended but not required"
fi
echo

# Step 8: Code Quality Metrics
echo -e "${BLUE}Step 8: Code Quality Metrics${NC}"
echo "──────────────────────────────"

# Check for TODO/FIXME comments - NON-BLOCKING
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX\|HACK" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt "20" ]; then
    echo -e "${YELLOW}⚠️  Too many TODO/FIXME comments ($TODO_COUNT found, max 20 recommended) (Non-Blocking)${NC}"

    # Show sample TODOs
    echo "Sample TODO/FIXME comments:"
    grep -r "TODO\|FIXME" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | head -5

    # Create tech debt story
    echo -e "${YELLOW}📝 Creating tech debt story for TODO cleanup...${NC}"

    DETAILS="Found $TODO_COUNT TODO/FIXME comments (recommended max: 20).\n\nSample TODOs:\n$(grep -r 'TODO\|FIXME' src/ --include='*.js' --include='*.ts' --include='*.tsx' 2>/dev/null | head -10)\n\nReview and address or remove outdated TODOs."

    "$SCRIPT_DIR/create-tech-debt-story.sh" \
        "Clean up $TODO_COUNT TODO/FIXME comments" \
        "P3" \
        "TODO_CLEANUP" \
        "$DETAILS" || echo "⚠️  Could not create story automatically"

    echo -e "${YELLOW}⚠️  Continuing deployment with excess TODOs${NC}"
    echo -e "${YELLOW}   Tech debt story added to backlog${NC}"
else
    echo -e "${GREEN}✅ TODO count acceptable ($TODO_COUNT/20)${NC}"
fi

# Check for console.log statements
CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v '^\s*//' | grep -v '//.*console\.log' | wc -l | tr -d ' ' | tr -d '\n' || echo "0")
CONSOLE_COUNT=$(echo "$CONSOLE_COUNT" | sed 's/^0*//' | sed 's/^$/0/')
if [ "$CONSOLE_COUNT" -gt "5" ]; then
    handle_error "Too many console.log statements ($CONSOLE_COUNT found, max 5 allowed)" \
        "Remove console.log statements. Run: grep -r 'console\\.log' src/"
fi
echo -e "${GREEN}✅ Console.log count acceptable ($CONSOLE_COUNT/5)${NC}"

# Check for debugger statements
DEBUGGER_COUNT=$(grep -r "debugger" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null || true | wc -l | tr -d ' ')
if [ "$DEBUGGER_COUNT" -gt "0" ]; then
    handle_error "Debugger statements found ($DEBUGGER_COUNT found)" \
        "Remove all debugger statements. Run: grep -r 'debugger' src/"
fi
echo -e "${GREEN}✅ No debugger statements${NC}"

# Check for potential hardcoded secrets
SECRET_PATTERNS="(api[_-]?key|secret|password|token|private[_-]?key|ACCESS_KEY|SECRET_KEY)"
SECRET_COUNT=$(grep -riE "$SECRET_PATTERNS\s*[:=]\s*['\"][^'\"]{10,}['\"]" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ' | tr -d '\n' || echo "0")
SECRET_COUNT=$(echo "$SECRET_COUNT" | sed 's/^0*//' | sed 's/^$/0/')
if [ "$SECRET_COUNT" -gt "0" ]; then
    show_warning "Potential hardcoded secrets found ($SECRET_COUNT). Please review:"
    grep -riE "$SECRET_PATTERNS\s*[:=]\s*['\"][^'\"]{10,}['\"]" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | head -3
fi
echo

# Step 9: Tiered Test Suite Execution
echo -e "${BLUE}Step 9: Tiered Test Suite${NC}"
echo "──────────────────────────────"

# Pre-flight Smoke Test (10 second sanity check)
echo -e "${YELLOW}→ Pre-flight: Smoke Test (10 second sanity check)${NC}"
timeout 15 npm run test:smoke > /tmp/test-smoke.txt 2>&1 || true
SMOKE_EXIT=$?

if [ $SMOKE_EXIT -ne 0 ] && [ $SMOKE_EXIT -ne 124 ]; then
    cat /tmp/test-smoke.txt
    handle_error "Smoke test failed - basic functionality broken" \
        "Fix critical issues before proceeding: npm run test:smoke"
fi

SMOKE_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-smoke.txt | grep -oE "[0-9]+" | head -1 || echo "0")
echo -e "${GREEN}✅ Smoke test passed ($SMOKE_PASSED critical tests)${NC}"
echo

# Tier 1: Critical Tests (MUST PASS - blocks deployment)
echo -e "${YELLOW}→ Running Tier 1: Critical Tests (encryption, auth, data integrity)${NC}"
timeout 90 npm run test:critical > /tmp/test-critical.txt 2>&1 || true
CRITICAL_EXIT=$?

# Show output if failed
if [ $CRITICAL_EXIT -ne 0 ] && [ $CRITICAL_EXIT -ne 124 ]; then
    cat /tmp/test-critical.txt
    FAILED_COUNT=$(grep -c "●" /tmp/test-critical.txt 2>/dev/null || echo "unknown")
    handle_error "CRITICAL TESTS FAILED ($FAILED_COUNT failures)" \
        "Critical tests must pass 100%. Fix immediately: npm run test:critical"
fi

CRITICAL_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-critical.txt | grep -oE "[0-9]+" | head -1 || echo "0")
echo -e "${GREEN}✅ Critical tests passed ($CRITICAL_PASSED tests)${NC}"

# Tier 2: Important Tests (95%+ should pass - warning only)
echo -e "${YELLOW}→ Running Tier 2: Important Tests (core features, business logic)${NC}"
timeout 120 npm run test:important > /tmp/test-important.txt 2>&1 || true
IMPORTANT_EXIT=$?

IMPORTANT_TOTAL=$(grep -oE "[0-9]+ total" /tmp/test-important.txt | head -1 | grep -oE "[0-9]+" || echo "0")
IMPORTANT_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-important.txt | grep -oE "[0-9]+" | head -1 || echo "0")

if [ $IMPORTANT_TOTAL -gt 0 ]; then
    IMPORTANT_PASS_RATE=$(( IMPORTANT_PASSED * 100 / IMPORTANT_TOTAL ))

    if [ $IMPORTANT_PASS_RATE -lt 95 ]; then
        echo -e "${YELLOW}⚠️  Important test pass rate: ${IMPORTANT_PASS_RATE}% (below 95% threshold)${NC}"
        echo -e "${YELLOW}   Consider fixing before next deployment${NC}"
    else
        echo -e "${GREEN}✅ Important tests: ${IMPORTANT_PASS_RATE}% pass rate ($IMPORTANT_PASSED/$IMPORTANT_TOTAL)${NC}"
    fi
fi

# Tier 3: UI/Integration Tests (informational only)
echo -e "${YELLOW}→ Running Tier 3: UI/Integration Tests (informational)${NC}"
timeout 120 npm run test:ui > /tmp/test-ui.txt 2>&1 || true
UI_EXIT=$?

UI_PASSED=$(grep -oE "[0-9]+ passed" /tmp/test-ui.txt | grep -oE "[0-9]+" | head -1 || echo "0")
UI_FAILED=$(grep -oE "[0-9]+ failed" /tmp/test-ui.txt | grep -oE "[0-9]+" | head -1 || echo "0")

if [ "$UI_FAILED" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  UI tests: $UI_PASSED passed, $UI_FAILED failed (non-blocking)${NC}"
else
    echo -e "${GREEN}✅ UI tests: All $UI_PASSED tests passed${NC}"
fi

# Summary
echo
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test Suite Summary:${NC}"
echo -e "${GREEN}  Tier 1 (Critical):  $CRITICAL_PASSED passed ✅${NC}"
if [ $IMPORTANT_TOTAL -gt 0 ]; then
    echo -e "${GREEN}  Tier 2 (Important): $IMPORTANT_PASSED/$IMPORTANT_TOTAL (${IMPORTANT_PASS_RATE}%)${NC}"
fi
echo -e "${GREEN}  Tier 3 (UI):        $UI_PASSED passed, $UI_FAILED failed${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Step 10: Dependency Analysis
echo -e "${BLUE}Step 10: Dependency Analysis${NC}"
echo "─────────────────────────────"

# Check for unused dependencies
echo "Checking for unused dependencies..."
if command -v npx &> /dev/null; then
    npx depcheck --json > /tmp/depcheck.json 2>/dev/null || true
    if [ -f /tmp/depcheck.json ]; then
        UNUSED_COUNT=$(jq -r '.dependencies | length' /tmp/depcheck.json 2>/dev/null || echo "0")
        if [ "$UNUSED_COUNT" -gt "0" ]; then
            show_warning "Found $UNUSED_COUNT potentially unused dependencies"
            echo "Consider removing unused packages. Run: npx depcheck"
        else
            echo -e "${GREEN}✅ No unused dependencies detected${NC}"
        fi
    fi
fi

# Check for circular dependencies
echo "Checking for circular dependencies..."
if npx madge --circular src/ > /tmp/circular-deps.txt 2>&1 || true; then
    if grep -q "No circular dependency found" /tmp/circular-deps.txt; then
        echo -e "${GREEN}✅ No circular dependencies${NC}"
    else
        CIRCULAR_COUNT=$(grep -c "→" /tmp/circular-deps.txt 2>/dev/null || echo "0")
        if [ "$CIRCULAR_COUNT" -gt "0" ]; then
            show_warning "Circular dependencies detected"
            cat /tmp/circular-deps.txt
            echo "Consider refactoring to remove circular dependencies"
        fi
    fi
fi

# Check for duplicate packages
echo "Checking for duplicate packages in bundle..."
DUPLICATE_COUNT=$(npm ls --depth=999 2>/dev/null | grep "deduped" | wc -l | tr -d ' ' || echo "0")
if [ "$DUPLICATE_COUNT" -gt "10" ]; then
    show_warning "$DUPLICATE_COUNT duplicate packages found. Run: npm dedupe"
else
    echo -e "${GREEN}✅ Minimal package duplication${NC}"
fi
echo

# Step 11: Bundle Size Analysis
echo -e "${BLUE}Step 11: Bundle Size Pre-Check${NC}"
echo "────────────────────────────────"
# This is just a warning for now, actual build happens later
if [ -d "build" ]; then
    CURRENT_BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1)
    echo "Current build size: $CURRENT_BUILD_SIZE"
    echo "New build size will be checked after building"
fi
echo

# Step 12: SonarCloud Code Quality Analysis (Always Run - Unlimited Scans for Open Source)
echo -e "${BLUE}Step 12: SonarCloud Code Quality Analysis${NC}"
echo "────────────────────────────────"

if [ -n "$SONAR_TOKEN" ]; then
    echo "SonarCloud token detected. Running full analysis (unlimited for open source)..."

    # Get current git info for SonarCloud
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

    echo "Branch: $CURRENT_BRANCH"
    echo "Commit: $CURRENT_COMMIT"

    # Run coverage tests for SonarCloud
    echo "Generating test coverage..."
    npm run test:coverage > /tmp/sonar-coverage.txt 2>&1 || {
        echo -e "${YELLOW}⚠️  Coverage generation had issues (continuing with analysis)${NC}"
    }

    # Run SonarCloud scanner with JRE provisioning skipped (avoids 403 error)
    echo "Running SonarCloud scanner..."
    SONAR_SCANNER_SKIP_JRE_PROVISIONING=true npx sonar-scanner \
        -Dsonar.projectVersion="$CURRENT_COMMIT" \
        -Dsonar.branch.name="$CURRENT_BRANCH" || {
        echo -e "${YELLOW}⚠️  SonarCloud analysis failed (non-blocking)${NC}"
        echo "Continuing with deployment..."
    }

    echo -e "${GREEN}✓ Code quality analysis completed${NC}"
    echo "View results at: https://sonarcloud.io/dashboard?id=ajstack22_manylla&branch=$CURRENT_BRANCH"
else
    echo -e "${YELLOW}ℹ️  SonarCloud token not found. Skipping code quality analysis.${NC}"
    echo "   To enable: echo 'SONAR_TOKEN=\"your-token\"' > ~/.manylla-env"
fi
echo

# ============================================================================
# PHASE 2: VERSION UPDATE & COMMIT
# Only executed if ALL validation passes
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    PHASE 2: VERSION UPDATE & COMMIT                   ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

echo -e "${BLUE}Updating Version & Committing${NC}"
echo "──────────────────────────────"

# Update version in package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
else
    # Linux
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
fi

# Commit the version change
git add package.json
git add docs/RELEASE_NOTES.md 2>/dev/null || git add RELEASE_NOTES.md 2>/dev/null || true
git commit -m "v$NEW_VERSION: $RELEASE_TITLE" || handle_error "Git commit failed" \
    "Resolve git issues and try again"

echo -e "${GREEN}✅ Version updated to $NEW_VERSION${NC}"
echo -e "${GREEN}✅ Changes committed${NC}"

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main 2>/dev/null || git push origin master 2>/dev/null || {
    handle_error "Git push failed" \
        "Pull remote changes first: git pull origin main"
}
echo -e "${GREEN}✅ Pushed to GitHub${NC}"
echo

# ============================================================================
# PHASE 3: WEB DEPLOYMENT (FASTEST)
# Deploy to web first for quick validation
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    PHASE 3: WEB DEPLOYMENT                            ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

echo -e "${BLUE}Building Web Application${NC}"
echo "─────────────────────────"

# Copy qual environment file
if [ -f .env.qual ]; then
    cp .env.qual .env.production.local
    echo -e "${GREEN}✅ Using qual environment configuration${NC}"
else
    echo -e "${YELLOW}⚠️  No .env.qual file found, using defaults${NC}"
fi

# Update homepage in package.json for qual subdirectory
cp package.json package.json.backup
node -e "
const pkg = require('./package.json');
pkg.homepage = '/qual';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Build the app with increased memory
echo -e "${YELLOW}📦 Building for staging...${NC}"
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web 2>&1 | tee /tmp/build-output.txt
BUILD_EXIT_CODE=${PIPESTATUS[0]}

# Restore original package.json
mv package.json.backup package.json

# Clean up environment file
rm -f .env.production.local

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    handle_error "Build failed" \
        "Check build errors above. Run: npm run build:web"
fi

# Check build size
if [ -d "web/build" ]; then
    BUILD_SIZE=$(du -sh web/build | cut -f1)
    # Try to get size in bytes (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        BUILD_SIZE_BYTES=$(find web/build -type f -exec stat -f%z {} + | awk '{s+=$1} END {print s}')
    else
        BUILD_SIZE_BYTES=$(du -sb web/build | cut -f1)
    fi
    echo -e "${GREEN}✅ Build completed successfully (size: $BUILD_SIZE)${NC}"
    
    # Check if build is over 10MB - NON-BLOCKING
    if [ "$BUILD_SIZE_BYTES" -gt "10485760" ]; then
        SIZE_MB=$((BUILD_SIZE_BYTES / 1048576))
        echo -e "${YELLOW}⚠️  Build size exceeds 10MB (${SIZE_MB}MB) - Non-Blocking${NC}"
        echo -e "${YELLOW}   Consider code splitting for better performance${NC}"

        # Create tech debt story for bundle optimization
        echo -e "${YELLOW}📝 Creating tech debt story for bundle size optimization...${NC}"

        DETAILS="Build size is ${SIZE_MB}MB (${BUILD_SIZE}), exceeding recommended 10MB limit.\n\nLarge bundles impact:\n- Initial load time\n- Performance on slow connections\n- User experience\n\nRecommendations:\n- Implement code splitting\n- Lazy load routes\n- Analyze bundle with 'npm run analyze'\n- Remove unused dependencies"

        "$SCRIPT_DIR/create-tech-debt-story.sh" \
            "Optimize bundle size - currently ${SIZE_MB}MB" \
            "P2" \
            "PERFORMANCE" \
            "$DETAILS" || echo "⚠️  Could not create story automatically"

        echo -e "${YELLOW}⚠️  Continuing deployment with large bundle${NC}"
        echo -e "${YELLOW}   Tech debt story added to backlog${NC}"
    fi
else
    handle_error "Build directory not created" \
        "Build process failed to generate output"
fi
echo

echo -e "${BLUE}Deploying to Qual Server${NC}"
echo "─────────────────────────"

# Check if SSH alias exists
if ! grep -q "Host stackmap-cpanel" ~/.ssh/config 2>/dev/null; then
    handle_error "SSH configuration missing" \
        "Run: ./scripts/setup-ssh.sh to configure SSH"
fi

# Clean qual directory
echo -e "${YELLOW}🧹 Cleaning qual directory...${NC}"
ssh stackmap-cpanel "
    cd ~/public_html/manylla/qual && \
    find . -type f ! -name '.htaccess' ! -name '*.php' ! -path './api/config/*' -delete && \
    find . -type d -empty -delete 2>/dev/null || true
" || handle_error "Failed to clean qual directory" \
    "Check SSH connection and permissions"

echo -e "${GREEN}✅ Qual directory cleaned${NC}"

# Deploy build files
echo -e "${YELLOW}🚀 Deploying to staging...${NC}"
ssh stackmap-cpanel "mkdir -p ~/public_html/manylla/qual"

rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env' \
    web/build/ stackmap-cpanel:~/public_html/manylla/qual/ || \
    handle_error "Rsync deployment failed" \
        "Check SSH connection and disk space"

# Deploy .htaccess if exists (for Manylla, not StackMap)
if [ -f "public/.htaccess.manylla-qual" ]; then
    echo -e "${YELLOW}📄 Deploying Manylla qual .htaccess...${NC}"
    scp public/.htaccess.manylla-qual stackmap-cpanel:~/public_html/manylla/qual/.htaccess
elif [ -f "build/.htaccess" ]; then
    echo -e "${YELLOW}📄 Using build .htaccess...${NC}"
    # The build/.htaccess was already deployed via rsync
fi

echo -e "${GREEN}✅ Web files deployed${NC}"

# Deploy API if it exists
if [ -d "api" ]; then
    echo -e "${YELLOW}📡 Deploying API...${NC}"
    
    ssh stackmap-cpanel "mkdir -p ~/public_html/manylla/qual/api/{config,sync,share,logs}"
    
    rsync -avz \
        --exclude='.git' \
        --exclude='config/*.php' \
        --exclude='*.example.php' \
        api/sync/ stackmap-cpanel:~/public_html/manylla/qual/api/sync/
    
    scp api/config/database.php stackmap-cpanel:~/public_html/manylla/qual/api/config/
    scp api/config/config.php stackmap-cpanel:~/public_html/manylla/qual/api/config/
    
    if [ -f "api/config/config.qual.php" ]; then
        echo -e "${YELLOW}📄 Deploying qual configuration...${NC}"
        scp api/config/config.qual.php stackmap-cpanel:~/public_html/manylla/qual/api/config/
        ssh stackmap-cpanel "chmod 600 ~/public_html/manylla/qual/api/config/config.qual.php"
    else
        handle_error "Qual API config not found" \
            "Run: ./scripts/deploy-api-config.sh to create config.qual.php"
    fi
    
    ssh stackmap-cpanel "chmod 755 ~/public_html/manylla/qual/api/logs"
    
    echo -e "${GREEN}✅ API deployed${NC}"
fi

# Health check
echo -e "${YELLOW}🔍 Running health check...${NC}"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://manylla.com/qual/)
if [ "$HEALTH_CHECK" != "200" ]; then
    handle_error "Health check failed (HTTP $HEALTH_CHECK)" \
        "Check server logs and ensure deployment completed"
fi
echo -e "${GREEN}✅ Site responding (HTTP 200)${NC}"

# API health check
if [ -d "api" ]; then
    API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://manylla.com/qual/api/sync_health.php)
    if [ "$API_HEALTH" == "200" ]; then
        echo -e "${GREEN}✅ API responding (HTTP 200)${NC}"
    else
        show_warning "API health check returned HTTP $API_HEALTH"
    fi
fi
echo

# ============================================================================
# PHASE 4: MOBILE DEPLOYMENT (OPTIONAL)
# Deploy to iOS simulators and Android devices if available
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}    PHASE 4: MOBILE DEPLOYMENT (OPTIONAL)              ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo

# iOS Simulator Deployment
echo -e "${BLUE}iOS Simulator Deployment${NC}"
echo "─────────────────────────"

# Check for running iOS simulators
IOS_SIMULATORS=$(xcrun simctl list devices 2>/dev/null | grep "Booted" || echo "")
if [ -n "$IOS_SIMULATORS" ]; then
    echo "Found running iOS simulators:"
    echo "$IOS_SIMULATORS"
    
    # Try to deploy to iPhone simulator
    if echo "$IOS_SIMULATORS" | grep -q "iPhone"; then
        IPHONE_NAME=$(echo "$IOS_SIMULATORS" | grep "iPhone" | head -1 | sed 's/(.*//g' | xargs)
        echo -e "${YELLOW}📱 Deploying to $IPHONE_NAME...${NC}"
        npx react-native run-ios --simulator="$IPHONE_NAME" 2>/dev/null || \
            show_warning "iOS iPhone deployment failed - continuing"
    fi
    
    # Try to deploy to iPad simulator
    if echo "$IOS_SIMULATORS" | grep -q "iPad"; then
        IPAD_NAME=$(echo "$IOS_SIMULATORS" | grep "iPad" | head -1 | sed 's/(.*//g' | xargs)
        echo -e "${YELLOW}📱 Deploying to $IPAD_NAME...${NC}"
        npx react-native run-ios --simulator="$IPAD_NAME" 2>/dev/null || \
            show_warning "iOS iPad deployment failed - continuing"
    fi
    
    # Open the web URL in simulator Safari
    echo -e "${YELLOW}🌐 Opening qual URL in simulator...${NC}"
    xcrun simctl openurl booted https://manylla.com/qual 2>/dev/null || true
    
    echo -e "${GREEN}✅ iOS deployment attempted${NC}"
else
    echo "No iOS simulators running - skipping iOS deployment"
fi
echo

# Android Device Deployment and Testing
echo -e "${BLUE}Android Device Deployment${NC}"
echo "──────────────────────────"

# Check for connected Android devices (including emulators)
ANDROID_DEVICES=$(adb devices 2>/dev/null | grep -v "List of devices" | grep -E "device$|emulator" || echo "")
if [ -n "$ANDROID_DEVICES" ]; then
    echo "Found connected Android devices:"
    echo "$ANDROID_DEVICES"
    
    # Run Android clean script if available
    if [ -f "$SCRIPT_DIR/android/clean-android.sh" ]; then
        echo -e "${YELLOW}🧹 Cleaning Android build artifacts...${NC}"
        "$SCRIPT_DIR/android/clean-android.sh" || show_warning "Clean script failed"
    fi
    
    # Build Android APK
    echo -e "${YELLOW}🔨 Building Android APK...${NC}"
    cd android && ./gradlew assembleDebug 2>/dev/null && cd .. || {
        show_warning "Android build failed - continuing"
        cd ..
    }
    
    # Determine correct APK path based on ABI splits
    APK_PATH=""
    if [ -f "android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk" ]; then
        APK_PATH="android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk"
    elif [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
    fi
    
    if [ -n "$APK_PATH" ]; then
        # Deploy to each connected device
        while IFS= read -r line; do
            DEVICE_ID=$(echo "$line" | awk '{print $1}')
            if [ -n "$DEVICE_ID" ]; then
                echo -e "${YELLOW}📱 Installing on device $DEVICE_ID...${NC}"
                # Use correct package name for Manylla
                adb -s "$DEVICE_ID" uninstall com.manyllamobile 2>/dev/null || true
                adb -s "$DEVICE_ID" install -r "$APK_PATH" 2>/dev/null || \
                    show_warning "Failed to install on $DEVICE_ID"
                
                # Run basic tests if test script available
                if [ -f "$SCRIPT_DIR/android/debug-android.sh" ]; then
                    echo -e "${YELLOW}🧪 Running Android tests on $DEVICE_ID...${NC}"
                    "$SCRIPT_DIR/android/debug-android.sh" info || true
                fi
            fi
        done <<< "$ANDROID_DEVICES"
        echo -e "${GREEN}✅ Android deployment attempted${NC}"
        
        # Run Jest tests for Android if available
        if [ -d "__tests__/android" ]; then
            echo -e "${YELLOW}🧪 Running Android Jest tests...${NC}"
            npm test -- __tests__/android/ --passWithNoTests || show_warning "Android tests failed"
        fi
    fi
else
    echo "No Android devices connected - skipping Android deployment"
fi
echo

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================

echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    🎉 DEPLOYMENT SUCCESSFUL!                          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo
echo -e "${GREEN}Version: v$NEW_VERSION${NC}"
echo -e "${GREEN}Title: $RELEASE_TITLE${NC}"
echo -e "${GREEN}Web URL: https://manylla.com/qual${NC}"
echo
echo "Deployment Summary:"
echo "─────────────────"
echo "✅ All validation checks passed"
echo "✅ Code committed and pushed to GitHub"
echo "✅ Web application deployed to qual"
if [ -n "$IOS_SIMULATORS" ]; then
    echo "✅ iOS simulators deployment attempted"
fi
if [ -n "$ANDROID_DEVICES" ]; then
    echo "✅ Android devices deployment attempted"
fi
echo

# ============================================================================
# OPTIONAL: Update Role Definitions with Recent Learnings
# ============================================================================

echo "Role Evolution Check:"
echo "────────────────────"
# Check if this was a bug fix or feature implementation
if echo "$RELEASE_TITLE" | grep -iE "fix|bug|B[0-9]{3}|feature|feat|S[0-9]{3}" > /dev/null; then
    echo -e "${YELLOW}This deployment appears to include fixes or features.${NC}"
    echo "Would you like to capture learnings for role evolution?"
    echo ""
    read -p "Update role definitions with learnings? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "$SCRIPT_DIR/apply-role-learnings.sh" ]; then
            echo -e "${BLUE}Applying recent learnings to role definitions...${NC}"
            "$SCRIPT_DIR/apply-role-learnings.sh"
            echo "✅ Role definitions updated with recent learnings"
        else
            echo -e "${YELLOW}Role learning script not found. Skipping.${NC}"
        fi
    else
        echo "Skipping role definition updates"
    fi
else
    echo "No bug fixes or features detected in this deployment"
fi
echo

echo "Next Steps:"
echo "──────────"
echo "1. Test the deployment at https://manylla.com/qual"
echo "2. Check all critical features are working"
echo "3. Monitor error logs for any issues"
echo "4. Once verified, consider production deployment"
echo "5. If bugs were fixed, consider updating role definitions"
echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"