<?php
/**
 * Manylla Sync API - Push Data
 * Stores encrypted data for a sync group
 * 
 * Endpoint: POST /api/sync_push.php
 * 
 * Request body:
 * {
 *   "sync_id": "string",          // Sync group identifier
 *   "data": "string",             // Base64 encrypted data blob
 *   "timestamp": number,          // Unix timestamp in milliseconds
 *   "version": "string"           // Version identifier (optional)
 * }
 */

// Load security utilities
require_once __DIR__ . '/../utils/error-handler.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/rate-limiter.php';
require_once __DIR__ . '/../utils/cors.php';

// Initialize headers with enhanced security
initializeHeaders();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Validate request method
validateRequestMethod('POST');

// Get and validate input
$input = getJsonInput();

// Validate required fields (mobile app sends: sync_id, data)
validateRequired($input, ['sync_id', 'data']);

// Validate sync_id format
if (!validateSyncId($input['sync_id'])) {
    sendError('Invalid sync_id format', 400);
}

// Validate encrypted data
if (!validateEncryptedBlob($input['data'])) {
    sendError('Invalid encrypted data', 400);
}

// Validate timestamp if provided
if (isset($input['timestamp'])) {
    if (!is_numeric($input['timestamp']) || $input['timestamp'] < 0) {
        sendError('Invalid timestamp', 400);
    }
}

// Extract fields (map 'data' to 'encrypted_data' for internal use)
$sync_id = $input['sync_id'];
$encrypted_data = $input['data'];  // Mobile sends 'data', we store as 'encrypted_data'
$timestamp = $input['timestamp'] ?? round(microtime(true) * 1000);
$device_id = $input['device_id'] ?? 'mobile_device';  // Default if not provided

// Validate device_id format if provided
if (isset($input['device_id']) && !validateDeviceId($input['device_id'])) {
    sendError('Invalid device_id format', 400);
}

// Apply rate limiting
global $rateLimiter;
if ($rateLimiter) {
    $rateLimiter->enforceAllLimits($sync_id, $device_id, getClientIp());
    
    // Check for data reduction attacks
    $rateLimiter->checkDataReduction($sync_id, $device_id, strlen($encrypted_data));
}

// Phase 3: Store encrypted data in database
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Calculate blob hash for integrity
    $blobHash = hash('sha256', $encrypted_data);
    
    // Store encrypted data with versioning
    $stmt = $db->prepare("
        INSERT INTO sync_data (sync_id, device_id, encrypted_blob, blob_hash, version, timestamp)
        VALUES (?, ?, ?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE
            encrypted_blob = VALUES(encrypted_blob),
            blob_hash = VALUES(blob_hash),
            version = version + 1,
            device_id = VALUES(device_id),
            timestamp = VALUES(timestamp),
            updated_at = CURRENT_TIMESTAMP
    ");
    
    $stmt->execute([$sync_id, $device_id, $encrypted_data, $blobHash, $timestamp]);
    $affectedRows = $stmt->rowCount();
    
    // Create backup of previous version if this was an update
    if ($affectedRows > 0) {
        // Get the current version for backup
        $versionStmt = $db->prepare("SELECT version FROM sync_data WHERE sync_id = ?");
        $versionStmt->execute([$sync_id]);
        $currentVersion = $versionStmt->fetchColumn();
        
        // Only backup if this was an update (not first insert)
        if ($currentVersion > 1) {
            $backupId = bin2hex(random_bytes(18)); // 36 char UUID
            $backupStmt = $db->prepare("
                INSERT INTO sync_backups (backup_id, sync_id, encrypted_blob, blob_hash, version, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $backupStmt->execute([
                $backupId,
                $sync_id,
                $encrypted_data,
                $blobHash,
                $currentVersion - 1,
                $device_id
            ]);
        }
    }
    
    // Update device last seen
    $deviceStmt = $db->prepare("
        INSERT INTO sync_devices (sync_id, device_id, last_seen)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            last_seen = NOW()
    ");
    $deviceStmt->execute([$sync_id, $device_id]);
    
    // Log successful sync
    if (class_exists('AuditLogger')) {
        $auditLogger = new AuditLogger($db);
        $auditLogger->log('sync_push_success', $sync_id, $device_id, [
            'data_size' => strlen($encrypted_data),
            'blob_hash' => $blobHash,
            'timestamp' => $timestamp
        ]);
    }
    
    sendSuccess([
        'timestamp' => $timestamp,
        'blob_hash' => $blobHash,
        'version' => $currentVersion ?? 1
    ], 'Data stored successfully');
    
} catch (Exception $e) {
    error_log('Manylla push error: ' . $e->getMessage());
    sendError('Failed to store data', 500);
}
?>