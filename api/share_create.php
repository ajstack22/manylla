<?php
/**
 * Share Create Endpoint
 * Creates a temporary encrypted share of a profile
 * 
 * Expected POST data:
 * - access_code: 8-character access code (XXXX-XXXX format)
 * - encrypted_data: Base64 encoded encrypted blob
 * - recipient_type: Type of recipient (education, support, medical, custom)
 * - expiry_hours: Hours until expiration (default 168 = 7 days)
 * - max_views: Optional maximum view count
 */

require_once 'config/config.php';
require_once 'config/database.php';

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['access_code']) || !isset($input['encrypted_data'])) {
    http_response_code(400);
    die(json_encode(['error' => ERROR_MESSAGES['INVALID_REQUEST']]));
}

$accessCode = trim($input['access_code']);
$encryptedData = $input['encrypted_data'];
$recipientType = $input['recipient_type'] ?? 'custom';
$expiryHours = intval($input['expiry_hours'] ?? DEFAULT_SHARE_EXPIRY_HOURS);
$maxViews = isset($input['max_views']) ? intval($input['max_views']) : null;

// Validate access code format (XXXX-XXXX)
if (!preg_match('/^[A-Z0-9]{4}-[A-Z0-9]{4}$/i', $accessCode)) {
    http_response_code(400);
    die(json_encode(['error' => ERROR_MESSAGES['INVALID_ACCESS_CODE']]));
}

// Validate encrypted data is base64
if (!base64_decode($encryptedData, true)) {
    http_response_code(400);
    die(json_encode(['error' => ERROR_MESSAGES['INVALID_BLOB']]));
}

// Check blob size
if (strlen($encryptedData) > MAX_BLOB_SIZE) {
    http_response_code(413);
    die(json_encode(['error' => ERROR_MESSAGES['PAYLOAD_TOO_LARGE']]));
}

// Validate expiry hours (max 1 year)
if ($expiryHours < 1 || $expiryHours > (MAX_SHARE_EXPIRY_DAYS * 24)) {
    $expiryHours = DEFAULT_SHARE_EXPIRY_HOURS;
}

try {
    $db = Database::getInstance();
    
    // Generate unique share ID
    $shareId = bin2hex(random_bytes(16));
    
    // Calculate expiration timestamp
    $expiresAt = date('Y-m-d H:i:s', time() + ($expiryHours * 3600));
    
    // Check if access code already exists (unlikely but possible)
    $existing = $db->fetchOne(
        "SELECT share_token FROM shares WHERE share_token = ? AND expires_at > NOW()",
        [$accessCode]
    );
    
    if ($existing) {
        // Generate new access code if collision
        $accessCode = strtoupper(substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes(6))), 0, 8));
        $accessCode = substr($accessCode, 0, 4) . '-' . substr($accessCode, 4, 4);
    }
    
    // Insert share record  
    $sql = "INSERT INTO shares (
        share_token,
        encrypted_data, 
        expires_at,
        max_access,
        creator_ip
    ) VALUES (?, ?, ?, ?, ?)";
    
    $creatorIp = $_SERVER['REMOTE_ADDR'] ?? null;
    
    $db->execute($sql, [
        $accessCode,
        $encryptedData,
        $expiresAt,
        $maxViews,
        $creatorIp
    ]);
    
    // Log share creation (privacy-respecting) - Skip for now as share_audit table may not exist
    // if (SHARE_ACCESS_LOG_ENABLED) {
    //     $ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    //     $db->execute(
    //         "INSERT INTO share_audit (share_id, event_type, ip_hash) VALUES (?, ?, ?)",
    //         [$shareId, 'created', $ipHash]
    //     );
    // }
    
    // Record metric - Skip for now as sync_metrics table may not exist
    // $db->execute(
    //     "INSERT INTO sync_metrics (event, metadata) VALUES (?, ?)",
    //     ['share_created', json_encode(['recipient_type' => $recipientType])]
    // );
    
    // Return success response
    $response = [
        'success' => true,
        'message' => SHARE_MESSAGES['SHARE_CREATED'],
        'share_id' => $shareId,
        'access_code' => $accessCode,
        'share_token' => $accessCode, // For compatibility
        'expires_at' => $expiresAt,
        'expiry_hours' => $expiryHours
    ];
    
    http_response_code(201);
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Share creation failed: " . $e->getMessage());
    http_response_code(500);
    die(json_encode(['error' => ERROR_MESSAGES['SERVER_ERROR']]));
}
?>