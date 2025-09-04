#!/bin/bash

# Manylla Staging (Qual) Deployment Script
# Deploys to manylla.com/qual for testing before production

set -e  # Exit on error

echo "🚀 Manylla Staging Deployment"
echo "=============================="
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

# Check for required tools
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }

# Auto-commit any uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}📝 Found uncommitted changes. Auto-committing before deployment...${NC}"
    
    # Add all changes
    git add -A
    
    # Generate commit message with timestamp
    TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)
    COMMIT_MSG="Deploy to qual: $TIMESTAMP"
    
    # Check if there's a custom message in DEPLOY_NOTES.md
    if [ -f "DEPLOY_NOTES.md" ] && [ -s "DEPLOY_NOTES.md" ]; then
        # Extract version and description from the latest deployment entry
        # Looking for pattern: ## YYYY_MM_DD_VV - Description
        VERSION_LINE=$(grep -E "^## [0-9]{4}_[0-9]{2}_[0-9]{2}_[0-9]{2} -" DEPLOY_NOTES.md | head -n 1)
        
        if [ -n "$VERSION_LINE" ]; then
            # Extract version (YYYY_MM_DD_VV)
            VERSION=$(echo "$VERSION_LINE" | sed -E 's/^## ([0-9]{4}_[0-9]{2}_[0-9]{2}_[0-9]{2}) .*/\1/')
            # Extract description (everything after the dash)
            DESCRIPTION=$(echo "$VERSION_LINE" | sed -E 's/^## [0-9]{4}_[0-9]{2}_[0-9]{2}_[0-9]{2} - //')
            
            if [ -n "$VERSION" ] && [ -n "$DESCRIPTION" ]; then
                COMMIT_MSG="v${VERSION}: ${DESCRIPTION}"
                echo -e "${GREEN}📋 Using version ${VERSION} from DEPLOY_NOTES.md${NC}"
                echo -e "${GREEN}📝 Description: ${DESCRIPTION}${NC}"
            fi
        fi
    fi
    
    # Commit changes
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed: $COMMIT_MSG${NC}"
fi

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main 2>/dev/null || git push origin master 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Could not push to GitHub. You may need to set up remote or resolve conflicts.${NC}"
    echo "Continue with deployment anyway? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}
echo -e "${GREEN}✅ Pushed to GitHub${NC}"

# Run pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check for critical vulnerabilities
echo "- Running security audit..."
npm audit --audit-level=critical 2>&1 | tail -5
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}❌ Critical vulnerabilities found!${NC}"
    echo "Run 'npm audit' to see details"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run lint check (warnings OK, errors not)
echo "- Running lint check..."
npm run lint 2>&1 | tail -10
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Lint warnings found (continuing)${NC}"
fi

# Check for console.logs (just a warning)
CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -gt "10" ]; then
    echo -e "${YELLOW}⚠️  Warning: $CONSOLE_COUNT console.log statements found${NC}"
fi

echo -e "${GREEN}✅ Pre-deployment checks complete${NC}"
echo

# Copy staging environment file
if [ -f .env.staging ]; then
    cp .env.staging .env.production.local
    echo -e "${GREEN}✅ Using staging environment configuration${NC}"
else
    echo -e "${YELLOW}⚠️  No .env.staging file found, using defaults${NC}"
fi

echo -e "${YELLOW}📦 Building for staging...${NC}"

# Update homepage in package.json for qual subdirectory
cp package.json package.json.backup
node -e "
const pkg = require('./package.json');
pkg.homepage = '/qual';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Build the app (will use .env.production.local which we just created)
npm run build

# Clean up environment file
rm -f .env.production.local

# Restore original package.json
mv package.json.backup package.json

echo -e "${GREEN}✅ Build complete${NC}"
echo

# Check if SSH alias exists (use stackmap-cpanel since it's the same server)
if ! grep -q "Host stackmap-cpanel" ~/.ssh/config 2>/dev/null; then
    echo -e "${YELLOW}📝 SSH configuration needed${NC}"
    echo "It looks like SSH isn't configured yet."
    echo "Run: ./scripts/setup-ssh.sh"
    exit 1
fi

echo -e "${YELLOW}🚀 Deploying to staging...${NC}"

# Create qual directory if it doesn't exist
ssh stackmap-cpanel "mkdir -p ~/public_html/manylla/qual"

# Deploy build files to qual
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env' \
    build/ stackmap-cpanel:~/public_html/manylla/qual/

# Deploy API if it exists
if [ -d "api" ]; then
    echo -e "${YELLOW}📡 Deploying API...${NC}"
    
    # Create API directories
    ssh stackmap-cpanel "mkdir -p ~/public_html/manylla/qual/api/{config,sync,share,logs}"
    
    # Deploy API files (excluding sensitive configs)
    rsync -avz \
        --exclude='.git' \
        --exclude='config/*.php' \
        --exclude='*.example.php' \
        api/sync/ stackmap-cpanel:~/public_html/manylla/qual/api/sync/
    
    # Deploy database class
    scp api/config/database.php stackmap-cpanel:~/public_html/manylla/qual/api/config/
    
    # Deploy main config loader
    scp api/config/config.php stackmap-cpanel:~/public_html/manylla/qual/api/config/
    
    # Check if qual config exists and deploy it
    if [ -f "api/config/config.qual.php" ]; then
        echo -e "${YELLOW}📄 Deploying qual configuration...${NC}"
        scp api/config/config.qual.php stackmap-cpanel:~/public_html/manylla/qual/api/config/
        ssh stackmap-cpanel "chmod 600 ~/public_html/manylla/qual/api/config/config.qual.php"
    else
        echo -e "${YELLOW}⚠️  Warning: Qual API config not found. Run deploy-api-config.sh first.${NC}"
    fi
    
    # Set permissions
    ssh stackmap-cpanel "chmod 755 ~/public_html/manylla/qual/api/logs"
fi

echo
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}🌐 Staging URL: https://manylla.com/qual${NC}"
echo
echo "Test your changes at the staging URL before deploying to production."
echo "To deploy to production, run: npm run deploy:prod"