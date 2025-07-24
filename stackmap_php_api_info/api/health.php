<?php
/**
 * Health Check Endpoint
 * 
 * Simple endpoint to verify API is operational
 * Used by clients for connectivity checks
 * 
 * Method: GET, HEAD
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/cors.php';

// Initialize headers
initializeHeaders();

// Allow both GET and HEAD requests
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
    http_response_code(405);
    header('Allow: GET, HEAD, OPTIONS');
    exit;
}

// For HEAD requests, just return headers
if ($method === 'HEAD') {
    http_response_code(200);
    exit;
}

// Check database connectivity
$dbStatus = 'healthy';
$dbMessage = 'Connected';

try {
    $db = Database::getInstance();
    
    // Simple query to verify connection
    $result = $db->fetchOne("SELECT 1 as test");
    
    if (!$result || $result['test'] != 1) {
        $dbStatus = 'unhealthy';
        $dbMessage = 'Query failed';
    }
} catch (Exception $e) {
    $dbStatus = 'unhealthy';
    $dbMessage = 'Connection failed';
    error_log("Health check DB error: " . $e->getMessage());
}

// Return health status
echo json_encode([
    'status' => $dbStatus === 'healthy' ? 'healthy' : 'degraded',
    'service' => 'stackmap-sync',
    'version' => API_VERSION,
    'timestamp' => date('Y-m-d H:i:s'),
    'database' => [
        'status' => $dbStatus,
        'message' => $dbMessage
    ]
]);
?>