<?php
/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Handles CORS headers for web clients
 */

/**
 * Set CORS headers based on request origin
 */
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Define allowed origins if not already defined
    if (!defined('CORS_ALLOWED_ORIGINS')) {
        define('CORS_ALLOWED_ORIGINS', [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://stackmap.app',
            'https://manylla.com'
        ]);
    }
    
    // Check if origin is allowed
    if (in_array($origin, CORS_ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    } elseif (defined('API_DEBUG') && API_DEBUG && strpos($origin, 'localhost') !== false) {
        // Allow localhost in debug mode
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    } else {
        // Default to most restrictive origin
        header("Access-Control-Allow-Origin: https://manylla.com");
    }
    
    // Set other CORS headers with enhanced security
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
    header("Access-Control-Max-Age: 86400"); // 24 hours cache for preflight
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204); // No Content
        exit;
    }
}

/**
 * Set security headers
 */
function setSecurityHeaders() {
    // Enhanced security headers for Phase 2
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("X-XSS-Protection: 1; mode=block");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    
    // Content Security Policy for JSON responses
    header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none';");
    
    // Additional security headers if defined in config
    if (defined('SECURITY_HEADERS') && is_array(SECURITY_HEADERS)) {
        foreach (SECURITY_HEADERS as $header => $value) {
            header("$header: $value");
        }
    }
}

/**
 * Set standard API headers
 */
function setApiHeaders() {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // API version header
    header('X-API-Version: ' . API_VERSION);
}

/**
 * Initialize all headers
 */
function initializeHeaders() {
    setCorsHeaders();
    setSecurityHeaders();
    setApiHeaders();
}
?>