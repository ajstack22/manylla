#!/bin/bash

# Deploy to Dev Environment Script
# This creates a safe testing environment before qual deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Manylla Dev Environment Deployment${NC}"
echo "===================================="

# Configuration
REMOTE_HOST="stackmap-cpanel"
REMOTE_DEV_PATH="~/public_html/manylla/dev"
REMOTE_API_PATH="~/public_html/manylla/dev/api"
LOCAL_BUILD_PATH="web/build"
LOCAL_API_PATH="api"

# Step 1: Build the web app
echo -e "\n${BLUE}Step 1: Building Web Application${NC}"
echo "─────────────────────────────────"
if [ -z "$SKIP_BUILD" ]; then
    NODE_OPTIONS=--max-old-space-size=8192 npm run build:web
    echo -e "${GREEN}✅ Build completed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping build (SKIP_BUILD=true)${NC}"
fi

# Step 2: Create dev environment structure on server
echo -e "\n${BLUE}Step 2: Setting up Dev Environment${NC}"
echo "──────────────────────────────────"
ssh $REMOTE_HOST "mkdir -p $REMOTE_DEV_PATH $REMOTE_API_PATH"
echo -e "${GREEN}✅ Dev directories created${NC}"

# Step 3: Deploy web build to dev
echo -e "\n${BLUE}Step 3: Deploying Web Build to Dev${NC}"
echo "────────────────────────────────────"
rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='*.map' \
    $LOCAL_BUILD_PATH/ $REMOTE_HOST:$REMOTE_DEV_PATH/
echo -e "${GREEN}✅ Web build deployed to dev${NC}"

# Step 4: Deploy API to dev
echo -e "\n${BLUE}Step 4: Deploying API to Dev${NC}"
echo "──────────────────────────────"
if [ -d "$LOCAL_API_PATH" ]; then
    rsync -avz \
        --exclude='.DS_Store' \
        --exclude='config.php' \
        $LOCAL_API_PATH/ $REMOTE_HOST:$REMOTE_API_PATH/
    echo -e "${GREEN}✅ API deployed to dev${NC}"
else
    echo -e "${YELLOW}⚠️  No API directory found locally${NC}"
fi

# Step 5: Create dev-specific .htaccess
echo -e "\n${BLUE}Step 5: Configuring Dev .htaccess${NC}"
echo "───────────────────────────────────"
cat > /tmp/.htaccess.dev << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /manylla/dev/

  # Handle client-side routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/manylla/dev/api
  RewriteRule . /manylla/dev/index.html [L]

  # API pass-through
  RewriteRule ^api/(.*)$ api/$1 [L,QSA]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Enable CORS for dev testing
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "http://localhost:3000"
  Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
EOF

scp /tmp/.htaccess.dev $REMOTE_HOST:$REMOTE_DEV_PATH/.htaccess
rm /tmp/.htaccess.dev
echo -e "${GREEN}✅ Dev .htaccess configured${NC}"

# Step 6: Create dev API configuration
echo -e "\n${BLUE}Step 6: Creating Dev API Config${NC}"
echo "─────────────────────────────────"
cat > /tmp/config.dev.php << 'EOF'
<?php
// Dev Environment Configuration
define('ENV', 'dev');
define('DB_NAME', 'stachblx_manylla_sync_dev');
define('CORS_ORIGIN', 'http://localhost:3000,https://manylla.com');
define('DEBUG', true);
define('LOG_ERRORS', true);

// Use same DB credentials as qual but different database
require_once(__DIR__ . '/../../qual/api/config.php');

// Override database name for dev
$GLOBALS['DB_NAME'] = 'stachblx_manylla_sync_dev';
?>
EOF

scp /tmp/config.dev.php $REMOTE_HOST:$REMOTE_API_PATH/config.php
rm /tmp/config.dev.php
echo -e "${GREEN}✅ Dev API configuration created${NC}"

# Step 7: Set up dev database (if needed)
echo -e "\n${BLUE}Step 7: Database Setup${NC}"
echo "───────────────────────"
echo -e "${YELLOW}Note: You may need to create the dev database manually via cPanel${NC}"
echo "Database name: stachblx_manylla_sync_dev"
echo "Copy structure from: stachblx_manylla_sync_qual"

# Step 8: Test the deployment
echo -e "\n${BLUE}Step 8: Testing Dev Deployment${NC}"
echo "────────────────────────────────"
DEV_URL="https://manylla.com/dev/"
API_HEALTH_URL="https://manylla.com/dev/api/sync_health.php"

echo "Testing web deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DEV_URL)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Web deployment successful${NC}"
else
    echo -e "${RED}❌ Web deployment failed (HTTP $HTTP_STATUS)${NC}"
fi

echo "Testing API health..."
API_RESPONSE=$(curl -s $API_HEALTH_URL 2>/dev/null || echo "{}")
if echo "$API_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed${NC}"
    echo "Response: $API_RESPONSE"
fi

echo -e "\n${CYAN}════════════════════════════════════${NC}"
echo -e "${GREEN}Dev Deployment Complete!${NC}"
echo -e "${CYAN}════════════════════════════════════${NC}"
echo ""
echo "Access your dev environment at:"
echo -e "${BLUE}  Web: https://manylla.com/dev/${NC}"
echo -e "${BLUE}  API: https://manylla.com/dev/api/${NC}"
echo ""
echo "To run tests against dev API:"
echo -e "${YELLOW}  API_ENV=dev npm test${NC}"
echo ""
echo "Once dev testing passes, deploy to qual:"
echo -e "${YELLOW}  ./scripts/deploy-qual.sh${NC}"