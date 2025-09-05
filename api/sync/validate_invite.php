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

// Get invite code from query parameter
$invite_code = $_GET['code'] ?? null;

if (!$invite_code) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing invite code']);
    exit;
}

// Normalize invite code (uppercase, trim)
$invite_code = strtoupper(trim($invite_code));

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
    
    // Note: We don't check if it's been used - invites can be used multiple times
    // within the expiration period (family-friendly approach)
    
    echo json_encode([
        'success' => true,
        'sync_id' => $invite['sync_id'],
        'expires_at' => $invite['expires_at'],
        'is_used' => !empty($invite['used_at'])
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log('Manylla validate invite error: ' . $e->getMessage());
}
*/

// For now, return success (localStorage only mode)
echo json_encode([
    'success' => true,
    'message' => 'API endpoint ready for deployment (using localStorage)'
]);
?>