<?php
/**
 * Check Server Limits
 *
 * Display PHP configuration relevant to file uploads
 */

header('Content-Type: text/plain');

echo "=== PHP Server Configuration ===\n\n";

echo "PHP Version: " . phpversion() . "\n\n";

echo "File Upload Settings:\n";
echo "---------------------\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "max_execution_time: " . ini_get('max_execution_time') . " seconds\n";
echo "max_input_time: " . ini_get('max_input_time') . " seconds\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n\n";

echo "File System:\n";
echo "------------\n";
echo "Temp directory: " . sys_get_temp_dir() . "\n";

$user_files_dir = __DIR__ . '/../../user-files';
if (is_dir($user_files_dir)) {
    echo "User files directory: EXISTS\n";
    echo "  Writable: " . (is_writable($user_files_dir) ? 'YES' : 'NO') . "\n";
    $disk_free = disk_free_space($user_files_dir);
    $disk_total = disk_total_space($user_files_dir);
    echo "  Disk free: " . number_format($disk_free / (1024*1024*1024), 2) . " GB\n";
    echo "  Disk total: " . number_format($disk_total / (1024*1024*1024), 2) . " GB\n";
} else {
    echo "User files directory: NOT FOUND\n";
}

echo "\n";

echo "Database:\n";
echo "---------\n";
try {
    require_once __DIR__ . '/../config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "Database connection: OK\n";

    // Check if file_metadata table exists
    $stmt = $db->query("SHOW TABLES LIKE 'file_metadata'");
    if ($stmt->rowCount() > 0) {
        echo "file_metadata table: EXISTS\n";

        // Get row count
        $count_stmt = $db->query("SELECT COUNT(*) as count FROM file_metadata");
        $count = $count_stmt->fetchColumn();
        echo "  Records: $count\n";
    } else {
        echo "file_metadata table: NOT FOUND (run install script)\n";
    }
} catch (Exception $e) {
    echo "Database connection: ERROR\n";
    echo "  " . $e->getMessage() . "\n";
}

echo "\n";

echo "Recommended Configuration:\n";
echo "--------------------------\n";
echo "✓ PHP 7.4+ or 8.x\n";
echo "✓ upload_max_filesize >= 10M (for chunked uploads)\n";
echo "✓ post_max_size >= 10M\n";
echo "✓ max_execution_time >= 300 (5 minutes)\n";
echo "✓ memory_limit >= 256M\n";
echo "✓ Disk space >= 10GB free\n";

echo "\n=== Check Complete ===\n";
?>
