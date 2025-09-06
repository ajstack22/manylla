# Manylla Security Hardening Master Plan
# Pre-Mobile App Development

## Document Purpose
This is a living document that guides the security hardening implementation for Manylla before mobile app development. Each phase includes specific prompts for LLM developers to execute tasks. Progress is tracked directly in this document.

## Critical Context
- **NO EXISTING USERS** - We can make breaking changes without migration concerns
- **Target**: iOS and Android apps after security hardening
- **Architecture**: Zero-knowledge encryption matching StackMap's proven approach
- **Timeline**: 4 phases, each approximately 1 week

## Current Security Status (January 2025)

### ✅ Already Implemented
- Basic zero-knowledge encryption (TweetNaCl.js)
- 32-character hex recovery phrases
- Manual UTF-8 encoding for iOS compatibility
- 60-second pull interval optimization
- Basic conflict resolution
- URL fragment extraction and clearing

### ❌ Critical Gaps (From StackMap Analysis)
1. **UNENCRYPTED SHARE STORAGE** (Manylla-specific vulnerability)
2. No input validation on API endpoints
3. No rate limiting (client or server)
4. Emulated prepared statements (security risk)
5. Detailed error messages exposed to client
6. Invite system not connected to backend
7. No compression for large payloads
8. No metadata versioning system

---

## PHASE 1: CRITICAL SECURITY FIXES
**Status**: ✅ COMPLETED
**Target Duration**: 3-4 days
**Start Date**: 2025-01-06
**Completion Date**: 2025-01-06

### Phase 1 LLM Developer Prompt
```
You are implementing Phase 1 of Manylla's security hardening. Read this entire document first.

CONTEXT:
- Manylla has NO existing users, so breaking changes are acceptable
- Focus on critical security vulnerabilities first
- Test each change thoroughly before moving to the next

YOUR TASKS:
1. Fix unencrypted share storage (Task 1.1)
2. Add input validation to all API endpoints (Task 1.2)
3. Implement client-side rate limiting (Task 1.3)
4. Implement server-side rate limiting (Task 1.4)

After completing each task:
- Mark it COMPLETED with timestamp
- Note any issues or deviations
- Run the test commands provided
- Update the Phase 1 Summary before proceeding
```

### Task 1.1: Fix Unencrypted Share Storage
**Status**: ✅ COMPLETED - 2025-01-06 18:48 UTC
**Priority**: CRITICAL - Unique to Manylla

#### Current Vulnerability
```javascript
// src/components/Sharing/ShareDialog.tsx - Line ~145
shares[code] = {
  profile: sharedProfile,  // ❌ CRITICAL: Medical data in plaintext!
  createdAt: new Date(),
  expiresAt: new Date(...)
};
localStorage.setItem('manylla_shares', JSON.stringify(shares));
```

#### Implementation Steps
1. Create new file: `src/services/sharing/shareEncryptionService.js`
```javascript
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

class ShareEncryptionService {
  // Derive share-specific key from share code
  deriveShareKey(shareCode) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Manual UTF-8 encoding for iOS compatibility
    const codeBytes = encoder.encode(shareCode);
    const salt = encoder.encode('ManyllaShare2025');
    
    // Combine code and salt
    let key = new Uint8Array(codeBytes.length + salt.length);
    key.set(codeBytes);
    key.set(salt, codeBytes.length);
    
    // 10,000 iterations for share keys
    for (let i = 0; i < 10000; i++) {
      key = nacl.hash(key);
    }
    
    return key.slice(0, 32); // 256-bit key
  }
  
  encryptShareData(shareData, shareCode) {
    const key = this.deriveShareKey(shareCode);
    const nonce = nacl.randomBytes(24);
    
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(JSON.stringify(shareData));
    
    const encrypted = nacl.secretbox(dataBytes, nonce, key);
    
    // Combine nonce and ciphertext
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);
    
    return util.encodeBase64(combined);
  }
  
  decryptShareData(encryptedData, shareCode) {
    try {
      const key = this.deriveShareKey(shareCode);
      const combined = util.decodeBase64(encryptedData);
      
      const nonce = combined.slice(0, 24);
      const ciphertext = combined.slice(24);
      
      const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
      if (!decrypted) return null;
      
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Share decryption failed:', error);
      return null;
    }
  }
}

export default new ShareEncryptionService();
```

2. Update `src/components/Sharing/ShareDialog.tsx`:
- Import shareEncryptionService
- Replace plaintext storage with:
```javascript
const encryptedData = shareEncryptionService.encryptShareData({
  profile: sharedProfile,
  createdAt: new Date().toISOString(),
  expiresAt: expiresAt.toISOString(),
  recipientName,
  note: shareNote
}, code);

shares[code] = {
  encrypted: encryptedData,
  createdAt: new Date().toISOString()
};
```

3. Update `src/components/Sharing/SharedProfileView.tsx`:
- Decrypt shares when loading:
```javascript
const decryptedShare = shareEncryptionService.decryptShareData(
  shareData.encrypted, 
  shareCode
);
```

#### Implementation Notes (2025-01-06)
**Approach Taken**: Instead of creating a separate service, the fix was implemented directly in ShareDialog.tsx by:
1. Modified the existing `encryptShare` function to encrypt ALL data including metadata
2. Changed storage structure to only store `encrypted` and `expiresAt` fields
3. Updated SharedView.tsx to handle both old format (backward compatibility) and new format
4. Created comprehensive test scripts to verify no plaintext leakage

**Files Modified**:
- `src/components/Sharing/ShareDialog.tsx` (lines 179-190): Now encrypts recipientName and note inside the encrypted payload
- `src/components/Sharing/SharedView.tsx` (lines 78-83): Added backward compatibility for decryption

**Testing Performed**:
- Created `test-encryption.js` to verify encryption works correctly
- Created `public/test-share-encryption.html` for browser-based testing
- Confirmed no sensitive medical terms appear in localStorage

**Result**: ✅ All sensitive data including metadata is now properly encrypted

#### Test Commands
```bash
# Test share creation and encryption
npm test -- --testNamePattern="ShareDialog.*encryption"

# Manual test
# 1. Create a share in the app
# 2. Check localStorage - should see encrypted data, no plaintext
# 3. Access the share URL - should decrypt and display correctly
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 1.2: Add Input Validation to All API Endpoints
**Status**: ✅ COMPLETED - 2025-01-06 19:15 UTC

#### Files to Update
All files in `api/sync/`:
- `push_timestamp.php`
- `pull_timestamp.php`
- `join_timestamp.php`
- `create_invite.php`
- `validate_invite.php`
- `use_invite.php`

#### Implementation Template
Add to the top of each PHP file after CORS headers:
```php
// Input validation functions
function validateSyncId($sync_id) {
    if (!preg_match('/^[a-f0-9]{32}$/', $sync_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid sync_id format']);
        exit();
    }
}

function validateDeviceId($device_id) {
    if (!preg_match('/^[a-f0-9]{32}$/', $device_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid device_id format']);
        exit();
    }
}

function validateInviteCode($code) {
    if (!preg_match('/^[A-Z0-9]{8}$/', $code)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid invite code format']);
        exit();
    }
}

// Add after getting input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields exist
if (!$input || !isset($input['sync_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

// Validate formats
validateSyncId($input['sync_id']);
if (isset($input['device_id'])) {
    validateDeviceId($input['device_id']);
}
```

#### Test Commands
```bash
# Test with invalid inputs
curl -X POST http://localhost:3000/api/sync/push_timestamp.php \
  -H "Content-Type: application/json" \
  -d '{"sync_id": "invalid!", "device_id": "12345"}'
# Should return 400 with "Invalid sync_id format"

# Test with valid inputs
curl -X POST http://localhost:3000/api/sync/push_timestamp.php \
  -H "Content-Type: application/json" \
  -d '{"sync_id": "abcdef0123456789abcdef0123456789", "device_id": "fedcba9876543210fedcba9876543210"}'
# Should pass validation
```

**Implementation Notes**: Used existing validation utility functions from `/api/utils/validation.php`. Added validation to all sync API endpoints including push_timestamp.php, pull_timestamp.php, join_timestamp.php, create_invite.php, validate_invite.php, and use_invite.php. All endpoints now use consistent validation patterns with `validateRequestMethod()`, `getJsonInput()`, `validateRequired()`, and format validation for sync_id, device_id, and invite codes.
**Completion Time**: 2025-01-06 19:15 UTC

---

### Task 1.3: Implement Client-Side Rate Limiting
**Status**: ✅ COMPLETED - 2025-01-06 19:20 UTC

#### File to Update
`src/services/sync/manyllaMinimalSyncService.js`

#### Implementation
Add rate limiting properties and methods:
```javascript
class ManyllaMinimalSyncService {
  constructor() {
    // ... existing code ...
    
    // Rate limiting
    this.MIN_REQUEST_INTERVAL = 200; // 200ms between requests
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }
  
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
  
  async makeRequest(requestFn) {
    await this.enforceRateLimit();
    return requestFn();
  }
  
  // Update existing methods to use rate limiting
  async pullData() {
    return this.makeRequest(async () => {
      // ... existing pull logic ...
    });
  }
  
  async pushData(profileData) {
    return this.makeRequest(async () => {
      // ... existing push logic ...
    });
  }
}
```

#### Test Commands
```javascript
// In browser console
const sync = manyllaMinimalSyncService;

// Try rapid requests
console.time('rapid-requests');
Promise.all([
  sync.pullData(),
  sync.pullData(),
  sync.pullData()
]).then(() => {
  console.timeEnd('rapid-requests');
  // Should take at least 600ms (3 requests * 200ms)
});
```

**Implementation Notes**: Added rate limiting methods to manyllaMinimalSyncService.js including enforceRateLimit() and makeRequest() wrapper. Updated pullData() and pushData() methods to use the rate-limited wrapper. Set MIN_REQUEST_INTERVAL to 200ms to prevent API flooding.
**Completion Time**: 2025-01-06 19:20 UTC

---

### Task 1.4: Implement Server-Side Rate Limiting
**Status**: ✅ COMPLETED - 2025-01-06 19:25 UTC

#### Create New File
`api/utils/rate-limiter.php`
```php
<?php
class RateLimiter {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    // Check if device is too new (60-second protection)
    public function checkNewDeviceProtection($sync_id, $device_id) {
        $stmt = $this->db->prepare("
            SELECT TIMESTAMPDIFF(SECOND, joined_at, NOW()) as seconds_since_join
            FROM sync_devices 
            WHERE sync_id = ? AND device_id = ?
        ");
        $stmt->execute([$sync_id, $device_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['seconds_since_join'] < 60) {
            http_response_code(429);
            echo json_encode([
                'error' => 'New device protection',
                'retry_after' => 60 - $result['seconds_since_join']
            ]);
            exit();
        }
    }
    
    // Check for catastrophic data reduction
    public function checkDataReduction($sync_id, $newDataSize) {
        $stmt = $this->db->prepare("
            SELECT LENGTH(encrypted_data) as current_size 
            FROM sync_data 
            WHERE sync_id = ?
        ");
        $stmt->execute([$sync_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['current_size'] > 0) {
            $reduction = ($result['current_size'] - $newDataSize) / $result['current_size'];
            
            if ($reduction > 0.5) { // More than 50% reduction
                error_log("WARNING: Device $device_id attempting to reduce data by " . 
                         ($reduction * 100) . "% for sync_id $sync_id");
                
                http_response_code(400);
                echo json_encode(['error' => 'Excessive data reduction detected']);
                exit();
            }
        }
    }
    
    // General rate limiting per IP
    public function checkIPRateLimit($ip, $limit = 60, $window = 60) {
        // For now, using simple file-based tracking
        // In production, use Redis or database
        $cacheFile = sys_get_temp_dir() . '/manylla_rate_' . md5($ip);
        
        $requests = [];
        if (file_exists($cacheFile)) {
            $requests = json_decode(file_get_contents($cacheFile), true);
        }
        
        $now = time();
        $requests = array_filter($requests, fn($t) => $t > $now - $window);
        
        if (count($requests) >= $limit) {
            http_response_code(429);
            echo json_encode(['error' => 'Rate limit exceeded']);
            exit();
        }
        
        $requests[] = $now;
        file_put_contents($cacheFile, json_encode($requests));
    }
}
```

#### Update Each Endpoint
Add to `push_timestamp.php` and other endpoints:
```php
require_once '../utils/rate-limiter.php';

$rateLimiter = new RateLimiter($db);

// Check IP rate limit
$rateLimiter->checkIPRateLimit($_SERVER['REMOTE_ADDR']);

// For push operations, check new device and data reduction
if (isset($input['device_id'])) {
    $rateLimiter->checkNewDeviceProtection($input['sync_id'], $input['device_id']);
}

if (isset($input['encrypted_data'])) {
    $rateLimiter->checkDataReduction($input['sync_id'], strlen($input['encrypted_data']));
}
```

#### Test Commands
```bash
# Test rate limiting
for i in {1..70}; do
  curl -X POST http://localhost:3000/api/sync/pull_timestamp.php \
    -H "Content-Type: application/json" \
    -d '{"sync_id": "abcdef0123456789abcdef0123456789"}'
done
# Should get rate limited after 60 requests
```

**Implementation Notes**: Created comprehensive rate-limiter.php with multiple protection layers: IP-based rate limiting (120 req/min), device-based rate limiting (60 req/min), new device protection (60-second delay), data reduction detection (prevents >50% data loss), and suspicious activity monitoring. Integrated rate limiting into all sync API endpoints (push_timestamp.php, pull_timestamp.php, join_timestamp.php, create_invite.php). Uses file-based caching for now, ready for Redis/database upgrade when backend is deployed.
**Completion Time**: 2025-01-06 19:25 UTC

---

### Phase 1 Summary
**All Tasks Completed**: ✅
**Total Time Taken**: ~1 hour (18:48 - 19:25 UTC)
**Issues Encountered**: 
- Share URL routing issue with subdirectory deployment (fixed with .htaccess and query parameter format)
- Validation utilities were already present, just needed to be integrated

**Deviations from Plan**: 
- Used existing validation.php utilities instead of creating inline validation
- Rate limiter is more comprehensive than originally planned (added suspicious activity detection)

### Phase 1 Exit Criteria
Before proceeding to Phase 2, ensure:
- [x] All share data is encrypted in localStorage
- [x] All API endpoints validate input format
- [x] Client enforces 200ms between requests
- [x] Server blocks new devices for 60 seconds
- [x] Server prevents >50% data reduction
- [x] All tests pass

**Phase 1 Sign-off**: ✅ COMPLETED - 2025-01-06 19:30 UTC

---

## PHASE 2: NETWORK & DATA SECURITY
**Status**: NOT STARTED
**Target Duration**: 3-4 days
**Start Date**: _____________
**Completion Date**: _____________

### Phase 2 LLM Developer Prompt
```
You are implementing Phase 2 of Manylla's security hardening. 

PREREQUISITE: Phase 1 must be completed. Verify:
- Share encryption is working
- Input validation is active on all endpoints
- Rate limiting is functional

YOUR TASKS:
1. Enhance URL fragment security (Task 2.1)
2. Upgrade database security (Task 2.2)
3. Implement secure error handling (Task 2.3)
4. Add CORS security headers (Task 2.4)

Test thoroughly and update this document with your progress.
```

### Task 2.1: Enhance URL Fragment Security
**Status**: NOT STARTED

#### Current Implementation Gap
Fragment extraction happens in React, but should happen earlier to prevent framework exposure.

#### Implementation Steps

1. Update `public/index.html`:
Add before ANY other scripts:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- First script - capture fragments immediately -->
    <script>
      (function() {
        if (window.location.hash) {
          // Store the hash before React Router can see it
          window.__initialHash = window.location.hash;
          
          // Clear from URL immediately
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          
          // Set timer to clear from memory
          setTimeout(function() {
            window.__initialHash = null;
          }, 10000); // 10 seconds
        }
      })();
    </script>
    <!-- Rest of head content -->
```

2. Update `src/services/sync/manyllaMinimalSyncService.js`:
```javascript
constructor() {
  // ... existing code ...
  
  // Check for captured fragment first
  if (typeof window !== 'undefined') {
    const capturedHash = window.__initialHash;
    
    if (capturedHash) {
      const fragment = capturedHash.substring(1);
      
      // Clear the captured hash
      window.__initialHash = null;
      
      // Process if it looks like a recovery phrase
      if (fragment.match(/^[a-f0-9]{32}$/)) {
        this.pendingRecoveryPhrase = fragment;
        
        // Clear from memory after 10 seconds (not 30)
        setTimeout(() => {
          this.pendingRecoveryPhrase = null;
        }, 10000);
      }
    }
  }
}
```

#### Test Commands
```javascript
// Test by visiting URL with fragment
// http://localhost:3000/#abcdef0123456789abcdef0123456789

// In console immediately after page load:
console.log(window.location.hash); // Should be empty
console.log(window.__initialHash); // Should be null after 10 seconds
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 2.2: Upgrade Database Security
**Status**: NOT STARTED

#### File to Update
`api/config/database.php`

#### Current Issue
Using emulated prepared statements (less secure)

#### Implementation
```php
<?php
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            // Use real prepared statements, not emulated
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false, // CRITICAL: Use real prepared statements
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->connection = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                $options
            );
            
        } catch(PDOException $e) {
            // Log error, don't expose details
            error_log('Database connection failed: ' . $e->getMessage());
            die('Database unavailable');
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Prevent cloning of the instance
    private function __clone() {}
    
    // Prevent unserializing of the instance
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// Usage in endpoints:
// $db = Database::getInstance()->getConnection();
```

#### Database Schema Updates
Create `api/sync/schema.sql`:
```sql
-- Sync data table with proper constraints
CREATE TABLE IF NOT EXISTS sync_data (
    sync_id VARCHAR(32) PRIMARY KEY,
    encrypted_data MEDIUMTEXT,
    timestamp BIGINT NOT NULL,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Devices table with foreign key
CREATE TABLE IF NOT EXISTS sync_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL,
    device_id VARCHAR(32) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NULL,
    UNIQUE KEY unique_device (sync_id, device_id),
    FOREIGN KEY (sync_id) REFERENCES sync_data(sync_id) ON DELETE CASCADE,
    INDEX idx_last_seen (last_seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
    code VARCHAR(8) PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    max_uses INT DEFAULT 1,
    current_uses INT DEFAULT 0,
    created_by_device VARCHAR(32),
    FOREIGN KEY (sync_id) REFERENCES sync_data(sync_id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 2.3: Implement Secure Error Handling
**Status**: NOT STARTED

#### Create New File
`api/utils/error-handler.php`
```php
<?php
// Secure error configuration
error_reporting(E_ALL);
ini_set('display_errors', 0);  // Never display errors
ini_set('log_errors', 1);       // Always log errors
ini_set('error_log', __DIR__ . '/../../logs/error.log');

// Custom error handler
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Exception handler
set_exception_handler(function($exception) {
    // Log detailed error
    error_log(sprintf(
        "[%s] %s in %s:%d\nStack trace:\n%s",
        get_class($exception),
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine(),
        $exception->getTraceAsString()
    ));
    
    // Return generic error to client
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Internal server error']);
    exit();
});

// Shutdown handler for fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] & (E_ERROR | E_CORE_ERROR | E_COMPILE_ERROR | E_PARSE))) {
        error_log(sprintf(
            "Fatal error: %s in %s:%d",
            $error['message'],
            $error['file'],
            $error['line']
        ));
        
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Internal server error']);
    }
});

// Environment-specific error messages
function getErrorMessage($code, $isDevelopment = false) {
    $messages = [
        'validation_failed' => 'Invalid input format',
        'not_found' => 'Resource not found',
        'rate_limited' => 'Too many requests',
        'unauthorized' => 'Unauthorized access',
        'database_error' => 'Database operation failed'
    ];
    
    if ($isDevelopment) {
        // In development, can be more specific
        return $messages[$code] ?? $code;
    }
    
    // In production, always generic
    return 'Request failed';
}
```

#### Update All Endpoints
Add at the top of each PHP file:
```php
require_once '../utils/error-handler.php';

// Use try-catch for all operations
try {
    // ... endpoint logic ...
} catch (Exception $e) {
    error_log('Endpoint error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => getErrorMessage('database_error', IS_DEVELOPMENT)]);
    exit();
}
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 2.4: Add CORS Security Headers
**Status**: NOT STARTED

#### Update File
`api/utils/cors.php`
```php
<?php
// Determine allowed origins based on environment
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://stackmap.app',
    'https://manylla.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://manylla.com");
}

// Security headers
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Content Security Policy for JSON responses
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none';");
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Phase 2 Summary
**All Tasks Completed**: ☐
**Total Time Taken**: _____________________
**Issues Encountered**: _____________________
**Deviations from Plan**: _____________________

### Phase 2 Exit Criteria
- [ ] URL fragments captured before React loads
- [ ] Database uses real prepared statements
- [ ] All errors logged server-side only
- [ ] CORS properly configured
- [ ] Security headers present on all responses

**Phase 2 Sign-off**: _____________________

---

## PHASE 3: ADVANCED SECURITY FEATURES
**Status**: NOT STARTED
**Target Duration**: 4-5 days
**Start Date**: _____________
**Completion Date**: _____________

### Phase 3 LLM Developer Prompt
```
You are implementing Phase 3 of Manylla's security hardening.

PREREQUISITE: Phases 1-2 must be completed. Verify all security basics are in place.

YOUR TASKS:
1. Implement secure invite system backend (Task 3.1)
2. Enhance conflict resolution security (Task 3.2)
3. Add compression and versioning (Task 3.3)
4. Implement audit logging (Task 3.4)

Focus on production-ready implementations since we have no existing users.
```

### Task 3.1: Implement Secure Invite System Backend
**Status**: NOT STARTED

#### Implementation Steps

1. Update `api/sync/create_invite.php`:
```php
<?php
require_once '../utils/error-handler.php';
require_once '../utils/cors.php';
require_once '../utils/rate-limiter.php';
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($input['sync_id']) || !isset($input['device_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    validateSyncId($input['sync_id']);
    validateDeviceId($input['device_id']);
    
    $db = Database::getInstance()->getConnection();
    $rateLimiter = new RateLimiter($db);
    
    // Check rate limits
    $rateLimiter->checkIPRateLimit($_SERVER['REMOTE_ADDR'], 10, 3600); // 10 invites per hour
    
    // Generate collision-resistant code
    $maxAttempts = 10;
    $inviteCode = null;
    
    for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
        $inviteCode = generateSecureInviteCode();
        
        // Check for collision
        $stmt = $db->prepare("SELECT code FROM invite_codes WHERE code = ?");
        $stmt->execute([$inviteCode]);
        
        if (!$stmt->fetch()) {
            break; // Code is unique
        }
        
        $inviteCode = null;
    }
    
    if (!$inviteCode) {
        throw new Exception('Failed to generate unique invite code');
    }
    
    // Store invite with expiration
    $expiresHours = min(max($input['expires_hours'] ?? 24, 1), 168); // 1-168 hours
    $maxUses = min(max($input['max_uses'] ?? 1, 1), 10); // 1-10 uses
    
    $stmt = $db->prepare("
        INSERT INTO invite_codes (code, sync_id, expires_at, max_uses, created_by_device)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR), ?, ?)
    ");
    
    $stmt->execute([
        $inviteCode,
        $input['sync_id'],
        $expiresHours,
        $maxUses,
        $input['device_id']
    ]);
    
    // Return invite details
    echo json_encode([
        'success' => true,
        'invite_code' => $inviteCode,
        'expires_hours' => $expiresHours,
        'max_uses' => $maxUses
    ]);
    
} catch (Exception $e) {
    error_log('Create invite error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create invite']);
}

function generateSecureInviteCode() {
    // Unambiguous character set (no 0/O, 1/I/L)
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    
    for ($i = 0; i < 8; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    
    return $code;
}
```

2. Update `api/sync/use_invite.php`:
```php
<?php
// ... headers and includes ...

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['invite_code'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing invite code']);
        exit();
    }
    
    validateInviteCode($input['invite_code']);
    
    $db = Database::getInstance()->getConnection();
    
    // Start transaction
    $db->beginTransaction();
    
    // Get invite with lock
    $stmt = $db->prepare("
        SELECT sync_id, max_uses, current_uses, expires_at
        FROM invite_codes 
        WHERE code = ?
        FOR UPDATE
    ");
    $stmt->execute([$input['invite_code']]);
    $invite = $stmt->fetch();
    
    if (!$invite) {
        $db->rollback();
        http_response_code(404);
        echo json_encode(['error' => 'Invalid invite code']);
        exit();
    }
    
    // Check expiration
    if (strtotime($invite['expires_at']) < time()) {
        $db->rollback();
        http_response_code(410);
        echo json_encode(['error' => 'Invite code expired']);
        exit();
    }
    
    // Check usage limit
    if ($invite['current_uses'] >= $invite['max_uses']) {
        $db->rollback();
        http_response_code(410);
        echo json_encode(['error' => 'Invite code already used']);
        exit();
    }
    
    // Increment usage
    $stmt = $db->prepare("
        UPDATE invite_codes 
        SET current_uses = current_uses + 1 
        WHERE code = ?
    ");
    $stmt->execute([$input['invite_code']]);
    
    // Get encrypted recovery phrase (stored separately for security)
    $stmt = $db->prepare("
        SELECT encrypted_recovery_phrase 
        FROM sync_recovery 
        WHERE sync_id = ?
    ");
    $stmt->execute([$invite['sync_id']]);
    $recovery = $stmt->fetch();
    
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'sync_id' => $invite['sync_id'],
        'encrypted_recovery_phrase' => $recovery['encrypted_recovery_phrase']
    ]);
    
} catch (Exception $e) {
    $db->rollback();
    error_log('Use invite error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to use invite']);
}
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 3.2: Enhance Conflict Resolution Security
**Status**: NOT STARTED

#### File to Update
`src/services/sync/conflictResolver.js`

#### Implementation
```javascript
class ConflictResolver {
  constructor() {
    this.MERGE_WINDOW = 3000; // 3-second window for concurrent changes
    this.mergeLog = [];
  }
  
  /**
   * Secure additive merge - never delete data
   */
  mergeProfiles(local, remote, deviceId) {
    const mergeStart = Date.now();
    const conflicts = [];
    
    try {
      // Start with local as base (user's current view)
      const merged = JSON.parse(JSON.stringify(local));
      
      // Track what we're merging for audit
      const mergeOperation = {
        timestamp: mergeStart,
        deviceId,
        localVersion: this.getDataHash(local),
        remoteVersion: this.getDataHash(remote),
        conflicts: []
      };
      
      // Merge basic fields with timestamp comparison
      const basicFields = ['childName', 'dateOfBirth', 'bloodType', 'allergies'];
      
      basicFields.forEach(field => {
        if (local[field] !== remote[field]) {
          // Use timestamp to determine winner
          const localTime = local[`${field}_updated`] || 0;
          const remoteTime = remote[`${field}_updated`] || 0;
          
          if (Math.abs(localTime - remoteTime) < this.MERGE_WINDOW) {
            // Within merge window - use device ID as tiebreaker
            merged[field] = deviceId.localeCompare(remote.deviceId) > 0 
              ? local[field] 
              : remote[field];
            
            mergeOperation.conflicts.push({
              field,
              resolution: 'device_tiebreak',
              chosen: merged[field]
            });
          } else {
            // Outside merge window - newer wins
            merged[field] = remoteTime > localTime ? remote[field] : local[field];
            
            mergeOperation.conflicts.push({
              field,
              resolution: 'timestamp',
              chosen: merged[field]
            });
          }
        }
      });
      
      // Additive merge for arrays - never delete
      ['medications', 'conditions', 'providers', 'documents'].forEach(field => {
        if (Array.isArray(local[field]) && Array.isArray(remote[field])) {
          merged[field] = this.mergeArraysAdditive(
            local[field], 
            remote[field],
            field
          );
        }
      });
      
      // Log the merge operation
      this.mergeLog.push(mergeOperation);
      
      // Trim log to last 100 operations
      if (this.mergeLog.length > 100) {
        this.mergeLog = this.mergeLog.slice(-100);
      }
      
      // Validate merged data structure
      this.validateMergedData(merged);
      
      return {
        merged,
        conflicts: mergeOperation.conflicts,
        success: true
      };
      
    } catch (error) {
      console.error('Merge failed:', error);
      
      // On merge failure, prefer local (user's current data)
      return {
        merged: local,
        conflicts: [{field: 'merge_error', resolution: 'kept_local'}],
        success: false
      };
    }
  }
  
  /**
   * Additive array merge - combine without deletion
   */
  mergeArraysAdditive(localArray, remoteArray, fieldName) {
    const merged = [...localArray];
    const localIds = new Set(localArray.map(item => item.id || item.name));
    
    remoteArray.forEach(remoteItem => {
      const itemId = remoteItem.id || remoteItem.name;
      
      if (!localIds.has(itemId)) {
        // Item doesn't exist locally - add it
        merged.push(remoteItem);
      } else {
        // Item exists - check if remote is newer
        const localItem = localArray.find(
          item => (item.id || item.name) === itemId
        );
        
        if (remoteItem.updatedAt > localItem.updatedAt) {
          // Replace with newer version
          const index = merged.findIndex(
            item => (item.id || item.name) === itemId
          );
          merged[index] = remoteItem;
        }
      }
    });
    
    // Sort by date or name for consistency
    return merged.sort((a, b) => {
      if (a.updatedAt && b.updatedAt) {
        return b.updatedAt - a.updatedAt;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }
  
  /**
   * Generate hash of data for comparison
   */
  getDataHash(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
  
  /**
   * Validate merged data structure
   */
  validateMergedData(data) {
    // Check required fields exist
    const required = ['childName', 'medications', 'conditions', 'providers'];
    
    required.forEach(field => {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
    
    // Validate arrays are arrays
    ['medications', 'conditions', 'providers', 'documents'].forEach(field => {
      if (data[field] && !Array.isArray(data[field])) {
        throw new Error(`Field ${field} must be an array`);
      }
    });
    
    // Check for data corruption
    if (JSON.stringify(data).length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Merged data exceeds size limit');
    }
  }
  
  /**
   * Get merge audit log
   */
  getMergeLog() {
    return this.mergeLog;
  }
}

export default new ConflictResolver();
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 3.3: Add Compression and Versioning
**Status**: NOT STARTED

#### File to Update
`src/services/sync/manyllaEncryptionService.js`

#### Implementation
Add compression and metadata versioning:
```javascript
import pako from 'pako';

const ENCRYPTION_VERSION = 3; // Increment for format changes
const COMPRESSION_THRESHOLD = 1024; // Compress if > 1KB

class ManyllaEncryptionService {
  // ... existing code ...
  
  /**
   * Encrypt with optional compression and versioning
   */
  async encryptData(data, key) {
    const dataStr = JSON.stringify(data);
    const shouldCompress = dataStr.length > COMPRESSION_THRESHOLD;
    
    // Create metadata
    const metadata = {
      version: ENCRYPTION_VERSION,
      compressed: shouldCompress,
      timestamp: Date.now(),
      checksum: this.calculateChecksum(dataStr)
    };
    
    // Compress if needed
    let dataBytes;
    if (shouldCompress) {
      const compressed = pako.deflate(dataStr);
      dataBytes = compressed;
    } else {
      const encoder = new TextEncoder();
      dataBytes = encoder.encode(dataStr);
    }
    
    // Generate nonce
    const nonce = nacl.randomBytes(24);
    
    // Encrypt
    const encrypted = nacl.secretbox(dataBytes, nonce, key);
    
    // Package everything
    const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
    const metadataLength = metadataBytes.length;
    
    // Format: [metadata_length(4)] [metadata] [nonce(24)] [ciphertext]
    const combined = new Uint8Array(
      4 + metadataLength + nonce.length + encrypted.length
    );
    
    // Write metadata length (4 bytes)
    new DataView(combined.buffer).setUint32(0, metadataLength);
    
    // Write metadata
    combined.set(metadataBytes, 4);
    
    // Write nonce
    combined.set(nonce, 4 + metadataLength);
    
    // Write ciphertext
    combined.set(encrypted, 4 + metadataLength + nonce.length);
    
    return util.encodeBase64(combined);
  }
  
  /**
   * Decrypt with version handling
   */
  async decryptData(encryptedData, key) {
    try {
      const combined = util.decodeBase64(encryptedData);
      
      // Read metadata length
      const metadataLength = new DataView(combined.buffer).getUint32(0);
      
      // Extract metadata
      const metadataBytes = combined.slice(4, 4 + metadataLength);
      const metadata = JSON.parse(
        new TextDecoder().decode(metadataBytes)
      );
      
      // Handle version differences
      if (metadata.version !== ENCRYPTION_VERSION) {
        console.warn(`Encryption version mismatch: ${metadata.version} vs ${ENCRYPTION_VERSION}`);
        // Could implement migration logic here
      }
      
      // Extract nonce and ciphertext
      const nonceStart = 4 + metadataLength;
      const nonce = combined.slice(nonceStart, nonceStart + 24);
      const ciphertext = combined.slice(nonceStart + 24);
      
      // Decrypt
      const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
      if (!decrypted) {
        throw new Error('Decryption failed');
      }
      
      // Decompress if needed
      let dataStr;
      if (metadata.compressed) {
        const decompressed = pako.inflate(decrypted);
        dataStr = new TextDecoder().decode(decompressed);
      } else {
        dataStr = new TextDecoder().decode(decrypted);
      }
      
      // Verify checksum
      const checksum = this.calculateChecksum(dataStr);
      if (checksum !== metadata.checksum) {
        throw new Error('Data integrity check failed');
      }
      
      return JSON.parse(dataStr);
      
    } catch (error) {
      console.error('Decryption error:', error);
      
      // Try legacy format as fallback
      return this.decryptLegacyFormat(encryptedData, key);
    }
  }
  
  /**
   * Calculate checksum for integrity verification
   */
  calculateChecksum(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
  
  /**
   * Handle legacy format for backward compatibility
   */
  decryptLegacyFormat(encryptedData, key) {
    // Implementation for old format
    // This ensures smooth migration even though we have no users yet
    try {
      const combined = util.decodeBase64(encryptedData);
      const nonce = combined.slice(0, 24);
      const ciphertext = combined.slice(24);
      
      const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
      if (!decrypted) return null;
      
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch {
      return null;
    }
  }
}
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 3.4: Implement Audit Logging
**Status**: NOT STARTED

#### Create New File
`api/utils/audit-logger.php`
```php
<?php
class AuditLogger {
    private $db;
    private $logFile;
    
    public function __construct($db) {
        $this->db = $db;
        $this->logFile = __DIR__ . '/../../logs/audit.log';
    }
    
    /**
     * Log security-relevant events
     */
    public function log($event_type, $sync_id, $device_id, $details = []) {
        $entry = [
            'timestamp' => microtime(true),
            'event_type' => $event_type,
            'sync_id' => $sync_id,
            'device_id' => $device_id,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'details' => $details
        ];
        
        // Write to file (for immediate access)
        $this->writeToFile($entry);
        
        // Store in database (for queries)
        $this->writeToDatabase($entry);
        
        // Alert on suspicious activity
        $this->checkForSuspiciousActivity($entry);
    }
    
    private function writeToFile($entry) {
        $line = date('Y-m-d H:i:s', $entry['timestamp']) . ' | ' .
                $entry['event_type'] . ' | ' .
                $entry['sync_id'] . ' | ' .
                $entry['device_id'] . ' | ' .
                json_encode($entry['details']) . PHP_EOL;
        
        file_put_contents($this->logFile, $line, FILE_APPEND | LOCK_EX);
    }
    
    private function writeToDatabase($entry) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO audit_log 
                (event_type, sync_id, device_id, ip_address, user_agent, details, created_at)
                VALUES (?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))
            ");
            
            $stmt->execute([
                $entry['event_type'],
                $entry['sync_id'],
                $entry['device_id'],
                $entry['ip_address'],
                $entry['user_agent'],
                json_encode($entry['details']),
                $entry['timestamp']
            ]);
        } catch (Exception $e) {
            error_log('Audit log database write failed: ' . $e->getMessage());
        }
    }
    
    private function checkForSuspiciousActivity($entry) {
        $suspiciousEvents = [
            'excessive_data_reduction',
            'rapid_device_creation',
            'invalid_sync_attempt',
            'decryption_failure'
        ];
        
        if (in_array($entry['event_type'], $suspiciousEvents)) {
            // Count recent suspicious events
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM audit_log
                WHERE ip_address = ?
                  AND event_type IN ('" . implode("','", $suspiciousEvents) . "')
                  AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");
            
            $stmt->execute([$entry['ip_address']]);
            $result = $stmt->fetch();
            
            if ($result['count'] > 10) {
                // Log alert
                error_log("SECURITY ALERT: Suspicious activity from IP " . $entry['ip_address']);
                
                // Could implement automated blocking here
            }
        }
    }
}

// Audit log database schema
/*
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    sync_id VARCHAR(32),
    device_id VARCHAR(32),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_sync_id (sync_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/
```

#### Usage in Endpoints
Add to critical operations:
```php
$auditLogger = new AuditLogger($db);

// Log successful sync
$auditLogger->log('sync_success', $sync_id, $device_id, [
    'data_size' => strlen($encrypted_data),
    'timestamp' => $timestamp
]);

// Log failures
$auditLogger->log('sync_failure', $sync_id, $device_id, [
    'error' => $error_message
]);
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Phase 3 Summary
**All Tasks Completed**: ☐
**Total Time Taken**: _____________________
**Issues Encountered**: _____________________
**Deviations from Plan**: _____________________

### Phase 3 Exit Criteria
- [ ] Invite system fully functional with backend
- [ ] Conflict resolution never loses data
- [ ] Compression working for large payloads
- [ ] Metadata versioning implemented
- [ ] Audit logging capturing all events

**Phase 3 Sign-off**: _____________________

---

## PHASE 4: MOBILE-READY ARCHITECTURE
**Status**: NOT STARTED
**Target Duration**: 3-4 days
**Start Date**: _____________
**Completion Date**: _____________

### Phase 4 LLM Developer Prompt
```
You are implementing Phase 4 - the final phase before mobile app development.

PREREQUISITE: Phases 1-3 must be completed with all security measures in place.

YOUR TASKS:
1. Create platform abstraction layer (Task 4.1)
2. Implement offline-first architecture (Task 4.2)
3. Add performance optimizations (Task 4.3)
4. Create mobile bridge utilities (Task 4.4)

This phase prepares the codebase for React Native while maintaining web compatibility.
```

### Task 4.1: Create Platform Abstraction Layer
**Status**: NOT STARTED

#### Create New Directory Structure
```
src/services/platform/
├── index.js           // Platform detection and routing
├── storage.web.js     // Web localStorage implementation
├── storage.native.js  // React Native AsyncStorage (stub)
├── crypto.web.js      // Web crypto implementation
└── crypto.native.js   // React Native crypto (stub)
```

#### Implementation
`src/services/platform/index.js`:
```javascript
// Platform detection
export const Platform = {
  OS: 'web', // Will be overridden in React Native
  isWeb: typeof window !== 'undefined' && !window.ReactNativeWebView,
  isNative: typeof window !== 'undefined' && window.ReactNativeWebView,
  isIOS: false, // Will be set in React Native
  isAndroid: false // Will be set in React Native
};

// Dynamic imports based on platform
export async function getStorage() {
  if (Platform.isNative) {
    const { default: storage } = await import('./storage.native');
    return storage;
  }
  const { default: storage } = await import('./storage.web');
  return storage;
}

export async function getCrypto() {
  if (Platform.isNative) {
    const { default: crypto } = await import('./crypto.native');
    return crypto;
  }
  const { default: crypto } = await import('./crypto.web');
  return crypto;
}
```

`src/services/platform/storage.web.js`:
```javascript
class WebStorage {
  async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  }
  
  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Storage write error:', error);
      
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        // Clear old data
        this.clearOldData();
        
        // Retry
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      }
      
      return false;
    }
  }
  
  async removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
  
  async getAllKeys() {
    return Object.keys(localStorage).filter(key => 
      key.startsWith('manylla_')
    );
  }
  
  clearOldData() {
    // Remove old shares
    const shares = JSON.parse(localStorage.getItem('manylla_shares') || '{}');
    const now = Date.now();
    
    Object.keys(shares).forEach(code => {
      if (new Date(shares[code].expiresAt).getTime() < now) {
        delete shares[code];
      }
    });
    
    localStorage.setItem('manylla_shares', JSON.stringify(shares));
  }
}

export default new WebStorage();
```

`src/services/platform/storage.native.js`:
```javascript
// Stub for React Native - will be implemented in mobile app
class NativeStorage {
  async getItem(key) {
    // Will use AsyncStorage in React Native
    throw new Error('Native storage not implemented in web build');
  }
  
  async setItem(key, value) {
    throw new Error('Native storage not implemented in web build');
  }
  
  async removeItem(key) {
    throw new Error('Native storage not implemented in web build');
  }
  
  async getAllKeys() {
    throw new Error('Native storage not implemented in web build');
  }
}

export default new NativeStorage();
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 4.2: Implement Offline-First Architecture
**Status**: NOT STARTED

#### Create New File
`src/services/sync/offlineQueue.js`:
```javascript
import { getStorage } from '../platform';

class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.baseDelay = 1000; // Start with 1 second
    
    // Load persisted queue
    this.loadQueue();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.processQueue());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  async loadQueue() {
    const storage = await getStorage();
    const saved = await storage.getItem('manylla_offline_queue');
    
    if (saved) {
      try {
        this.queue = JSON.parse(saved);
      } catch {
        this.queue = [];
      }
    }
  }
  
  async saveQueue() {
    const storage = await getStorage();
    await storage.setItem('manylla_offline_queue', JSON.stringify(this.queue));
  }
  
  async addToQueue(operation) {
    const queueItem = {
      id: Date.now() + '_' + Math.random(),
      operation,
      retries: 0,
      createdAt: Date.now(),
      lastAttempt: null
    };
    
    this.queue.push(queueItem);
    await this.saveQueue();
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
    
    return queueItem.id;
  }
  
  async processQueue() {
    if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0];
      
      try {
        // Exponential backoff
        const delay = this.baseDelay * Math.pow(2, item.retries);
        
        if (item.lastAttempt && Date.now() - item.lastAttempt < delay) {
          // Still in backoff period
          break;
        }
        
        // Execute operation
        await this.executeOperation(item.operation);
        
        // Success - remove from queue
        this.queue.shift();
        await this.saveQueue();
        
        // Notify success
        this.notifySuccess(item);
        
      } catch (error) {
        item.retries++;
        item.lastAttempt = Date.now();
        
        if (item.retries >= this.maxRetries) {
          // Max retries reached - move to failed queue
          this.queue.shift();
          await this.handleFailedOperation(item, error);
        }
        
        await this.saveQueue();
        
        // Stop processing on error (will retry later)
        break;
      }
    }
    
    this.isProcessing = false;
    
    // Schedule next attempt if items remain
    if (this.queue.length > 0) {
      const nextItem = this.queue[0];
      const delay = this.baseDelay * Math.pow(2, nextItem.retries);
      
      setTimeout(() => this.processQueue(), delay);
    }
  }
  
  async executeOperation(operation) {
    switch (operation.type) {
      case 'sync_push':
        return await this.executeSyncPush(operation.data);
      
      case 'share_create':
        return await this.executeShareCreate(operation.data);
      
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
  
  async executeSyncPush(data) {
    const response = await fetch('/api/sync/push_timestamp.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync push failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  async executeShareCreate(data) {
    const response = await fetch('/api/share/create.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Share create failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  async handleFailedOperation(item, error) {
    const storage = await getStorage();
    
    // Save to failed operations for manual retry
    const failed = JSON.parse(
      await storage.getItem('manylla_failed_operations') || '[]'
    );
    
    failed.push({
      ...item,
      failedAt: Date.now(),
      error: error.message
    });
    
    // Keep only last 50 failed operations
    if (failed.length > 50) {
      failed.splice(0, failed.length - 50);
    }
    
    await storage.setItem('manylla_failed_operations', JSON.stringify(failed));
    
    // Notify user
    this.notifyFailure(item, error);
  }
  
  handleOffline() {
    // Notify user they're offline
    if (this.queue.length > 0) {
      this.notifyOffline();
    }
  }
  
  notifySuccess(item) {
    window.dispatchEvent(new CustomEvent('manylla:sync:success', {
      detail: { operation: item.operation }
    }));
  }
  
  notifyFailure(item, error) {
    window.dispatchEvent(new CustomEvent('manylla:sync:failure', {
      detail: { operation: item.operation, error: error.message }
    }));
  }
  
  notifyOffline() {
    window.dispatchEvent(new CustomEvent('manylla:offline', {
      detail: { queueLength: this.queue.length }
    }));
  }
  
  getQueueStatus() {
    return {
      pending: this.queue.length,
      isProcessing: this.isProcessing,
      isOnline: navigator.onLine
    };
  }
}

export default new OfflineQueue();
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 4.3: Add Performance Optimizations
**Status**: NOT STARTED

#### Update File
`src/services/sync/manyllaMinimalSyncService.js`

Add differential sync and caching:
```javascript
class ManyllaMinimalSyncService {
  constructor() {
    // ... existing code ...
    
    // Performance optimizations
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.lastSyncHash = null;
    this.deltaThreshold = 100; // Use delta if < 100 changes
  }
  
  /**
   * Calculate diff between two data objects
   */
  calculateDiff(oldData, newData) {
    const changes = [];
    
    // Check each field
    Object.keys(newData).forEach(key => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push({
          field: key,
          old: oldData[key],
          new: newData[key]
        });
      }
    });
    
    return changes;
  }
  
  /**
   * Create delta update instead of full sync
   */
  createDeltaUpdate(changes, baseHash) {
    return {
      type: 'delta',
      baseHash,
      changes,
      timestamp: Date.now()
    };
  }
  
  /**
   * Apply delta updates to base data
   */
  applyDeltaUpdate(baseData, delta) {
    const updated = { ...baseData };
    
    delta.changes.forEach(change => {
      updated[change.field] = change.new;
    });
    
    return updated;
  }
  
  /**
   * Optimized push with delta updates
   */
  async pushDataOptimized(profileData) {
    // Check if we can use delta update
    if (this.lastSyncData && this.lastSyncHash) {
      const changes = this.calculateDiff(this.lastSyncData, profileData);
      
      if (changes.length < this.deltaThreshold) {
        // Use delta update
        const delta = this.createDeltaUpdate(changes, this.lastSyncHash);
        
        try {
          await this.pushDelta(delta);
          
          // Update cache
          this.lastSyncData = profileData;
          this.lastSyncHash = this.calculateHash(profileData);
          
          return { success: true, type: 'delta' };
        } catch (error) {
          // Fall back to full sync
          console.warn('Delta sync failed, using full sync:', error);
        }
      }
    }
    
    // Full sync
    return this.pushData(profileData);
  }
  
  /**
   * Cache remote data to reduce pulls
   */
  async pullDataCached() {
    const cacheKey = `pull_${this.syncId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      // Return cached data
      return cached.data;
    }
    
    // Pull fresh data
    const data = await this.pullData();
    
    // Update cache
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    this.cleanCache();
    
    return data;
  }
  
  cleanCache() {
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout * 2) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Calculate hash for data comparison
   */
  calculateHash(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return hash.toString(16);
  }
}
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Task 4.4: Create Mobile Bridge Utilities
**Status**: NOT STARTED

#### Create New File
`src/services/mobile/bridge.js`:
```javascript
/**
 * Bridge for communication between React Native WebView and web app
 */
class MobileBridge {
  constructor() {
    this.isReactNative = window.ReactNativeWebView !== undefined;
    this.messageQueue = [];
    this.responseHandlers = new Map();
    
    if (this.isReactNative) {
      this.setupBridge();
    }
  }
  
  setupBridge() {
    // Listen for messages from React Native
    window.addEventListener('message', (event) => {
      this.handleNativeMessage(event.data);
    });
    
    // Override console for debugging in React Native
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      this.postMessage({
        type: 'console.log',
        data: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : arg
        )
      });
    };
  }
  
  /**
   * Send message to React Native
   */
  postMessage(message) {
    if (!this.isReactNative) return;
    
    const messageWithId = {
      ...message,
      id: Date.now() + '_' + Math.random()
    };
    
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify(messageWithId)
      );
    } catch (error) {
      console.error('Failed to post message to React Native:', error);
    }
    
    return messageWithId.id;
  }
  
  /**
   * Send message and wait for response
   */
  async sendRequest(type, data) {
    if (!this.isReactNative) {
      throw new Error('Not in React Native environment');
    }
    
    return new Promise((resolve, reject) => {
      const messageId = this.postMessage({ type, data });
      
      // Store response handler
      this.responseHandlers.set(messageId, { resolve, reject });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.responseHandlers.has(messageId)) {
          this.responseHandlers.delete(messageId);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }
  
  /**
   * Handle message from React Native
   */
  handleNativeMessage(data) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Check if this is a response to a request
      if (message.responseId && this.responseHandlers.has(message.responseId)) {
        const handler = this.responseHandlers.get(message.responseId);
        this.responseHandlers.delete(message.responseId);
        
        if (message.error) {
          handler.reject(new Error(message.error));
        } else {
          handler.resolve(message.data);
        }
        
        return;
      }
      
      // Handle specific message types
      switch (message.type) {
        case 'biometric_auth':
          this.handleBiometricAuth(message.data);
          break;
          
        case 'share_intent':
          this.handleShareIntent(message.data);
          break;
          
        case 'deep_link':
          this.handleDeepLink(message.data);
          break;
          
        case 'storage_update':
          this.handleStorageUpdate(message.data);
          break;
          
        default:
          console.warn('Unknown message type from React Native:', message.type);
      }
      
    } catch (error) {
      console.error('Failed to handle native message:', error);
    }
  }
  
  /**
   * Request biometric authentication
   */
  async requestBiometricAuth(reason) {
    return this.sendRequest('request_biometric', { reason });
  }
  
  /**
   * Get device info
   */
  async getDeviceInfo() {
    return this.sendRequest('get_device_info', {});
  }
  
  /**
   * Request native storage
   */
  async getNativeStorage(key) {
    return this.sendRequest('get_storage', { key });
  }
  
  async setNativeStorage(key, value) {
    return this.sendRequest('set_storage', { key, value });
  }
  
  /**
   * Handle biometric authentication result
   */
  handleBiometricAuth(data) {
    window.dispatchEvent(new CustomEvent('manylla:biometric', {
      detail: data
    }));
  }
  
  /**
   * Handle share intent from native app
   */
  handleShareIntent(data) {
    window.dispatchEvent(new CustomEvent('manylla:share_intent', {
      detail: data
    }));
  }
  
  /**
   * Handle deep link
   */
  handleDeepLink(data) {
    window.dispatchEvent(new CustomEvent('manylla:deep_link', {
      detail: data
    }));
  }
  
  /**
   * Handle storage update from native
   */
  handleStorageUpdate(data) {
    window.dispatchEvent(new CustomEvent('manylla:storage_update', {
      detail: data
    }));
  }
  
  /**
   * Check if running in React Native
   */
  isNative() {
    return this.isReactNative;
  }
}

export default new MobileBridge();
```

**Implementation Notes**: _____________________
**Completion Time**: _____________________

---

### Phase 4 Summary
**All Tasks Completed**: ☐
**Total Time Taken**: _____________________
**Issues Encountered**: _____________________
**Deviations from Plan**: _____________________

### Phase 4 Exit Criteria
- [ ] Platform abstraction layer complete
- [ ] Offline queue functioning
- [ ] Performance optimizations implemented
- [ ] Mobile bridge utilities ready
- [ ] All web functionality maintained

**Phase 4 Sign-off**: _____________________

---

## FINAL SECURITY CHECKLIST

### Before Mobile Development
- [ ] All phases completed and tested
- [ ] No plaintext data in storage
- [ ] All API endpoints secured
- [ ] Rate limiting active
- [ ] Audit logging operational
- [ ] Performance metrics acceptable
- [ ] Security scan passed

### Performance Targets
- [ ] Initial load < 3 seconds
- [ ] Sync operation < 2 seconds
- [ ] Encryption/decryption < 100ms
- [ ] Offline mode seamless
- [ ] Cache hit rate > 80%

### Documentation Complete
- [ ] API documentation updated
- [ ] Security procedures documented
- [ ] Mobile integration guide ready
- [ ] Deployment instructions clear

---

## PROJECT COMPLETION

**All Phases Completed**: ☐
**Total Project Duration**: _____________________
**Ready for Mobile Development**: ☐

### Final Notes
_____________________

### Approval for Mobile Development
**Approved By**: _____________________
**Date**: _____________________

---

## Appendix: Quick Reference

### Key Security Implementations
1. **Encryption**: TweetNaCl.js with XSalsa20-Poly1305
2. **Key Derivation**: 100,000 nacl.hash iterations
3. **Recovery Phrase**: 32-character hexadecimal
4. **Rate Limiting**: 200ms client, 60s new device
5. **Input Validation**: 32-char hex for IDs
6. **Database**: Real prepared statements, UTF8MB4
7. **Compression**: Pako for >1KB payloads
8. **Conflict Resolution**: Additive merge, never delete

### API Endpoints
- `/api/sync/push_timestamp.php` - Push encrypted data
- `/api/sync/pull_timestamp.php` - Pull encrypted data
- `/api/sync/join_timestamp.php` - Join sync group
- `/api/sync/create_invite.php` - Create invite code
- `/api/sync/use_invite.php` - Use invite code
- `/api/share/create.php` - Create temporary share
- `/api/share/access.php` - Access shared data

### Testing Commands
```bash
# Run all tests
npm test

# Security tests
npm test -- --testNamePattern="security"

# Integration tests
npm test -- --testNamePattern="integration"

# Manual security audit
npm audit
```