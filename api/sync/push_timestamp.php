<?php
/**
 * Manylla Sync API - Push Data
 * Stores encrypted data for a sync group
 * 
 * Endpoint: POST /api/sync/push_timestamp.php
 * 
 * Request body:
 * {
 *   "sync_id": "string",          // Sync group identifier
 *   "encrypted_data": "string",   // Base64 encrypted data blob
 *   "timestamp": number,          // Unix timestamp in milliseconds
 *   "device_id": "string"         // Device pushing the data
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

// Validate required fields
validateRequired($input, ['sync_id', 'encrypted_data', 'device_id']);

// Validate sync_id format
if (!validateSyncId($input['sync_id'])) {
    sendError('Invalid sync_id format', 400);
}

// Validate device_id format
if (!validateDeviceId($input['device_id'])) {
    sendError('Invalid device_id format', 400);
}

// Validate encrypted data
if (!validateEncryptedBlob($input['encrypted_data'])) {
    sendError('Invalid encrypted data', 400);
}

// Validate timestamp if provided
if (isset($input['timestamp'])) {
    if (!is_numeric($input['timestamp']) || $input['timestamp'] < 0) {
        sendError('Invalid timestamp', 400);
    }
}

$sync_id = $input['sync_id'];
$encrypted_data = $input['encrypted_data'];
$timestamp = $input['timestamp'] ?? round(microtime(true) * 1000);
$device_id = $input['device_id'];

// Apply rate limiting
global $rateLimiter;
if ($rateLimiter) {
    $rateLimiter->enforceAllLimits($sync_id, $device_id, getClientIp());
    
    // Check for data reduction attacks
    $rateLimiter->checkDataReduction($sync_id, $device_id, strlen($encrypted_data));
}

// TODO: When backend is ready, uncomment and configure database
/*
require_once '../config/database.php';

try {
    // Verify sync group exists
    $stmt = $pdo->prepare("SELECT id FROM manylla_sync_groups WHERE sync_id = ?");
    $stmt->execute([$sync_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Sync group not found']);
        exit;
    }
    
    // Store encrypted data (zero-knowledge - server can't decrypt)
    $stmt = $pdo->prepare("
        INSERT INTO manylla_sync_data (
            sync_id, 
            encrypted_data, 
            timestamp, 
            device_id,
            created_at
        ) VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            encrypted_data = VALUES(encrypted_data),
            timestamp = VALUES(timestamp),
            updated_at = NOW()
    ");
    
    $stmt->execute([$sync_id, $encrypted_data, $timestamp, $device_id]);
    
    echo json_encode([
        'success' => true,
        'timestamp' => $timestamp
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log('Manylla push error: ' . $e->getMessage());
}
*/

// For now, return success (localStorage only mode)
sendSuccess([
    'timestamp' => $timestamp
], 'API endpoint ready for deployment with validation');
?>