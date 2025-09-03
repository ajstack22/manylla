-- Manylla Sync Database Setup
-- Run this SQL in your MySQL database to set up the sync tables

-- Create database (if you have privileges)
-- CREATE DATABASE IF NOT EXISTS manylla_sync;
-- USE manylla_sync;

-- Drop existing tables if needed (careful in production!)
-- DROP TABLE IF EXISTS sync_shares;
-- DROP TABLE IF EXISTS sync_data;

-- Main sync data table
CREATE TABLE IF NOT EXISTS sync_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recovery_hash VARCHAR(64) NOT NULL COMMENT 'Hash of recovery phrase',
    encrypted_blob LONGTEXT NOT NULL COMMENT 'Encrypted profile data',
    version BIGINT NOT NULL COMMENT 'Version timestamp',
    device_id VARCHAR(64) COMMENT 'Device that made the backup',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_recovery_hash (recovery_hash),
    INDEX idx_version (recovery_hash, version),
    INDEX idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores encrypted profile backups';

-- Temporary sharing table
CREATE TABLE IF NOT EXISTS sync_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    share_code VARCHAR(32) NOT NULL UNIQUE COMMENT 'Random share code',
    recovery_hash VARCHAR(64) NOT NULL COMMENT 'Links to sync_data',
    encrypted_data LONGTEXT NOT NULL COMMENT 'Filtered encrypted data',
    visibility_filter JSON COMMENT 'What data is included in share',
    expires_at TIMESTAMP NOT NULL COMMENT 'When share expires',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_count INT DEFAULT 0 COMMENT 'Number of times accessed',
    max_accesses INT DEFAULT NULL COMMENT 'Max allowed accesses',
    
    -- Indexes
    INDEX idx_share_code (share_code),
    INDEX idx_expires (expires_at),
    INDEX idx_recovery (recovery_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Temporary shares with expiration';

-- Create a view for active shares (optional)
CREATE OR REPLACE VIEW active_shares AS
SELECT 
    share_code,
    visibility_filter,
    expires_at,
    accessed_count,
    max_accesses,
    TIMESTAMPDIFF(MINUTE, NOW(), expires_at) as minutes_remaining
FROM sync_shares
WHERE expires_at > NOW()
  AND (max_accesses IS NULL OR accessed_count < max_accesses);

-- Stored procedure to clean up expired shares (optional)
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS cleanup_expired_shares()
BEGIN
    DELETE FROM sync_shares 
    WHERE expires_at < NOW() 
       OR (max_accesses IS NOT NULL AND accessed_count >= max_accesses);
END$$
DELIMITER ;

-- Create event to run cleanup daily (requires EVENT scheduler)
-- CREATE EVENT IF NOT EXISTS cleanup_shares_event
-- ON SCHEDULE EVERY 1 DAY
-- DO CALL cleanup_expired_shares();

-- Grant minimum required permissions (adjust username)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON manylla_sync.* TO 'your_web_user'@'localhost';

-- Sample queries for monitoring
-- SELECT COUNT(*) as total_profiles FROM sync_data;
-- SELECT COUNT(*) as active_shares FROM sync_shares WHERE expires_at > NOW();
-- SELECT recovery_hash, version, updated_at FROM sync_data ORDER BY updated_at DESC LIMIT 10;