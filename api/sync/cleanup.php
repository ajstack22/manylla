<?php
/**
 * Manylla Data Cleanup Script (Phase 3)
 * Implements data retention policies and automatic cleanup
 * 
 * This should be run as a cron job, not accessible via web
 * Cron example: 0 3 * * * /usr/bin/php /path/to/api/sync/cleanup.php >> /path/to/logs/cleanup.log 2>&1
 */

// Ensure this is run from CLI only
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

require_once __DIR__ . '/../config/database.php';

// Data retention settings
define('SHARE_MAX_AGE_DAYS', 30);        // Auto-delete shares after 30 days
define('BACKUP_MAX_COUNT', 10);           // Keep last 10 backups per user
define('INACTIVE_SYNC_DAYS', 90);        // Delete inactive syncs after 90 days
define('AUDIT_LOG_RETENTION_DAYS', 30);  // Keep audit logs for 30 days
define('RATE_LIMIT_RETENTION_HOURS', 24); // Keep rate limit records for 24 hours

try {
    $db = Database::getInstance()->getConnection();
    
    echo date('Y-m-d H:i:s') . " - Starting cleanup process\n";
    
    // 1. Delete expired shares
    $stmt = $db->prepare("
        DELETE FROM shares 
        WHERE expires_at < NOW()
           OR created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    ");
    $stmt->execute([SHARE_MAX_AGE_DAYS]);
    $sharesDeleted = $stmt->rowCount();
    echo "  Expired shares deleted: $sharesDeleted\n";
    
    // Also delete from shared_profiles table if it exists
    $stmt = $db->prepare("
        DELETE FROM shared_profiles 
        WHERE expires_at < NOW()
           OR created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    ");
    $stmt->execute([SHARE_MAX_AGE_DAYS]);
    $sharedProfilesDeleted = $stmt->rowCount();
    if ($sharedProfilesDeleted > 0) {
        echo "  Expired shared profiles deleted: $sharedProfilesDeleted\n";
    }
    
    // 2. Delete old backups (keep last N per sync_id)
    $stmt = $db->prepare("
        DELETE b1 FROM sync_backups b1
        LEFT JOIN (
            SELECT backup_id FROM (
                SELECT backup_id,
                       ROW_NUMBER() OVER (PARTITION BY sync_id ORDER BY created_at DESC) as rn
                FROM sync_backups
            ) ranked
            WHERE rn <= ?
        ) b2 ON b1.backup_id = b2.backup_id
        WHERE b2.backup_id IS NULL
    ");
    $stmt->execute([BACKUP_MAX_COUNT]);
    $backupsDeleted = $stmt->rowCount();
    echo "  Old backups deleted: $backupsDeleted\n";
    
    // 3. Delete inactive sync data (no activity in N days)
    // First identify inactive sync_ids
    $stmt = $db->prepare("
        SELECT sync_id 
        FROM sync_data 
        WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    ");
    $stmt->execute([INACTIVE_SYNC_DAYS]);
    $inactiveSyncIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!empty($inactiveSyncIds)) {
        // Delete associated data
        $placeholders = implode(',', array_fill(0, count($inactiveSyncIds), '?'));
        
        // Delete devices
        $stmt = $db->prepare("DELETE FROM sync_devices WHERE sync_id IN ($placeholders)");
        $stmt->execute($inactiveSyncIds);
        
        // Delete invite codes
        $stmt = $db->prepare("DELETE FROM invite_codes WHERE sync_id IN ($placeholders)");
        $stmt->execute($inactiveSyncIds);
        
        // Delete backups
        $stmt = $db->prepare("DELETE FROM sync_backups WHERE sync_id IN ($placeholders)");
        $stmt->execute($inactiveSyncIds);
        
        // Finally delete sync data
        $stmt = $db->prepare("DELETE FROM sync_data WHERE sync_id IN ($placeholders)");
        $stmt->execute($inactiveSyncIds);
        
        echo "  Inactive sync groups deleted: " . count($inactiveSyncIds) . "\n";
    } else {
        echo "  No inactive sync groups found\n";
    }
    
    // 4. Delete old audit logs
    $stmt = $db->prepare("
        DELETE FROM audit_log 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    ");
    $stmt->execute([AUDIT_LOG_RETENTION_DAYS]);
    $auditDeleted = $stmt->rowCount();
    echo "  Old audit logs deleted: $auditDeleted\n";
    
    // 5. Delete old rate limit records
    $stmt = $db->prepare("
        DELETE FROM rate_limits 
        WHERE window_end < DATE_SUB(NOW(), INTERVAL ? HOUR)
    ");
    $stmt->execute([RATE_LIMIT_RETENTION_HOURS]);
    $rateLimitsDeleted = $stmt->rowCount();
    echo "  Old rate limit records deleted: $rateLimitsDeleted\n";
    
    // 6. Delete expired invite codes
    $stmt = $db->prepare("
        DELETE FROM invite_codes 
        WHERE expires_at < NOW()
    ");
    $stmt->execute();
    $invitesDeleted = $stmt->rowCount();
    echo "  Expired invite codes deleted: $invitesDeleted\n";
    
    // 7. Optimize tables (MySQL specific)
    echo "  Optimizing tables...\n";
    $tables = [
        'sync_data', 'sync_backups', 'sync_devices', 
        'shares', 'shared_profiles', 'invite_codes', 
        'audit_log', 'rate_limits'
    ];
    
    foreach ($tables as $table) {
        try {
            $db->exec("OPTIMIZE TABLE $table");
            echo "    Optimized table: $table\n";
        } catch (Exception $e) {
            // Table might not exist, that's okay
            echo "    Skipped table: $table (may not exist)\n";
        }
    }
    
    // Summary
    echo date('Y-m-d H:i:s') . " - Cleanup complete:\n";
    echo "  Total shares deleted: " . ($sharesDeleted + $sharedProfilesDeleted) . "\n";
    echo "  Total backups deleted: $backupsDeleted\n";
    echo "  Total inactive syncs deleted: " . count($inactiveSyncIds) . "\n";
    echo "  Total audit logs deleted: $auditDeleted\n";
    echo "  Total rate limits deleted: $rateLimitsDeleted\n";
    echo "  Total invite codes deleted: $invitesDeleted\n";
    
    // Log success to audit log if available
    if ($auditDeleted > 0 || $sharesDeleted > 0 || $backupsDeleted > 0) {
        try {
            $stmt = $db->prepare("
                INSERT INTO audit_log (event_type, details, created_at)
                VALUES ('cleanup_completed', ?, NOW())
            ");
            $stmt->execute([json_encode([
                'shares_deleted' => $sharesDeleted + $sharedProfilesDeleted,
                'backups_deleted' => $backupsDeleted,
                'inactive_syncs_deleted' => count($inactiveSyncIds),
                'audit_logs_deleted' => $auditDeleted,
                'rate_limits_deleted' => $rateLimitsDeleted,
                'invite_codes_deleted' => $invitesDeleted
            ])]);
        } catch (Exception $e) {
            // Audit log might not exist yet
        }
    }
    
    exit(0); // Success
    
} catch (Exception $e) {
    echo date('Y-m-d H:i:s') . " - Cleanup error: " . $e->getMessage() . "\n";
    error_log('Manylla cleanup error: ' . $e->getMessage());
    exit(1); // Error
}
?>