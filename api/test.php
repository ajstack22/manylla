<?php
// Simple test endpoint
header('Content-Type: application/json');
echo json_encode([
    'status' => 'healthy',
    'timestamp' => time(),
    'message' => 'Test endpoint working'
]);
?>