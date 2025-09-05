<?php
/**
 * Manylla Sync API - Use Invite Code
 * Marks an invite code as used and returns sync data
 * 
 * Endpoint: POST /api/sync/use_invite.php
 * 
 * Request body:
 * {
 *   "invite_code": "ABCD-1234",
 *   "device_id": "string"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "sync_id": "string",
 *   "encrypted_data": "string"  // Latest sync data
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

if (!$input || !isset($input['invite_code'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing invite code']);
    exit;
}

$invite_code = strtoupper(trim($input['invite_code']));
$device_id = $input['device_id'] ?? 'unknown';

// Validate format: XXXX-XXXX
if (!preg_match('/^[A-Z2-9]{4}-[A-Z2-9]{4}$/', $invite_code)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid invite code format']);
    exit;
}

try {
    // Look up invite code
    $stmt = $pdo->prepare("
        SELECT 
            id,
            sync_id,
            expires_at,
            used_at
        FROM manylla_sync_invites
        WHERE invite_code = ?
    ");
    $stmt->execute([$invite_code]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Invite code not found']);
        exit;
    }
    
    $invite = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if expired
    if (strtotime($invite['expires_at']) < time()) {
        http_response_code(410);
        echo json_encode(['error' => 'Invite code has expired']);
        exit;
    }
    
    // Mark as used (but still allow multiple uses within expiration)
    if (empty($invite['used_at'])) {
        $stmt = $pdo->prepare("
            UPDATE manylla_sync_invites 
            SET 
                used_at = NOW(),
                used_by_device = ?
            WHERE id = ?
        ");
        $stmt->execute([$device_id, $invite['id']]);
    }
    
    // Log device join
    $stmt = $pdo->prepare("
        INSERT INTO manylla_sync_devices (
            sync_id,
            device_id,
            joined_at,
            joined_via_invite
        ) VALUES (?, ?, NOW(), ?)
        ON DUPLICATE KEY UPDATE
            last_seen = NOW()
    ");
    $stmt->execute([$invite['sync_id'], $device_id, $invite_code]);
    
    // Get latest encrypted data for this sync group
    $stmt = $pdo->prepare("
        SELECT encrypted_data, timestamp 
        FROM manylla_sync_data 
        WHERE sync_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
    ");
    $stmt->execute([$invite['sync_id']]);
    
    $latest_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'sync_id' => $invite['sync_id'],
        'encrypted_data' => $latest_data['encrypted_data'] ?? null,
        'timestamp' => $latest_data['timestamp'] ?? 0
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log('Manylla use invite error: ' . $e->getMessage());
}
*/

// For now, return success (localStorage only mode)
echo json_encode([
    'success' => true,
    'message' => 'API endpoint ready for deployment (using localStorage)'
]);
?>