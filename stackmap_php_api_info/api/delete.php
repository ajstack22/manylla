<?php
/**
 * Delete Sync Data Endpoint
 * 
 * Permanently deletes all data for a sync group
 * 
 * Method: POST
 * Required fields: sync_id, device_id
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/validation.php';
require_once __DIR__ . '/utils/rate-limiter.php';
require_once __DIR__ . '/utils/cors.php';

// Initialize headers
initializeHeaders();

// Check request method
validateRequestMethod('POST');

// Check rate limit
checkRateLimit();

// Get JSON input
$input = getJsonInput();
if (!$input) {
    sendError(ERROR_MESSAGES['INVALID_REQUEST']);
}

// Validate required fields
validateRequired($input, ['sync_id', 'device_id']);

// Extract and validate inputs
$syncId = $input['sync_id'] ?? '';
$deviceId = $input['device_id'] ?? '';

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
    $db->beginTransaction();
    
    // Verify sync group exists
    $sql = "SELECT id FROM sync_data WHERE sync_id = ?";
    $syncData = $db->fetchOne($sql, [$syncId]);
    
    if (!$syncData) {
        $db->rollback();
        sendError(ERROR_MESSAGES['SYNC_NOT_FOUND'], 404);
    }
    
    // Delete sync data
    $sql = "DELETE FROM sync_data WHERE sync_id = ?";
    $deletedCount = $db->delete($sql, [$syncId]);
    
    $db->commit();
    
    // Return success response
    sendSuccess([
        'sync_id' => $syncId,
        'deleted_count' => $deletedCount,
        'deleted_at' => date('Y-m-d H:i:s')
    ], 'Sync data deleted successfully');
    
} catch (Exception $e) {
    if (isset($db)) {
        $db->rollback();
    }
    
    error_log("Delete sync error: " . $e->getMessage());
    sendError(ERROR_MESSAGES['SERVER_ERROR'], 500);
}
?>