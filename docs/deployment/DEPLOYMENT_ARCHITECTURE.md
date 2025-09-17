# Manylla Deployment Architecture & Infrastructure Guide

## Overview
This document comprehensively details the deployment architecture, server configuration, and infrastructure setup for Manylla on Namecheap shared hosting with cPanel.

## Table of Contents
1. [Server Infrastructure](#server-infrastructure)
2. [Directory Structure](#directory-structure)
3. [Domain Configuration](#domain-configuration)
4. [Database Architecture](#database-architecture)
5. [SSH Access](#ssh-access)
6. [Apache Configuration](#apache-configuration)
7. [Deployment Process](#deployment-process)
8. [Troubleshooting](#troubleshooting)

---

## Server Infrastructure

### Hosting Environment
- **Provider**: Namecheap Shared Hosting
- **Control Panel**: cPanel
- **Server Software**: LiteSpeed/Apache
- **PHP Version**: 8.1.33
- **MySQL Version**: MariaDB
- **SSL**: Enabled via cPanel AutoSSL

### Server Details
- **Primary Domain**: manylla.com
- **Server IP**: 199.188.200.58
- **cPanel Username**: stachblx
- **Home Directory**: `/home/stachblx/`

### Shared Server Architecture
**IMPORTANT**: Manylla shares the server with StackMap
- Both applications reside on the same Namecheap account
- Each has its own directory structure and databases
- Careful configuration required to avoid conflicts

---

## Directory Structure

### Root Level Organization
```
/home/stachblx/public_html/
├── api/                    # StackMap production API
├── qual/                   # StackMap qual/staging
├── manylla/               # Manylla base directory (manylla.com root)
│   ├── index.html         # Production frontend
│   ├── static/            # Production assets
│   ├── api/               # Production API
│   └── qual/              # Qual/staging environment
│       ├── index.html     # Qual frontend
│       ├── static/        # Qual assets
│       └── api/           # Qual API
└── [other StackMap files]
```

### Critical Path Mapping
| URL | Physical Path | Purpose |
|-----|--------------|---------|
| `manylla.com` | `/public_html/manylla/` | Production |
| `manylla.com/qual` | `/public_html/manylla/qual/` | Staging |
| `manylla.com/api` | `/public_html/manylla/api/` | Production API |
| `manylla.com/qual/api` | `/public_html/manylla/qual/api/` | Staging API |

### Directory Depth Importance
**CRITICAL**: Manylla is one directory level deeper than StackMap
- StackMap qual: `/public_html/qual/`
- Manylla qual: `/public_html/manylla/qual/`
- This affects `.htaccess` rules and RewriteBase configurations

---

## Domain Configuration

### cPanel Domain Setup
1. **Primary Domain**: manylla.com
2. **Document Root**: `/home/stachblx/public_html/manylla`
3. **Subdomain Configuration**: Not used (using subdirectories instead)

### DNS Configuration
- Managed through Namecheap
- Points to shared hosting IP
- SSL certificate auto-provisioned

---

## Database Architecture

### Database Naming Convention
```
stachblx_[app]_[purpose]_[env]
```

### Manylla Databases

#### Production Database
- **Name**: `stachblx_manylla_sync_prod`
- **User**: `stachblx_mpl`
- **Tables**: sync_data, sync_backups, shares, active_shares, etc.

#### Qual/Staging Database
- **Name**: `stachblx_manylla_sync_qual`
- **User**: `stachblx_mql`
- **Password**: `M8C52Mp8f17fIc5UkBVnKQ==`
- **Tables**: Same structure as production

### Database Access
```bash
# Access qual database
mysql -u stachblx_mql -p'M8C52Mp8f17fIc5UkBVnKQ==' stachblx_manylla_sync_qual

# Access production database
mysql -u stachblx_mpl -p'[PROD_PASSWORD]' stachblx_manylla_sync_prod
```

### Table Structure (Phase 3)
```sql
-- Key tables for Phase 3 Cloud Storage
- shares (share_token, encrypted_data, expires_at)
- sync_data (sync_id, device_id, encrypted_blob, blob_hash, version)
- sync_backups (backup_id, sync_id, encrypted_blob, version)
- active_shares (tracking active share sessions)
```

---

## SSH Access

### Connection Details
```bash
# Namecheap uses non-standard SSH port
ssh -p 21098 stachblx@manylla.com

# Alternative with key authentication
ssh -p 21098 -i ~/.ssh/id_rsa stachblx@manylla.com
```

### Important SSH Notes
- **Port**: 21098 (NOT the standard 22)
- **Username**: stachblx (cPanel username)
- **Authentication**: Password or SSH key
- **Restrictions**: Shared hosting limitations apply

### Common SSH Commands
```bash
# Navigate to Manylla qual
cd ~/public_html/manylla/qual

# Check API files
ls -la ~/public_html/manylla/qual/api/

# Test PHP execution
php ~/public_html/manylla/qual/api/sync_health.php

# Monitor error logs
tail -f ~/logs/manylla.com/error.log
```

---

## Apache Configuration

### .htaccess Hierarchy
The `.htaccess` files cascade with specific rules at each level:

#### 1. Root Level (`/public_html/.htaccess`)
- General server rules
- Affects all subdomains

#### 2. Manylla Base (`/public_html/manylla/.htaccess`)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Route API requests
  RewriteRule ^api/ - [L]
  
  # Handle React routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]
</IfModule>
```

#### 3. Manylla Qual (`/public_html/manylla/qual/.htaccess`)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /qual/
  
  # CRITICAL: Exclude API from React routing
  RewriteRule ^api/ - [L]
  
  # Handle share routes
  RewriteRule ^share/.*$ /qual/index.html [L]
  
  # Handle sync routes
  RewriteRule ^sync/.*$ /qual/index.html [L]
  
  # Serve existing files/directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /qual/index.html [L]
</IfModule>
```

#### 4. API Directory (`/public_html/manylla/qual/api/.htaccess`)
```apache
# CRITICAL: Disable rewriting in API directory
RewriteEngine Off

# Ensure PHP execution
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# CORS headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

### Critical .htaccess Rules

#### API Exclusion Rule
**MUST be placed BEFORE other RewriteRules:**
```apache
RewriteRule ^api/ - [L]
```
This prevents API requests from being routed to React

#### RewriteBase Configuration
- Must match the URL path structure
- For `/manylla/qual/`: `RewriteBase /qual/`
- NOT `/manylla/qual/` because URL already includes manylla

---

## Deployment Process

### Deployment Script Configuration
Update `scripts/deploy-qual.sh`:
```bash
# Correct deployment paths
REMOTE_PATH="/home/stachblx/public_html/manylla/qual"
API_PATH="/home/stachblx/public_html/manylla/qual/api"

# Use correct SSH port
SSH_PORT=21098
rsync -avz -e "ssh -p $SSH_PORT" build/ stachblx@manylla.com:$REMOTE_PATH/
```

### Manual Deployment Steps

#### 1. Build the Application
```bash
cd /Users/adamstack/manylla/manylla-app
npm run build
```

#### 2. Deploy Frontend
```bash
# Deploy to qual
rsync -avz -e "ssh -p 21098" build/ stachblx@manylla.com:~/public_html/manylla/qual/

# Deploy to production
rsync -avz -e "ssh -p 21098" build/ stachblx@manylla.com:~/public_html/manylla/
```

#### 3. Deploy API
```bash
# Deploy API files
scp -P 21098 -r api/* stachblx@manylla.com:~/public_html/manylla/qual/api/
```

#### 4. Configure API
```bash
# SSH into server
ssh -p 21098 stachblx@manylla.com

# Update config files
cd ~/public_html/manylla/qual/api
vim config/config.qual.php
```

### Configuration Files

#### API Configuration (`config/config.qual.php`)
```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'stachblx_manylla_sync_qual');
define('DB_USER', 'stachblx_mql');
define('DB_PASS', 'M8C52Mp8f17fIc5UkBVnKQ==');
define('DB_CHARSET', 'utf8mb4');
define('API_ENV', 'qual');
?>
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. API Returns HTML Instead of JSON
**Symptom**: API calls return React app HTML
**Cause**: `.htaccess` rewrite rules catching API requests
**Solution**: 
- Ensure `RewriteRule ^api/ - [L]` is FIRST in `.htaccess`
- Verify `RewriteEngine Off` in `/api/.htaccess`

#### 2. 500 Internal Server Error
**Possible Causes**:
- Syntax error in `.htaccess`
- PHP version mismatch
- Missing PHP extensions

**Debug Steps**:
```bash
# Check error logs
ssh -p 21098 stachblx@manylla.com
tail -f ~/logs/error.log

# Test PHP directly
php ~/public_html/manylla/qual/api/test.php
```

#### 3. Database Connection Failed
**Check**:
- Credentials in config.php
- Database exists
- User has permissions

```bash
# Test connection
mysql -u stachblx_mql -p'M8C52Mp8f17fIc5UkBVnKQ==' stachblx_manylla_sync_qual -e "SELECT 1;"
```

#### 4. Share Creation Fails
**Common Issues**:
- Table structure mismatch (share_token vs access_code)
- Missing columns (recipient_type doesn't exist)
- API routing issues

**Verify**:
```bash
# Check table structure
mysql -u stachblx_mql -p'PASSWORD' stachblx_manylla_sync_qual -e "DESCRIBE shares;"

# Test API directly
curl -X POST https://manylla.com/qual/api/share_create.php \
  -H "Content-Type: application/json" \
  -d '{"encrypted_data":"test"}'
```

### Path Resolution Issues

#### Understanding REQUEST_URI
- For `https://manylla.com/qual/api/test.php`
- REQUEST_URI = `/qual/api/test.php`
- Physical path = `/home/stachblx/public_html/manylla/qual/api/test.php`

#### Directory Depth Matters
- StackMap qual: 2 levels deep (`/public_html/qual/`)
- Manylla qual: 3 levels deep (`/public_html/manylla/qual/`)
- Affects how Apache processes requests

### Testing Checklist

#### 1. PHP Execution
```bash
ssh -p 21098 stachblx@manylla.com
php ~/public_html/manylla/qual/api/sync_health.php
```

#### 2. HTTP Access
```bash
curl https://manylla.com/qual/api/sync_health.php
```

#### 3. Database Operations
```bash
mysql -u stachblx_mql -p'PASSWORD' stachblx_manylla_sync_qual -e "SELECT COUNT(*) FROM shares;"
```

#### 4. Frontend Integration
- Open browser console
- Create share
- Check network tab for API responses

---

## Security Considerations

### File Permissions
```bash
# Standard permissions
find ~/public_html/manylla -type f -exec chmod 644 {} \;
find ~/public_html/manylla -type d -exec chmod 755 {} \;

# Sensitive files
chmod 600 ~/public_html/manylla/api/config/*.php
```

### Database Security
- Use strong, unique passwords
- Different credentials for qual/prod
- Limit user permissions to required operations
- Regular backups

### API Security
- Validate all inputs
- Use prepared statements
- Implement rate limiting
- Log access attempts

---

## Maintenance

### Regular Tasks
1. **Monitor disk usage**: Encrypted blobs can be large
2. **Clean expired shares**: Run cleanup script weekly
3. **Database backups**: Daily automated backups
4. **Log rotation**: Prevent logs from filling disk

### Backup Strategy
```bash
# Backup database
mysqldump -u stachblx_mql -p stachblx_manylla_sync_qual > backup_$(date +%Y%m%d).sql

# Backup files
tar -czf manylla_backup_$(date +%Y%m%d).tar.gz ~/public_html/manylla/
```

---

## Appendix

### Environment Variables
- `NODE_ENV`: development | production
- `REACT_APP_API_URL`: API endpoint base
- `REACT_APP_SHARE_DOMAIN`: Share URL domain

### API Endpoints
- `/api/sync_health.php` - Health check
- `/api/share_create.php` - Create share
- `/api/share_access.php` - Access share
- `/api/sync_push.php` - Push sync data
- `/api/sync_pull.php` - Pull sync data

### Database Tables Reference
- `shares` - Temporary encrypted shares
- `sync_data` - Encrypted sync data with versioning
- `sync_backups` - Backup versions
- `active_shares` - Share access tracking
- `audit_log` - Security audit trail

---

*Last Updated: September 2025*
*Version: 1.0*