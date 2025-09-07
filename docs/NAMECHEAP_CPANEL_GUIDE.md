# Namecheap cPanel Configuration Guide for Manylla

## Quick Reference

### SSH Access
```bash
# Namecheap SSH uses port 21098
ssh -p 21098 stachblx@manylla.com

# With SSH key
ssh -p 21098 -i ~/.ssh/id_rsa stachblx@manylla.com
```

### Critical Paths
- **cPanel URL**: https://manylla.com:2083/
- **Document Root**: `/home/stachblx/public_html/manylla/`
- **Manylla Qual**: `/home/stachblx/public_html/manylla/qual/`
- **Database Prefix**: `stachblx_manylla_`

---

## Initial Setup in cPanel

### 1. Domain Configuration
1. Log into cPanel at https://manylla.com:2083/
2. Navigate to **Domains** → **Domains**
3. Set document root for manylla.com to `/public_html/manylla`

### 2. Database Creation

#### Through cPanel Interface
1. Go to **Databases** → **MySQL Databases**
2. Create databases:
   - **Qual**: `stachblx_manylla_sync_qual`
   - **Production**: `stachblx_manylla_sync_prod`

3. Create database users:
   - **Qual User**: `stachblx_mql`
   - **Prod User**: `stachblx_mpl`

4. Add users to databases with ALL PRIVILEGES

#### Database Connection Test
```bash
# Test from SSH
mysql -u stachblx_mql -p'M8C52Mp8f17fIc5UkBVnKQ==' stachblx_manylla_sync_qual
```

### 3. SSL Configuration
- AutoSSL is enabled by default
- Certificate auto-renews
- Force HTTPS redirect via .htaccess

---

## File Manager Structure

### Navigate to Manylla Directory
1. Open **File Manager** in cPanel
2. Navigate to `/public_html/manylla/`

### Directory Layout
```
manylla/
├── index.html          # Production app
├── static/             # Production assets
├── api/                # Production API
│   ├── config/
│   ├── share/
│   └── sync/
└── qual/               # Staging environment
    ├── index.html      # Staging app
    ├── static/         # Staging assets
    └── api/            # Staging API
```

---

## Apache/LiteSpeed Configuration

### Understanding .htaccess Hierarchy

#### Level 1: Server Root (`/public_html/.htaccess`)
- Affects ALL domains on the account
- Usually managed by cPanel
- Don't modify unless necessary

#### Level 2: Manylla Root (`/public_html/manylla/.htaccess`)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Exclude API directory
  RewriteRule ^api/ - [L]
  
  # React app routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]
</IfModule>
```

#### Level 3: Qual Directory (`/public_html/manylla/qual/.htaccess`)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /qual/
  
  # CRITICAL: Must exclude API FIRST
  RewriteRule ^api/ - [L]
  
  # React routing for shares
  RewriteRule ^share/.*$ /qual/index.html [L]
  RewriteRule ^sync/.*$ /qual/index.html [L]
  
  # Default React routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /qual/index.html [L]
</IfModule>
```

#### Level 4: API Directories (`/api/.htaccess`)
```apache
# CRITICAL: Disable rewriting for API
RewriteEngine Off

# Ensure PHP execution
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# CORS headers
Header set Access-Control-Allow-Origin "*"
```

---

## PHP Configuration

### PHP Version Selection
1. In cPanel, go to **Software** → **Select PHP Version**
2. Choose PHP 8.1 or higher
3. Enable required extensions:
   - mysqli
   - json
   - mbstring
   - openssl

### PHP Settings (php.ini)
Via cPanel **Software** → **MultiPHP INI Editor**:
```ini
memory_limit = 256M
max_execution_time = 300
post_max_size = 50M
upload_max_filesize = 50M
```

---

## Database Management

### Using phpMyAdmin
1. Access via cPanel → **Databases** → **phpMyAdmin**
2. Select database: `stachblx_manylla_sync_qual`
3. Run SQL queries or import schemas

### Command Line Access
```bash
# SSH into server
ssh -p 21098 stachblx@manylla.com

# Access database
mysql -u stachblx_mql -p'M8C52Mp8f17fIc5UkBVnKQ==' stachblx_manylla_sync_qual

# Common queries
SHOW TABLES;
DESCRIBE shares;
SELECT COUNT(*) FROM shares;
```

### Backup Procedures
```bash
# Create backup
mysqldump -u stachblx_mql -p'PASSWORD' stachblx_manylla_sync_qual > backup.sql

# Restore backup
mysql -u stachblx_mql -p'PASSWORD' stachblx_manylla_sync_qual < backup.sql
```

---

## Deployment via cPanel

### Option 1: File Manager Upload
1. Build locally: `npm run build`
2. ZIP the build folder
3. Upload via File Manager
4. Extract to `/public_html/manylla/qual/`

### Option 2: SSH/rsync Deployment
```bash
# Deploy to qual
rsync -avz -e "ssh -p 21098" build/ stachblx@manylla.com:~/public_html/manylla/qual/

# Deploy to production
rsync -avz -e "ssh -p 21098" build/ stachblx@manylla.com:~/public_html/manylla/
```

### Option 3: Git Deployment
```bash
# SSH into server
ssh -p 21098 stachblx@manylla.com

# Pull from repository
cd ~/public_html/manylla
git pull origin main
```

---

## Monitoring & Logs

### Access Logs via cPanel
1. Go to **Metrics** → **Raw Access**
2. Download logs for manylla.com

### Error Logs
```bash
# Via SSH
tail -f ~/logs/manylla.com/error.log

# Recent errors
grep -i error ~/logs/manylla.com/error.log | tail -20
```

### Resource Usage
- Check via cPanel → **Metrics** → **Resource Usage**
- Monitor:
  - CPU usage
  - Memory usage
  - Entry processes
  - I/O usage

---

## Troubleshooting

### Issue: API Returns HTML
**Solution**: Check .htaccess rules
```apache
# Must be BEFORE other rules
RewriteRule ^api/ - [L]
```

### Issue: 500 Internal Server Error
**Check**:
1. .htaccess syntax
2. File permissions (644 for files, 755 for directories)
3. PHP errors in error log

### Issue: Database Connection Failed
**Verify**:
1. Credentials in config.php
2. Database exists
3. User has permissions
4. Using localhost as host

### Issue: Cannot SSH
**Remember**:
- Port is 21098, not 22
- Username is cPanel username
- May need to enable SSH in cPanel

---

## Security Best Practices

### File Permissions
```bash
# Set correct permissions
find ~/public_html/manylla -type f -exec chmod 644 {} \;
find ~/public_html/manylla -type d -exec chmod 755 {} \;

# Protect config files
chmod 600 ~/public_html/manylla/api/config/*.php
```

### Directory Protection
1. In cPanel → **Security** → **Directory Privacy**
2. Password protect admin directories
3. Block access to sensitive files via .htaccess

### IP Restrictions
```apache
# Add to .htaccess for admin areas
<RequireAll>
    Require ip YOUR.IP.ADDRESS
</RequireAll>
```

---

## Cron Jobs

### Setting Up Cron Jobs
1. cPanel → **Advanced** → **Cron Jobs**
2. Add new cron job

### Example: Daily Cleanup
```bash
# Command
php /home/stachblx/public_html/manylla/api/cleanup.php

# Schedule
0 2 * * * 
```

---

## Email Configuration

### Setting Up Email Accounts
1. cPanel → **Email** → **Email Accounts**
2. Create noreply@manylla.com
3. Configure in PHP:

```php
// In config.php
define('SMTP_HOST', 'mail.manylla.com');
define('SMTP_USER', 'noreply@manylla.com');
define('SMTP_PASS', 'email_password');
define('SMTP_PORT', 587);
```

---

## Backup Strategy

### Automated Backups
1. cPanel → **Files** → **Backup Wizard**
2. Configure automatic backups
3. Download regularly

### Manual Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/home/stachblx/backups"

# Database backup
mysqldump -u stachblx_mql -p'PASSWORD' stachblx_manylla_sync_qual > $BACKUP_DIR/db_qual_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz ~/public_html/manylla/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

---

## Performance Optimization

### Enable Caching
Add to .htaccess:
```apache
# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

### Optimize Images
- Use WebP format
- Compress before upload
- Lazy load images

### Database Optimization
```sql
-- Regular maintenance
OPTIMIZE TABLE shares;
OPTIMIZE TABLE sync_data;

-- Clean old data
DELETE FROM shares WHERE expires_at < NOW();
```

---

## Migration Checklist

When moving between environments:

- [ ] Export database
- [ ] Update config.php with new credentials
- [ ] Verify .htaccess rules
- [ ] Test API endpoints
- [ ] Check file permissions
- [ ] Update API URLs in frontend
- [ ] Clear browser cache
- [ ] Test share creation
- [ ] Verify sync functionality
- [ ] Monitor error logs

---

*Last Updated: September 2025*