<?php
/**
 * Create Sync Group Endpoint
 * 
 * Creates a new sync group with initial encrypted data
 * 
 * Method: POST
 * Required fields: sync_id, encrypted_blob, device_id
 * Optional fields: device_name
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/validation.php';
require_once __DIR__ . '/utils/rate-limiter.php';
require_once __DIR__ . '/utils/cors.php';

// Initialize headers
initializeHeaders();

// Check request method
validateRequestMethod('POST');

// Check rate limit
checkRateLimit();

// Get JSON input
$input = getJsonInput();
if (!$input) {
    sendError(ERROR_MESSAGES['INVALID_REQUEST']);
}

// Validate required fields
validateRequired($input, ['sync_id', 'encrypted_blob', 'device_id']);

// Extract and validate inputs
$syncId = $input['sync_id'] ?? '';
$encryptedBlob = $input['encrypted_blob'] ?? '';
$deviceId = $input['device_id'] ?? '';
$deviceName = $input['device_name'] ?? 'Unknown Device';

// Validate sync ID
if (!validateSyncId($syncId)) {
    sendError(ERROR_MESSAGES['INVALID_SYNC_ID']);
}

// Validate device ID
if (!validateDeviceId($deviceId)) {
    sendError(ERROR_MESSAGES['INVALID_DEVICE_ID']);
}

// Validate encrypted blob
if (!validateEncryptedBlob($encryptedBlob)) {
    sendError(ERROR_MESSAGES['INVALID_BLOB']);
}

// Validate device name
if (!validateDeviceName($deviceName)) {
    sendError('Invalid device name format');
}

// Sanitize device name
$deviceName = sanitizeString($deviceName);

try {
    $db = Database::getInstance();
    $db->beginTransaction();
    
    // Check if sync group already exists
    $sql = "SELECT id FROM sync_data WHERE sync_id = ?";
    $existing = $db->fetchOne($sql, [$syncId]);
    
    if ($existing) {
        $db->rollback();
        sendError(ERROR_MESSAGES['SYNC_EXISTS'], 409);
    }
    
    // Create new sync group
    $sql = "INSERT INTO sync_data (sync_id, encrypted_blob, version, device_id, device_name) 
            VALUES (?, ?, 1, ?, ?)";
    
    $db->insert($sql, [$syncId, $encryptedBlob, $deviceId, $deviceName]);
    
    $db->commit();
    
    // Return success response
    sendSuccess([
        'sync_id' => $syncId,
        'version' => 1,
        'created_at' => date('Y-m-d H:i:s')
    ], 'Sync group created successfully');
    
} catch (Exception $e) {
    if (isset($db)) {
        $db->rollback();
    }
    
    error_log("Create sync error: " . $e->getMessage());
    sendError(ERROR_MESSAGES['SERVER_ERROR'], 500);
}
?>