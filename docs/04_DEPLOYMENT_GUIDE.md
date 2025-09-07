# Deployment Guide

## Current Status
**Phase 3 COMPLETED** - Cloud Data Storage is fully operational
- ✅ All data stored in cloud (no localStorage fallbacks)
- ✅ Zero-knowledge encryption maintained
- ✅ Deployed to https://manylla.com/qual/
- ✅ All API endpoints operational

## Build Process

### Development Build
```bash
# Start development server
cd /Users/adamstack/manylla/manylla-app
npm start

# Runs on http://localhost:3000
# Hot reloading enabled
# Source maps included
```

### Production Build
```bash
# Create optimized production build
npm run build

# Output directory: ./build/
# Optimizations applied:
# - Minification
# - Tree shaking  
# - Code splitting
# - Asset optimization
# - Service worker generation
```

### Build Configuration
```json
// package.json build settings
{
  "homepage": "/qual",  // Change for different deployments
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 react-scripts build"
  }
}

// Environment variables (.env.production)
REACT_APP_API_URL=https://manylla.com/api
REACT_APP_SHARE_DOMAIN=https://manylla.com
GENERATE_SOURCEMAP=false
```

## Deployment Environments

### Local Development
```bash
# Prerequisites
Node.js >= 18.0.0
npm >= 9.0.0

# Setup
git clone https://github.com/ajstack22/manylla.git
cd manylla/manylla-app
npm install
npm start
```

### Staging/Qual Environment (PHASE 3 DEPLOYED)
```bash
# SSH Access (Namecheap uses port 21098)
ssh -p 21098 stachblx@manylla.com

# Automatic deployment script
./scripts/deploy-qual.sh

# Manual deployment steps:
1. npm run build
2. rsync -avz -e "ssh -p 21098" build/ stachblx@manylla.com:/home/stachblx/public_html/manylla/qual/
3. Deploy API files via SSH

# Access URL: https://manylla.com/qual
# API Base: https://manylla.com/qual/api/

# Current API Endpoints (All Operational):
- /api/sync_health.php - Health check
- /api/sync_push.php - Push encrypted data
- /api/sync_pull.php - Pull encrypted data  
- /api/share_create.php - Create encrypted share
- /api/share_access.php - Access encrypted share
```

### Production Environment
```bash
# Automatic deployment script
./scripts/deploy-prod.sh

# Manual deployment steps:
1. Update package.json homepage to "/"
2. npm run build
3. rsync -avz -e "ssh -p 21098" build/ stachblx@manylla.com:/home/stachblx/public_html/manylla/
4. Deploy API files to /public_html/manylla/api/

# Access URL: https://manylla.com
# Note: Production deployment pending Phase 4 completion
```

## Deployment Scripts

### deploy-qual.sh
```bash
#!/bin/bash
# Location: /scripts/deploy-qual.sh

# Features:
- Auto-commits uncommitted changes with DEPLOY_NOTES.md message
- Pushes to GitHub
- Runs security audit and lint checks
- Builds with staging configuration
- Deploys frontend to /qual directory
- Deploys API to /qual/api directory
- Updates qual-specific configuration

# Usage:
./scripts/deploy-qual.sh
```

### deploy-prod.sh
```bash
#!/bin/bash
# Location: /scripts/deploy-prod.sh

# Features:
- Requires clean git working directory
- Creates git tag for release
- Builds with production configuration
- Deploys frontend to root directory
- Deploys API to /api directory
- Creates backup before deployment
- Updates production configuration

# Usage:
./scripts/deploy-prod.sh
```

### deploy-api-config.sh
```bash
#!/bin/bash
# Location: /scripts/deploy-api-config.sh

# Purpose: Deploy API configuration files
# Updates database credentials and environment settings

# Usage:
./scripts/deploy-api-config.sh [qual|prod]
```

## Server Configuration

### Directory Structure
```
/home/stachblx/public_html/
├── index.html              # Production frontend
├── api/                    # Production API
│   ├── share/
│   ├── sync/
│   └── config.php
├── qual/                   # Staging environment
│   ├── index.html         # Staging frontend
│   └── api/               # Staging API
└── .htaccess              # Apache configuration
```

### Apache Configuration (.htaccess)
```apache
# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA routing for React
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteRule . /index.html [L]

# Security headers
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

### PHP Configuration
```php
// api/config.php (environment-specific)

// Qual/Staging (PHASE 3 ACTIVE)
define('DB_HOST', 'localhost');
define('DB_NAME', 'stachblx_manylla_sync_qual');
define('DB_USER', 'stachblx_mql');
define('DB_PASS', '***'); // Stored securely
define('API_ENV', 'qual');

// Production (Pending)
define('DB_HOST', 'localhost');
define('DB_NAME', 'stachblx_manylla_sync_prod');
define('DB_USER', 'stachblx_mpl');
define('DB_PASS', '***'); // Stored securely
define('API_ENV', 'production');

// CORS settings
$allowed_origins = [
    'https://manylla.com',
    'https://stackmap.app',
    'http://localhost:3000' // Development only
];
```

## Database Deployment

### Initial Setup
```sql
-- Run on server MySQL
CREATE DATABASE stachblx_manylla_sync_qual;
CREATE DATABASE stachblx_manylla_sync_prod;

-- Create users
CREATE USER 'stachblx_manyqual'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'stachblx_manyprod'@'localhost' IDENTIFIED BY 'password';

-- Grant permissions
GRANT ALL PRIVILEGES ON stachblx_manylla_sync_qual.* TO 'stachblx_manyqual'@'localhost';
GRANT ALL PRIVILEGES ON stachblx_manylla_sync_prod.* TO 'stachblx_manyprod'@'localhost';

-- Run schema setup
SOURCE /path/to/schema.sql;
```

### Migration Process
```bash
# Backup existing data
mysqldump -u user -p stachblx_manylla_sync_prod > backup_$(date +%Y%m%d).sql

# Apply migrations
mysql -u user -p stachblx_manylla_sync_prod < migration.sql

# Verify migration
mysql -u user -p -e "SELECT version FROM migrations ORDER BY id DESC LIMIT 1;" stachblx_manylla_sync_prod
```

## CI/CD Pipeline

### GitHub Actions (Future)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy to server
        run: ./scripts/deploy-prod.sh
```

### Pre-Deployment Checklist
```markdown
- [ ] All tests passing
- [ ] No linting errors
- [ ] Updated DEPLOY_NOTES.md
- [ ] Database migrations ready
- [ ] Environment variables updated
- [ ] Backup created
- [ ] Monitoring alerts configured
```

## Monitoring & Maintenance

### Health Checks
```bash
# API health check
curl https://manylla.com/api/health.php

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

### Log Files
```bash
# Location on server
/home/stachblx/logs/
├── access.log       # Apache access logs
├── error.log        # Apache error logs
└── api_errors.log   # API-specific errors

# Monitor logs
tail -f /home/stachblx/logs/api_errors.log
```

### Database Maintenance
```sql
-- Clean expired share links (run daily)
DELETE FROM share_links WHERE expires_at < NOW();

-- Clean old rate limits (run hourly)
DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 2 HOUR);

-- Optimize tables (run weekly)
OPTIMIZE TABLE sync_data, share_links, rate_limits;
```

## Rollback Procedures

### Frontend Rollback
```bash
# Keep previous build
mv build/ build_backup/
npm run build

# If issues, restore backup
rm -rf build/
mv build_backup/ build/
rsync -avz build/ adam@manylla.com:/home/stachblx/public_html/
```

### Database Rollback
```bash
# Restore from backup
mysql -u user -p stachblx_manylla_sync_prod < backup_20240104.sql

# Verify restoration
mysql -u user -p -e "SELECT COUNT(*) FROM sync_groups;" stachblx_manylla_sync_prod
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Memory issues
NODE_OPTIONS=--max-old-space-size=8192 npm run build

# Clear cache
rm -rf node_modules/.cache
npm run build
```

#### Deployment Failures
```bash
# Check SSH connection
ssh adam@manylla.com "echo 'Connection OK'"

# Check disk space
ssh adam@manylla.com "df -h"

# Check file permissions
ssh adam@manylla.com "ls -la /home/stachblx/public_html/"
```

#### API Errors
```php
// Enable debug mode in config.php
define('DEBUG_MODE', true);
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
```

## Security Considerations

### Pre-Deployment Security Checks
```bash
# Run security audit
npm audit

# Check for secrets in code
grep -r "password\|secret\|key\|token" --exclude-dir=node_modules

# Verify environment variables
cat .env.production | grep -v "#"
```

### Production Security Settings
- HTTPS enforced via .htaccess
- Security headers configured
- Rate limiting implemented
- Input validation on all endpoints
- Prepared statements for all queries
- Regular security updates applied

## Environment Variables Reference

### Frontend (.env)
```bash
REACT_APP_API_URL=https://manylla.com/api
REACT_APP_SHARE_DOMAIN=https://manylla.com
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

### Backend (config.php)
```php
define('ENVIRONMENT', 'production'); // or 'staging'
define('DEBUG_MODE', false);
define('RATE_LIMIT_ENABLED', true);
define('CORS_ENABLED', true);
define('MAX_SHARE_SIZE', 10485760); // 10MB
```

## Version Management

### Semantic Versioning
```
MAJOR.MINOR.PATCH
1.0.0 - Initial release
1.1.0 - New feature added
1.1.1 - Bug fix

Update in:
- package.json
- api/version.php
- DEPLOY_NOTES.md
```

### Release Process
1. Update version numbers
2. Update CHANGELOG.md
3. Create git tag: `git tag -a v1.0.0 -m "Release 1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. Deploy to production
6. Create GitHub release