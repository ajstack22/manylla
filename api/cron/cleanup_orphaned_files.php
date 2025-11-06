<?php
/**
 * Cleanup Orphaned Files Script
 *
 * Removes:
 * 1. Temporary upload chunks older than 24 hours
 * 2. Files marked as deleted for more than 30 days
 * 3. Files on disk not referenced in database (orphaned)
 *
 * Run via cron:
 * 0 2 * * * php /path/to/api/cron/cleanup_orphaned_files.php
 */

// Set execution time limit (cleanup might take a while)
set_time_limit(300); // 5 minutes

// Load required files
require_once __DIR__ . '/../config/file_config.php';
require_once __DIR__ . '/../config/database.php';

// Logging
$log_file = __DIR__ . '/../../logs/cleanup.log';
$start_time = microtime(true);

function log_message($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[$timestamp] $message\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND);
    echo $log_entry;
}

log_message('=== Starting file cleanup ===');

try {
    $db = Database::getInstance()->getConnection();

    // ============================================================
    // Task 1: Clean up temporary upload chunks (> 24 hours old)
    // ============================================================

    log_message('Task 1: Cleaning temporary chunks...');

    $temp_dir = TEMP_UPLOAD_DIR;
    $chunks_deleted = 0;

    if (is_dir($temp_dir)) {
        $cutoff_time = time() - (TEMP_FILE_EXPIRY_HOURS * 3600);
        $files = glob($temp_dir . '/*_chunk_*');

        foreach ($files as $file) {
            if (is_file($file) && filemtime($file) < $cutoff_time) {
                if (unlink($file)) {
                    $chunks_deleted++;
                } else {
                    log_message("  WARNING: Failed to delete temp chunk: $file");
                }
            }
        }
    }

    log_message("  Deleted $chunks_deleted temporary chunks");

    // ============================================================
    // Task 2: Delete files marked as deleted > 30 days ago
    // ============================================================

    log_message('Task 2: Deleting soft-deleted files...');

    $grace_period_seconds = DELETED_FILE_GRACE_DAYS * 24 * 3600;

    // Get files to delete
    $stmt = $db->prepare("
        SELECT file_id, sync_id
        FROM file_metadata
        WHERE deleted = TRUE
        AND deleted_at IS NOT NULL
        AND deleted_at < DATE_SUB(NOW(), INTERVAL ? SECOND)
    ");

    $stmt->execute([$grace_period_seconds]);
    $files_to_delete = $stmt->fetchAll();

    $deleted_count = 0;

    foreach ($files_to_delete as $file) {
        $file_path = getFilePath($file['sync_id'], $file['file_id']);

        // Delete from disk
        if (file_exists($file_path)) {
            if (unlink($file_path)) {
                log_message("  Deleted file: {$file['file_id']}");
            } else {
                log_message("  WARNING: Failed to delete file: $file_path");
                continue;
            }
        }

        // Delete metadata from database
        $delete_stmt = $db->prepare("
            DELETE FROM file_metadata
            WHERE file_id = ?
        ");

        if ($delete_stmt->execute([$file['file_id']])) {
            $deleted_count++;
        }
    }

    log_message("  Permanently deleted $deleted_count files");

    // ============================================================
    // Task 3: Find orphaned files (on disk but not in database)
    // ============================================================

    log_message('Task 3: Checking for orphaned files...');

    $orphaned_count = 0;
    $orphaned_size = 0;

    if (is_dir(USER_FILES_DIR)) {
        // Get all file IDs from database
        $stmt = $db->prepare("SELECT file_id FROM file_metadata");
        $stmt->execute();
        $db_file_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $db_file_ids_set = array_flip($db_file_ids);

        // Scan user files directory
        $user_dirs = glob(USER_FILES_DIR . '/*', GLOB_ONLYDIR);

        foreach ($user_dirs as $user_dir) {
            $files = glob($user_dir . '/*.enc');

            foreach ($files as $file_path) {
                $filename = basename($file_path, '.enc');

                // Check if file_id exists in database
                if (!isset($db_file_ids_set[$filename])) {
                    // Orphaned file found
                    $file_size = filesize($file_path);
                    log_message("  ORPHANED: $file_path (" . formatBytes($file_size) . ")");

                    // Delete orphaned file
                    if (unlink($file_path)) {
                        $orphaned_count++;
                        $orphaned_size += $file_size;
                    } else {
                        log_message("  WARNING: Failed to delete orphaned file: $file_path");
                    }
                }
            }

            // Clean up empty user directories
            if (count(glob($user_dir . '/*')) === 0) {
                rmdir($user_dir);
                log_message("  Removed empty directory: $user_dir");
            }
        }
    }

    log_message("  Deleted $orphaned_count orphaned files (" . formatBytes($orphaned_size) . ")");

    // ============================================================
    // Summary
    // ============================================================

    $elapsed_time = round(microtime(true) - $start_time, 2);

    log_message('');
    log_message('=== Cleanup Summary ===');
    log_message("  Temp chunks deleted: $chunks_deleted");
    log_message("  Soft-deleted files removed: $deleted_count");
    log_message("  Orphaned files removed: $orphaned_count");
    log_message("  Total space freed: " . formatBytes($orphaned_size));
    log_message("  Execution time: {$elapsed_time}s");
    log_message('=== Cleanup complete ===');

    exit(0);

} catch (Exception $e) {
    log_message('ERROR: ' . $e->getMessage());
    log_message('Stack trace: ' . $e->getTraceAsString());
    exit(1);
}
?>
