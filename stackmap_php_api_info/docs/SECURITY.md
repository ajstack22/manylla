# Security Implementation Guide

## Overview

This document details the security measures implemented in the StackMap Sync API to ensure zero-knowledge architecture and protect user data.

## Core Security Principles

### 1. Zero-Knowledge Architecture
- Server never has access to unencrypted data
- No ability to decrypt user data even if database is compromised
- No user accounts or passwords stored

### 2. End-to-End Encryption
- All data encrypted client-side before transmission
- TweetNaCl.js (XSalsa20-Poly1305) for symmetric encryption
- PBKDF2 for key derivation from recovery phrases

### 3. Privacy by Design
- Minimal data collection
- No analytics or tracking
- Automatic data expiration after 6 months
- No personally identifiable information required

## Implementation Details

### Input Validation

All inputs are strictly validated to prevent injection attacks:

```php
// Sync ID validation (32 hex characters)
function validateSyncId($syncId) {
    return preg_match('/^[a-f0-9]{32}$/i', $syncId) === 1;
}

// Encrypted blob validation
function validateEncryptedBlob($blob) {
    // Check base64 format
    if (!preg_match('/^[A-Za-z0-9+\/]+=*$/', $blob)) {
        return false;
    }
    
    // Size limit (5MB)
    if (strlen($blob) > 5 * 1024 * 1024) {
        return false;
    }
    
    // Verify decodable
    return base64_decode($blob, true) !== false;
}
```

### SQL Injection Prevention

All database queries use prepared statements:

```php
// Never use string concatenation for queries
$sql = "SELECT * FROM sync_data WHERE sync_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$syncId]);

// Use parameterized queries for all user input
$sql = "INSERT INTO sync_data (sync_id, encrypted_blob) VALUES (?, ?)";
$stmt = $pdo->prepare($sql);
$stmt->execute([$syncId, $encryptedBlob]);
```

### Rate Limiting

Prevents brute force attacks and API abuse:

- 30 requests per minute per IP address
- Sliding window implementation
- Automatic cleanup of old entries
- Headers communicate limit status

### Security Headers

All responses include security headers:

```php
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CORS Configuration

Strict origin validation:

```php
$allowed_origins = [
    'https://stackmap.app',
    'https://www.stackmap.app'
];

if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
```

## Encryption Details

### Client-Side Encryption

```javascript
// Key derivation from recovery phrase
async function deriveKey(recoveryPhrase, salt) {
    const iterations = 100000;
    const keyLength = 32; // 256 bits
    
    return pbkdf2(recoveryPhrase, salt, iterations, keyLength);
}

// Encryption process
function encryptData(data, key) {
    const nonce = crypto.randomBytes(24);
    const encrypted = nacl.secretbox(data, nonce, key);
    
    // Combine nonce and ciphertext
    return base64Encode(concat(nonce, encrypted));
}
```

### Recovery Phrase Security

- 12-word phrases from 2048-word list (BIP39)
- 128 bits of entropy
- Never transmitted to server
- Stored only in device secure storage

## Database Security

### Schema Design

```sql
-- Minimal data storage
CREATE TABLE sync_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL UNIQUE,
    encrypted_blob MEDIUMTEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    device_id VARCHAR(32) NOT NULL,
    device_name VARCHAR(100),
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- No user tables, no email storage, no passwords
```

### Access Control

```php
// Database user should have minimal permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON stackmap_sync.* TO 'sync_user'@'localhost';

// No DROP, CREATE, ALTER permissions
// No access to other databases
```

## Server Configuration

### PHP Configuration

```ini
; Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen

; Hide PHP version
expose_php = Off

; Limit file uploads
file_uploads = Off
upload_max_filesize = 0

; Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_only_cookies = 1
```

### Web Server Configuration

```apache
# .htaccess for Apache
<FilesMatch "\.(php|sql|log|md)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>

<FilesMatch "^(create|push|pull|delete|health|cleanup)\.php$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Monitoring and Logging

### What to Log

```php
// Log security events
error_log("Rate limit exceeded for IP: " . $ip);
error_log("Invalid sync ID attempt: " . substr($syncId, 0, 8) . "...");
error_log("Large payload rejected: " . strlen($blob) . " bytes");
```

### What NOT to Log

- Never log encryption keys
- Never log decrypted data
- Never log full sync IDs
- Never log recovery phrases
- Avoid logging device IDs

## Incident Response

### If Database is Compromised

1. All data is encrypted - attacker cannot read it
2. No user accounts to reset
3. Users can delete their data via API
4. Implement cleanup of affected sync groups

### If Server is Compromised

1. No encryption keys are stored
2. API only accepts encrypted data
3. Rate limiting prevents mass data extraction
4. Implement IP blocking for suspicious activity

## Security Checklist

- [ ] All inputs validated with regex
- [ ] Prepared statements for all queries
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] HTTPS enforced
- [ ] Error messages don't leak information
- [ ] Logging excludes sensitive data
- [ ] Database user has minimal permissions
- [ ] Regular security updates applied
- [ ] Backup encryption keys never stored
- [ ] Cleanup job removes old data

## Testing Security

### Input Validation Tests

```bash
# Test invalid sync ID
curl -X POST https://your-domain.com/api/sync/create.php \
  -d '{"sync_id": "invalid", "encrypted_blob": "...", "device_id": "..."}'

# Test SQL injection attempt
curl "https://your-domain.com/api/sync/pull.php?sync_id=a' OR '1'='1"

# Test oversized payload
curl -X POST https://your-domain.com/api/sync/push.php \
  -d '{"sync_id": "...", "encrypted_blob": "'$(head -c 6000000 /dev/urandom | base64)'"}'
```

### Rate Limiting Tests

```bash
# Test rate limiting
for i in {1..40}; do
  curl https://your-domain.com/api/sync/health.php
done
```

## Best Practices

1. **Regular Updates**: Keep PHP, MySQL, and dependencies updated
2. **Monitoring**: Set up alerts for suspicious activity
3. **Backups**: Regular encrypted backups (but never backup keys)
4. **Auditing**: Periodic security audits
5. **Principle of Least Privilege**: Minimal permissions everywhere
6. **Defense in Depth**: Multiple layers of security
7. **Fail Securely**: Errors should not expose information

## Additional Resources

- [OWASP PHP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html)
- [TweetNaCl.js Documentation](https://github.com/dchest/tweetnacl-js)
- [PBKDF2 Specification](https://tools.ietf.org/html/rfc2898)