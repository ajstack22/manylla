<?php
/**
 * Manylla Sync API - Create Sync Group
 * Creates a new sync group for a recovery phrase
 * 
 * Endpoint: POST /api/sync/create_timestamp.php
 * 
 * Request body:
 * {
 *   "sync_id": "string",          // Hash of recovery phrase
 *   "encrypted_data": "string",   // Base64 encrypted initial data
 *   "timestamp": number,          // Unix timestamp in milliseconds
 *   "device_id": "string"         // Device identifier
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
    // Check if sync_id already exists
    $stmt = $pdo->prepare("SELECT id FROM manylla_sync_groups WHERE sync_id = ?");
    $stmt->execute([$sync_id]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Sync group already exists']);
        exit;
    }
    
    // Create new sync group
    $stmt = $pdo->prepare("
        INSERT INTO manylla_sync_groups (sync_id, created_at) 
        VALUES (?, NOW())
    ");
    $stmt->execute([$sync_id]);
    
    // Store initial encrypted data
    $stmt = $pdo->prepare("
        INSERT INTO manylla_sync_data (
            sync_id, 
            encrypted_data, 
            timestamp, 
            device_id,
            created_at
        ) VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$sync_id, $encrypted_data, $timestamp, $device_id]);
    
    echo json_encode([
        'success' => true,
        'sync_id' => $sync_id,
        'timestamp' => $timestamp
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log('Manylla sync error: ' . $e->getMessage());
}
*/

// For now, return success (localStorage only mode)
echo json_encode([
    'success' => true,
    'message' => 'API endpoint ready for deployment'
]);
?>