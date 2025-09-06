<?php
/**
 * Manylla Sync API - Pull Data
 * Retrieves encrypted data for a sync group since a timestamp
 * 
 * Endpoint: GET /api/sync/pull_timestamp.php
 * 
 * Query parameters:
 * - sync_id: Sync group identifier
 * - since: Unix timestamp in milliseconds (optional, 0 for all)
 * - device_id: Requesting device ID (optional)
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
validateRequestMethod('GET');

// Get and validate parameters
$sync_id = $_GET['sync_id'] ?? null;
$since = $_GET['since'] ?? 0;
$device_id = $_GET['device_id'] ?? null;

// Validate required sync_id
if (!$sync_id) {
    sendError('sync_id is required', 400);
}

// Validate sync_id format
if (!validateSyncId($sync_id)) {
    sendError('Invalid sync_id format', 400);
}

// Validate device_id if provided
if ($device_id && !validateDeviceId($device_id)) {
    sendError('Invalid device_id format', 400);
}

// Validate since timestamp
if (!is_numeric($since) || $since < 0) {
    sendError('Invalid since timestamp', 400);
}

// Apply rate limiting
global $rateLimiter;
if ($rateLimiter) {
    $rateLimiter->enforceAllLimits($sync_id, $device_id, getClientIp());
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
    
    // Get latest data after timestamp (excluding requesting device's own data)
    $query = "
        SELECT encrypted_data, timestamp, device_id 
        FROM manylla_sync_data 
        WHERE sync_id = ? 
        AND timestamp > ?
    ";
    
    $params = [$sync_id, $since];
    
    // Optionally exclude requesting device's data
    if ($device_id) {
        $query .= " AND device_id != ?";
        $params[] = $device_id;
    }
    
    $query .= " ORDER BY timestamp DESC LIMIT 1";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo json_encode([
            'success' => true,
            'encrypted_data' => $data['encrypted_data'],
            'timestamp' => $data['timestamp'],
            'device_id' => $data['device_id']
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'encrypted_data' => null,
            'message' => 'No new data'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log('Manylla pull error: ' . $e->getMessage());
}
*/

// For now, return no new data (localStorage only mode)
echo json_encode([
    'success' => true,
    'encrypted_data' => null,
    'message' => 'API endpoint ready for deployment'
]);
?>