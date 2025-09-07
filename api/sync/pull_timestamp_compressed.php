<?php
/**
 * Example: Pull Data Endpoint with Compression
 * Shows how to add gzip compression to API responses
 */

// Load utilities including new compression
require_once __DIR__ . '/../utils/compression.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/cors.php';

// Initialize CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Add API version header for mobile apps
header('API-Version: 1.0.0');
header('Accept-Version: 1.0.0');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Example response data (would come from database)
$responseData = [
    'success' => true,
    'sync_id' => 'example_sync_id',
    'encrypted_data' => base64_encode(str_repeat('Large encrypted data blob...', 100)),
    'timestamp' => time() * 1000,
    'device_info' => [
        'last_sync' => date('c'),
        'platform' => 'unknown'
    ]
];

// Convert to JSON
$jsonResponse = json_encode($responseData);

// Check if we should compress (only for responses > 1KB)
if (shouldCompress($jsonResponse, 1000)) {
    // Send compressed response
    sendCompressedJson($responseData);
} else {
    // Send normal response for small payloads
    echo $jsonResponse;
}
?>