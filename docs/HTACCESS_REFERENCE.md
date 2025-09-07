# .htaccess Configuration Reference for Manylla

## Critical Concepts

### The Directory Depth Problem
When deploying to subdirectories, the relationship between URL paths and file system paths becomes critical:

- **URL Path**: What appears in the browser (e.g., `/qual/api/test.php`)
- **File Path**: Where the file actually exists (e.g., `/public_html/manylla/qual/api/test.php`)
- **RewriteBase**: Tells Apache the URL base path for rewrite rules

### Why Manylla's Setup is Different from StackMap
| | StackMap | Manylla |
|---|---|---|
| **Domain** | stackmap.app | manylla.com |
| **Root Path** | `/public_html/` | `/public_html/manylla/` |
| **Qual Path** | `/public_html/qual/` | `/public_html/manylla/qual/` |
| **Qual URL** | stackmap.app/qual/ | manylla.com/qual/ |
| **Depth** | 2 levels | 3 levels |

This extra directory level affects how Apache processes requests and requires careful .htaccess configuration.

---

## Complete .htaccess Templates

### Production Root (`/public_html/manylla/.htaccess`)
```apache
# ========================================
# Manylla Production .htaccess
# Location: /public_html/manylla/.htaccess
# URL: https://manylla.com/
# ========================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # CRITICAL: Exclude API directory from React routing
  # This MUST come before other rewrite rules
  RewriteRule ^api/ - [L]
  
  # Handle React Router paths for shares
  # These are virtual routes that should load index.html
  RewriteRule ^share/([A-Z0-9]{4}-[A-Z0-9]{4}|[a-fA-F0-9]+)/?$ /index.html [L,NC]
  
  # Handle React Router paths for sync
  RewriteRule ^sync/([A-Z0-9]{4}-[A-Z0-9]{4}|[a-fA-F0-9]+)/?$ /index.html [L,NC]
  
  # Don't rewrite files that actually exist
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # All other requests go to React app
  RewriteRule ^ /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Cache Control for SPA
<IfModule mod_headers.c>
  # Don't cache HTML
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>
  
  # Cache static assets
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>

# Prevent directory listing
Options -Indexes

# Set index file
DirectoryIndex index.html

# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
</IfModule>
```

### Qual/Staging (`/public_html/manylla/qual/.htaccess`)
```apache
# ========================================
# Manylla Qual/Staging .htaccess
# Location: /public_html/manylla/qual/.htaccess
# URL: https://manylla.com/qual/
# ========================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # CRITICAL: RewriteBase must match the URL path, NOT the file system path
  # URL is manylla.com/qual/, so base is /qual/
  RewriteBase /qual/
  
  # CRITICAL: Exclude API directory - MUST BE FIRST
  # This prevents API calls from being routed to React
  RewriteRule ^api/ - [L]
  
  # React Router: Handle share routes
  # Format: /qual/share/XXXX-XXXX or /qual/share/[hex]
  RewriteRule ^share/([A-Z0-9]{4}-[A-Z0-9]{4}|[a-fA-F0-9]+)/?$ /qual/index.html [L,NC]
  
  # React Router: Handle sync routes  
  # Format: /qual/sync/XXXX-XXXX or /qual/sync/[hex]
  RewriteRule ^sync/([A-Z0-9]{4}-[A-Z0-9]{4}|[a-fA-F0-9]+)/?$ /qual/index.html [L,NC]
  
  # Serve existing files and directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # All other requests go to React app
  RewriteRule ^ /qual/index.html [L]
</IfModule>

# Headers for SPA
<IfModule mod_headers.c>
  Header set Cache-Control "no-cache, no-store, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires 0
</IfModule>

# Prevent directory listing
Options -Indexes

# Set index file
DirectoryIndex index.html

# Fallback for servers without mod_rewrite
FallbackResource /qual/index.html
```

### API Directory (`/public_html/manylla/qual/api/.htaccess`)
```apache
# ========================================
# API Directory .htaccess
# Location: /public_html/manylla/qual/api/.htaccess
# Purpose: Ensure PHP execution, prevent React routing
# ========================================

# CRITICAL: Turn OFF rewriting in API directory
# This prevents parent .htaccess rules from affecting API
RewriteEngine Off

# Ensure PHP files are executed, not downloaded
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# CORS Headers for API access
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Max-Age "3600"
</IfModule>

# Prevent directory listing
Options -Indexes

# Deny access to config files
<FilesMatch "config\.php|\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

# PHP Settings (if allowed)
<IfModule mod_php.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
</IfModule>
```

---

## Common Patterns and Solutions

### Pattern 1: API Exclusion Rule
```apache
# WRONG - Too specific
RewriteCond %{REQUEST_URI} !^/qual/api/

# CORRECT - Relative to RewriteBase
RewriteRule ^api/ - [L]
```

### Pattern 2: React Router Paths
```apache
# Handle specific React routes that use parameters
RewriteRule ^share/([^/]+)/?$ /qual/index.html [L]
RewriteRule ^sync/([^/]+)/?$ /qual/index.html [L]
RewriteRule ^profile/([^/]+)/?$ /qual/index.html [L]
```

### Pattern 3: Force HTTPS with Subdirectory
```apache
RewriteCond %{HTTPS} off
RewriteCond %{REQUEST_URI} ^/qual/
RewriteRule ^(.*)$ https://%{HTTP_HOST}/qual/$1 [R=301,L]
```

### Pattern 4: Maintenance Mode
```apache
# Add to top of .htaccess for maintenance
RewriteCond %{REQUEST_URI} !^/maintenance.html
RewriteCond %{REMOTE_ADDR} !^YOUR\.IP\.ADDRESS
RewriteRule ^(.*)$ /maintenance.html [R=302,L]
```

---

## Debugging Techniques

### 1. Enable Rewrite Logging (Development Only)
```apache
# Add to .htaccess (remove in production!)
RewriteLog "/home/stachblx/rewrite.log"
RewriteLogLevel 3
```

### 2. Test Rewrite Rules
```apache
# Add temporary rule to test
RewriteRule ^test$ /test-success.html [R=302,L]
```

### 3. Check What's Being Matched
```apache
# Capture and display what's being matched
RewriteRule ^(.*)$ /debug.php?path=$1 [L]
```

### 4. Common Debug Commands
```bash
# Check if .htaccess is being read
echo "DirectoryIndex test.html" >> .htaccess
# Visit site - if index.html still loads, .htaccess is ignored

# Test if mod_rewrite is enabled
ssh -p 21098 stachblx@manylla.com
httpd -M | grep rewrite
# or
apache2ctl -M | grep rewrite
```

---

## Rule Order Matters

### Correct Order
```apache
1. API exclusions          # RewriteRule ^api/ - [L]
2. Static file checks      # RewriteCond %{REQUEST_FILENAME} -f
3. Specific routes         # RewriteRule ^share/...
4. Catch-all for React     # RewriteRule ^ /index.html [L]
```

### Why Order Matters
- Rules are processed top to bottom
- `[L]` flag stops processing for that request
- More specific rules must come before general ones

---

## Environment-Specific Configurations

### Development
```apache
# Allow detailed error reporting
php_flag display_errors on
php_value error_reporting E_ALL

# Disable caching
Header set Cache-Control "no-cache, no-store, must-revalidate"
```

### Staging/Qual
```apache
# Moderate error reporting
php_flag display_errors off
php_flag log_errors on

# Short cache times
Header set Cache-Control "public, max-age=3600"
```

### Production
```apache
# No error display
php_flag display_errors off
php_flag log_errors on

# Aggressive caching
Header set Cache-Control "public, max-age=31536000, immutable"
```

---

## Troubleshooting Guide

### Problem: API returns HTML instead of JSON
**Cause**: React routing is catching API requests
**Solution**: 
```apache
# Add BEFORE other rules
RewriteRule ^api/ - [L]
```

### Problem: Share links don't work
**Cause**: Share route not handled by React
**Solution**:
```apache
RewriteRule ^share/([^/]+)/?$ /qual/index.html [L]
```

### Problem: 500 Internal Server Error
**Common Causes**:
1. Syntax error in .htaccess
2. RewriteBase mismatch
3. Invalid RewriteRule regex

**Debug**:
```bash
# Check Apache error log
tail -f ~/logs/error.log

# Validate .htaccess syntax
apachectl configtest
```

### Problem: Changes to .htaccess have no effect
**Causes**:
1. .htaccess overrides disabled
2. Wrong directory
3. Parent .htaccess overriding

**Solution**:
```apache
# In parent directory
RewriteOptions Inherit
```

---

## Security Considerations

### Protect Sensitive Files
```apache
# Deny access to all .env files
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

# Protect backup files
<FilesMatch "\.(bak|backup|sql|log)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### Prevent Script Injection
```apache
# Disable script execution in upload directories
<Directory "/public_html/manylla/uploads">
    <FilesMatch "\.(php|pl|py|jsp|asp|sh|cgi)$">
        Order allow,deny
        Deny from all
    </FilesMatch>
</Directory>
```

### Rate Limiting
```apache
# Basic rate limiting (requires mod_ratelimit)
<Location "/api/">
    SetOutputFilter RATE_LIMIT
    SetEnv rate-limit 100
</Location>
```

---

## Performance Optimizations

### Enable Compression
```apache
<IfModule mod_deflate.c>
    # Compress HTML, CSS, JavaScript, Text, XML
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
    AddOutputFilterByType DEFLATE application/x-font
    AddOutputFilterByType DEFLATE application/x-font-opentype
    AddOutputFilterByType DEFLATE application/x-font-otf
    AddOutputFilterByType DEFLATE application/x-font-truetype
    AddOutputFilterByType DEFLATE application/x-font-ttf
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE font/opentype
    AddOutputFilterByType DEFLATE font/otf
    AddOutputFilterByType DEFLATE font/ttf
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE image/x-icon
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
</IfModule>
```

### Browser Caching
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    
    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    
    # Web fonts
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/ttf "access plus 1 year"
    
    # HTML and Data
    ExpiresByType text/html "access plus 0 seconds"
    ExpiresByType application/json "access plus 0 seconds"
    ExpiresByType application/xml "access plus 0 seconds"
</IfModule>
```

---

## Testing Checklist

Before deploying, test:

- [ ] API endpoints return JSON, not HTML
- [ ] Share links route correctly
- [ ] Static assets load
- [ ] React routing works
- [ ] HTTPS redirect works
- [ ] API CORS headers present
- [ ] File uploads work (if applicable)
- [ ] Error pages display correctly
- [ ] Cache headers are appropriate
- [ ] Security headers are present

---

*Last Updated: September 2025*
*Reference Version: 1.0*