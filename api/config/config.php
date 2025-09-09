<?php
/**
 * Manylla API Configuration Loader
 * 
 * Detects environment and loads appropriate configuration
 */

// Detect environment based on URL path
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';

// Determine environment
if (strpos($requestUri, '/qual/') !== false) {
    // Qual/Staging environment
    $environment = 'qual';
} elseif ($serverName === 'localhost' || strpos($serverName, 'local') !== false) {
    // Local development
    $environment = 'local';
} else {
    // Production environment (default)
    $environment = 'prod';
}

// Load environment-specific configuration
$configFile = __DIR__ . '/config.' . $environment . '.php';

if (file_exists($configFile)) {
    require_once $configFile;
} else {
    // Fallback to example config with error
    if (file_exists(__DIR__ . '/config.example.php')) {
        require_once __DIR__ . '/config.example.php';
        
        // Log configuration error
        error_log("Warning: Environment config not found for '$environment', using example config");
        
        // In production, this should fail safely
        if ($environment === 'prod') {
            http_response_code(500);
            die(json_encode(['error' => 'Configuration error']));
        }
    } else {
        http_response_code(500);
        die(json_encode(['error' => 'Configuration not found']));
    }
}

// Helper function to get database connection
function getDbConnection() {
    static $db = null;
    
    if ($db === null) {
        require_once __DIR__ . '/database.php';
        $db = Database::getInstance();
    }
    
    return $db->getConnection();
}

// Helper function to validate recovery hash format
function validateRecoveryHash($hash) {
    // Should be a 64-character hex string (SHA-256)
    return preg_match('/^[a-f0-9]{64}$/i', $hash);
}

// Helper function to validate device ID format
function validateDeviceId($deviceId) {
    // Should be alphanumeric with hyphens, 32 chars
    return preg_match('/^[a-zA-Z0-9\-]{32,64}$/', $deviceId);
}

// Helper function to generate share code
function generateShareCode() {
    $characters = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude confusing chars
    $code = '';
    $max = strlen($characters) - 1;
    
    for ($i = 0; $i < SHARE_CODE_LENGTH; $i++) {
        $code .= $characters[random_int(0, $max)];
    }
    
    return $code;
}

// Apply security headers
foreach (SECURITY_HEADERS as $header => $value) {
    header("$header: $value");
}

// Handle CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, CORS_ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
}

// Handle OPTIONS requests for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Set JSON response header
header('Content-Type: application/json');

// Environment info function (for debugging)
function getEnvironmentInfo() {
    if (!API_DEBUG) {
        return ['environment' => API_ENV];
    }
    
    return [
        'environment' => API_ENV,
        'version' => API_VERSION,
        'debug' => API_DEBUG,
        'database' => DB_NAME,
        'rate_limit' => RATE_LIMIT_REQUESTS . ' requests per ' . RATE_LIMIT_WINDOW . ' seconds'
    ];
}
?>