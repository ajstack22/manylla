# Manyla API Deployment Guide

## Overview
This guide walks through deploying the Manyla PHP API, which combines StackMap's zero-knowledge sync with Manyla's sharing features.

## Prerequisites
- PHP 7.4+ with PDO MySQL extension
- MySQL 5.7+ database
- HTTPS enabled on server
- cPanel access (for Namecheap hosting)

## Step 1: Database Setup

1. **Create Database in cPanel**
   - Go to MySQL Databases
   - Create database: `yourusername_manyla`
   - Create user: `yourusername_manylauser`
   - Add user to database with ALL PRIVILEGES

2. **Import Schema**
   - Open phpMyAdmin
   - Select your database
   - Import `/database/manyla_sync_schema.sql`

3. **Verify Tables**
   ```sql
   SHOW TABLES;
   ```
   Should show: sync_data, sync_devices, shared_profiles, share_audit, etc.

## Step 2: Configure API

1. **Copy Config Template**
   ```bash
   cp api/config/config.example.php api/config/config.php
   ```

2. **Edit config.php**
   ```php
   define('DB_NAME', 'yourusername_manyla');
   define('DB_USER', 'yourusername_manylauser');
   define('DB_PASS', 'your_secure_password');
   ```

3. **Update CORS Origins**
   ```php
   define('CORS_ALLOWED_ORIGINS', [
       'https://many.la',
       'https://stackmap.app' // If still using subdirectory
   ]);
   ```

## Step 3: Upload Files

### Directory Structure:
```
public_html/
├── manyla/          (or many.la/ if using separate domain)
│   ├── index.html   (React build)
│   └── static/
└── api/
    └── manyla/
        ├── config/
        │   ├── config.php (DO NOT commit!)
        │   └── database.php
        ├── utils/
        │   ├── validation.php
        │   ├── cors.php
        │   └── rate-limiter.php
        ├── sync/        (Copy from StackMap)
        │   ├── create.php
        │   ├── push.php
        │   ├── pull.php
        │   └── delete.php
        └── share/       (Manyla-specific)
            ├── create.php
            ├── access.php
            └── delete.php
```

### Upload via FTP/cPanel:
1. Create `/api/manyla/` directory
2. Upload all PHP files maintaining structure
3. Set permissions: 644 for files, 755 for directories
4. Ensure config.php is NOT publicly accessible

## Step 4: Copy StackMap Sync Endpoints

Copy these files from `stackmap_php_api_info/api/` to `api/manyla/sync/`:
- create.php
- push.php
- pull.php
- delete.php
- health.php

## Step 5: Create Rate Limiter

Create `api/utils/rate-limiter.php`:
```php
<?php
class RateLimiter {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function checkLimit($endpoint) {
        $identifier = getClientIp();
        
        // Clean old entries
        $this->db->execute(
            "DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL ? SECOND)",
            [RATE_LIMIT_WINDOW]
        );
        
        // Check current rate
        $result = $this->db->fetchOne(
            "SELECT request_count FROM rate_limits WHERE identifier = ? AND endpoint = ?",
            [$identifier, $endpoint]
        );
        
        if ($result && $result['request_count'] >= RATE_LIMIT_REQUESTS) {
            sendError(ERROR_MESSAGES['RATE_LIMIT'], 429);
        }
        
        // Update counter
        $this->db->execute(
            "INSERT INTO rate_limits (identifier, endpoint, request_count, window_start)
             VALUES (?, ?, 1, NOW())
             ON DUPLICATE KEY UPDATE request_count = request_count + 1",
            [$identifier, $endpoint]
        );
    }
}
?>
```

## Step 6: Test Endpoints

### Test Share Creation:
```bash
curl -X POST https://stackmap.app/api/manyla/share/create.php \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted_data": "base64_encrypted_data_here",
    "recipient_type": "teacher",
    "expiry_hours": 168
  }'
```

### Test Share Access:
```bash
curl -X POST https://stackmap.app/api/manyla/share/access.php \
  -H "Content-Type: application/json" \
  -d '{
    "access_code": "ABC123"
  }'
```

## Step 7: Update Frontend

In your React app, update API endpoints:
```javascript
// config.js
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://stackmap.app/api/manyla'  // or https://many.la/api
  : 'http://localhost:3000/api/manyla';

// Share service
const createShare = async (encryptedData, options) => {
  const response = await fetch(`${API_BASE}/share/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encrypted_data: encryptedData,
      ...options
    })
  });
  return response.json();
};
```

## Step 8: Security Checklist

- [ ] HTTPS enforced
- [ ] config.php not in version control
- [ ] Database user has minimal required permissions
- [ ] Rate limiting active
- [ ] Error messages don't expose sensitive info
- [ ] All inputs validated
- [ ] Prepared statements used for all queries

## Step 9: Monitoring

1. **Check Error Logs**
   ```bash
   tail -f /home/username/public_html/error_log
   ```

2. **Monitor Database**
   - Check `sync_metrics` table for usage
   - Review `share_audit` for access patterns
   - Run cleanup regularly

3. **Set Up Cron Job** (optional)
   ```bash
   0 2 * * * /usr/bin/php /home/username/public_html/api/manyla/cleanup.php
   ```

## Troubleshooting

### CORS Issues
- Verify origin is in CORS_ALLOWED_ORIGINS
- Check browser console for specific error
- Test with curl to bypass CORS

### Database Connection Failed
- Verify credentials in config.php
- Check database exists and user has access
- Ensure PDO MySQL extension enabled

### 500 Errors
- Check PHP error log
- Verify file permissions
- Enable API_DEBUG temporarily

## Next Steps

1. Implement remaining endpoints (cleanup.php, delete.php)
2. Add sync functionality to React app
3. Create backup strategy
4. Monitor performance and optimize
5. Consider CDN for API responses