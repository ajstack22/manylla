<?php
/**
 * Create Share Endpoint
 * 
 * Creates a temporary shared profile with access code
 * POST /api/share/create.php
 */

require_once '../config/database.php';
require_once '../utils/validation.php';
require_once '../utils/cors.php';
require_once '../utils/rate-limiter.php';

// Define constants if not already defined
if (!defined('DEFAULT_SHARE_EXPIRY_HOURS')) {
    define('DEFAULT_SHARE_EXPIRY_HOURS', 48);
}
if (!defined('SHARE_ACCESS_LOG_ENABLED')) {
    define('SHARE_ACCESS_LOG_ENABLED', false);
}

// Define message constants
$ERROR_MESSAGES = [
    'INVALID_SHARE_DATA' => 'Invalid share data',
    'SERVER_ERROR' => 'Server error occurred'
];

$SHARE_MESSAGES = [
    'SHARE_CREATED' => 'Share created successfully'
];

// Set CORS headers
setCorsHeaders();

// Validate request method
validateRequestMethod('POST');

// Check rate limit - using IP-based rate limiting for share creation
$rateLimiter = new RateLimiter();
$rateLimiter->checkIPRateLimit(getClientIp(), 30, 60); // 30 requests per minute

// Get JSON input
$data = getJsonInput();
validateRequired($data, ['encrypted_data']);

// Validate inputs
if (!validateEncryptedBlob($data['encrypted_data'])) {
    sendError($ERROR_MESSAGES['INVALID_SHARE_DATA'], 400);
}

// Optional fields
$recipientType = isset($data['recipient_type']) ? sanitizeString($data['recipient_type']) : 'custom';
if (!validateRecipientType($recipientType)) {
    sendError('Invalid recipient type', 400);
}

$expiryHours = isset($data['expiry_hours']) ? intval($data['expiry_hours']) : DEFAULT_SHARE_EXPIRY_HOURS;
if (!validateShareExpiry($expiryHours)) {
    sendError('Invalid expiry duration', 400);
}

$maxViews = isset($data['max_views']) ? intval($data['max_views']) : null;
if ($maxViews !== null && $maxViews < 1) {
    sendError('Invalid max views', 400);
}

try {
    $db = Database::getInstance();
    
    // Generate unique share ID and access code
    $shareId = generateUuid();
    $accessCode = generateAccessCode();
    
    // Ensure access code is unique
    $maxAttempts = 10;
    $attempts = 0;
    
    while ($attempts < $maxAttempts) {
        $existing = $db->fetchOne(
            "SELECT share_id FROM shared_profiles WHERE access_code = ? AND expires_at > NOW()",
            [$accessCode]
        );
        
        if (!$existing) {
            break;
        }
        
        $accessCode = generateAccessCode();
        $attempts++;
    }
    
    if ($attempts >= $maxAttempts) {
        sendError('Failed to generate unique access code', 500);
    }
    
    // Calculate expiry time
    $expiresAt = date('Y-m-d H:i:s', strtotime("+{$expiryHours} hours"));
    
    // Insert share record
    $sql = "INSERT INTO shared_profiles 
            (share_id, access_code, encrypted_data, recipient_type, expires_at, max_views, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())";
    
    $db->execute($sql, [
        $shareId,
        $accessCode,
        $data['encrypted_data'],
        $recipientType,
        $expiresAt,
        $maxViews
    ]);
    
    // Log share creation
    if (SHARE_ACCESS_LOG_ENABLED) {
        $db->execute(
            "INSERT INTO share_audit (share_id, event_type, ip_hash, created_at) 
             VALUES (?, 'created', ?, NOW())",
            [$shareId, hashIp(getClientIp())]
        );
    }
    
    // Return share details
    sendSuccess([
        'share_id' => $shareId,
        'access_code' => $accessCode,
        'expires_at' => $expiresAt,
        'share_url' => 'https://' . $_SERVER['HTTP_HOST'] . '/manylla?share=' . $accessCode
    ], $SHARE_MESSAGES['SHARE_CREATED']);
    
} catch (Exception $e) {
    error_log("Share creation failed: " . $e->getMessage());
    sendError($ERROR_MESSAGES['SERVER_ERROR'], 500);
}
?>