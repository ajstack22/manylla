# cPanel Security Recommendations for Manylla & StackMap
*Namecheap Shared Hosting Configuration Guide*

## Current Security Assessment

### ✅ What's Already Secure
- SSL/TLS enabled with auto-renewal (AutoSSL)
- PHP 8.1.33 with OpenSSL support
- SSH on non-standard port (21098)
- Basic .htaccess protection in place
- Zero-knowledge encryption at application level
- Database credentials stored outside web root

### ⚠️ Security Gaps Identified
- Missing security headers in .htaccess files
- No HSTS (HTTP Strict Transport Security) enabled
- File permissions too permissive (666/777 in some cases)
- No rate limiting at server level
- Missing XSS/CSRF protection headers
- No Content Security Policy (CSP)
- API directories lack additional protection

## Critical Security Configurations

### 1. Enhanced .htaccess Security Headers

#### For Manylla Production (`/public_html/manylla/.htaccess`)
```apache
# ========================================
# SECURITY HEADERS - Add to existing .htaccess
# ========================================

<IfModule mod_headers.c>
  # HSTS - Force HTTPS for 1 year
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS
  
  # Prevent clickjacking attacks
  Header always set X-Frame-Options "DENY"
  
  # Prevent MIME type sniffing
  Header always set X-Content-Type-Options "nosniff"
  
  # Enable XSS filtering
  Header always set X-XSS-Protection "1; mode=block"
  
  # Referrer Policy for privacy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Content Security Policy (adjust as needed)
  Header always set Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  
  # Permissions Policy (formerly Feature Policy)
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Protect sensitive files
<FilesMatch "\.(env|json|lock|md|git|gitignore|yml|yaml|ini|log|sh)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Protect .htaccess itself
<Files .htaccess>
  Order allow,deny
  Deny from all
</Files>

# Disable server signature
ServerSignature Off

# Prevent directory browsing
Options -Indexes -FollowSymLinks +SymLinksIfOwnerMatch
```

#### For API Directories (`/api/.htaccess`)
```apache
# API-specific security
<IfModule mod_headers.c>
  # CORS - Restrict to your domains only
  SetEnvIf Origin "^https://(manylla\.com|stackmap\.app|localhost:3000)$" AccessControlAllowOrigin=$0
  Header set Access-Control-Allow-Origin %{AccessControlAllowOrigin}e env=AccessControlAllowOrigin
  Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
  Header set Access-Control-Max-Age "86400"
  
  # Additional API security
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
</IfModule>

# Rate limiting (if mod_ratelimit available)
<IfModule mod_ratelimit.c>
  SetOutputFilter RATE_LIMIT
  SetEnv rate-limit 100
</IfModule>

# Deny direct access to config files
<FilesMatch "config\.php$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

### 2. File Permission Security

```bash
# Fix file permissions via SSH
ssh -p 21098 stachblx@manylla.com

# For Manylla
find ~/public_html/manylla -type f -exec chmod 644 {} \;
find ~/public_html/manylla -type d -exec chmod 755 {} \;
chmod 600 ~/public_html/manylla/api/config.php
chmod 600 ~/public_html/manylla/qual/api/config.php

# For StackMap
find ~/public_html -maxdepth 1 -type f -name "*.html" -exec chmod 644 {} \;
find ~/public_html/api -type f -name "*.php" -exec chmod 644 {} \;
chmod 600 ~/public_html/api/config.php
```

### 3. Database Security Hardening

#### Create database-specific .htaccess
```apache
# Place in any directory containing SQL files or backups
<FilesMatch "\.(sql|sql\.gz|bak|backup)$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

#### Regular Security Audit Queries
```sql
-- Check for suspicious activity
SELECT * FROM audit_log 
WHERE action LIKE '%delete%' 
OR action LIKE '%drop%' 
ORDER BY created_at DESC 
LIMIT 50;

-- Monitor large data changes
SELECT sync_id, 
       LENGTH(encrypted_blob) as size,
       created_at 
FROM sync_data 
WHERE LENGTH(encrypted_blob) > 1000000
ORDER BY created_at DESC;
```

### 4. PHP Security Configuration

#### Create php.ini in application directories
```ini
; /public_html/manylla/php.ini
display_errors = Off
log_errors = On
error_log = /home/stachblx/logs/manylla_php_errors.log
expose_php = Off
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_only_cookies = 1
session.cookie_samesite = "Strict"
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 30
max_input_time = 30
memory_limit = 256M
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source
```

### 5. Zero-Knowledge Specific Security

Since both apps implement zero-knowledge encryption:

#### Additional Headers for Encryption Security
```apache
# Prevent caching of sensitive data
<FilesMatch "\.(php|html)$">
  Header set Cache-Control "no-store, no-cache, must-revalidate, private"
  Header set Pragma "no-cache"
  Header set Expires 0
</FilesMatch>

# Ensure HTTPS for all encryption operations
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
```

### 6. Monitoring & Logging

#### Create monitoring script
```bash
#!/bin/bash
# ~/monitor_security.sh

# Check for modified files in last 24 hours
echo "=== Recently Modified Files ==="
find ~/public_html -type f -mtime -1 -name "*.php" -o -name "*.js"

# Check error logs
echo "=== Recent PHP Errors ==="
tail -20 ~/logs/error.log | grep -i "error\|warning"

# Check for large files (potential attacks)
echo "=== Large Files (>10MB) ==="
find ~/public_html -type f -size +10M

# Check .htaccess modifications
echo "=== .htaccess File Dates ==="
find ~/public_html -name ".htaccess" -exec ls -la {} \;
```

### 7. Backup Security

```bash
# Secure backup script
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d)

# Create encrypted backup
tar -czf - ~/public_html/manylla | openssl enc -aes-256-cbc -salt -out $BACKUP_DIR/manylla_$DATE.tar.gz.enc

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.enc" -mtime +30 -delete
```

## Implementation Priority

### 🔴 Critical (Implement Immediately)
1. Add security headers to all .htaccess files
2. Fix file permissions (especially config files)
3. Enable HSTS
4. Protect sensitive files from web access

### 🟡 Important (Within 1 Week)
1. Implement CSP headers
2. Set up monitoring scripts
3. Configure PHP security settings
4. Add rate limiting where possible

### 🟢 Recommended (Within 1 Month)
1. Set up automated security scanning
2. Implement backup encryption
3. Configure detailed logging
4. Consider upgrading to VPS for better control

## Testing Security Configurations

### Online Tools
- SSL Test: https://www.ssllabs.com/ssltest/
- Security Headers: https://securityheaders.com/
- HSTS Preload: https://hstspreload.org/

### Command Line Tests
```bash
# Test security headers
curl -I https://manylla.com

# Test HSTS
curl -I https://manylla.com | grep -i strict

# Test file permissions
curl https://manylla.com/api/config.php
# Should return 403 Forbidden
```

## Special Considerations for Zero-Knowledge Apps

### Manylla-Specific
- All medical data is encrypted client-side
- Server never sees encryption keys
- Share URLs contain keys in fragments (never sent to server)
- Implement CSP to prevent XSS attacks that could steal keys

### StackMap-Specific
- Similar zero-knowledge architecture
- Focus on preventing timing attacks
- Ensure consistent response times for all API calls
- Monitor for unusual data access patterns

## Regular Security Maintenance

### Weekly Tasks
- Review error logs
- Check for unauthorized file modifications
- Monitor disk usage
- Review failed login attempts

### Monthly Tasks
- Update .htaccess security rules
- Review and rotate API keys
- Test backup restoration
- Security header audit

### Quarterly Tasks
- Full security audit
- Update PHP version if needed
- Review and update CSP policies
- Penetration testing (if possible)

## Emergency Response Plan

### If Compromised:
1. Immediately change all passwords (cPanel, MySQL, SSH)
2. Review access logs: `~/logs/access.log`
3. Check for unauthorized files: `find ~/public_html -type f -mtime -7`
4. Restore from clean backup
5. Implement additional security measures
6. Notify users if data was potentially accessed

## Contact Information

### Namecheap Support
- Security issues: Open urgent ticket in cPanel
- General support: support@namecheap.com
- Abuse reports: abuse@namecheap.com

### Monitoring Services
- UptimeRobot: Free monitoring
- Sucuri SiteCheck: Free malware scanning
- Qualys SSL Labs: Free SSL testing

---

*Last Updated: September 7, 2025*
*Document Version: 1.0*
*Author: Security Analysis for Manylla & StackMap*