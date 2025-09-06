<?php
/**
 * Manylla Sync API - Restore Endpoint (Phase 3)
 * Retrieves backup of encrypted sync data
 * 
 * POST /api/sync/restore.php
 * Body: {
 *   sync_id: string,
 *   device_id: string,
 *   backup_id?: string,  // Optional - specific backup ID
 *   restore?: boolean    // Optional - whether to restore as current data
 * }
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/rate-limiter.php';
require_once __DIR__ . '/../utils/error-handler.php';

// Set CORS headers
setCorsHeaders();

// Validate request method
validateRequestMethod('POST');

// Apply rate limiting - 10 restores per minute
$rateLimiter = new RateLimiter();
$rateLimiter->checkIPRateLimit(getClientIp(), 10, 60);

// Get JSON input
$data = getJsonInput();
validateRequired($data, ['sync_id', 'device_id']);

// Validate sync_id format
if (!validateSyncId($data['sync_id'])) {
    sendError('Invalid sync_id format', 400);
}

// Validate device_id format
if (!validateDeviceId($data['device_id'])) {
    sendError('Invalid device_id format', 400);
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Get latest backup or specific version
    if (isset($data['backup_id'])) {
        // Validate backup_id format (36 char UUID)
        if (!preg_match('/^[a-f0-9]{36}$/i', $data['backup_id'])) {
            sendError('Invalid backup_id format', 400);
        }
        
        $stmt = $db->prepare("
            SELECT encrypted_blob, blob_hash, version, created_at
            FROM sync_backups
            WHERE backup_id = ? AND sync_id = ?
        ");
        $stmt->execute([$data['backup_id'], $data['sync_id']]);
    } else {
        // Get latest backup
        $stmt = $db->prepare("
            SELECT backup_id, encrypted_blob, blob_hash, version, created_at
            FROM sync_backups
            WHERE sync_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$data['sync_id']]);
    }
    
    $backup = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$backup) {
        sendError('No backup found', 404);
    }
    
    // Option to restore as current data
    if (isset($data['restore']) && $data['restore'] === true) {
        // Restore backup as current sync data
        $restoreStmt = $db->prepare("
            UPDATE sync_data 
            SET encrypted_blob = ?, 
                blob_hash = ?, 
                version = version + 1,
                device_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE sync_id = ?
        ");
        $restoreStmt->execute([
            $backup['encrypted_blob'],
            $backup['blob_hash'],
            $data['device_id'],
            $data['sync_id']
        ]);
        
        // Log restore action
        if (class_exists('AuditLogger')) {
            $auditLogger = new AuditLogger($db);
            $auditLogger->log('backup_restored', $data['sync_id'], $data['device_id'], [
                'backup_id' => $data['backup_id'] ?? $backup['backup_id'] ?? 'latest',
                'restored_version' => $backup['version']
            ]);
        }
        
        sendSuccess([
            'encrypted_blob' => $backup['encrypted_blob'],
            'blob_hash' => $backup['blob_hash'],
            'version' => $backup['version'],
            'created_at' => $backup['created_at'],
            'restored' => true
        ], 'Backup restored successfully');
    } else {
        // Just retrieve backup without restoring
        sendSuccess([
            'encrypted_blob' => $backup['encrypted_blob'],
            'blob_hash' => $backup['blob_hash'],
            'version' => $backup['version'],
            'created_at' => $backup['created_at'],
            'restored' => false
        ], 'Backup retrieved successfully');
    }
    
} catch (Exception $e) {
    error_log('Restore error: ' . $e->getMessage());
    sendError('Restore failed', 500);
}
?>