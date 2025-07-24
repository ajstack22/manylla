<?php
/**
 * Input Validation Functions
 * 
 * Validates and sanitizes all user inputs
 */

/**
 * Validate sync ID format (32 hex characters)
 */
function validateSyncId($syncId) {
    if (empty($syncId)) {
        return false;
    }
    
    // Must be exactly 32 hexadecimal characters
    return preg_match('/^[a-f0-9]{32}$/i', $syncId) === 1;
}

/**
 * Validate device ID format (32 hex characters)
 */
function validateDeviceId($deviceId) {
    if (empty($deviceId)) {
        return false;
    }
    
    // Must be exactly 32 hexadecimal characters
    return preg_match('/^[a-f0-9]{32}$/i', $deviceId) === 1;
}

/**
 * Validate encrypted blob (base64)
 */
function validateEncryptedBlob($blob) {
    if (empty($blob)) {
        return false;
    }
    
    // Check if valid base64
    if (!preg_match('/^[A-Za-z0-9+\/]+=*$/', $blob)) {
        return false;
    }
    
    // Check size limit
    if (strlen($blob) > MAX_BLOB_SIZE) {
        return false;
    }
    
    // Verify it can be decoded
    $decoded = base64_decode($blob, true);
    return $decoded !== false;
}

/**
 * Validate device name
 */
function validateDeviceName($name) {
    if (empty($name)) {
        return true; // Device name is optional
    }
    
    // Check length
    if (strlen($name) > MAX_DEVICE_NAME_LENGTH) {
        return false;
    }
    
    // Allow alphanumeric, spaces, hyphens, underscores
    return preg_match('/^[a-zA-Z0-9\s\-_]+$/', $name) === 1;
}

/**
 * Validate sync type
 */
function validateSyncType($type) {
    $validTypes = ['full', 'incremental'];
    return in_array($type, $validTypes, true);
}

/**
 * Validate access code (Manyla-specific)
 */
function validateAccessCode($code) {
    if (empty($code)) {
        return false;
    }
    
    // Must be alphanumeric, case-insensitive
    return preg_match('/^[A-Z0-9]{' . SHARE_CODE_LENGTH . '}$/i', $code) === 1;
}

/**
 * Validate share expiry
 */
function validateShareExpiry($hours) {
    if (!is_numeric($hours) || $hours < 1) {
        return false;
    }
    
    $maxHours = MAX_SHARE_EXPIRY_DAYS * 24;
    return $hours <= $maxHours;
}

/**
 * Validate recipient type
 */
function validateRecipientType($type) {
    $validTypes = ['teacher', 'doctor', 'babysitter', 'family', 'custom'];
    return in_array($type, $validTypes, true);
}

/**
 * Sanitize string input
 */
function sanitizeString($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Get IP address (considering proxies)
 */
function getClientIp() {
    $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            $ip = $_SERVER[$key];
            
            // Handle comma-separated IPs
            if (strpos($ip, ',') !== false) {
                $ip = explode(',', $ip)[0];
            }
            
            $ip = trim($ip);
            
            // Validate IP
            if (filter_var($ip, FILTER_VALIDATE_IP, 
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Hash IP address for privacy
 */
function hashIp($ip) {
    return hash('sha256', $ip . (defined('IP_SALT') ? IP_SALT : 'manyla-default-salt'));
}

/**
 * Validate request method
 */
function validateRequestMethod($expected) {
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    
    if ($method !== $expected) {
        http_response_code(405);
        header('Allow: ' . $expected);
        die(json_encode([
            'error' => 'Method not allowed',
            'expected' => $expected,
            'received' => $method
        ]));
    }
}

/**
 * Get JSON input
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    
    if (empty($input)) {
        return null;
    }
    
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        die(json_encode([
            'error' => ERROR_MESSAGES['INVALID_REQUEST'],
            'details' => 'Invalid JSON: ' . json_last_error_msg()
        ]));
    }
    
    return $data;
}

/**
 * Validate required fields
 */
function validateRequired($data, $fields) {
    $missing = [];
    
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        http_response_code(400);
        die(json_encode([
            'error' => ERROR_MESSAGES['INVALID_REQUEST'],
            'missing_fields' => $missing
        ]));
    }
}

/**
 * Generate secure access code
 */
function generateAccessCode() {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    
    for ($i = 0; $i < SHARE_CODE_LENGTH; $i++) {
        $code .= $characters[random_int(0, strlen($characters) - 1)];
    }
    
    return $code;
}

/**
 * Generate UUID v4
 */
function generateUuid() {
    $data = random_bytes(16);
    
    // Set version (4) and variant bits
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

/**
 * Send error response
 */
function sendError($message, $code = 400, $details = null) {
    http_response_code($code);
    
    $response = ['error' => $message];
    
    if ($details !== null && API_DEBUG) {
        $response['details'] = $details;
    }
    
    die(json_encode($response));
}

/**
 * Send success response
 */
function sendSuccess($data = null, $message = null) {
    $response = ['success' => true];
    
    if ($message !== null) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    
    echo json_encode($response);
    exit;
}
?>