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

// Set CORS headers
setCorsHeaders();

// Validate request method
validateRequestMethod('POST');

// Check rate limit
$rateLimiter = new RateLimiter();
$rateLimiter->checkLimit('share_access');

// Get JSON input
$data = getJsonInput();
validateRequired($data, ['access_code']);

// Validate and normalize access code
$accessCode = strtoupper(trim($data['access_code']));
if (!validateAccessCode($accessCode)) {
    sendError(ERROR_MESSAGES['INVALID_ACCESS_CODE'], 400);
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
        sendError(ERROR_MESSAGES['SHARE_NOT_FOUND'], 404);
    }
    
    // Check if expired
    if (strtotime($share['expires_at']) < time()) {
        sendError(ERROR_MESSAGES['SHARE_EXPIRED'], 403);
    }
    
    // Check view limit
    if ($share['max_views'] !== null && $share['view_count'] >= $share['max_views']) {
        sendError(ERROR_MESSAGES['SHARE_VIEW_LIMIT'], 403);
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
    ], SHARE_MESSAGES['SHARE_ACCESSED']);
    
} catch (Exception $e) {
    error_log("Share access failed: " . $e->getMessage());
    sendError(ERROR_MESSAGES['SERVER_ERROR'], 500);
}
?>