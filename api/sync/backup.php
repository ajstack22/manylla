<?php
/**
 * Manylla Sync API - Backup Endpoint
 * Stores encrypted profile data for a recovery hash
 */

require_once 'config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['recovery_hash']) || !isset($input['encrypted_blob']) || !isset($input['version'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$recoveryHash = $input['recovery_hash'];
$encryptedBlob = $input['encrypted_blob'];
$version = intval($input['version']);
$deviceId = $input['device_id'] ?? null;

// Validate recovery hash
if (!validateRecoveryHash($recoveryHash)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid recovery hash']);
    exit();
}

// Validate encrypted blob (should be base64)
if (!base64_decode($encryptedBlob, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid encrypted data']);
    exit();
}

try {
    $pdo = getDbConnection();
    
    // Check if this recovery hash already has data
    $stmt = $pdo->prepare("SELECT id, version FROM sync_data WHERE recovery_hash = ? ORDER BY version DESC LIMIT 1");
    $stmt->execute([$recoveryHash]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update existing record only if version is newer
        if ($version <= $existing['version']) {
            http_response_code(409);
            echo json_encode([
                'error' => 'Older version',
                'current_version' => $existing['version'],
                'your_version' => $version
            ]);
            exit();
        }
        
        // Update the existing record
        $stmt = $pdo->prepare("
            UPDATE sync_data 
            SET encrypted_blob = ?, 
                version = ?, 
                device_id = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$encryptedBlob, $version, $deviceId, $existing['id']]);
        
        $message = 'Backup updated successfully';
    } else {
        // Insert new record
        $stmt = $pdo->prepare("
            INSERT INTO sync_data (recovery_hash, encrypted_blob, version, device_id)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$recoveryHash, $encryptedBlob, $version, $deviceId]);
        
        $message = 'Backup created successfully';
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => $message,
        'version' => $version,
        'timestamp' => time()
    ]);
    
} catch (Exception $e) {
    error_log("Backup failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Backup failed']);
}