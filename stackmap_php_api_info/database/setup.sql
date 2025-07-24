-- StackMap Sync Database Setup
-- Complete database schema for sync functionality
-- 
-- Instructions:
-- 1. Create a new database or use existing one
-- 2. Run this entire script in phpMyAdmin or MySQL terminal
-- 3. Verify all tables are created with SHOW TABLES;

-- Create database (optional - skip if using existing database)
-- CREATE DATABASE IF NOT EXISTS stackmap_sync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE stackmap_sync;

-- 1. Main sync data table
-- Stores encrypted data blobs for each sync group
CREATE TABLE IF NOT EXISTS sync_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sync_id VARCHAR(32) NOT NULL UNIQUE,
  encrypted_blob MEDIUMTEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  device_id VARCHAR(32) NOT NULL,
  device_name VARCHAR(100),
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sync_id (sync_id),
  INDEX idx_last_modified (last_modified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Rate limiting table
-- Prevents API abuse by tracking request rates
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_identifier_endpoint (identifier, endpoint),
  INDEX idx_window_start (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Cleanup log table (optional but recommended)
-- Tracks automatic cleanup operations
CREATE TABLE IF NOT EXISTS cleanup_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deleted_count INT DEFAULT 0,
  cleanup_type VARCHAR(50),
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stored procedure for cleaning old data (6 months retention)
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS cleanup_old_sync_data()
BEGIN
  DECLARE rows_deleted INT DEFAULT 0;
  
  -- Delete sync data older than 6 months
  DELETE FROM sync_data 
  WHERE last_modified < DATE_SUB(NOW(), INTERVAL 6 MONTH);
  
  SET rows_deleted = ROW_COUNT();
  
  -- Log the cleanup
  INSERT INTO cleanup_log (deleted_count, cleanup_type) 
  VALUES (rows_deleted, 'sync_data_6_months');
  
  -- Clean up old rate limit entries
  DELETE FROM rate_limits 
  WHERE window_start < DATE_SUB(NOW(), INTERVAL 1 HOUR);
END$$
DELIMITER ;

-- Create event to run cleanup daily (if events are enabled)
-- Note: May need to enable events with: SET GLOBAL event_scheduler = ON;
CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 3 HOUR
DO CALL cleanup_old_sync_data();

-- Verify tables were created
SHOW TABLES;

-- Display table structures
DESCRIBE sync_data;
DESCRIBE rate_limits;
DESCRIBE cleanup_log;