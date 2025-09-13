<?php
/**
 * Share Access Endpoint
 * Retrieves an encrypted shared profile using an access code
 * 
 * Expected GET/POST parameters:
 * - access_code: 8-character access code (XXXX-XXXX format)
 */

require_once 'config/config.php';
require_once 'config/database.php';

// Allow both GET and POST for flexibility
$accessCode = null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $accessCode = $_GET['access_code'] ?? null;
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $accessCode = $input['access_code'] ?? null;
} else {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// Validate access code
if (!$accessCode) {
    http_response_code(400);
    die(json_encode(['error' => ERROR_MESSAGES['INVALID_REQUEST']]));
}

$accessCode = trim(strtoupper($accessCode));

// Validate access code format (XXXX-XXXX)
if (!preg_match('/^[A-Z0-9]{4}-[A-Z0-9]{4}$/', $accessCode)) {
    http_response_code(400);
    die(json_encode(['error' => ERROR_MESSAGES['INVALID_ACCESS_CODE']]));
}

try {
    $db = Database::getInstance();
    
    // Retrieve share data
    $share = $db->fetchOne(
        "SELECT share_token, encrypted_data, expires_at, access_count, max_access, created_at, creator_ip 
         FROM shares 
         WHERE share_token = ? AND expires_at > NOW()",
        [$accessCode]
    );
    
    if (!$share) {
        // Check if it existed but expired
        $expired = $db->fetchOne(
            "SELECT share_token FROM shares WHERE share_token = ?",
            [$accessCode]
        );
        
        if ($expired) {
            http_response_code(410); // Gone
            die(json_encode(['error' => ERROR_MESSAGES['SHARE_EXPIRED']]));
        } else {
            http_response_code(404);
            die(json_encode(['error' => ERROR_MESSAGES['SHARE_NOT_FOUND']]));
        }
    }
    
    // Check view limit using max_access column
    $maxViews = $share['max_access'];
    
    // Check view limit
    if ($maxViews !== null && $share['access_count'] >= $maxViews) {
        http_response_code(403);
        die(json_encode(['error' => ERROR_MESSAGES['SHARE_VIEW_LIMIT']]));
    }
    
    // Increment access count
    $db->execute(
        "UPDATE shares SET access_count = access_count + 1 WHERE share_token = ?",
        [$accessCode]
    );
    
    // Log access (privacy-respecting) - Skip for now as share_audit table may not exist
    // if (SHARE_ACCESS_LOG_ENABLED) {
    //     $shareId = $metadata['share_id'] ?? $accessCode;
    //     $ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    //     $db->execute(
    //         "INSERT INTO share_audit (share_id, event_type, ip_hash) VALUES (?, ?, ?)",
    //         [$shareId, 'accessed', $ipHash]
    //     );
    // }
    
    // Record metric - Skip for now as sync_metrics table may not exist
    // $db->execute(
    //     "INSERT INTO sync_metrics (event, metadata) VALUES (?, ?)",
    //     ['share_accessed', json_encode(['recipient_type' => $share['recipient_type']])]
    // );
    
    // Calculate time until expiration
    $expiresAt = strtotime($share['expires_at']);
    $now = time();
    $hoursRemaining = max(0, round(($expiresAt - $now) / 3600));
    
    // Return encrypted data
    $response = [
        'success' => true,
        'message' => SHARE_MESSAGES['SHARE_ACCESSED'],
        'encrypted_data' => $share['encrypted_data'],
        'recipient_type' => 'custom', // Default since not stored in this schema
        'created_at' => $share['created_at'],
        'expires_at' => $share['expires_at'],
        'hours_remaining' => $hoursRemaining,
        'view_count' => intval($share['access_count']),
        'max_views' => $maxViews ? intval($maxViews) : null,
        'views_remaining' => $maxViews ? max(0, intval($maxViews) - intval($share['access_count'])) : null,
        'share_token' => $share['share_token'] // For compatibility
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Share access failed: " . $e->getMessage());
    http_response_code(500);
    die(json_encode(['error' => ERROR_MESSAGES['SERVER_ERROR']]));
}
?>