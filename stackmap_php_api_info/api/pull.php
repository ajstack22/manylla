<?php
/**
 * Pull Data Endpoint
 * 
 * Retrieves latest encrypted data for a sync group
 * 
 * Method: GET
 * Required parameters: sync_id, device_id
 * Optional parameters: version (for conditional requests)
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/validation.php';
require_once __DIR__ . '/utils/rate-limiter.php';
require_once __DIR__ . '/utils/cors.php';

// Initialize headers
initializeHeaders();

// Check request method
validateRequestMethod('GET');

// Check rate limit
checkRateLimit();

// Get query parameters
$syncId = $_GET['sync_id'] ?? '';
$deviceId = $_GET['device_id'] ?? '';
$requestedVersion = isset($_GET['version']) ? (int)$_GET['version'] : null;

// Validate sync ID
if (!validateSyncId($syncId)) {
    sendError(ERROR_MESSAGES['INVALID_SYNC_ID']);
}

// Validate device ID
if (!validateDeviceId($deviceId)) {
    sendError(ERROR_MESSAGES['INVALID_DEVICE_ID']);
}

try {
    $db = Database::getInstance();
    
    // Get sync data
    $sql = "SELECT encrypted_blob, version, device_id, device_name, 
                   last_modified, created_at 
            FROM sync_data 
            WHERE sync_id = ?";
    
    $syncData = $db->fetchOne($sql, [$syncId]);
    
    if (!$syncData) {
        sendError(ERROR_MESSAGES['SYNC_NOT_FOUND'], 404);
    }
    
    // Check if requested version matches current version (conditional request)
    if ($requestedVersion !== null && $requestedVersion === (int)$syncData['version']) {
        http_response_code(304); // Not Modified
        exit;
    }
    
    // Set ETag header for caching
    $etag = '"' . md5($syncData['version'] . $syncData['last_modified']) . '"';
    header('ETag: ' . $etag);
    
    // Check If-None-Match header
    $ifNoneMatch = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
    if ($ifNoneMatch === $etag) {
        http_response_code(304); // Not Modified
        exit;
    }
    
    // Return sync data
    sendSuccess([
        'encrypted_blob' => $syncData['encrypted_blob'],
        'version' => (int)$syncData['version'],
        'device_id' => $syncData['device_id'],
        'device_name' => $syncData['device_name'],
        'last_modified' => $syncData['last_modified'],
        'created_at' => $syncData['created_at']
    ]);
    
} catch (Exception $e) {
    error_log("Pull sync error: " . $e->getMessage());
    sendError(ERROR_MESSAGES['SERVER_ERROR'], 500);
}
?>