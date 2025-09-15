#!/bin/bash

# Manylla Production Deployment Script
# Deploys tested qual version to production with backup

set -e  # Exit on error

echo "🚀 Manylla Production Deployment"
echo "================================"
echo

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to rollback
rollback_prod() {
    echo -e "${YELLOW}⏮️  Rolling back production...${NC}"
    
    # Get the last backup timestamp
    TIMESTAMP=$(ssh stackmap-cpanel 'cat ~/.last-manylla-deploy 2>/dev/null')
    
    if [ -z "$TIMESTAMP" ]; then
        echo -e "${RED}❌ No rollback available${NC}"
        exit 1
    fi
    
    echo "Restoring from backup: manylla-backup-$TIMESTAMP.tar.gz"
    ssh stackmap-cpanel << EOF
        cd ~/public_html/manylla
        tar -xzf ~/backups/manylla-backup-$TIMESTAMP.tar.gz
        echo "✅ Production rolled back"
EOF
    
    echo -e "${GREEN}✅ Rollback complete!${NC}"
    echo "🌐 Production: https://manylla.com"
    exit 0
}

# Check for rollback command
if [ "$1" = "rollback" ]; then
    rollback_prod
fi

# Check for uncommitted changes - these should NOT go to production
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Uncommitted changes detected!${NC}"
    echo "Production deployments should only promote tested code from qual."
    echo ""
    echo "You have two options:"
    echo "1. Deploy these changes to qual first: npm run deploy:qual"
    echo "2. Stash/discard these changes and deploy current qual to prod"
    echo ""
    read -p "Continue anyway? (not recommended) (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    echo -e "${YELLOW}⚠️  WARNING: Proceeding with uncommitted changes${NC}"
fi

# Run final safety checks before production
echo -e "${YELLOW}🔍 Running production safety checks...${NC}"

# Security audit - MUST pass for production
echo "- Checking for vulnerabilities..."
if ! npm audit --audit-level=critical 2>/dev/null; then
    echo -e "${RED}❌ CRITICAL: Security vulnerabilities detected!${NC}"
    echo "Production deployment blocked. Fix vulnerabilities first."
    echo "Run 'npm audit fix' or 'npm audit' for details"
    exit 1
fi

# Lint check
echo "- Running lint check..."
if npm run lint 2>&1 | grep -E "error\s" > /dev/null; then
    echo -e "${RED}❌ Lint errors found!${NC}"
    echo "Fix errors before deploying to production"
    echo "Run 'npm run lint' to see details"
    exit 1
fi

echo -e "${GREEN}✅ Safety checks passed${NC}"
echo

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: This will deploy to PRODUCTION${NC}"
echo "Have you tested the changes at https://manylla.com/qual?"
read -p "Continue with production deployment? (yes/no) " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Check if qual exists on server
echo -e "${YELLOW}🔍 Checking qual deployment...${NC}"
if ! ssh stackmap-cpanel "[ -d ~/public_html/manylla/qual ]"; then
    echo -e "${RED}❌ No qual deployment found!${NC}"
    echo "Please deploy to qual first: npm run deploy:qual"
    exit 1
fi

echo -e "${YELLOW}📦 Creating backup...${NC}"

# Create backup on server
ssh stackmap-cpanel << 'EOF'
    cd ~/public_html/manylla
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    mkdir -p ~/backups
    
    # Backup current production (excluding qual)
    tar -czf ~/backups/manylla-backup-$TIMESTAMP.tar.gz \
        --exclude='qual' \
        --exclude='api/logs' \
        --exclude='*.log' \
        .
    
    echo $TIMESTAMP > ~/.last-manylla-deploy
    echo "✅ Backup created: manylla-backup-$TIMESTAMP.tar.gz"
EOF

echo -e "${YELLOW}🔄 Syncing qual to production...${NC}"

# Sync qual to production (excluding API configs)
# Using --delete to remove files that no longer exist in qual
ssh stackmap-cpanel << 'EOF'
    cd ~/public_html/manylla
    
    # Use rsync to make production match qual exactly (except protected files)
    # --delete removes files from prod that don't exist in qual
    rsync -av --delete \
        --exclude='.htaccess' \
        --exclude='.htpasswd*' \
        --exclude='qual' \
        --exclude='demo' \
        --exclude='api/config/*.php' \
        --exclude='api/logs' \
        --exclude='*.log' \
        qual/ .
    
    echo "✅ Production updated from qual (old files cleaned up)"
EOF

# Deploy production API configuration
echo -e "${YELLOW}📡 Deploying production API configuration...${NC}"

# Check if prod config exists locally
if [ -f "$PROJECT_ROOT/api/config/config.prod.php" ]; then
    # Check for password placeholder
    if grep -q "YOUR_PROD_DB_PASSWORD_HERE" "$PROJECT_ROOT/api/config/config.prod.php"; then
        echo -e "${RED}⚠️  Warning: Production database password not configured${NC}"
        echo "Update api/config/config.prod.php with actual password"
        read -p "Continue without API? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        # Deploy production API config
        scp "$PROJECT_ROOT/api/config/config.prod.php" stackmap-cpanel:~/public_html/manylla/api/config/
        ssh stackmap-cpanel "chmod 600 ~/public_html/manylla/api/config/config.prod.php"
        echo -e "${GREEN}✅ Production API configuration deployed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No production API config found (api/config/config.prod.php)${NC}"
    echo "API will use default configuration"
fi

# Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

# Check if main JS file exists
if curl -s -o /dev/null -w "%{http_code}" https://manylla.com | grep -q "200"; then
    echo -e "${GREEN}✅ Production site is accessible${NC}"
else
    echo -e "${RED}⚠️  Warning: Could not verify production site${NC}"
fi

echo
echo -e "${GREEN}🎉 PRODUCTION DEPLOYMENT COMPLETE!${NC}"
echo
echo "📋 Summary:"
echo "  ✅ Backup created"
echo "  ✅ Production updated from qual"
echo "  🌐 Production: https://manylla.com"
echo
echo "If you encounter any issues, run:"
echo "  npm run deploy:prod rollback"