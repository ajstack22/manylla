<?php
/**
 * Install file_metadata table
 *
 * Run this script once to create the table:
 * php api/database/install_file_metadata.php
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "Creating file_metadata table...\n";

    $sql = "
    CREATE TABLE IF NOT EXISTS file_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,

        -- File identification
        file_id VARCHAR(36) NOT NULL UNIQUE,
        sync_id VARCHAR(64) NOT NULL,

        -- File information (encrypted)
        encrypted_filename TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        file_hash VARCHAR(64) NOT NULL,

        -- Timestamps
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed TIMESTAMP NULL,

        -- Versioning
        version INT DEFAULT 1,

        -- Soft delete
        deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP NULL,

        -- Indexes for performance
        INDEX idx_sync_id (sync_id),
        INDEX idx_file_id (file_id),
        INDEX idx_file_hash (file_hash),
        INDEX idx_deleted (deleted),
        INDEX idx_upload_date (upload_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Zero-knowledge encrypted file metadata';
    ";

    $db->exec($sql);

    echo "✓ Table created successfully\n";

    // Verify table exists
    $stmt = $db->query("SHOW TABLES LIKE 'file_metadata'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Table verified\n";

        // Show table structure
        echo "\nTable structure:\n";
        $describe = $db->query("DESCRIBE file_metadata");
        foreach ($describe as $row) {
            echo "  {$row['Field']}: {$row['Type']}\n";
        }
    } else {
        echo "✗ Table verification failed\n";
        exit(1);
    }

    exit(0);

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
