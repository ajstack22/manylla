-- Manyla Sync Database Setup
-- Zero-knowledge sync for special needs information management
-- 
-- IMPORTANT: Before running this:
-- 1. Create database 'manyla_app' in cPanel
-- 2. Create a database user in cPanel
-- 3. Grant the following permissions to the user:
--    - SELECT, INSERT, UPDATE, DELETE (for normal operations)
--    - CREATE, ALTER, DROP (for initial setup only)
--    - INDEX (for performance optimization)
--    - EXECUTE (for stored procedures)
--    - EVENT (for scheduled cleanup)
-- 4. Select the database in phpMyAdmin
-- 5. Then run this script

-- 1. Main sync data table
-- Stores encrypted profile data for each family
CREATE TABLE IF NOT EXISTS sync_data (
  sync_id VARCHAR(36) PRIMARY KEY,
  encrypted_blob LONGBLOB NOT NULL,
  recovery_salt VARCHAR(32) NOT NULL,
  version INT DEFAULT 1,
  device_count INT DEFAULT 1,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_last_modified (last_modified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Device tracking table
-- Tracks family devices (mom's phone, dad's tablet, etc.)
CREATE TABLE IF NOT EXISTS sync_devices (
  device_id VARCHAR(36) PRIMARY KEY,
  sync_id VARCHAR(36) NOT NULL,
  device_name VARCHAR(100),
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sync_id) REFERENCES sync_data(sync_id) ON DELETE CASCADE,
  INDEX idx_sync_id (sync_id),
  INDEX idx_last_seen (last_seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Temporary shares table (Manyla-specific)
-- Stores encrypted shared profiles with access codes
CREATE TABLE IF NOT EXISTS shared_profiles (
  share_id VARCHAR(36) PRIMARY KEY,
  access_code VARCHAR(8) NOT NULL,
  encrypted_data LONGBLOB NOT NULL,
  recipient_type VARCHAR(50), -- teacher, doctor, babysitter, etc.
  expires_at TIMESTAMP NOT NULL,
  view_count INT DEFAULT 0,
  max_views INT DEFAULT NULL, -- optional view limit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_access_code (access_code),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Share audit log (privacy-respecting)
-- Tracks share access without storing personal data
CREATE TABLE IF NOT EXISTS share_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- created, accessed, expired
  ip_hash VARCHAR(64), -- hashed IP for security
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (share_id) REFERENCES shared_profiles(share_id) ON DELETE CASCADE,
  INDEX idx_share_event (share_id, event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Metrics table (privacy-respecting)
-- Anonymous usage metrics
CREATE TABLE IF NOT EXISTS sync_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event VARCHAR(50) NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_date (event, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Rate limiting table
-- Prevents abuse
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier VARCHAR(255) PRIMARY KEY,
  endpoint VARCHAR(100) NOT NULL,
  request_count INT DEFAULT 0,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_endpoint (endpoint),
  INDEX idx_window_start (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Pairing sessions table
-- For QR code device pairing
CREATE TABLE IF NOT EXISTS pairing_sessions (
  channel_id VARCHAR(36) PRIMARY KEY,
  channel_key_hash VARCHAR(64) NOT NULL,
  initiated_by VARCHAR(36),
  expires_at TIMESTAMP NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cleanup procedures
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS cleanup_expired_data()
BEGIN
  -- Clean expired shares
  DELETE FROM shared_profiles WHERE expires_at < NOW();
  
  -- Clean expired pairing sessions
  DELETE FROM pairing_sessions WHERE expires_at < NOW();
  
  -- Clean old rate limits
  DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 1 HOUR);
  
  -- Clean abandoned sync data (optional - 6 months)
  DELETE FROM sync_data 
  WHERE last_modified < DATE_SUB(NOW(), INTERVAL 6 MONTH)
  AND sync_id NOT IN (
    SELECT DISTINCT sync_id FROM sync_devices 
    WHERE last_seen > DATE_SUB(NOW(), INTERVAL 6 MONTH)
  );
END$$

DELIMITER ;

-- Create event to run cleanup daily
CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO CALL cleanup_expired_data();

-- Verify tables were created
SHOW TABLES;

-- After setup is complete, you can revoke dangerous permissions:
-- REVOKE CREATE, ALTER, DROP ON manyla_app.* FROM 'manyla_user'@'localhost';
-- The user will retain SELECT, INSERT, UPDATE, DELETE, INDEX, EXECUTE, EVENT