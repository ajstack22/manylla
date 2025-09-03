<?php
/**
 * Manylla Sync API Configuration
 * Shared configuration for all sync endpoints
 */

// Error reporting for development (disable in production)
if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['REQUEST_URI'], '/qual/') !== false) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// CORS headers for web access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Recovery-Hash');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
function getDbConnection() {
    $config = [
        'host' => 'localhost',
        'database' => 'manylla_sync',
        'charset' => 'utf8mb4'
    ];
    
    // Use environment variables for credentials
    // Set these in .htaccess or hosting panel
    $config['username'] = $_ENV['DB_USER'] ?? 'your_db_user';
    $config['password'] = $_ENV['DB_PASSWORD'] ?? 'your_db_password';
    
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
        $pdo = new PDO($dsn, $config['username'], $config['password']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        // Log error securely, don't expose details
        error_log("Database connection failed: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
}

// Validate recovery hash
function validateRecoveryHash($hash) {
    // Basic validation - should be a hex string
    if (!$hash || !preg_match('/^[a-f0-9]{32,64}$/i', $hash)) {
        return false;
    }
    return true;
}

// Initialize database tables if they don't exist
function initializeDatabase() {
    $pdo = getDbConnection();
    
    // Create sync_data table
    $sql = "CREATE TABLE IF NOT EXISTS sync_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recovery_hash VARCHAR(64) NOT NULL,
        encrypted_blob LONGTEXT NOT NULL,
        version BIGINT NOT NULL,
        device_id VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_recovery_hash (recovery_hash),
        INDEX idx_version (recovery_hash, version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    
    // Create sync_shares table for temporary sharing
    $sql = "CREATE TABLE IF NOT EXISTS sync_shares (
        id INT AUTO_INCREMENT PRIMARY KEY,
        share_code VARCHAR(32) NOT NULL UNIQUE,
        recovery_hash VARCHAR(64) NOT NULL,
        encrypted_data LONGTEXT NOT NULL,
        visibility_filter JSON,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accessed_count INT DEFAULT 0,
        max_accesses INT DEFAULT NULL,
        INDEX idx_share_code (share_code),
        INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
}

// Clean up expired shares
function cleanupExpiredShares() {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("DELETE FROM sync_shares WHERE expires_at < NOW()");
        $stmt->execute();
    } catch (Exception $e) {
        error_log("Failed to cleanup expired shares: " . $e->getMessage());
    }
}

// Run cleanup occasionally (1% chance per request)
if (rand(1, 100) === 1) {
    cleanupExpiredShares();
}