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

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// TODO: When backend is ready, uncomment and configure database
/*
require_once '../config/database.php';

// Get input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['sync_id']) || !isset($input['encrypted_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$sync_id = $input['sync_id'];
$encrypted_data = $input['encrypted_data'];
$timestamp = $input['timestamp'] ?? round(microtime(true) * 1000);
$device_id = $input['device_id'] ?? 'unknown';

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
echo json_encode([
    'success' => true,
    'message' => 'API endpoint ready for deployment'
]);
?>