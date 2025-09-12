<?php
/**
 * Sync Health Check Endpoint
 * Maps to the actual health.php endpoint
 * This is the endpoint expected by the mobile app
 */

// CORS headers for mobile app
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Set working directory to sync folder
$syncDir = __DIR__ . '/sync';
if (!is_dir($syncDir)) {
    header('Content-Type: application/json');
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error' => 'Sync service not configured'
    ]);
    exit;
}

// Check if health endpoint exists
$healthFile = $syncDir . '/health.php';
if (!file_exists($healthFile)) {
    header('Content-Type: application/json');
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error' => 'Health endpoint not available'
    ]);
    exit;
}

// Change to sync directory and include health endpoint
chdir($syncDir);
include 'health.php';
?>