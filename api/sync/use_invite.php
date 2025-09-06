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

require_once __DIR__ . '/../utils/validation.php';

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

// TODO: When backend is ready, uncomment and configure database
/*
require_once '../config/database.php';

// Get JSON input
$input = getJsonInput();

if (!$input) {
    sendError('Missing request body', 400);
}

// Validate required fields
validateRequired($input, ['invite_code']);

$invite_code = strtoupper(trim($input['invite_code']));
$device_id = $input['device_id'] ?? 'unknown';

// Validate invite code format: XXXX-XXXX
if (!preg_match('/^[A-Z0-9]{4}-[A-Z0-9]{4}$/', $invite_code)) {
    sendError('Invalid invite code format', 400);
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
        sendError('Invite code not found', 404);
    }
    
    $invite = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if expired
    if (strtotime($invite['expires_at']) < time()) {
        sendError('Invite code has expired', 410);
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
    
    sendSuccess([
        'sync_id' => $invite['sync_id'],
        'encrypted_data' => $latest_data['encrypted_data'] ?? null,
        'timestamp' => $latest_data['timestamp'] ?? 0
    ]);
    
} catch (Exception $e) {
    error_log('Manylla use invite error: ' . $e->getMessage());
    sendError('Server error', 500);
}
*/

// For now, return success (localStorage only mode)
echo json_encode([
    'success' => true,
    'message' => 'API endpoint ready for deployment (using localStorage)'
]);
?>