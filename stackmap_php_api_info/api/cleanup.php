<?php
/**
 * Cleanup Old Data Endpoint
 * 
 * Removes sync data older than 6 months
 * Should be run periodically (daily recommended)
 * 
 * Method: POST
 * Optional: Can be called via cron job
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/validation.php';
require_once __DIR__ . '/utils/cors.php';

// Allow execution from CLI for cron jobs
$isCli = php_sapi_name() === 'cli';

if (!$isCli) {
    // Web request - initialize headers
    initializeHeaders();
    
    // Check request method
    validateRequestMethod('POST');
    
    // Optional: Add authentication here for web requests
    // For example, check for a secret key in headers
    $authKey = $_SERVER['HTTP_X_CLEANUP_KEY'] ?? '';
    if ($authKey !== 'your-secret-cleanup-key') {
        // Uncomment to enable authentication
        // sendError('Unauthorized', 401);
    }
}

try {
    $db = Database::getInstance();
    
    // Start cleanup
    if (!$isCli) {
        echo json_encode(['status' => 'starting', 'timestamp' => date('Y-m-d H:i:s')]) . "\n";
        ob_flush();
        flush();
    }
    
    // Delete old sync data (older than 6 months)
    $sql = "DELETE FROM sync_data 
            WHERE last_modified < DATE_SUB(NOW(), INTERVAL ? MONTH) 
            LIMIT ?";
    
    $totalDeleted = 0;
    $batchSize = CLEANUP_BATCH_SIZE;
    
    do {
        $deleted = $db->delete($sql, [DATA_RETENTION_MONTHS, $batchSize]);
        $totalDeleted += $deleted;
        
        if (!$isCli && $deleted > 0) {
            echo json_encode(['batch_deleted' => $deleted, 'total_deleted' => $totalDeleted]) . "\n";
            ob_flush();
            flush();
        }
        
        // Small delay to prevent overloading
        if ($deleted > 0) {
            usleep(100000); // 0.1 second
        }
    } while ($deleted === $batchSize);
    
    // Clean up rate limits
    $sql = "DELETE FROM rate_limits 
            WHERE window_start < DATE_SUB(NOW(), INTERVAL 1 HOUR)";
    
    $rateLimitsDeleted = $db->delete($sql);
    
    // Log cleanup
    if (isset($db)) {
        $sql = "INSERT INTO cleanup_log (deleted_count, cleanup_type) 
                VALUES (?, 'scheduled_cleanup')";
        $db->insert($sql, [$totalDeleted]);
    }
    
    // Final response
    $response = [
        'status' => 'completed',
        'sync_data_deleted' => $totalDeleted,
        'rate_limits_deleted' => $rateLimitsDeleted,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($isCli) {
        echo "Cleanup completed: " . json_encode($response) . "\n";
    } else {
        echo json_encode($response);
    }
    
} catch (Exception $e) {
    error_log("Cleanup error: " . $e->getMessage());
    
    if ($isCli) {
        echo "Cleanup failed: " . $e->getMessage() . "\n";
        exit(1);
    } else {
        sendError(ERROR_MESSAGES['SERVER_ERROR'], 500);
    }
}
?>