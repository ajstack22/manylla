<?php
/**
 * File Attachment Configuration
 *
 * Constants for file upload/download functionality
 */

// File Size Limits
define('MAX_FILE_SIZE', 50 * 1024 * 1024);  // 50MB per file
define('CHUNK_SIZE', 1024 * 1024);          // 1MB chunks for upload/download

// Storage Limits
define('STORAGE_QUOTA_PER_USER', 500 * 1024 * 1024);  // 500MB total per user

// Allowed File Types (MIME types)
define('ALLOWED_FILE_TYPES', [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',

    // Images
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif'
]);

// File Type Extensions (for validation)
define('ALLOWED_EXTENSIONS', [
    'pdf', 'doc', 'docx', 'txt',
    'jpg', 'jpeg', 'png', 'heic', 'heif'
]);

// Storage Directories
define('USER_FILES_DIR', __DIR__ . '/../../user-files');
define('TEMP_UPLOAD_DIR', sys_get_temp_dir() . '/manylla_uploads');

// File Metadata
define('MAX_FILENAME_LENGTH', 255);
define('FILE_ID_LENGTH', 36);  // UUID v4 format

// Cleanup Configuration
define('TEMP_FILE_EXPIRY_HOURS', 24);  // Clean up temp chunks after 24 hours
define('DELETED_FILE_GRACE_DAYS', 30); // Keep deleted files for 30 days

// Magic Bytes for File Type Validation
define('FILE_SIGNATURES', [
    'application/pdf' => [
        ['offset' => 0, 'bytes' => [0x25, 0x50, 0x44, 0x46]]  // %PDF
    ],
    'image/jpeg' => [
        ['offset' => 0, 'bytes' => [0xFF, 0xD8, 0xFF]]
    ],
    'image/png' => [
        ['offset' => 0, 'bytes' => [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]]
    ],
    'application/msword' => [
        ['offset' => 0, 'bytes' => [0xD0, 0xCF, 0x11, 0xE0]]  // MS Office
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => [
        ['offset' => 0, 'bytes' => [0x50, 0x4B, 0x03, 0x04]]  // ZIP (DOCX is ZIP)
    ]
]);

/**
 * Validate file type by checking magic bytes
 */
function validateFileSignature($fileData, $declaredType) {
    if (!isset(FILE_SIGNATURES[$declaredType])) {
        return false;
    }

    $signatures = FILE_SIGNATURES[$declaredType];

    foreach ($signatures as $signature) {
        $offset = $signature['offset'];
        $expectedBytes = $signature['bytes'];
        $length = count($expectedBytes);

        // Extract bytes at offset
        if ($offset >= 0) {
            $actualBytes = array_values(unpack('C*', substr($fileData, $offset, $length)));
        } else {
            // Negative offset means from end
            $actualBytes = array_values(unpack('C*', substr($fileData, $offset, $length)));
        }

        // Compare bytes
        if ($actualBytes === $expectedBytes) {
            return true;
        }
    }

    return false;
}

/**
 * Get hashed directory path for user files
 */
function getUserFileDirectory($syncId) {
    $hashedSyncId = hash('sha256', $syncId);
    return USER_FILES_DIR . '/' . $hashedSyncId;
}

/**
 * Get full file path
 */
function getFilePath($syncId, $fileId) {
    return getUserFileDirectory($syncId) . '/' . $fileId . '.enc';
}

/**
 * Get temp chunk path
 */
function getTempChunkPath($syncId, $fileId, $chunkIndex) {
    return TEMP_UPLOAD_DIR . '/' . $syncId . '_' . $fileId . '_chunk_' . $chunkIndex;
}

/**
 * Format bytes for human-readable display
 */
function formatBytes($bytes) {
    if ($bytes < 1024) {
        return $bytes . ' B';
    } elseif ($bytes < 1024 * 1024) {
        return round($bytes / 1024, 2) . ' KB';
    } elseif ($bytes < 1024 * 1024 * 1024) {
        return round($bytes / (1024 * 1024), 2) . ' MB';
    } else {
        return round($bytes / (1024 * 1024 * 1024), 2) . ' GB';
    }
}

/**
 * Validate file ID format (UUID v4)
 */
function validateFileId($fileId) {
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i', $fileId) === 1;
}

/**
 * Generate UUID v4
 */
function generateFileId() {
    $data = random_bytes(16);

    // Set version (4) and variant bits
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
?>
