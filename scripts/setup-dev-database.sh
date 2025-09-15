#!/bin/bash

# Setup Dev Database Script
# Creates and configures the dev database

set -e

REMOTE_HOST="stackmap-cpanel"

echo "Setting up Manylla Dev Database"
echo "================================"

# Create SQL script for database setup
cat > /tmp/setup_dev_db.sql << 'EOF'
-- Create dev database if it doesn't exist
CREATE DATABASE IF NOT EXISTS stachblx_manylla_sync_dev;

-- Use the dev database
USE stachblx_manylla_sync_dev;

-- Create sync_data table
CREATE TABLE IF NOT EXISTS sync_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sync_id VARCHAR(32) NOT NULL,
  encrypted_data LONGTEXT NOT NULL,
  version INT DEFAULT 1,
  checksum VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  device_info TEXT,
  INDEX idx_sync_id (sync_id),
  INDEX idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create shares table for temporary sharing
CREATE TABLE IF NOT EXISTS shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_token VARCHAR(16) NOT NULL UNIQUE,
  access_code VARCHAR(64) NOT NULL,
  encrypted_data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  access_count INT DEFAULT 0,
  max_accesses INT DEFAULT 10,
  created_by_sync_id VARCHAR(32),
  INDEX idx_token (share_token),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create active_shares tracking table
CREATE TABLE IF NOT EXISTS active_shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_id INT NOT NULL,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create sync_backups table for version history
CREATE TABLE IF NOT EXISTS sync_backups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sync_id VARCHAR(32) NOT NULL,
  encrypted_data LONGTEXT NOT NULL,
  version INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sync_backup (sync_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  sync_id VARCHAR(32),
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_sync (sync_id),
  INDEX idx_audit_event (event_type),
  INDEX idx_audit_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON stachblx_manylla_sync_dev.* TO 'stachblx'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Dev database setup complete' AS status;
EOF

# Copy SQL script to server
scp /tmp/setup_dev_db.sql $REMOTE_HOST:~/setup_dev_db.sql

# Execute the SQL script
echo "Creating database structure..."
ssh $REMOTE_HOST "mysql -u stachblx -p < ~/setup_dev_db.sql"

# Clean up
ssh $REMOTE_HOST "rm ~/setup_dev_db.sql"
rm /tmp/setup_dev_db.sql

echo "✅ Dev database setup complete!"
echo ""
echo "Database: stachblx_manylla_sync_dev"
echo "Tables created:"
echo "  - sync_data"
echo "  - shares"
echo "  - active_shares"
echo "  - sync_backups"
echo "  - audit_log"