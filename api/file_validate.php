<?php
/**
 * File Validation Endpoint
 *
 * Pre-upload validation to check if file can be uploaded
 *
 * Request (POST JSON):
 * {
 *   "sync_id": "string",       // User's recovery phrase hash
 *   "file_size": number,       // File size in bytes
 *   "file_type": "string",     // MIME type
 *   "file_extension": "string" // File extension (e.g., "pdf")
 * }
 *
 * Response:
 * {
 *   "allowed": true/false,
 *   "quota_used": bytes,
 *   "quota_total": bytes,
 *   "quota_remaining": bytes,
 *   "quota_percent": percentage,
 *   "estimated_upload_time": seconds,
 *   "reason": "optional error message"
 * }
 */

// Load required utilities
require_once __DIR__ . '/utils/error-handler.php';
require_once __DIR__ . '/utils/validation.php';
require_once __DIR__ . '/utils/cors.php';
require_once __DIR__ . '/config/file_config.php';
require_once __DIR__ . '/config/database.php';

// Initialize headers
initializeHeaders();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Validate request method
validateRequestMethod('POST');

// Get and validate input
$input = getJsonInput();

// Validate required fields
validateRequired($input, ['sync_id', 'file_size']);

$sync_id = $input['sync_id'];
$file_size = $input['file_size'];
$file_type = $input['file_type'] ?? '';
$file_extension = $input['file_extension'] ?? '';

// Validate sync_id format
if (!validateSyncId($sync_id)) {
    sendError('Invalid sync_id format', 400);
}

// Validate file size
if (!is_numeric($file_size) || $file_size <= 0) {
    sendError('Invalid file_size', 400);
}

try {
    $validation_result = [
        'allowed' => true,
        'reasons' => []
    ];

    // Check 1: File size limit
    if ($file_size > MAX_FILE_SIZE) {
        $validation_result['allowed'] = false;
        $validation_result['reasons'][] = 'File size exceeds maximum (' . formatBytes(MAX_FILE_SIZE) . ')';
    }

    // Check 2: File type allowed
    if (!empty($file_type) && !in_array($file_type, ALLOWED_FILE_TYPES)) {
        $validation_result['allowed'] = false;
        $validation_result['reasons'][] = 'File type not supported: ' . $file_type;
    }

    // Check 3: File extension allowed
    if (!empty($file_extension)) {
        $ext = strtolower($file_extension);
        if (!in_array($ext, ALLOWED_EXTENSIONS)) {
            $validation_result['allowed'] = false;
            $validation_result['reasons'][] = 'File extension not supported: ' . $file_extension;
        }
    }

    // Check 4: Storage quota
    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("
        SELECT SUM(file_size) as total_size
        FROM file_metadata
        WHERE sync_id = ? AND deleted = FALSE
    ");

    $stmt->execute([$sync_id]);
    $current_usage = $stmt->fetchColumn() ?: 0;

    $quota_remaining = STORAGE_QUOTA_PER_USER - $current_usage;
    $quota_percent = round(($current_usage / STORAGE_QUOTA_PER_USER) * 100, 2);

    if ($file_size > $quota_remaining) {
        $validation_result['allowed'] = false;
        $validation_result['reasons'][] = 'Insufficient storage quota';
    }

    // Check 5: Server disk space (basic check)
    $disk_free = disk_free_space(USER_FILES_DIR);
    if ($disk_free !== false && $file_size > $disk_free) {
        $validation_result['allowed'] = false;
        $validation_result['reasons'][] = 'Server storage unavailable';
    }

    // Calculate estimated upload time (assuming 1 Mbps = 125 KB/s on 4G)
    $estimated_seconds = ceil($file_size / (125 * 1024));  // Very rough estimate

    // Build response
    $response = [
        'allowed' => $validation_result['allowed'],
        'quota_used' => $current_usage,
        'quota_total' => STORAGE_QUOTA_PER_USER,
        'quota_remaining' => $quota_remaining,
        'quota_percent' => $quota_percent,
        'estimated_upload_time' => $estimated_seconds,
        'max_file_size' => MAX_FILE_SIZE,
        'chunk_size' => CHUNK_SIZE
    ];

    // Add reasons if validation failed
    if (!$validation_result['allowed']) {
        $response['reason'] = implode('; ', $validation_result['reasons']);
    }

    // Add warnings if approaching quota
    if ($quota_percent > 80 && $quota_percent < 100) {
        $response['warning'] = 'Approaching storage limit (' . $quota_percent . '% used)';
    }

    sendSuccess($response);

} catch (Exception $e) {
    error_log('File validation error: ' . $e->getMessage());
    sendError('Validation failed', 500);
}
?>
