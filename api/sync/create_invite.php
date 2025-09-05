<?php
/**
 * Manylla Sync API - Create Invite Code
 * Creates a temporary invite code for sharing sync access
 * 
 * Endpoint: POST /api/sync/create_invite.php
 * 
 * Request body:
 * {
 *   "sync_id": "string",      // Sync group identifier
 *   "device_id": "string"     // Device creating the invite
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "invite_code": "ABCD-1234",
 *   "expires_at": "2025-01-14T10:00:00Z"
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

/**
 * Generate a random invite code in format XXXX-XXXX
 * Using character set that avoids confusion (no 0/O, 1/I/L)
 */
function generateInviteCode() {
    $chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $code = '';
    
    for ($i = 0; $i < 8; $i++) {
        if ($i === 4) {
            $code .= '-';
        }
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    
    return $code;
}

// TODO: When backend is ready, uncomment and configure database
/*
require_once '../config/database.php';

// Get input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['sync_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing sync_id']);
    exit;
}

$sync_id = $input['sync_id'];
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
    
    // Generate unique invite code
    $max_attempts = 10;
    $invite_code = null;
    
    for ($i = 0; $i < $max_attempts; $i++) {
        $candidate = generateInviteCode();
        
        // Check if code already exists
        $stmt = $pdo->prepare("SELECT id FROM manylla_sync_invites WHERE invite_code = ?");
        $stmt->execute([$candidate]);
        
        if ($stmt->rowCount() === 0) {
            $invite_code = $candidate;
            break;
        }
    }
    
    if (!$invite_code) {
        throw new Exception('Failed to generate unique invite code');
    }
    
    // Create invite (expires in 24 hours)
    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    $stmt = $pdo->prepare("
        INSERT INTO manylla_sync_invites (
            invite_code,
            sync_id,
            created_by_device,
            expires_at
        ) VALUES (?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $invite_code,
        $sync_id,
        $device_id,
        $expires_at
    ]);
    
    echo json_encode([
        'success' => true,
        'invite_code' => $invite_code,
        'expires_at' => $expires_at
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log('Manylla create invite error: ' . $e->getMessage());
}
*/

// For now, return a mock invite code (localStorage only mode)
$invite_code = generateInviteCode();
$expires_at = date('c', strtotime('+24 hours'));

echo json_encode([
    'success' => true,
    'invite_code' => $invite_code,
    'expires_at' => $expires_at,
    'message' => 'API endpoint ready for deployment'
]);
?>