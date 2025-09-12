<?php
/**
 * Sync Push Endpoint
 * Maps to the actual push_timestamp.php endpoint
 * This is the endpoint expected by the mobile app
 * 
 * The mobile app sends data in this format:
 * {
 *   "sync_id": "string",
 *   "data": "encrypted_base64_string", 
 *   "timestamp": number,
 *   "version": "string"
 * }
 * 
 * But the actual endpoint expects:
 * {
 *   "sync_id": "string",
 *   "encrypted_data": "encrypted_base64_string",
 *   "timestamp": number,
 *   "device_id": "string"
 * }
 */

require_once __DIR__ . '/utils/cors.php';
require_once __DIR__ . '/utils/error-handler.php';
require_once __DIR__ . '/utils/validation.php';

// Initialize headers
initializeHeaders();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Validate request method
validateRequestMethod('POST');

// Get and validate input
$input = getJsonInput();

// Validate required fields from mobile app
if (!isset($input['sync_id']) || !isset($input['data'])) {
    sendError('sync_id and data are required', 400);
}

// Map mobile app format to actual endpoint format
$mappedInput = [
    'sync_id' => $input['sync_id'],
    'encrypted_data' => $input['data'],
    'timestamp' => $input['timestamp'] ?? round(microtime(true) * 1000),
    'device_id' => $input['device_id'] ?? 'mobile_device'
];

// Store original $_POST
$originalPost = $_POST;

// Set mapped data for the actual endpoint
$_POST = $mappedInput;

// Include the actual push endpoint
ob_start();
try {
    require __DIR__ . '/sync/push_timestamp.php';
    $output = ob_get_contents();
    ob_end_clean();
    
    // Output the response
    echo $output;
} catch (Exception $e) {
    ob_end_clean();
    sendError('Failed to push data: ' . $e->getMessage(), 500);
} finally {
    // Restore original $_POST
    $_POST = $originalPost;
}
?>