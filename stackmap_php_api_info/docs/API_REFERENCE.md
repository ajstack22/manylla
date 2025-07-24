# StackMap Sync API Reference

## Overview

The StackMap Sync API provides zero-knowledge synchronization for activity data across devices. All data is encrypted client-side before transmission, ensuring the server never has access to unencrypted user data.

## Base URL

```
https://your-domain.com/api/sync/
```

## Authentication

No traditional authentication is required. The API uses sync IDs derived from recovery phrases and device IDs for request validation.

## Common Headers

### Request Headers
- `Content-Type: application/json` (for POST requests)
- `X-Requested-With: XMLHttpRequest` (optional, for AJAX requests)

### Response Headers
- `Content-Type: application/json; charset=utf-8`
- `X-API-Version: 1.0.0`
- `X-RateLimit-Limit: 30`
- `X-RateLimit-Remaining: {number}`
- `X-RateLimit-Reset: {timestamp}`

## Endpoints

### 1. Create Sync Group

Create a new sync group with initial encrypted data.

**Endpoint:** `POST /create.php`

**Request Body:**
```json
{
  "sync_id": "32-character-hex-string",
  "encrypted_blob": "base64-encoded-encrypted-data",
  "device_id": "32-character-hex-string",
  "device_name": "My iPhone" // optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sync group created successfully",
  "sync_id": "32-character-hex-string",
  "version": 1,
  "created_at": "2024-01-20 12:34:56"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input format
- `409 Conflict` - Sync group already exists
- `429 Too Many Requests` - Rate limit exceeded

### 2. Push Data

Update sync data with a new encrypted blob.

**Endpoint:** `POST /push.php`

**Request Body:**
```json
{
  "sync_id": "32-character-hex-string",
  "device_id": "32-character-hex-string",
  "encrypted_blob": "base64-encoded-encrypted-data",
  "device_name": "My iPhone", // optional
  "sync_type": "full" // or "incremental"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data synchronized successfully",
  "sync_id": "32-character-hex-string",
  "version": 2,
  "previous_version": 1,
  "sync_type": "full",
  "last_modified": "2024-01-20 12:35:00"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input format
- `404 Not Found` - Sync group doesn't exist
- `413 Payload Too Large` - Encrypted blob exceeds 5MB
- `429 Too Many Requests` - Rate limit exceeded

### 3. Pull Data

Retrieve the latest encrypted data for a sync group.

**Endpoint:** `GET /pull.php`

**Query Parameters:**
- `sync_id` (required) - The sync group identifier
- `device_id` (required) - The requesting device ID
- `version` (optional) - For conditional requests

**Success Response (200):**
```json
{
  "success": true,
  "encrypted_blob": "base64-encoded-encrypted-data",
  "version": 2,
  "device_id": "32-character-hex-string",
  "device_name": "My iPhone",
  "last_modified": "2024-01-20 12:35:00",
  "created_at": "2024-01-20 12:34:56"
}
```

**Conditional Response (304):**
No body, returned when requested version matches current version.

**Error Responses:**
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Sync group doesn't exist
- `429 Too Many Requests` - Rate limit exceeded

### 4. Delete Sync Data

Permanently delete all data for a sync group.

**Endpoint:** `POST /delete.php`

**Request Body:**
```json
{
  "sync_id": "32-character-hex-string",
  "device_id": "32-character-hex-string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sync data deleted successfully",
  "sync_id": "32-character-hex-string",
  "deleted_count": 1,
  "deleted_at": "2024-01-20 12:36:00"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input format
- `404 Not Found` - Sync group doesn't exist
- `429 Too Many Requests` - Rate limit exceeded

### 5. Health Check

Check if the API is operational.

**Endpoint:** `GET /health.php`

**Success Response (200):**
```json
{
  "status": "healthy",
  "service": "stackmap-sync",
  "version": "1.0.0",
  "timestamp": "2024-01-20 12:34:56",
  "database": {
    "status": "healthy",
    "message": "Connected"
  }
}
```

### 6. Cleanup Old Data

Remove sync data older than 6 months (admin endpoint).

**Endpoint:** `POST /cleanup.php`

**Headers (optional):**
- `X-Cleanup-Key: your-secret-cleanup-key`

**Success Response (200):**
```json
{
  "status": "completed",
  "sync_data_deleted": 42,
  "rate_limits_deleted": 156,
  "timestamp": "2024-01-20 03:00:00"
}
```

## Error Format

All errors follow this structure:

```json
{
  "error": "Error message",
  "details": "Additional information (debug mode only)"
}
```

## Rate Limiting

- **Limit:** 30 requests per minute per IP address
- **Window:** 60-second sliding window
- **Headers:** Rate limit information included in all responses

When rate limited:
```json
{
  "error": "Too many requests. Please try again later.",
  "retry_after": 45,
  "reset_time": 1705761356
}
```

## Data Formats

### Sync ID Format
- 32 hexadecimal characters (lowercase)
- Derived from recovery phrase using PBKDF2
- Example: `a1b2c3d4e5f6789012345678901234567`

### Device ID Format
- 32 hexadecimal characters (lowercase)
- Unique per device
- Example: `f1e2d3c4b5a6987654321098765432109`

### Encrypted Blob Format
- Base64-encoded string
- Contains: 24-byte nonce + encrypted data
- Maximum size: 5MB
- Example: `SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0...`

## Usage Examples

### JavaScript/React Native

```javascript
// Create new sync group
const createSync = async (recoveryPhrase, initialData) => {
  const syncId = deriveSyncId(recoveryPhrase);
  const encryptedBlob = encryptData(initialData, recoveryPhrase);
  
  const response = await fetch('https://your-domain.com/api/sync/create.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sync_id: syncId,
      encrypted_blob: encryptedBlob,
      device_id: getDeviceId(),
      device_name: getDeviceName()
    })
  });
  
  if (!response.ok) {
    throw new Error(`Sync creation failed: ${response.status}`);
  }
  
  return response.json();
};

// Pull latest data
const pullData = async (syncId) => {
  const url = new URL('https://your-domain.com/api/sync/pull.php');
  url.searchParams.append('sync_id', syncId);
  url.searchParams.append('device_id', getDeviceId());
  
  const response = await fetch(url);
  
  if (response.status === 404) {
    return null; // Sync group doesn't exist
  }
  
  if (!response.ok) {
    throw new Error(`Pull failed: ${response.status}`);
  }
  
  return response.json();
};
```

### cURL Examples

```bash
# Create sync group
curl -X POST https://your-domain.com/api/sync/create.php \
  -H "Content-Type: application/json" \
  -d '{
    "sync_id": "a1b2c3d4e5f6789012345678901234567",
    "encrypted_blob": "SGVsbG8gV29ybGQh...",
    "device_id": "f1e2d3c4b5a6987654321098765432109",
    "device_name": "Test Device"
  }'

# Pull data
curl "https://your-domain.com/api/sync/pull.php?sync_id=a1b2c3d4e5f6789012345678901234567&device_id=f1e2d3c4b5a6987654321098765432109"

# Health check
curl https://your-domain.com/api/sync/health.php
```

## Best Practices

1. **Always use HTTPS** in production
2. **Handle rate limits** gracefully with exponential backoff
3. **Implement proper error handling** for all API calls
4. **Cache sync IDs** locally to avoid regeneration
5. **Use conditional requests** with version parameter to save bandwidth
6. **Compress data** before encryption for large payloads
7. **Implement retry logic** for network failures

## Troubleshooting

### Common Issues

1. **400 Bad Request**
   - Check input format (sync_id and device_id must be 32 hex chars)
   - Verify encrypted_blob is valid base64
   - Ensure all required fields are present

2. **404 Not Found**
   - Verify sync_id is correct
   - Check if sync group was deleted

3. **413 Payload Too Large**
   - Compress data before encryption
   - Consider incremental sync for large datasets

4. **429 Too Many Requests**
   - Implement exponential backoff
   - Cache responses when possible
   - Reduce sync frequency

5. **500 Server Error**
   - Check server logs
   - Verify database connectivity
   - Ensure proper PHP configuration