<?php
/**
 * Manylla Sync API - Version Check Endpoint
 * Returns the latest version without downloading the data
 */

require_once 'config.php';

// Only accept GET or POST requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get recovery hash from request
$recoveryHash = null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $recoveryHash = $_GET['recovery_hash'] ?? null;
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $recoveryHash = $input['recovery_hash'] ?? null;
}

// Validate recovery hash
if (!$recoveryHash || !validateRecoveryHash($recoveryHash)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid recovery hash']);
    exit();
}

try {
    $pdo = getDbConnection();
    
    // Get just the version info for this recovery hash
    $stmt = $pdo->prepare("
        SELECT version, device_id, 
               UNIX_TIMESTAMP(updated_at) as updated_timestamp
        FROM sync_data 
        WHERE recovery_hash = ? 
        ORDER BY version DESC 
        LIMIT 1
    ");
    $stmt->execute([$recoveryHash]);
    $data = $stmt->fetch();
    
    if (!$data) {
        // No backup exists yet
        echo json_encode([
            'success' => true,
            'has_backup' => false,
            'version' => 0
        ]);
        exit();
    }
    
    // Return version info
    echo json_encode([
        'success' => true,
        'has_backup' => true,
        'version' => intval($data['version']),
        'device_id' => $data['device_id'],
        'updated_at' => $data['updated_timestamp']
    ]);
    
} catch (Exception $e) {
    error_log("Version check failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Version check failed']);
}