<?php
/**
 * Secure Error Handler
 * Phase 2 Security Implementation
 * 
 * Prevents sensitive information disclosure through error messages
 */

// Secure error configuration
error_reporting(E_ALL);
ini_set('display_errors', 0);  // Never display errors to client
ini_set('log_errors', 1);       // Always log errors
ini_set('error_log', __DIR__ . '/../../logs/error.log');

// Custom error handler
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Exception handler
set_exception_handler(function($exception) {
    // Log detailed error for debugging
    error_log(sprintf(
        "[%s] %s in %s:%d\nStack trace:\n%s",
        get_class($exception),
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine(),
        $exception->getTraceAsString()
    ));
    
    // Return generic error to client
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Internal server error']);
    exit();
});

// Shutdown handler for fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] & (E_ERROR | E_CORE_ERROR | E_COMPILE_ERROR | E_PARSE))) {
        error_log(sprintf(
            "Fatal error: %s in %s:%d",
            $error['message'],
            $error['file'],
            $error['line']
        ));
        
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Internal server error']);
    }
});

/**
 * Get environment-appropriate error message
 * 
 * @param string $code Error code
 * @param bool $isDevelopment Whether in development mode
 * @return string Error message
 */
function getErrorMessage($code, $isDevelopment = false) {
    $messages = [
        'validation_failed' => 'Invalid input format',
        'not_found' => 'Resource not found',
        'rate_limited' => 'Too many requests',
        'unauthorized' => 'Unauthorized access',
        'database_error' => 'Database operation failed',
        'sync_failed' => 'Synchronization failed',
        'invite_invalid' => 'Invalid invite code',
        'invite_expired' => 'Invite code has expired',
        'device_limit' => 'Device limit reached',
        'data_corrupt' => 'Data integrity check failed'
    ];
    
    if ($isDevelopment) {
        // In development, can be more specific
        return $messages[$code] ?? $code;
    }
    
    // In production, always generic for security
    return 'Request failed';
}

/**
 * Log security event
 * 
 * @param string $event Event type
 * @param array $details Event details
 */
function logSecurityEvent($event, $details = []) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => $event,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'details' => $details
    ];
    
    error_log('[SECURITY] ' . json_encode($logEntry));
}