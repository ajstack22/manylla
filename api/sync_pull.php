<?php
/**
 * Sync Pull Endpoint
 * Maps to the actual pull_timestamp.php endpoint
 * This is the endpoint expected by the mobile app
 * 
 * The mobile app expects response in this format:
 * {
 *   "success": true,
 *   "data": "encrypted_base64_string"  // or null if no data
 * }
 * 
 * But the actual endpoint returns:
 * {
 *   "success": true,
 *   "data": {
 *     "encrypted_blob": "encrypted_base64_string", 
 *     "blob_hash": "hash",
 *     "version": number,
 *     "timestamp": number
 *   }
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
validateRequestMethod('GET');

// Get sync_id parameter - mobile app sends it as query param
$sync_id = $_GET['sync_id'] ?? null;

if (!$sync_id) {
    sendError('sync_id is required', 400);
}

// Validate sync_id format (should be 32-char hex)
if (!preg_match('/^[a-f0-9]{32}$/i', $sync_id)) {
    sendError('Invalid sync_id format', 400);
}

// Store original $_GET
$originalGet = $_GET;

// Ensure sync_id is available for the actual endpoint
$_GET['sync_id'] = $sync_id;

// Capture output from the actual endpoint
ob_start();
try {
    // Include the actual pull endpoint which will output JSON
    require __DIR__ . '/sync/pull_timestamp.php';
    
    // Get the output from the actual endpoint
    $originalOutput = ob_get_contents();
    ob_end_clean();
    
    // Parse the original JSON response
    $originalResponse = json_decode($originalOutput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from sync endpoint');
    }
    
    if ($originalResponse && isset($originalResponse['success'])) {
        if ($originalResponse['success']) {
            // Map the response format for mobile app
            $mappedResponse = [
                'success' => true,
                'data' => null
            ];
            
            // Check if we have encrypted data
            if (isset($originalResponse['data']['encrypted_blob']) && 
                !empty($originalResponse['data']['encrypted_blob'])) {
                $mappedResponse['data'] = $originalResponse['data']['encrypted_blob'];
            }
            
            header('Content-Type: application/json');
            echo json_encode($mappedResponse);
        } else {
            // Pass through error response
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => $originalResponse['error'] ?? 'Unknown error occurred'
            ]);
        }
    } else {
        throw new Exception('Invalid response structure from sync endpoint');
    }
    
} catch (Exception $e) {
    ob_end_clean();
    sendError($e->getMessage(), 500);
} finally {
    // Restore original $_GET
    $_GET = $originalGet;
}
?>