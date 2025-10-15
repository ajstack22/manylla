#!/bin/bash

# Manylla Production Rollback Script
# Restores previous production deployment from backup
#
# CRITICAL: Use this script to quickly recover from failed production deployments
#
# Usage: ./scripts/rollback-prod.sh
# Interactive: Script will list available backups and prompt for selection

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
echo -e "${RED}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        🔄 MANYLLA PRODUCTION ROLLBACK                          ║"
echo "║        Emergency Recovery System                              ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Configuration
DEPLOY_PATH="~/public_html/manylla"
SERVER="stackmap-cpanel"

echo -e "${RED}⚠️  WARNING: This will rollback PRODUCTION to a previous version${NC}"
echo -e "${RED}    All current production changes will be replaced${NC}"
echo
echo "This script will:"
echo "  1. Create backup of current PROD state (safety net)"
echo "  2. List available production backups"
echo "  3. Restore selected backup to production"
echo "  4. Verify deployment health"
echo
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo

# Check SSH connection
echo -e "${BLUE}🔍 Checking server connection...${NC}"
if ! ssh "$SERVER" "echo '✅ Connected'" 2>/dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to server '$SERVER'${NC}"
    echo "   Please check your SSH configuration"
    exit 1
fi
echo

# List available backups
echo -e "${BLUE}📦 Available production backups:${NC}"
echo

BACKUPS=$(ssh "$SERVER" "ls -1t ~/manylla-prod-backup-*.tar.gz 2>/dev/null" || echo "")

if [ -z "$BACKUPS" ]; then
    echo -e "${RED}❌ No production backups found${NC}"
    echo
    echo "Expected location: ~/manylla-prod-backup-*.tar.gz on server"
    echo
    echo "Backups are created automatically during production deployments."
    echo "If no backups exist, you may need to manually restore from:"
    echo "  - Git history (git checkout previous commit)"
    echo "  - Manual backup (if created)"
    echo "  - Redeploy from STAGE"
    exit 1
fi

# Display backups with numbers
echo "$BACKUPS" | while IFS= read -r backup; do
    BASENAME=$(basename "$backup")
    SIZE=$(ssh "$SERVER" "ls -lh '$backup' | awk '{print \$5}'")
    TIMESTAMP=$(echo "$BASENAME" | grep -oE '[0-9]{8}-[0-9]{6}' || echo "unknown")

    # Format timestamp
    if [ "$TIMESTAMP" != "unknown" ]; then
        DATE_PART="${TIMESTAMP:0:8}"
        TIME_PART="${TIMESTAMP:9:6}"
        FORMATTED_DATE="${DATE_PART:0:4}-${DATE_PART:4:2}-${DATE_PART:6:2}"
        FORMATTED_TIME="${TIME_PART:0:2}:${TIME_PART:2:2}:${TIME_PART:4:2}"
        DISPLAY_TIME="$FORMATTED_DATE $FORMATTED_TIME"
    else
        DISPLAY_TIME="$BASENAME"
    fi

    echo "  📁 $BASENAME"
    echo "     Size: $SIZE  |  Created: $DISPLAY_TIME"
    echo
done

echo -e "${YELLOW}Note: Backups are sorted by time (newest first)${NC}"
echo

# Prompt for backup selection
read -p "Enter backup filename to restore (or 'cancel' to abort): " BACKUP_FILE

if [ -z "$BACKUP_FILE" ] || [ "$BACKUP_FILE" == "cancel" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Validate backup exists
if ! echo "$BACKUPS" | grep -q "$BACKUP_FILE"; then
    echo -e "${RED}❌ Error: Backup file '$BACKUP_FILE' not found${NC}"
    exit 1
fi

# Confirm rollback
echo
echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${RED}              PRODUCTION ROLLBACK CONFIRMATION                  ${NC}"
echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
echo
echo "Selected backup: $BACKUP_FILE"
echo
echo -e "${YELLOW}This will:${NC}"
echo "  1. Backup current PROD state (safety net)"
echo "  2. Stop current production website"
echo "  3. Restore from: $BACKUP_FILE"
echo "  4. Verify health check passes"
echo
echo -e "${RED}⚠️  Current production will be REPLACED${NC}"
echo
read -p "Type 'ROLLBACK' to confirm (or anything else to cancel): " CONFIRM

if [ "$CONFIRM" != "ROLLBACK" ]; then
    echo "Rollback cancelled"
    exit 0
fi
echo

# Create backup of current state before rollback
echo -e "${YELLOW}💾 Step 1/4: Creating safety backup of current state...${NC}"
SAFETY_BACKUP="manylla-prod-before-rollback-$(date +%Y%m%d-%H%M%S)"
ssh "$SERVER" "
    cd ~/public_html && \
    tar -czf ~/$SAFETY_BACKUP.tar.gz manylla 2>/dev/null
" && echo -e "${GREEN}   ✅ Safety backup created: $SAFETY_BACKUP.tar.gz${NC}" || echo -e "${YELLOW}   ⚠️  Safety backup failed (non-fatal, continuing...)${NC}"
echo

# Perform rollback
echo -e "${BLUE}🔄 Step 2/4: Extracting backup archive...${NC}"
ssh "$SERVER" "
    cd ~/public_html && \
    rm -rf manylla.rollback-temp 2>/dev/null; \
    mkdir -p manylla.rollback-temp && \
    cd manylla.rollback-temp && \
    tar -xzf ~/$BACKUP_FILE
" || {
    echo -e "${RED}❌ Error: Failed to extract backup${NC}"
    exit 1
}
echo -e "${GREEN}   ✅ Backup extracted${NC}"
echo

echo -e "${BLUE}🔄 Step 3/4: Replacing production files...${NC}"
ssh "$SERVER" "
    cd ~/public_html && \
    rm -rf manylla.old 2>/dev/null; \
    mv manylla manylla.old 2>/dev/null; \
    mv manylla.rollback-temp/manylla manylla && \
    rm -rf manylla.rollback-temp
" || {
    echo -e "${RED}❌ Error: Failed to replace production files${NC}"
    echo -e "${YELLOW}   Attempting to restore from manylla.old...${NC}"
    ssh "$SERVER" "cd ~/public_html && rm -rf manylla && mv manylla.old manylla"
    exit 1
}
echo -e "${GREEN}   ✅ Production files replaced${NC}"
echo

# Verify deployment
echo -e "${BLUE}🔍 Step 4/4: Verifying deployment health...${NC}"
sleep 2  # Give server a moment to settle

HEALTH_URL="https://manylla.com/api/health.php"
HEALTH_RESPONSE=$(curl -s "$HEALTH_URL" 2>/dev/null || echo "")

if [ -z "$HEALTH_RESPONSE" ]; then
    echo -e "${YELLOW}   ⚠️  Health check endpoint not responding${NC}"
    echo -e "${YELLOW}   This may be expected if health endpoint wasn't in backup${NC}"
else
    HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

    if [ "$HEALTH_STATUS" == "healthy" ]; then
        echo -e "${GREEN}   ✅ Health check: $HEALTH_STATUS${NC}"
        echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null | head -10
    else
        echo -e "${YELLOW}   ⚠️  Health check returned: $HEALTH_STATUS${NC}"
        echo -e "${YELLOW}   Manual verification recommended${NC}"
    fi
fi
echo

# Success summary
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}              ROLLBACK COMPLETED SUCCESSFULLY                   ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo
echo -e "${GREEN}✅ Production has been rolled back to: $BACKUP_FILE${NC}"
echo
echo "Backups created:"
echo "  • Safety backup: $SAFETY_BACKUP.tar.gz (current state before rollback)"
echo "  • Old version: manylla.old (on server, can be removed after verification)"
echo
echo "Next steps:"
echo "  1. Verify production website: https://manylla.com/"
echo "  2. Check all critical features"
echo "  3. Review error logs if needed"
echo "  4. Clean up old backup after 48 hours:"
echo "     ssh $SERVER 'rm -rf ~/public_html/manylla.old'"
echo
echo -e "${CYAN}Production URL: https://manylla.com/${NC}"
echo

# Cleanup old version prompt
echo -e "${YELLOW}Keep manylla.old for 48 hours as additional safety net${NC}"
read -p "Remove manylla.old directory now? (y/N): " CLEANUP

if [ "$CLEANUP" == "y" ] || [ "$CLEANUP" == "Y" ]; then
    ssh "$SERVER" "rm -rf ~/public_html/manylla.old"
    echo -e "${GREEN}✅ Cleaned up manylla.old${NC}"
else
    echo "manylla.old kept on server (manual cleanup required later)"
fi

echo
echo -e "${CYAN}Rollback complete! 🎉${NC}"
