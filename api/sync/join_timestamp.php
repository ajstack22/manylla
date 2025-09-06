<?php
/**
 * Manylla Sync API - Join Sync Group
 * Joins an existing sync group with a recovery phrase
 * 
 * Endpoint: POST /api/sync/join_timestamp.php
 * 
 * Request body:
 * {
 *   "sync_id": "string",     // Hash of recovery phrase
 *   "device_id": "string"    // New device joining
 * }
 */

// Load validation utilities
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/rate-limiter.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Validate request method
validateRequestMethod('POST');

// Get and validate input
$input = getJsonInput();

// Validate required fields
validateRequired($input, ['sync_id', 'device_id']);

// Validate sync_id format
if (!validateSyncId($input['sync_id'])) {
    sendError('Invalid sync_id format', 400);
}

// Validate device_id format
if (!validateDeviceId($input['device_id'])) {
    sendError('Invalid device_id format', 400);
}

$sync_id = $input['sync_id'];
$device_id = $input['device_id'];

// Apply rate limiting
global $rateLimiter;
if ($rateLimiter) {
    $rateLimiter->enforceAllLimits($sync_id, $device_id, getClientIp());
}

// TODO: When backend is ready, uncomment and configure database
/*
require_once '../config/database.php';

try {
    // Check if sync group exists
    $stmt = $pdo->prepare("
        SELECT id, created_at 
        FROM manylla_sync_groups 
        WHERE sync_id = ?
    ");
    $stmt->execute([$sync_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Sync group not found']);
        exit;
    }
    
    $sync_group = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log device join
    $stmt = $pdo->prepare("
        INSERT INTO manylla_sync_devices (
            sync_id,
            device_id,
            joined_at
        ) VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            last_seen = NOW()
    ");
    $stmt->execute([$sync_id, $device_id]);
    
    // Get latest encrypted data
    $stmt = $pdo->prepare("
        SELECT encrypted_data, timestamp 
        FROM manylla_sync_data 
        WHERE sync_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
    ");
    $stmt->execute([$sync_id]);
    
    $latest_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'sync_id' => $sync_id,
        'encrypted_data' => $latest_data['encrypted_data'] ?? null,
        'timestamp' => $latest_data['timestamp'] ?? 0
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log('Manylla join error: ' . $e->getMessage());
}
*/

// For now, return success (localStorage only mode)
echo json_encode([
    'success' => true,
    'message' => 'API endpoint ready for deployment'
]);
?>