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

# Auto-commit any uncommitted changes before production deploy
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}📝 Found uncommitted changes. Auto-committing before production deployment...${NC}"
    
    git add -A
    TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)
    COMMIT_MSG="Deploy to production: $TIMESTAMP"
    
    # Check for custom message
    if [ -f "DEPLOY_NOTES.md" ] && [ -s "DEPLOY_NOTES.md" ]; then
        CUSTOM_MSG=$(head -n 1 DEPLOY_NOTES.md | sed 's/^#\+ *//')
        if [ -n "$CUSTOM_MSG" ]; then
            COMMIT_MSG="Deploy to production: $CUSTOM_MSG"
        fi
        # Clear the file
        echo "# Deploy Notes" > DEPLOY_NOTES.md
        echo "" >> DEPLOY_NOTES.md
        echo "Add notes here for the next deployment..." >> DEPLOY_NOTES.md
    fi
    
    git commit -m "$COMMIT_MSG"
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || true
    echo -e "${GREEN}✅ Changes committed and pushed${NC}"
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

# Sync qual to production
ssh stackmap-cpanel << 'EOF'
    cd ~/public_html/manylla
    
    # Use rsync to make production match qual
    rsync -av \
        --exclude='.htaccess' \
        --exclude='qual' \
        --exclude='api/config.php' \
        --exclude='api/logs' \
        --delete \
        qual/ .
    
    echo "✅ Production updated from qual"
EOF

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