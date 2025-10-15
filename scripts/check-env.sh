#!/bin/bash

# Manylla Environment Detection Utility
# Checks and displays current deployment environment information
#
# Usage: ./scripts/check-env.sh [TIER]
# Example: ./scripts/check-env.sh prod
#
# If no tier specified, checks all tiers

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SERVER="stackmap-cpanel"

# Banner
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        MANYLLA ENVIRONMENT DETECTOR                            ║"
echo "║        Deployment Status Checker                              ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Check single tier
check_tier() {
    local TIER="$1"
    local URL="$2"
    local PATH_ON_SERVER="$3"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Checking: $TIER${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo

    # Check if deployed on server
    echo -e "${CYAN}📦 Server Deployment:${NC}"
    if ssh "$SERVER" "test -d $PATH_ON_SERVER" 2>/dev/null; then
        echo -e "${GREEN}   ✅ Deployed at: $PATH_ON_SERVER${NC}"

        # Get deployment date
        DEPLOY_DATE=$(ssh "$SERVER" "stat -c %y '$PATH_ON_SERVER/index.html' 2>/dev/null || stat -f '%Sm' '$PATH_ON_SERVER/index.html' 2>/dev/null" || echo "Unknown")
        echo -e "   📅 Last modified: $DEPLOY_DATE"

        # Get directory size
        DIR_SIZE=$(ssh "$SERVER" "du -sh '$PATH_ON_SERVER' 2>/dev/null | cut -f1" || echo "Unknown")
        echo -e "   📊 Size: $DIR_SIZE"
    else
        echo -e "${RED}   ❌ Not deployed${NC}"
        echo
        return 0
    fi
    echo

    # Check health endpoint
    echo -e "${CYAN}🏥 Health Check:${NC}"
    HEALTH_URL="${URL}api/health.php"
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL" 2>/dev/null || echo "")

    if [ -z "$HEALTH_RESPONSE" ]; then
        echo -e "${YELLOW}   ⚠️  Health endpoint not responding${NC}"
        echo -e "   URL: $HEALTH_URL"
    else
        STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        ENV=$(echo "$HEALTH_RESPONSE" | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)
        VERSION=$(echo "$HEALTH_RESPONSE" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
        DB_NAME=$(echo "$HEALTH_RESPONSE" | grep -o '"database_name":"[^"]*"' | cut -d'"' -f4)
        DB_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)

        if [ "$STATUS" == "healthy" ]; then
            echo -e "${GREEN}   ✅ Status: $STATUS${NC}"
        else
            echo -e "${RED}   ❌ Status: $STATUS${NC}"
        fi

        echo -e "   🌍 Environment: $ENV"
        echo -e "   📌 Version: $VERSION"
        echo -e "   💾 Database: $DB_NAME ($DB_STATUS)"
        echo -e "   🔗 URL: $URL"
    fi
    echo

    # Check database connectivity
    echo -e "${CYAN}🗄️  Database:${NC}"
    DB_PASS_FILE=""
    case "$TIER" in
        QUAL)
            DB_PASS_FILE="~/.manylla-qual-db-pass"
            DB_USER="stachblx_mql"
            DB_NAME_CHECK="stachblx_manylla_sync_qual"
            ;;
        STAGE)
            DB_PASS_FILE="~/.manylla-qual-db-pass"  # STAGE shares QUAL database
            DB_USER="stachblx_mql"
            DB_NAME_CHECK="stachblx_manylla_sync_qual"
            ;;
        PROD)
            DB_PASS_FILE="~/.manylla-prod-db-pass"
            DB_USER="stachblx_mpd"
            DB_NAME_CHECK="stachblx_manylla_sync_prod"
            ;;
    esac

    if ssh "$SERVER" "test -f $DB_PASS_FILE" 2>/dev/null; then
        echo -e "${GREEN}   ✅ Password file exists: $DB_PASS_FILE${NC}"

        # Test database connection
        if ssh "$SERVER" "mariadb -u $DB_USER --password=\$(cat $DB_PASS_FILE) $DB_NAME_CHECK -e 'SELECT 1;' 2>/dev/null" >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Database connection: successful${NC}"

            # Get table count
            TABLE_COUNT=$(ssh "$SERVER" "mariadb -u $DB_USER --password=\$(cat $DB_PASS_FILE) $DB_NAME_CHECK -e 'SHOW TABLES;' 2>/dev/null | wc -l" || echo "0")
            TABLE_COUNT=$((TABLE_COUNT - 1))  # Subtract header row
            echo -e "   📊 Tables: $TABLE_COUNT"

            # Get data count (for sync_data table)
            if [ "$TABLE_COUNT" -gt 0 ]; then
                DATA_COUNT=$(ssh "$SERVER" "mariadb -u $DB_USER --password=\$(cat $DB_PASS_FILE) $DB_NAME_CHECK -e 'SELECT COUNT(*) FROM sync_data;' 2>/dev/null | tail -1" || echo "0")
                echo -e "   📦 Sync records: $DATA_COUNT"
            fi
        else
            echo -e "${RED}   ❌ Database connection: failed${NC}"
        fi
    else
        echo -e "${YELLOW}   ⚠️  Password file not found: $DB_PASS_FILE${NC}"
    fi
    echo

    # Check recent backups
    echo -e "${CYAN}💾 Recent Backups:${NC}"
    TIER_LOWER=$(echo "$TIER" | tr '[:upper:]' '[:lower:]')
    BACKUP_PATTERN="*manylla-${TIER_LOWER}-backup-*.tar.gz"
    RECENT_BACKUPS=$(ssh "$SERVER" "ls -1t ~/$BACKUP_PATTERN 2>/dev/null | head -3" || echo "")

    if [ -z "$RECENT_BACKUPS" ]; then
        echo -e "${YELLOW}   ⚠️  No backups found${NC}"
    else
        echo "$RECENT_BACKUPS" | while IFS= read -r backup; do
            BASENAME=$(basename "$backup")
            SIZE=$(ssh "$SERVER" "ls -lh '$backup' 2>/dev/null | awk '{print \$5}'")
            echo -e "${GREEN}   ✅ $BASENAME ($SIZE)${NC}"
        done
    fi
    echo
}

# Main execution
TIER_ARG="${1:-}"

if [ -z "$TIER_ARG" ]; then
    # Check all tiers
    echo -e "${YELLOW}No tier specified, checking all tiers...${NC}"
    echo

    check_tier "QUAL" "https://manylla.com/qual/" "~/public_html/manylla/qual"
    check_tier "STAGE" "https://manylla.com/stage/" "~/public_html/manylla/stage"
    check_tier "PROD" "https://manylla.com/" "~/public_html/manylla"
else
    # Check specific tier (convert to lowercase for case-insensitive matching)
    TIER_LOWER=$(echo "$TIER_ARG" | tr '[:upper:]' '[:lower:]')
    case "$TIER_LOWER" in
        qual)
            check_tier "QUAL" "https://manylla.com/qual/" "~/public_html/manylla/qual"
            ;;
        stage)
            check_tier "STAGE" "https://manylla.com/stage/" "~/public_html/manylla/stage"
            ;;
        prod|production)
            check_tier "PROD" "https://manylla.com/" "~/public_html/manylla"
            ;;
        *)
            echo -e "${RED}❌ Error: Unknown tier '$TIER_ARG'${NC}"
            echo
            echo "Usage: $0 [qual|stage|prod]"
            exit 1
            ;;
    esac
fi

# Summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo "Useful commands:"
echo "  • Deploy to QUAL:  ./scripts/deploy.sh qual"
echo "  • Deploy to STAGE: ./scripts/deploy.sh stage"
echo "  • Deploy to PROD:  ./scripts/deploy.sh prod"
echo "  • Rollback PROD:   ./scripts/rollback-prod.sh"
echo
echo "URLs:"
echo "  • QUAL:  https://manylla.com/qual/"
echo "  • STAGE: https://manylla.com/stage/"
echo "  • PROD:  https://manylla.com/"
echo
