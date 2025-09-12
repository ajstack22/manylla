<?php
/**
 * Manylla Sync API - Pull Data
 * Retrieves encrypted data for a sync group since a timestamp
 * 
 * Endpoint: GET /api/sync/pull_timestamp.php
 * 
 * Query parameters:
 * - sync_id: Sync group identifier
 * - since: Unix timestamp in milliseconds (optional, 0 for all)
 * - device_id: Requesting device ID (optional)
 */

// Load security utilities
require_once __DIR__ . '/../utils/error-handler.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/rate-limiter.php';
require_once __DIR__ . '/../utils/cors.php';

// Initialize headers with enhanced security
initializeHeaders();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Validate request method
validateRequestMethod('GET');

// Get and validate parameters
$sync_id = $_GET['sync_id'] ?? null;
$since = $_GET['since'] ?? 0;
$device_id = $_GET['device_id'] ?? null;

// Validate required sync_id
if (!$sync_id) {
    sendError('sync_id is required', 400);
}

// Validate sync_id format
if (!validateSyncId($sync_id)) {
    sendError('Invalid sync_id format', 400);
}

// Validate device_id if provided
if ($device_id && !validateDeviceId($device_id)) {
    sendError('Invalid device_id format', 400);
}

// Validate since timestamp
if (!is_numeric($since) || $since < 0) {
    sendError('Invalid since timestamp', 400);
}

// Apply rate limiting
global $rateLimiter;
if ($rateLimiter) {
    $rateLimiter->enforceAllLimits($sync_id, $device_id, getClientIp());
}

// Phase 3: Retrieve encrypted data from database
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Retrieve latest encrypted data
    $stmt = $db->prepare("
        SELECT encrypted_blob, blob_hash, version, timestamp, updated_at
        FROM sync_data
        WHERE sync_id = ?
    ");
    $stmt->execute([$sync_id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        // Check if data is newer than requested timestamp
        if ($since > 0 && $data['timestamp'] <= $since) {
            // No new data since requested timestamp
            // No new data since requested timestamp
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => null
            ]);
            exit;
        } else {
            // Update device last seen if device_id provided
            if ($device_id) {
                $deviceStmt = $db->prepare("
                    INSERT INTO sync_devices (sync_id, device_id, last_seen)
                    VALUES (?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        last_seen = NOW()
                ");
                $deviceStmt->execute([$sync_id, $device_id]);
            }
            
            // Log successful pull
            if (class_exists('AuditLogger')) {
                $auditLogger = new AuditLogger($db);
                $auditLogger->log('sync_pull_success', $sync_id, $device_id ?? 'unknown', [
                    'blob_hash' => $data['blob_hash'],
                    'version' => $data['version']
                ]);
            }
            
            // Mobile app expects 'data' field directly
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $data['encrypted_blob']
            ]);
            exit;
        }
    } else {
        // No data found for this sync_id
        // No data found for this sync_id
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => null
        ]);
        exit;
    }
    
} catch (Exception $e) {
    error_log('Manylla pull error: ' . $e->getMessage());
    sendError('Failed to retrieve data', 500);
}
?>