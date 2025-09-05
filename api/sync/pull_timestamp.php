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

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// TODO: When backend is ready, uncomment and configure database
/*
require_once '../config/database.php';

// Get parameters
$sync_id = $_GET['sync_id'] ?? null;
$since = $_GET['since'] ?? 0;
$device_id = $_GET['device_id'] ?? null;

if (!$sync_id) {
    http_response_code(400);
    echo json_encode(['error' => 'sync_id is required']);
    exit;
}

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