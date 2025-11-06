<?php
/**
 * File Upload Endpoint (Chunked)
 *
 * Accepts encrypted file chunks and assembles them into complete files
 *
 * Request (multipart/form-data):
 * - sync_id: User's recovery phrase hash (64 chars hex)
 * - file_id: UUID v4 for this file
 * - chunk_index: Current chunk number (0-based)
 * - total_chunks: Total number of chunks
 * - chunk_data: Base64-encoded encrypted chunk data
 * - file_hash: SHA-256 hash of complete file (sent with last chunk)
 * - encrypted_filename: Encrypted filename (sent with last chunk)
 *
 * Response:
 * {
 *   "success": true,
 *   "chunk_received": 5,
 *   "total_chunks": 10,
 *   "complete": false
 * }
 *
 * Final chunk response:
 * {
 *   "success": true,
 *   "file_id": "uuid-here",
 *   "file_hash": "sha256-hash",
 *   "complete": true
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

// Validate required fields
$sync_id = $_POST['sync_id'] ?? '';
$file_id = $_POST['file_id'] ?? '';
$chunk_index = $_POST['chunk_index'] ?? '';
$total_chunks = $_POST['total_chunks'] ?? '';
$chunk_data = $_POST['chunk_data'] ?? '';

// Validate sync_id format
if (!validateSyncId($sync_id)) {
    sendError('Invalid sync_id format', 400);
}

// Validate file_id format (UUID v4)
if (!validateFileId($file_id)) {
    sendError('Invalid file_id format', 400);
}

// Validate chunk parameters
if (!is_numeric($chunk_index) || $chunk_index < 0) {
    sendError('Invalid chunk_index', 400);
}

if (!is_numeric($total_chunks) || $total_chunks < 1) {
    sendError('Invalid total_chunks', 400);
}

if ((int)$chunk_index >= (int)$total_chunks) {
    sendError('chunk_index must be less than total_chunks', 400);
}

// Validate chunk data
if (empty($chunk_data)) {
    sendError('Missing chunk_data', 400);
}

// Decode chunk data (base64)
$chunk_binary = base64_decode($chunk_data, true);
if ($chunk_binary === false) {
    sendError('Invalid chunk_data encoding', 400);
}

// Validate chunk size
$chunk_size = strlen($chunk_binary);
if ($chunk_size > CHUNK_SIZE * 1.5) {  // Allow some overhead for encryption
    sendError('Chunk size exceeds limit', 413);
}

try {
    // Create temp upload directory if doesn't exist
    if (!is_dir(TEMP_UPLOAD_DIR)) {
        mkdir(TEMP_UPLOAD_DIR, 0750, true);
    }

    // Save chunk to temp directory
    $chunk_path = getTempChunkPath($sync_id, $file_id, $chunk_index);
    if (file_put_contents($chunk_path, $chunk_binary) === false) {
        sendError('Failed to save chunk', 500);
    }

    // Check if this is the last chunk
    $is_last_chunk = ((int)$chunk_index === (int)$total_chunks - 1);

    if (!$is_last_chunk) {
        // Not the last chunk, just acknowledge receipt
        sendSuccess([
            'chunk_received' => (int)$chunk_index,
            'total_chunks' => (int)$total_chunks,
            'complete' => false
        ], 'Chunk received');
    }

    // Last chunk - assemble file
    $file_hash = $_POST['file_hash'] ?? '';
    $encrypted_filename = $_POST['encrypted_filename'] ?? '';

    // Validate final chunk parameters
    if (empty($file_hash) || strlen($file_hash) !== 64) {
        sendError('Invalid or missing file_hash', 400);
    }

    if (empty($encrypted_filename)) {
        sendError('Missing encrypted_filename', 400);
    }

    // Assemble all chunks
    $user_dir = getUserFileDirectory($sync_id);
    if (!is_dir($user_dir)) {
        mkdir($user_dir, 0750, true);
    }

    $final_path = getFilePath($sync_id, $file_id);
    $final_file = fopen($final_path, 'wb');

    if ($final_file === false) {
        sendError('Failed to create final file', 500);
    }

    $total_size = 0;

    // Write chunks in order
    for ($i = 0; $i < $total_chunks; $i++) {
        $chunk_path = getTempChunkPath($sync_id, $file_id, $i);

        if (!file_exists($chunk_path)) {
            fclose($final_file);
            unlink($final_path);
            sendError('Missing chunk ' . $i, 400);
        }

        $chunk_data = file_get_contents($chunk_path);
        fwrite($final_file, $chunk_data);
        $total_size += strlen($chunk_data);

        // Delete temp chunk
        unlink($chunk_path);
    }

    fclose($final_file);

    // Validate assembled file size
    if ($total_size > MAX_FILE_SIZE) {
        unlink($final_path);
        sendError('File size exceeds limit', 413);
    }

    // Verify file hash
    $actual_hash = hash_file('sha256', $final_path);
    if ($actual_hash !== $file_hash) {
        unlink($final_path);
        sendError('File hash mismatch - upload corrupted', 400);
    }

    // Check storage quota
    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("
        SELECT SUM(file_size) as total_size
        FROM file_metadata
        WHERE sync_id = ? AND deleted = FALSE
    ");
    $stmt->execute([$sync_id]);
    $current_usage = $stmt->fetchColumn() ?: 0;

    if ($current_usage + $total_size > STORAGE_QUOTA_PER_USER) {
        unlink($final_path);
        sendError('Storage quota exceeded', 413, [
            'quota_used' => $current_usage,
            'quota_total' => STORAGE_QUOTA_PER_USER,
            'file_size' => $total_size
        ]);
    }

    // Store metadata in database
    $stmt = $db->prepare("
        INSERT INTO file_metadata (
            file_id, sync_id, encrypted_filename, file_size, file_hash, version
        ) VALUES (?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
            encrypted_filename = VALUES(encrypted_filename),
            file_size = VALUES(file_size),
            file_hash = VALUES(file_hash),
            version = version + 1,
            upload_date = CURRENT_TIMESTAMP,
            deleted = FALSE
    ");

    $stmt->execute([$file_id, $sync_id, $encrypted_filename, $total_size, $file_hash]);

    // Success!
    sendSuccess([
        'file_id' => $file_id,
        'file_hash' => $file_hash,
        'file_size' => $total_size,
        'complete' => true
    ], 'File uploaded successfully');

} catch (Exception $e) {
    error_log('File upload error: ' . $e->getMessage());

    // Clean up on error
    if (isset($final_path) && file_exists($final_path)) {
        unlink($final_path);
    }

    sendError('File upload failed', 500);
}
?>
