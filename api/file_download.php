<?php
/**
 * File Download Endpoint (Streaming)
 *
 * Streams encrypted file to client with support for range requests
 *
 * Request (GET):
 * - sync_id: User's recovery phrase hash (64 chars hex)
 * - file_id: UUID v4 for the file to download
 *
 * Response:
 * Binary data stream with headers:
 * - Content-Type: application/octet-stream
 * - Content-Length: file size
 * - Accept-Ranges: bytes
 * - Content-Disposition: attachment
 */

// Load required utilities
require_once __DIR__ . '/utils/validation.php';
require_once __DIR__ . '/config/file_config.php';
require_once __DIR__ . '/config/database.php';

// Note: Don't use initializeHeaders() - we need custom headers for file streaming

// Handle CORS manually for GET requests
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://manylla.com',
    'https://www.manylla.com'
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Range");
    http_response_code(204);
    exit;
}

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Method not allowed']));
}

// Get parameters
$sync_id = $_GET['sync_id'] ?? '';
$file_id = $_GET['file_id'] ?? '';

// Validate sync_id
if (!validateSyncId($sync_id)) {
    http_response_code(400);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Invalid sync_id format']));
}

// Validate file_id
if (!validateFileId($file_id)) {
    http_response_code(400);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Invalid file_id format']));
}

try {
    // Get file metadata from database
    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("
        SELECT file_id, encrypted_filename, file_size, file_hash, deleted
        FROM file_metadata
        WHERE file_id = ? AND sync_id = ?
    ");

    $stmt->execute([$file_id, $sync_id]);
    $metadata = $stmt->fetch();

    if (!$metadata) {
        http_response_code(404);
        header('Content-Type: application/json');
        die(json_encode(['error' => 'File not found']));
    }

    // Check if file is deleted
    if ($metadata['deleted']) {
        http_response_code(410);  // Gone
        header('Content-Type: application/json');
        die(json_encode(['error' => 'File has been deleted']));
    }

    // Get file path
    $file_path = getFilePath($sync_id, $file_id);

    // Verify file exists on disk
    if (!file_exists($file_path)) {
        error_log("File metadata exists but file missing: $file_path");
        http_response_code(404);
        header('Content-Type: application/json');
        die(json_encode(['error' => 'File not found on server']));
    }

    // Get file size
    $file_size = filesize($file_path);

    // Update last_accessed timestamp
    $update_stmt = $db->prepare("
        UPDATE file_metadata
        SET last_accessed = CURRENT_TIMESTAMP
        WHERE file_id = ?
    ");
    $update_stmt->execute([$file_id]);

    // Handle range requests (for resume capability)
    $range_start = 0;
    $range_end = $file_size - 1;
    $is_range_request = false;

    if (isset($_SERVER['HTTP_RANGE'])) {
        $is_range_request = true;

        // Parse Range header (format: bytes=start-end)
        if (preg_match('/bytes=(\d+)-(\d*)/', $_SERVER['HTTP_RANGE'], $matches)) {
            $range_start = intval($matches[1]);
            $range_end = !empty($matches[2]) ? intval($matches[2]) : $file_size - 1;

            // Validate range
            if ($range_start > $range_end || $range_end >= $file_size) {
                http_response_code(416);  // Range Not Satisfiable
                header("Content-Range: bytes */$file_size");
                exit;
            }
        }
    }

    $content_length = $range_end - $range_start + 1;

    // Set headers for file download
    if ($is_range_request) {
        http_response_code(206);  // Partial Content
        header("Content-Range: bytes $range_start-$range_end/$file_size");
    } else {
        http_response_code(200);
    }

    header('Content-Type: application/octet-stream');
    header('Content-Length: ' . $content_length);
    header('Accept-Ranges: bytes');
    header('Content-Disposition: attachment; filename="encrypted_file"');
    header('Cache-Control: private, max-age=3600');
    header('X-Content-Type-Options: nosniff');

    // Disable output buffering for streaming
    if (ob_get_level()) {
        ob_end_clean();
    }

    // Open file for reading
    $file_handle = fopen($file_path, 'rb');
    if ($file_handle === false) {
        error_log("Failed to open file: $file_path");
        http_response_code(500);
        exit;
    }

    // Seek to start position if range request
    if ($range_start > 0) {
        fseek($file_handle, $range_start);
    }

    // Stream file in chunks
    $bytes_sent = 0;
    $bytes_to_send = $content_length;

    while (!feof($file_handle) && $bytes_sent < $bytes_to_send) {
        // Read chunk (1MB)
        $chunk_size = min(CHUNK_SIZE, $bytes_to_send - $bytes_sent);
        $chunk = fread($file_handle, $chunk_size);

        if ($chunk === false) {
            error_log("Error reading file chunk");
            break;
        }

        echo $chunk;
        flush();

        $bytes_sent += strlen($chunk);

        // Check if client disconnected
        if (connection_status() != 0) {
            error_log("Client disconnected during download");
            break;
        }
    }

    fclose($file_handle);
    exit;

} catch (Exception $e) {
    error_log('File download error: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'File download failed']));
}
?>
