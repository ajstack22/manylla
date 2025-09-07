<?php
/**
 * Compression Utilities for Manylla API
 * Reduces payload size for mobile devices on cellular connections
 */

/**
 * Enable gzip compression for API responses
 * Should be called at the beginning of API endpoints
 */
function enableCompression() {
    // Check if client accepts gzip
    $acceptEncoding = $_SERVER['HTTP_ACCEPT_ENCODING'] ?? '';
    
    if (strpos($acceptEncoding, 'gzip') === false) {
        return false; // Client doesn't support gzip
    }
    
    // Check if compression is already enabled
    if (ob_get_level() > 0) {
        return false; // Output buffering already started
    }
    
    // Start output buffering with gzip compression
    ob_start('ob_gzhandler');
    
    // Set appropriate headers
    header('Content-Encoding: gzip');
    header('Vary: Accept-Encoding');
    
    return true;
}

/**
 * Compress data manually for specific responses
 * Useful when you need more control over compression
 * 
 * @param string $data The data to compress
 * @param int $level Compression level (1-9, default 6)
 * @return string Compressed data
 */
function compressData($data, $level = 6) {
    // Check if gzencode is available
    if (!function_exists('gzencode')) {
        return $data; // Return uncompressed if not available
    }
    
    // Compress the data
    $compressed = gzencode($data, $level);
    
    // Only use compressed version if it's actually smaller
    if (strlen($compressed) < strlen($data)) {
        header('Content-Encoding: gzip');
        return $compressed;
    }
    
    return $data;
}

/**
 * Check if response should be compressed based on size
 * 
 * @param string $data The response data
 * @param int $threshold Minimum size in bytes to compress (default 1000)
 * @return bool
 */
function shouldCompress($data, $threshold = 1000) {
    // Don't compress small responses (overhead not worth it)
    if (strlen($data) < $threshold) {
        return false;
    }
    
    // Check if client accepts gzip
    $acceptEncoding = $_SERVER['HTTP_ACCEPT_ENCODING'] ?? '';
    if (strpos($acceptEncoding, 'gzip') === false) {
        return false;
    }
    
    return true;
}

/**
 * Send compressed JSON response
 * 
 * @param array $data The data to send as JSON
 * @param int $statusCode HTTP status code
 */
function sendCompressedJson($data, $statusCode = 200) {
    // Set JSON content type
    header('Content-Type: application/json');
    
    // Set status code
    http_response_code($statusCode);
    
    // Convert to JSON
    $json = json_encode($data);
    
    // Compress if beneficial
    if (shouldCompress($json)) {
        // Add compression headers
        header('Content-Encoding: gzip');
        header('Vary: Accept-Encoding');
        
        // Send compressed data
        echo gzencode($json, 6);
    } else {
        // Send uncompressed
        echo $json;
    }
    
    exit();
}

/**
 * Get compression statistics for debugging
 * 
 * @param string $original Original data
 * @param string $compressed Compressed data
 * @return array
 */
function getCompressionStats($original, $compressed) {
    $originalSize = strlen($original);
    $compressedSize = strlen($compressed);
    $savings = $originalSize - $compressedSize;
    $ratio = $originalSize > 0 ? ($savings / $originalSize) * 100 : 0;
    
    return [
        'original_size' => $originalSize,
        'compressed_size' => $compressedSize,
        'savings' => $savings,
        'compression_ratio' => round($ratio, 2) . '%'
    ];
}
?>