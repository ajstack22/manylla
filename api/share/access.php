<?php
/**
 * Access Share Endpoint
 * 
 * Validates access code and returns encrypted shared data
 * POST /api/share/access.php
 */

require_once '../config/database.php';
require_once '../utils/validation.php';
require_once '../utils/cors.php';
require_once '../utils/rate-limiter.php';

// Define constants if not already defined
if (!defined('SHARE_ACCESS_LOG_ENABLED')) {
    define('SHARE_ACCESS_LOG_ENABLED', false);
}

// Define message constants
$ERROR_MESSAGES = [
    'INVALID_ACCESS_CODE' => 'Invalid access code format',
    'SHARE_NOT_FOUND' => 'Share not found',
    'SHARE_EXPIRED' => 'Share has expired',
    'SHARE_VIEW_LIMIT' => 'Share view limit reached',
    'SERVER_ERROR' => 'Server error occurred'
];

$SHARE_MESSAGES = [
    'SHARE_ACCESSED' => 'Share accessed successfully'
];

// Set CORS headers
setCorsHeaders();

// Validate request method
validateRequestMethod('POST');

// Check rate limit - using IP-based rate limiting for share access
$rateLimiter = new RateLimiter();
$rateLimiter->checkIPRateLimit(getClientIp(), 60, 60); // 60 requests per minute

// Get JSON input
$data = getJsonInput();
validateRequired($data, ['access_code']);

// Validate and normalize access code
$accessCode = strtoupper(trim($data['access_code']));
if (!validateAccessCode($accessCode)) {
    sendError($ERROR_MESSAGES['INVALID_ACCESS_CODE'], 400);
}

try {
    $db = Database::getInstance();
    
    // Find share by access code
    $share = $db->fetchOne(
        "SELECT share_id, encrypted_data, expires_at, view_count, max_views, recipient_type
         FROM shared_profiles 
         WHERE access_code = ?",
        [$accessCode]
    );
    
    if (!$share) {
        sendError($ERROR_MESSAGES['SHARE_NOT_FOUND'], 404);
    }
    
    // Check if expired
    if (strtotime($share['expires_at']) < time()) {
        sendError($ERROR_MESSAGES['SHARE_EXPIRED'], 403);
    }
    
    // Check view limit
    if ($share['max_views'] !== null && $share['view_count'] >= $share['max_views']) {
        sendError($ERROR_MESSAGES['SHARE_VIEW_LIMIT'], 403);
    }
    
    // Update view count
    $db->execute(
        "UPDATE shared_profiles SET view_count = view_count + 1 WHERE share_id = ?",
        [$share['share_id']]
    );
    
    // Log access
    if (SHARE_ACCESS_LOG_ENABLED) {
        $db->execute(
            "INSERT INTO share_audit (share_id, event_type, ip_hash, created_at) 
             VALUES (?, 'accessed', ?, NOW())",
            [$share['share_id'], hashIp(getClientIp())]
        );
    }
    
    // Return encrypted data
    sendSuccess([
        'encrypted_data' => $share['encrypted_data'],
        'recipient_type' => $share['recipient_type'],
        'expires_at' => $share['expires_at'],
        'views_remaining' => $share['max_views'] ? ($share['max_views'] - $share['view_count'] - 1) : null
    ], $SHARE_MESSAGES['SHARE_ACCESSED']);
    
} catch (Exception $e) {
    error_log("Share access failed: " . $e->getMessage());
    sendError($ERROR_MESSAGES['SERVER_ERROR'], 500);
}
?>