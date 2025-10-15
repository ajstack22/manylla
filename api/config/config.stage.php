<?php
/**
 * Manylla API Configuration - STAGE Environment
 *
 * STAGE shares QUAL's database for realistic testing (StackMap pattern).
 * This allows STAGE to test with actual qual data before production deployment.
 * Database credentials are same as QUAL - already deployed and operational.
 */

// Database Configuration - Shares QUAL database for realistic testing
define('DB_HOST', 'localhost');
define('DB_NAME', 'stachblx_manylla_sync_qual'); // Shares QUAL database
define('DB_USER', 'stachblx_mql'); // Shares QUAL user
define('DB_PASS', 'M8C52Mp8f17fIc5UkBVnKQ=='); // Shares QUAL password
define('DB_CHARSET', 'utf8mb4');

// API Configuration
define('API_VERSION', '1.0.0');
define('API_DEBUG', false); // Production-like behavior
define('API_ENV', 'stage'); // Environment identifier

// Rate Limiting (production-like)
define('RATE_LIMIT_REQUESTS', 60); // Production-like rate limit
define('RATE_LIMIT_WINDOW', 60); // seconds

// Data Limits
define('MAX_BLOB_SIZE', 5 * 1024 * 1024); // 5MB max encrypted blob size
define('MAX_DEVICE_NAME_LENGTH', 100);
define('SYNC_ID_LENGTH', 32);
define('DEVICE_ID_LENGTH', 32);

// Share Configuration
define('SHARE_CODE_LENGTH', 6); // 6-character access codes
define('DEFAULT_SHARE_EXPIRY_HOURS', 168); // 7 days default
define('MAX_SHARE_EXPIRY_DAYS', 365); // 1 year maximum
define('SHARE_ACCESS_LOG_ENABLED', true); // Log share access for parents

// Cleanup Configuration
define('DATA_RETENTION_MONTHS', 4); // Longer retention for stage
define('SHARE_CLEANUP_HOURS', 18); // Less frequent cleanup than qual
define('CLEANUP_BATCH_SIZE', 1000);

// Security Headers
define('SECURITY_HEADERS', [
    'X-Content-Type-Options' => 'nosniff',
    'X-Frame-Options' => 'DENY',
    'X-XSS-Protection' => '1; mode=block',
    'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains'
]);

// CORS Configuration - STAGE
define('CORS_ALLOWED_ORIGINS', [
    'https://manylla.com',
    'https://www.manylla.com',
    'https://manylla.com/stage',
]);

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
    'INVALID_ACCESS_CODE' => 'Invalid or expired access code',
    'SHARE_NOT_FOUND' => 'Shared profile not found',
    'SHARE_EXPIRED' => 'This share has expired',
    'SHARE_VIEW_LIMIT' => 'Maximum views reached for this share',
    'INVALID_SHARE_DATA' => 'Invalid share data format'
]);

// Share Messages
define('SHARE_MESSAGES', [
    'SHARE_CREATED' => 'Share link created successfully',
    'SHARE_ACCESSED' => 'Share accessed successfully',
    'SHARE_DELETED' => 'Share deleted successfully'
]);

// Timezone
date_default_timezone_set('UTC');

// Error reporting - production-like (no display to users)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/stage_error.log');
?>
