#!/bin/bash

# Deploy API configuration to qual or prod
# Usage: ./deploy-api-config.sh [qual|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for environment argument
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Please specify environment (qual or prod)${NC}"
    echo "Usage: $0 [qual|prod]"
    exit 1
fi

ENV=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
API_DIR="$APP_DIR/api"

# Validate environment
if [ "$ENV" != "qual" ] && [ "$ENV" != "prod" ]; then
    echo -e "${RED}Error: Invalid environment. Use 'qual' or 'prod'${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Deploying API configuration to ${ENV}...${NC}"
echo "========================================="

# Check if config file exists
CONFIG_FILE="$API_DIR/config/config.$ENV.php"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Error: Configuration file not found: $CONFIG_FILE${NC}"
    echo "Please create the configuration file first."
    exit 1
fi

# Check for password placeholder
if grep -q "YOUR_.*_DB_PASSWORD_HERE" "$CONFIG_FILE"; then
    echo -e "${YELLOW}⚠️  Warning: Database password not set in $CONFIG_FILE${NC}"
    echo "Please update the database password before deploying."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Determine deployment path
if [ "$ENV" == "qual" ]; then
    DEPLOY_PATH="~/public_html/manylla/qual/api"
    URL="https://manylla.com/qual/api/"
else
    DEPLOY_PATH="~/public_html/manylla/api"
    URL="https://manylla.com/api/"
fi

echo -e "${YELLOW}📦 Deploying API files to $ENV...${NC}"

# Create API directories if they don't exist
echo "Creating API directories..."
ssh stackmap-cpanel "mkdir -p $DEPLOY_PATH/config $DEPLOY_PATH/sync $DEPLOY_PATH/share $DEPLOY_PATH/logs"

# Deploy API files
echo "Deploying API files..."

# Deploy main config loader
scp "$API_DIR/config/config.php" stackmap-cpanel:$DEPLOY_PATH/config/

# Deploy environment-specific config
scp "$CONFIG_FILE" stackmap-cpanel:$DEPLOY_PATH/config/

# Deploy database class
scp "$API_DIR/config/database.php" stackmap-cpanel:$DEPLOY_PATH/config/

# Deploy sync endpoints
for file in "$API_DIR/sync"/*.php; do
    if [ -f "$file" ]; then
        scp "$file" stackmap-cpanel:$DEPLOY_PATH/sync/
    fi
done

# Deploy share endpoints (if they exist)
if [ -d "$API_DIR/share" ]; then
    for file in "$API_DIR/share"/*.php; do
        if [ -f "$file" ]; then
            scp "$file" stackmap-cpanel:$DEPLOY_PATH/share/
        fi
    done
fi

# Deploy .htaccess for API routing
echo "Deploying .htaccess..."
cat > /tmp/api_htaccess << 'EOF'
# Manylla API .htaccess
# Handles API routing and security

# Enable rewrite engine
RewriteEngine On

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"

# Prevent direct access to config files
<FilesMatch "\.(php|sql|log)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>

# Allow API endpoints
<FilesMatch "^(backup|restore|share|access)\.php$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Disable directory browsing
Options -Indexes

# UTF-8 encoding
AddDefaultCharset UTF-8

# PHP settings
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value max_execution_time 30
php_value max_input_time 30
EOF

scp /tmp/api_htaccess stackmap-cpanel:$DEPLOY_PATH/.htaccess
rm /tmp/api_htaccess

# Set proper permissions
echo "Setting permissions..."
ssh stackmap-cpanel "
    chmod 755 $DEPLOY_PATH
    chmod 755 $DEPLOY_PATH/sync
    chmod 755 $DEPLOY_PATH/share 2>/dev/null || true
    chmod 755 $DEPLOY_PATH/config
    chmod 755 $DEPLOY_PATH/logs
    chmod 644 $DEPLOY_PATH/.htaccess
    chmod 644 $DEPLOY_PATH/sync/*.php
    chmod 644 $DEPLOY_PATH/share/*.php 2>/dev/null || true
    chmod 600 $DEPLOY_PATH/config/config.$ENV.php
    chmod 644 $DEPLOY_PATH/config/config.php
    chmod 644 $DEPLOY_PATH/config/database.php
"

# Test the API endpoint
echo -e "\n${YELLOW}🧪 Testing API endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${URL}sync/health.php" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ API endpoint is responding correctly${NC}"
elif [ "$HTTP_CODE" == "000" ]; then
    echo -e "${YELLOW}⚠️  Could not reach API endpoint (might not have health check)${NC}"
else
    echo -e "${YELLOW}⚠️  API returned HTTP $HTTP_CODE${NC}"
fi

echo -e "\n${GREEN}✅ API configuration deployed to $ENV!${NC}"
echo -e "${BLUE}🔗 API URL: $URL${NC}"
echo ""
echo "Next steps:"
echo "1. Create the database on the server if not exists"
echo "2. Update the database password in the config file"
echo "3. Run the setup.sql script to create tables"
echo "4. Test the sync functionality"

# Offer to show SQL setup commands
echo ""
read -p "Would you like to see the SQL commands to set up the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${BLUE}Database Setup Commands:${NC}"
    echo "======================================="
    if [ "$ENV" == "qual" ]; then
        echo "CREATE DATABASE IF NOT EXISTS stachblx_manylla_sync_qual;"
        echo "CREATE USER 'stachblx_manylla_qual'@'localhost' IDENTIFIED BY 'secure_password_here';"
        echo "GRANT ALL PRIVILEGES ON stachblx_manylla_sync_qual.* TO 'stachblx_manylla_qual'@'localhost';"
    else
        echo "CREATE DATABASE IF NOT EXISTS stachblx_manylla_sync_prod;"
        echo "CREATE USER 'stachblx_manylla_prod'@'localhost' IDENTIFIED BY 'secure_password_here';"
        echo "GRANT ALL PRIVILEGES ON stachblx_manylla_sync_prod.* TO 'stachblx_manylla_prod'@'localhost';"
    fi
    echo "FLUSH PRIVILEGES;"
    echo ""
    echo "Then run the setup.sql file in the database."
fi