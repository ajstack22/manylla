#!/bin/bash

# Manylla Multi-Platform Deployment Script
# Deploys to:
# - manylla.com/qual for web testing
# - iOS/Android simulators for mobile testing

set -e  # Exit on error

echo "🚀 Manylla Multi-Platform Deployment"
echo "======================================"
echo

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WEB_PROJECT_ROOT="/Users/adamstack/Desktop/manylla-app"
MOBILE_PROJECT_ROOT="/Users/adamstack/manylla"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for required tools
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }

# Function to increment version
increment_version() {
    # Get current version from package.json
    if [ -f "$WEB_PROJECT_ROOT/package.json" ]; then
        CURRENT_VERSION=$(grep '"version":' "$WEB_PROJECT_ROOT/package.json" | head -1 | cut -d'"' -f4)
    else
        CURRENT_VERSION="0.0.0.0"
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
    echo -e "${GREEN}📈 New version: $NEW_VERSION${NC}"
    
    # Update package.json in both projects
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$WEB_PROJECT_ROOT/package.json"
        sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MOBILE_PROJECT_ROOT/package.json"
    else
        # Linux
        sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$WEB_PROJECT_ROOT/package.json"
        sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MOBILE_PROJECT_ROOT/package.json"
    fi
    
    echo -e "${GREEN}✅ Version updated to $NEW_VERSION${NC}"
    
    # Export for use later
    export NEW_VERSION
    export CURRENT_VERSION
}

# Function to deploy to simulators
deploy_to_simulators() {
    echo
    echo -e "${BLUE}📱 Deploying to Mobile Simulators${NC}"
    echo "=================================="
    
    cd "$MOBILE_PROJECT_ROOT"
    
    # Check if iOS simulator is running
    SIMULATOR_STATUS=$(xcrun simctl list devices | grep "Booted" | wc -l | tr -d ' ')
    
    if [ "$SIMULATOR_STATUS" -gt 0 ]; then
        echo -e "${YELLOW}📱 Found running iOS simulator(s)${NC}"
        
        # Option to rebuild or just reload
        echo "Choose deployment option:"
        echo "1) Full rebuild and deploy (slower, ensures latest native changes)"
        echo "2) Quick reload (faster, JavaScript changes only)"
        read -p "Enter choice (1 or 2): " DEPLOY_CHOICE
        
        case $DEPLOY_CHOICE in
            1)
                echo -e "${YELLOW}🔨 Building and deploying to iOS simulator...${NC}"
                npx react-native run-ios
                ;;
            2)
                echo -e "${YELLOW}♻️  Reloading iOS app...${NC}"
                # Trigger reload in simulator
                xcrun simctl openurl booted "http://localhost:8081/reload"
                echo -e "${GREEN}✅ iOS app reloaded${NC}"
                ;;
            *)
                echo -e "${YELLOW}⚠️  Invalid choice, skipping iOS deployment${NC}"
                ;;
        esac
    else
        echo -e "${YELLOW}⚠️  No iOS simulator running${NC}"
        read -p "Start iOS simulator and deploy? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}🚀 Starting iOS simulator and deploying...${NC}"
            npx react-native run-ios --simulator="iPhone 16 Pro"
        fi
    fi
    
    # Check for Android emulator (optional)
    if command -v adb >/dev/null 2>&1; then
        ADB_DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l | tr -d ' ')
        if [ "$ADB_DEVICES" -gt 0 ]; then
            echo -e "${YELLOW}🤖 Found Android device/emulator${NC}"
            read -p "Deploy to Android? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}🔨 Building and deploying to Android...${NC}"
                npx react-native run-android
            fi
        fi
    fi
}

# Function to deploy to web qual
deploy_to_web_qual() {
    echo
    echo -e "${BLUE}🌐 Deploying to Web Qual${NC}"
    echo "========================"
    
    cd "$WEB_PROJECT_ROOT"
    
    # Auto-commit any uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${YELLOW}📝 Found uncommitted changes. Auto-committing before deployment...${NC}"
        
        # Add all changes
        git add -A
        
        # Generate commit message with version and description
        COMMIT_MSG="v${NEW_VERSION}: Deploy to qual"
        
        # Check if RELEASE_NOTES.md has a description for this version
        if [ -f "RELEASE_NOTES.md" ]; then
            # Try to extract the latest version's title from release notes
            LATEST_TITLE=$(grep -A1 "^## Version" RELEASE_NOTES.md | head -2 | tail -1 | sed 's/^[^-]*- //')
            if [ -n "$LATEST_TITLE" ]; then
                COMMIT_MSG="v${NEW_VERSION}: ${LATEST_TITLE}"
                echo -e "${GREEN}📝 Using description from RELEASE_NOTES.md${NC}"
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
            return 1
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
            return 1
        fi
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
    NODE_OPTIONS=--max-old-space-size=8192 npm run build
    
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
        return 1
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
    
    # Copy the correct .htaccess file for qual
    if [ -f "public/.htaccess.qual" ]; then
        echo -e "${YELLOW}📄 Deploying qual .htaccess...${NC}"
        scp public/.htaccess.qual stackmap-cpanel:~/public_html/manylla/qual/.htaccess
    else
        echo -e "${YELLOW}⚠️  Using default .htaccess${NC}"
    fi
    
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
}

# Main deployment flow
echo "🎯 Deployment Options:"
echo "1) Deploy to Web Qual only"
echo "2) Deploy to Mobile Simulators only"
echo "3) Deploy to Both (Web + Mobile)"
echo "4) Quick reload Mobile only (no build)"
read -p "Enter your choice (1-4): " MAIN_CHOICE

# Increment version for any deployment
increment_version

case $MAIN_CHOICE in
    1)
        deploy_to_web_qual
        echo
        echo -e "${GREEN}✅ Web Deployment Complete!${NC}"
        echo -e "${GREEN}🌐 Staging URL: https://manylla.com/qual${NC}"
        ;;
    2)
        deploy_to_simulators
        echo
        echo -e "${GREEN}✅ Mobile Deployment Complete!${NC}"
        ;;
    3)
        deploy_to_web_qual
        deploy_to_simulators
        echo
        echo -e "${GREEN}✅ Full Deployment Complete!${NC}"
        echo -e "${GREEN}🌐 Web: https://manylla.com/qual${NC}"
        echo -e "${GREEN}📱 Mobile: Check your simulators${NC}"
        ;;
    4)
        cd "$MOBILE_PROJECT_ROOT"
        echo -e "${YELLOW}♻️  Quick reloading mobile app...${NC}"
        xcrun simctl openurl booted "http://localhost:8081/reload"
        echo -e "${GREEN}✅ Mobile app reloaded${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo
echo "Test your changes before deploying to production."
echo "To deploy to production, run: npm run deploy:prod"