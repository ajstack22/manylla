-- Manylla Qual Database Setup Script
-- 
-- Instructions:
-- 1. Create database in cPanel: stachblx_manylla_sync_qual
-- 2. Create user in cPanel: stachblx_manylla_qual
-- 3. Grant ALL PRIVILEGES to the user on the database
-- 4. Run this script to create tables

-- Phase 3 Cloud Storage Schema for Manylla

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS sync_backups;
DROP TABLE IF EXISTS share_links;
DROP TABLE IF EXISTS sync_invites;
DROP TABLE IF EXISTS sync_data;
DROP TABLE IF EXISTS sync_groups;

-- Create sync_groups table (stores sync group metadata)
CREATE TABLE sync_groups (
    sync_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON,
    INDEX idx_active (is_active),
    INDEX idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sync_data table (Phase 3 Enhanced)
CREATE TABLE sync_data (
    sync_id VARCHAR(32) PRIMARY KEY,
    device_id VARCHAR(32) NOT NULL,
    encrypted_blob MEDIUMTEXT NOT NULL,
    blob_hash VARCHAR(64) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sync_timestamp (sync_id, timestamp),
    INDEX idx_device (device_id),
    INDEX idx_version (version),
    INDEX idx_hash (blob_hash),
    CONSTRAINT fk_sync_group 
        FOREIGN KEY (sync_id) 
        REFERENCES sync_groups(sync_id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sync_backups table (Phase 3 New)
CREATE TABLE sync_backups (
    backup_id INT AUTO_INCREMENT PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL,
    device_id VARCHAR(32) NOT NULL,
    encrypted_blob MEDIUMTEXT NOT NULL,
    blob_hash VARCHAR(64) NOT NULL,
    version INT NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_auto_backup BOOLEAN DEFAULT FALSE,
    backup_name VARCHAR(100),
    INDEX idx_sync_backups (sync_id, created_at),
    INDEX idx_device_backups (device_id),
    INDEX idx_version_backups (version),
    CONSTRAINT fk_backup_sync_group 
        FOREIGN KEY (sync_id) 
        REFERENCES sync_groups(sync_id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sync_invites table (for sharing sync groups)
CREATE TABLE sync_invites (
    invite_code VARCHAR(16) PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    max_uses INT DEFAULT 1,
    uses_count INT DEFAULT 0,
    created_by VARCHAR(32),
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_sync_invites (sync_id),
    INDEX idx_expires (expires_at),
    INDEX idx_active_invites (is_active),
    CONSTRAINT fk_invite_sync_group 
        FOREIGN KEY (sync_id) 
        REFERENCES sync_groups(sync_id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create share_links table (Phase 3 Enhanced)
CREATE TABLE share_links (
    access_code VARCHAR(16) PRIMARY KEY,
    encrypted_data MEDIUMTEXT NOT NULL,
    recipient_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    access_count INT DEFAULT 0,
    last_accessed TIMESTAMP NULL,
    metadata JSON,
    INDEX idx_expires_shares (expires_at),
    INDEX idx_recipient (recipient_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cleanup event (removes expired data daily)
DELIMITER $$
CREATE EVENT IF NOT EXISTS cleanup_expired_data
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    -- Delete expired share links
    DELETE FROM share_links 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    -- Delete expired invites
    DELETE FROM sync_invites 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    -- Delete old backups (keep last 10 per sync_id)
    DELETE b1 FROM sync_backups b1
    INNER JOIN (
        SELECT sync_id, 
               backup_id,
               ROW_NUMBER() OVER (PARTITION BY sync_id ORDER BY created_at DESC) as rn
        FROM sync_backups
    ) b2 ON b1.backup_id = b2.backup_id
    WHERE b2.rn > 10;
END$$
DELIMITER ;

-- Grant permissions (run as root if needed)
-- GRANT ALL PRIVILEGES ON stachblx_manylla_sync_qual.* TO 'stachblx_manylla_qual'@'localhost';
-- FLUSH PRIVILEGES;

-- Insert initial test data (optional)
INSERT INTO sync_groups (sync_id, name, metadata) 
VALUES ('TEST000000000000', 'Test Sync Group', '{"test": true}')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;