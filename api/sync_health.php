<?php
/**
 * Health Check Endpoint
 * Returns API status and environment information
 */

require_once '../config/config.php';

// Return health status
$response = [
    'status' => 'healthy',
    'timestamp' => time(),
    'environment' => API_ENV ?? 'unknown',
    'version' => API_VERSION ?? '1.0.0'
];

// Test database connection if in debug mode
if (defined('API_DEBUG') && API_DEBUG) {
    try {
        $db = getDbConnection();
        $response['database'] = 'connected';
        $response['database_name'] = DB_NAME;
    } catch (Exception $e) {
        $response['database'] = 'error';
        $response['database_error'] = $e->getMessage();
    }
}

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);
?>