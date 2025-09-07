<?php
/**
 * Rate Limiter for Manylla API
 * Provides multiple layers of rate limiting protection
 */

class RateLimiter {
    private $db;
    
    public function __construct($db = null) {
        $this->db = $db;
    }
    
    /**
     * Check if device is too new (60-second protection)
     * Prevents rapid sync operations from newly joined devices
     */
    public function checkNewDeviceProtection($sync_id, $device_id) {
        if (!$this->db) return; // Skip if no database
        
        $stmt = $this->db->prepare("
            SELECT TIMESTAMPDIFF(SECOND, joined_at, NOW()) as seconds_since_join
            FROM sync_devices 
            WHERE sync_id = ? AND device_id = ?
        ");
        $stmt->execute([$sync_id, $device_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['seconds_since_join'] < 60) {
            http_response_code(429);
            echo json_encode([
                'error' => 'New device protection active',
                'retry_after' => 60 - $result['seconds_since_join'],
                'message' => 'Please wait before syncing data'
            ]);
            exit();
        }
    }
    
    /**
     * Check for catastrophic data reduction
     * Prevents accidental or malicious data deletion
     */
    public function checkDataReduction($sync_id, $device_id, $newDataSize) {
        if (!$this->db) return; // Skip if no database
        
        $stmt = $this->db->prepare("
            SELECT LENGTH(encrypted_data) as current_size 
            FROM sync_data 
            WHERE sync_id = ?
            ORDER BY timestamp DESC
            LIMIT 1
        ");
        $stmt->execute([$sync_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['current_size'] > 1000) { // Only check if data is substantial
            $reduction = ($result['current_size'] - $newDataSize) / $result['current_size'];
            
            if ($reduction > 0.5) { // More than 50% reduction
                error_log("WARNING: Device $device_id attempting to reduce data by " . 
                         ($reduction * 100) . "% for sync_id $sync_id");
                
                http_response_code(400);
                echo json_encode([
                    'error' => 'Excessive data reduction detected',
                    'reduction_percentage' => round($reduction * 100),
                    'message' => 'This operation would delete too much data'
                ]);
                exit();
            }
        }
    }
    
    /**
     * General rate limiting per IP address
     * @param string $ip - IP address to check
     * @param int $limit - Maximum requests allowed
     * @param int $window - Time window in seconds
     */
    public function checkIPRateLimit($ip, $limit = 60, $window = 60) {
        // Hash IP for privacy
        $ipHash = hash('sha256', $ip . 'manylla-rate-salt');
        $cacheFile = sys_get_temp_dir() . '/manylla_rate_' . $ipHash;
        
        $requests = [];
        if (file_exists($cacheFile)) {
            $content = file_get_contents($cacheFile);
            if ($content) {
                $requests = json_decode($content, true) ?: [];
            }
        }
        
        $now = time();
        
        // Clean old requests outside the window
        $requests = array_filter($requests, function($timestamp) use ($now, $window) {
            return $timestamp > ($now - $window);
        });
        
        // Check if limit exceeded
        if (count($requests) >= $limit) {
            $oldestRequest = min($requests);
            $retryAfter = $window - ($now - $oldestRequest);
            
            http_response_code(429);
            header('Retry-After: ' . $retryAfter);
            echo json_encode([
                'error' => 'Rate limit exceeded',
                'retry_after' => $retryAfter,
                'limit' => $limit,
                'window' => $window
            ]);
            exit();
        }
        
        // Add current request
        $requests[] = $now;
        
        // Save to cache
        file_put_contents($cacheFile, json_encode(array_values($requests)));
        
        // Clean up old cache files periodically (1% chance)
        if (rand(1, 100) === 1) {
            $this->cleanupOldCacheFiles();
        }
    }
    
    /**
     * Per-device rate limiting
     * More restrictive than IP limits
     */
    public function checkDeviceRateLimit($device_id, $limit = 30, $window = 60) {
        $deviceHash = hash('sha256', $device_id . 'manylla-device-salt');
        $cacheFile = sys_get_temp_dir() . '/manylla_device_' . $deviceHash;
        
        $requests = [];
        if (file_exists($cacheFile)) {
            $content = file_get_contents($cacheFile);
            if ($content) {
                $requests = json_decode($content, true) ?: [];
            }
        }
        
        $now = time();
        
        // Clean old requests
        $requests = array_filter($requests, function($timestamp) use ($now, $window) {
            return $timestamp > ($now - $window);
        });
        
        // Check if limit exceeded
        if (count($requests) >= $limit) {
            $oldestRequest = min($requests);
            $retryAfter = $window - ($now - $oldestRequest);
            
            http_response_code(429);
            header('Retry-After: ' . $retryAfter);
            echo json_encode([
                'error' => 'Device rate limit exceeded',
                'retry_after' => $retryAfter,
                'message' => 'Too many requests from this device'
            ]);
            exit();
        }
        
        // Add current request
        $requests[] = $now;
        
        // Save to cache
        file_put_contents($cacheFile, json_encode(array_values($requests)));
    }
    
    /**
     * Check for suspicious patterns
     */
    public function checkSuspiciousActivity($sync_id, $device_id) {
        // Check for rapid device switching
        $switchFile = sys_get_temp_dir() . '/manylla_switch_' . hash('sha256', $sync_id);
        
        $switches = [];
        if (file_exists($switchFile)) {
            $content = file_get_contents($switchFile);
            if ($content) {
                $switches = json_decode($content, true) ?: [];
            }
        }
        
        $now = time();
        
        // Track device switches in last 5 minutes
        $recentSwitches = array_filter($switches, function($entry) use ($now) {
            return $entry['time'] > ($now - 300);
        });
        
        // Check for rapid switching between devices
        $uniqueDevices = array_unique(array_column($recentSwitches, 'device'));
        if (count($uniqueDevices) > 5) {
            error_log("WARNING: Suspicious activity - rapid device switching for sync_id $sync_id");
            
            http_response_code(429);
            echo json_encode([
                'error' => 'Suspicious activity detected',
                'message' => 'Too many device switches'
            ]);
            exit();
        }
        
        // Add current switch
        $switches[] = ['time' => $now, 'device' => $device_id];
        
        // Keep only recent switches
        $switches = array_filter($switches, function($entry) use ($now) {
            return $entry['time'] > ($now - 600); // Keep 10 minutes
        });
        
        file_put_contents($switchFile, json_encode(array_values($switches)));
    }
    
    /**
     * Clean up old cache files
     */
    private function cleanupOldCacheFiles() {
        $tempDir = sys_get_temp_dir();
        $patterns = ['manylla_rate_*', 'manylla_device_*', 'manylla_switch_*'];
        
        foreach ($patterns as $pattern) {
            $files = glob($tempDir . '/' . $pattern);
            $now = time();
            
            foreach ($files as $file) {
                // Remove files older than 1 hour
                if (filemtime($file) < ($now - 3600)) {
                    @unlink($file);
                }
            }
        }
    }
    
    /**
     * Apply all rate limiting checks
     */
    public function enforceAllLimits($sync_id = null, $device_id = null, $ip = null) {
        // Get IP if not provided
        if (!$ip) {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        }
        
        // IP-based rate limiting (least restrictive)
        $this->checkIPRateLimit($ip, 120, 60); // 120 requests per minute
        
        // Device-based rate limiting (more restrictive)
        if ($device_id) {
            $this->checkDeviceRateLimit($device_id, 60, 60); // 60 requests per minute
        }
        
        // Check for suspicious patterns
        if ($sync_id && $device_id) {
            $this->checkSuspiciousActivity($sync_id, $device_id);
            
            // New device protection (if database available)
            if ($this->db) {
                $this->checkNewDeviceProtection($sync_id, $device_id);
            }
        }
    }
}

// Create singleton instance
$rateLimiter = new RateLimiter(isset($pdo) ? $pdo : null);
?>