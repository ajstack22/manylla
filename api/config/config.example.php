<?php
/**
 * Manyla API Configuration
 * 
 * Copy this file to config.php and update with your actual values
 * NEVER commit config.php to version control!
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name'); // e.g., username_manyla
define('DB_USER', 'your_database_user'); // e.g., username_manylauser
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// API Configuration
define('API_VERSION', '1.0.0');
define('API_DEBUG', false); // Set to true for development only

// Rate Limiting
define('RATE_LIMIT_REQUESTS', 30); // requests per window
define('RATE_LIMIT_WINDOW', 60); // seconds

// Data Limits
define('MAX_BLOB_SIZE', 5 * 1024 * 1024); // 5MB max encrypted blob size
define('MAX_DEVICE_NAME_LENGTH', 100);
define('SYNC_ID_LENGTH', 32);
define('DEVICE_ID_LENGTH', 32);

// Share Configuration (Manyla-specific)
define('SHARE_CODE_LENGTH', 6); // 6-character access codes
define('DEFAULT_SHARE_EXPIRY_HOURS', 168); // 7 days default
define('MAX_SHARE_EXPIRY_DAYS', 365); // 1 year maximum
define('SHARE_ACCESS_LOG_ENABLED', true); // Log share access for parents

// Cleanup Configuration
define('DATA_RETENTION_MONTHS', 6); // Delete sync data older than 6 months
define('SHARE_CLEANUP_HOURS', 24); // Check for expired shares every 24 hours
define('CLEANUP_BATCH_SIZE', 1000); // Process in batches to avoid timeouts

// Security Headers
define('SECURITY_HEADERS', [
    'X-Content-Type-Options' => 'nosniff',
    'X-Frame-Options' => 'DENY',
    'X-XSS-Protection' => '1; mode=block',
    'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains'
]);

// CORS Configuration
define('CORS_ALLOWED_ORIGINS', [
    'https://stackmap.app', // Main domain
    'https://stackmap.app/manyla', // Subdirectory deployment
    'https://manyla.com', // Future domain if purchased
    'https://www.manyla.com' // Future domain with www
]);

// Development origins (remove in production)
if (API_DEBUG) {
    array_push(
        CORS_ALLOWED_ORIGINS,
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:19006'
    );
}

// Error Messages
define('ERROR_MESSAGES', [
    'INVALID_REQUEST' => 'Invalid request format',
    'INVALID_SYNC_ID' => 'Invalid sync ID format',
    'INVALID_DEVICE_ID' => 'Invalid device ID format',
    'INVALID_BLOB' => 'Invalid encrypted data format',
    'SYNC_NOT_FOUND' => 'Sync group not found',
    'SYNC_EXISTS' => 'Sync group already exists',
    'RATE_LIMIT' => 'Too many requests. Please try again later.',
    'PAYLOAD_TOO_LARGE' => 'Encrypted data exceeds size limit',
    'DATABASE_ERROR' => 'Database operation failed',
    'SERVER_ERROR' => 'Internal server error',
    // Manyla-specific errors
    'INVALID_ACCESS_CODE' => 'Invalid or expired access code',
    'SHARE_NOT_FOUND' => 'Shared profile not found',
    'SHARE_EXPIRED' => 'This share has expired',
    'SHARE_VIEW_LIMIT' => 'Maximum views reached for this share',
    'INVALID_SHARE_DATA' => 'Invalid share data format'
]);

// Share Messages (for user-facing responses)
define('SHARE_MESSAGES', [
    'SHARE_CREATED' => 'Share link created successfully',
    'SHARE_ACCESSED' => 'Share accessed successfully',
    'SHARE_DELETED' => 'Share deleted successfully'
]);

// Timezone
date_default_timezone_set('UTC');

// Error reporting (disable in production)
if (API_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}
?>