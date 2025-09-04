# API Reference

## Base Configuration
```php
// Production
BASE_URL: https://manylla.com/api/

// Staging/Qual
BASE_URL: https://manylla.com/qual/api/

// Headers (all requests)
Content-Type: application/json
X-API-Version: 1.0
```

## Share Endpoints

### Create Share Link
```http
POST /share/create.php

Request:
{
  "profile": {
    "name": "string",
    "entries": [],
    "quickInfoPanels": []
  },
  "expiresAt": "ISO 8601 datetime",
  "recipientName": "string (optional)",
  "note": "string (optional)"
}

Response:
{
  "success": true,
  "shareCode": "ABC123",
  "expiresAt": "2024-01-15T12:00:00Z",
  "shareUrl": "https://manylla.com?share=ABC123"
}

Errors:
400: Invalid request data
429: Rate limit exceeded (10 shares per hour)
500: Server error
```

### Get Shared Profile
```http
GET /share/get.php?code=ABC123

Response:
{
  "success": true,
  "profile": {
    "name": "string",
    "entries": [],
    "quickInfoPanels": []
  },
  "recipientName": "string",
  "note": "string",
  "expiresAt": "2024-01-15T12:00:00Z"
}

Errors:
404: Share code not found or expired
429: Rate limit exceeded (60 requests per hour)
500: Server error
```

## Sync Endpoints

### Create Sync Group
```http
POST /sync/create-group.php

Request:
{
  "recoveryHash": "sha256 hash of recovery phrase"
}

Response:
{
  "success": true,
  "groupId": "uuid",
  "createdAt": "ISO 8601 datetime"
}

Errors:
409: Group already exists
429: Rate limit exceeded
500: Server error
```

### Save Sync Data
```http
POST /sync/save.php

Request:
{
  "groupId": "uuid",
  "recoveryHash": "sha256 hash",
  "encryptedData": "base64 encoded encrypted data",
  "dataHash": "sha256 hash of plaintext for conflict detection",
  "deviceId": "unique device identifier"
}

Response:
{
  "success": true,
  "version": 1,
  "savedAt": "ISO 8601 datetime"
}

Errors:
404: Sync group not found
401: Invalid recovery hash
409: Conflict detected
429: Rate limit exceeded
500: Server error
```

### Get Sync Data
```http
GET /sync/get.php?groupId=uuid&recoveryHash=hash

Response:
{
  "success": true,
  "encryptedData": "base64 encoded",
  "version": 1,
  "lastModified": "ISO 8601 datetime",
  "deviceId": "string"
}

Errors:
404: Sync group not found
401: Invalid recovery hash
429: Rate limit exceeded
500: Server error
```

### Check Sync Conflicts
```http
POST /sync/check-conflict.php

Request:
{
  "groupId": "uuid",
  "recoveryHash": "sha256 hash",
  "dataHash": "sha256 hash of current data"
}

Response:
{
  "success": true,
  "hasConflict": false,
  "currentVersion": 1,
  "currentHash": "sha256 hash"
}

Errors:
404: Sync group not found
401: Invalid recovery hash
500: Server error
```

## Health & Status

### Health Check
```http
GET /health.php

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "ISO 8601 datetime",
  "database": "connected"
}
```

### API Version
```http
GET /version.php

Response:
{
  "version": "1.0.0",
  "minClientVersion": "0.1.0",
  "features": ["share", "sync", "encryption"]
}
```

## Rate Limiting

All endpoints implement rate limiting:
```
Share Create: 10 requests per hour per IP
Share Get: 60 requests per hour per IP
Sync Operations: 100 requests per hour per IP + recovery hash
General API: 1000 requests per hour per IP
```

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642248000 (Unix timestamp)
```

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error message",
    "field": "specific_field (optional)",
    "details": {} // Additional context (optional)
  }
}
```

## CORS Configuration
```php
Allowed Origins:
- https://manylla.com
- https://stackmap.app/manylla (production)
- http://localhost:3000 (development)

Allowed Methods: GET, POST, OPTIONS
Allowed Headers: Content-Type, X-API-Version
Max Age: 3600 seconds
```

## Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## Database Schema
```sql
-- Sync Groups Table
CREATE TABLE sync_groups (
  id VARCHAR(36) PRIMARY KEY,
  recovery_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recovery_hash (recovery_hash)
);

-- Sync Data Table
CREATE TABLE sync_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  encrypted_data LONGTEXT NOT NULL,
  data_hash VARCHAR(64) NOT NULL,
  device_id VARCHAR(100),
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES sync_groups(id),
  INDEX idx_group_version (group_id, version)
);

-- Share Links Table
CREATE TABLE share_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_code VARCHAR(6) NOT NULL UNIQUE,
  encrypted_profile LONGTEXT NOT NULL,
  recipient_name VARCHAR(100),
  note TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  access_count INT DEFAULT 0,
  INDEX idx_share_code (share_code),
  INDEX idx_expires (expires_at)
);

-- Rate Limiting Table
CREATE TABLE rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_identifier_endpoint (identifier, endpoint),
  INDEX idx_window (window_start)
);
```