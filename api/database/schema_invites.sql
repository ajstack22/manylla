-- Manylla Sync Invites Table Schema
-- For temporary invite codes that map to sync groups

CREATE TABLE IF NOT EXISTS manylla_sync_invites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invite_code VARCHAR(9) UNIQUE NOT NULL COMMENT 'Format: XXXX-XXXX',
    sync_id VARCHAR(32) NOT NULL COMMENT 'Links to sync group',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL COMMENT 'When first used',
    used_by_device VARCHAR(64) COMMENT 'Device that used the invite',
    created_by_device VARCHAR(64) COMMENT 'Device that created the invite',
    
    -- Indexes for performance
    INDEX idx_invite_code (invite_code),
    INDEX idx_sync_id (sync_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Additional table for tracking devices that join via invites
CREATE TABLE IF NOT EXISTS manylla_sync_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_id VARCHAR(32) NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NULL,
    joined_via_invite VARCHAR(9) NULL COMMENT 'Invite code used to join',
    
    -- Prevent duplicate device entries per sync group
    UNIQUE KEY unique_sync_device (sync_id, device_id),
    
    -- Indexes
    INDEX idx_sync_id (sync_id),
    INDEX idx_device_id (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cleanup job (run periodically to remove expired invites)
-- DELETE FROM manylla_sync_invites WHERE expires_at < NOW();

-- Example queries:

-- Create an invite
-- INSERT INTO manylla_sync_invites (invite_code, sync_id, expires_at, created_by_device)
-- VALUES ('ABCD-1234', 'sync_id_hash', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'device123');

-- Validate an invite
-- SELECT sync_id, expires_at FROM manylla_sync_invites 
-- WHERE invite_code = 'ABCD-1234' AND expires_at > NOW();

-- Mark invite as used
-- UPDATE manylla_sync_invites 
-- SET used_at = NOW(), used_by_device = 'device456'
-- WHERE invite_code = 'ABCD-1234';

-- Get all devices in a sync group
-- SELECT device_id, joined_at, joined_via_invite 
-- FROM manylla_sync_devices 
-- WHERE sync_id = 'sync_id_hash';