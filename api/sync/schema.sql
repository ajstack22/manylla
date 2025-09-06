-- Manylla Database Schema
-- Phase 2 Security Implementation
-- Proper constraints and indexes for security and performance

-- Sync data table with proper constraints
CREATE TABLE IF NOT EXISTS sync_data (
    sync_id VARCHAR(32) PRIMARY KEY,
    encrypted_data MEDIUMTEXT,
    timestamp BIGINT NOT NULL,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Devices table with foreign key
CREATE TABLE IF NOT EXISTS sync_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL,
    device_id VARCHAR(32) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NULL,
    UNIQUE KEY unique_device (sync_id, device_id),
    FOREIGN KEY (sync_id) REFERENCES sync_data(sync_id) ON DELETE CASCADE,
    INDEX idx_last_seen (last_seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
    code VARCHAR(8) PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    max_uses INT DEFAULT 1,
    current_uses INT DEFAULT 0,
    created_by_device VARCHAR(32),
    FOREIGN KEY (sync_id) REFERENCES sync_data(sync_id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log table for security monitoring
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    sync_id VARCHAR(32),
    device_id VARCHAR(32),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_sync_id (sync_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Share storage table (backend for encrypted shares)
CREATE TABLE IF NOT EXISTS shares (
    share_token VARCHAR(64) PRIMARY KEY,
    encrypted_data MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    access_count INT DEFAULT 0,
    max_access INT DEFAULT NULL,
    creator_ip VARCHAR(45),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id VARCHAR(64) PRIMARY KEY,
    limit_type ENUM('ip', 'device', 'sync_id') NOT NULL,
    identifier VARCHAR(64) NOT NULL,
    request_count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMP NOT NULL,
    UNIQUE KEY unique_limit (limit_type, identifier, window_end),
    INDEX idx_window_end (window_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add cleanup job for expired data
DELIMITER //
CREATE EVENT IF NOT EXISTS cleanup_expired_data
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    -- Delete expired shares
    DELETE FROM shares WHERE expires_at < NOW();
    
    -- Delete expired invite codes
    DELETE FROM invite_codes WHERE expires_at < NOW();
    
    -- Delete old audit logs (keep 30 days)
    DELETE FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Delete old rate limit records
    DELETE FROM rate_limits WHERE window_end < NOW();
END//
DELIMITER ;