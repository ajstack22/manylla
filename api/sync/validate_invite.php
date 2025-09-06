<?php
/**
 * Manylla Sync API - Validate Invite Code
 * Checks if an invite code is valid and returns sync_id
 * 
 * Endpoint: GET /api/sync/validate_invite.php?code=ABCD-1234
 * 
 * Response:
 * {
 *   "success": true,
 *   "sync_id": "string",
 *   "expires_at": "2025-01-14T10:00:00Z"
 * }
 */

require_once __DIR__ . '/../utils/validation.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Validate request method
validateRequestMethod('GET');

// TODO: When backend is ready, uncomment and configure database
/*
require_once '../config/database.php';

// Get invite code from query parameter
$invite_code = $_GET['code'] ?? null;

// Validate required fields
if (empty($invite_code)) {
    sendError('Missing invite code', 400);
}

// Normalize invite code (uppercase, trim)
$invite_code = strtoupper(trim($invite_code));

// Validate invite code format: XXXX-XXXX
if (!preg_match('/^[A-Z0-9]{4}-[A-Z0-9]{4}$/', $invite_code)) {
    sendError('Invalid invite code format', 400);
}

try {
    // Look up invite code
    $stmt = $pdo->prepare("
        SELECT 
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
    
    // Note: We don't check if it's been used - invites can be used multiple times
    // within the expiration period (family-friendly approach)
    
    sendSuccess([
        'sync_id' => $invite['sync_id'],
        'expires_at' => $invite['expires_at'],
        'is_used' => !empty($invite['used_at'])
    ]);
    
} catch (Exception $e) {
    error_log('Manylla validate invite error: ' . $e->getMessage());
    sendError('Server error', 500);
}
*/

// For now, return success (localStorage only mode)
echo json_encode([
    'success' => true,
    'message' => 'API endpoint ready for deployment (using localStorage)'
]);
?>