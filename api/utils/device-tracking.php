<?php
/**
 * Device Tracking Utilities for Manylla API
 * Helps debug sync issues by tracking device information
 */

/**
 * Parse User-Agent string to identify platform
 * 
 * @param string $userAgent The User-Agent header
 * @return string Platform identifier (ios, android, web)
 */
function detectPlatform($userAgent = null) {
    if ($userAgent === null) {
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    }
    
    $userAgent = strtolower($userAgent);
    
    // Check for React Native apps
    if (strpos($userAgent, 'manylla/ios') !== false) {
        return 'ios';
    }
    if (strpos($userAgent, 'manylla/android') !== false) {
        return 'android';
    }
    
    // Check for mobile browsers
    if (strpos($userAgent, 'iphone') !== false || strpos($userAgent, 'ipad') !== false) {
        return 'ios-web';
    }
    if (strpos($userAgent, 'android') !== false) {
        return 'android-web';
    }
    
    // Desktop browsers
    if (strpos($userAgent, 'mac os') !== false) {
        return 'macos-web';
    }
    if (strpos($userAgent, 'windows') !== false) {
        return 'windows-web';
    }
    
    return 'web';
}

/**
 * Get device information from request headers
 * 
 * @return array Device information
 */
function getDeviceInfo() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $platform = detectPlatform($userAgent);
    
    // Get app version from custom header (if mobile app)
    $appVersion = $_SERVER['HTTP_X_APP_VERSION'] ?? null;
    
    // Get device ID from header or generate one
    $deviceId = $_SERVER['HTTP_X_DEVICE_ID'] ?? null;
    
    // Get IP address (considering proxies)
    $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    if (strpos($ipAddress, ',') !== false) {
        // If multiple IPs (proxy chain), get the first one
        $ipAddress = trim(explode(',', $ipAddress)[0]);
    }
    
    return [
        'platform' => $platform,
        'user_agent' => substr($userAgent, 0, 255), // Limit length for database
        'app_version' => $appVersion,
        'device_id' => $deviceId,
        'ip_address' => $ipAddress,
        'timestamp' => date('c')
    ];
}

/**
 * Track sync operation for debugging
 * 
 * @param string $syncId The sync group ID
 * @param string $operation Type of operation (push, pull, create, join)
 * @param array $additionalData Any additional data to track
 * @return array Tracking data
 */
function trackSyncOperation($syncId, $operation, $additionalData = []) {
    $deviceInfo = getDeviceInfo();
    
    $trackingData = [
        'sync_id' => $syncId,
        'operation' => $operation,
        'device_info' => $deviceInfo,
        'additional_data' => $additionalData,
        'tracked_at' => time()
    ];
    
    // Log to file for debugging (optional)
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        $logFile = __DIR__ . '/../../logs/device_tracking.log';
        $logEntry = date('Y-m-d H:i:s') . ' | ' . json_encode($trackingData) . PHP_EOL;
        @file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    return $trackingData;
}

/**
 * Get device-specific sync statistics
 * Useful for debugging sync issues
 * 
 * @param string $syncId The sync group ID
 * @param string $deviceId The device ID
 * @return array Statistics
 */
function getDeviceStats($syncId, $deviceId) {
    // This would query the database in production
    // For now, return mock data structure
    return [
        'device_id' => $deviceId,
        'last_push' => null,
        'last_pull' => null,
        'push_count' => 0,
        'pull_count' => 0,
        'error_count' => 0,
        'platform' => detectPlatform(),
        'first_seen' => date('c'),
        'last_seen' => date('c')
    ];
}

/**
 * Format device info for database storage
 * 
 * @param array $deviceInfo Device information array
 * @return string JSON string for database
 */
function formatDeviceInfoForDb($deviceInfo) {
    // Remove sensitive data
    unset($deviceInfo['ip_address']);
    
    // Ensure all values are properly encoded
    return json_encode($deviceInfo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

/**
 * Generate a device fingerprint for identifying unique devices
 * 
 * @return string Device fingerprint
 */
function generateDeviceFingerprint() {
    $components = [
        $_SERVER['HTTP_USER_AGENT'] ?? '',
        $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '',
        $_SERVER['HTTP_ACCEPT_ENCODING'] ?? '',
        // Don't use IP as it can change
    ];
    
    $fingerprint = implode('|', $components);
    return hash('sha256', $fingerprint);
}

/**
 * Check if device is known/trusted
 * 
 * @param string $syncId The sync group ID
 * @param string $deviceId The device ID
 * @return bool
 */
function isKnownDevice($syncId, $deviceId) {
    // In production, this would check the database
    // For now, always return true
    return true;
}

/**
 * Log device activity for debugging
 * 
 * @param string $message Log message
 * @param array $context Additional context
 */
function logDeviceActivity($message, $context = []) {
    if (!defined('DEBUG_MODE') || !DEBUG_MODE) {
        return;
    }
    
    $logEntry = [
        'timestamp' => date('c'),
        'message' => $message,
        'device' => getDeviceInfo(),
        'context' => $context
    ];
    
    $logFile = __DIR__ . '/../../logs/device_activity.log';
    $logLine = json_encode($logEntry) . PHP_EOL;
    @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
}
?>