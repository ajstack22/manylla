<?php
/**
 * Manylla Sync API - Backup Endpoint (Phase 3)
 * Creates a backup of encrypted sync data
 * 
 * POST /api/sync/backup.php
 * Body: {
 *   sync_id: string,
 *   device_id: string
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

// Apply rate limiting - 10 backups per minute
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
    
    // Get latest sync data
    $stmt = $db->prepare("
        SELECT encrypted_blob, blob_hash, version
        FROM sync_data
        WHERE sync_id = ?
    ");
    $stmt->execute([$data['sync_id']]);
    $syncData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$syncData) {
        sendError('No data to backup', 404);
    }
    
    // Generate unique backup ID
    $backupId = bin2hex(random_bytes(18)); // 36 char UUID
    
    // Create backup
    $backupStmt = $db->prepare("
        INSERT INTO sync_backups (
            backup_id, sync_id, encrypted_blob, 
            blob_hash, version, created_by
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $backupStmt->execute([
        $backupId,
        $data['sync_id'],
        $syncData['encrypted_blob'],
        $syncData['blob_hash'],
        $syncData['version'],
        $data['device_id']
    ]);
    
    // Log backup creation
    if (class_exists('AuditLogger')) {
        $auditLogger = new AuditLogger($db);
        $auditLogger->log('backup_created', $data['sync_id'], $data['device_id'], [
            'backup_id' => $backupId,
            'version' => $syncData['version']
        ]);
    }
    
    sendSuccess([
        'backup_id' => $backupId,
        'version' => $syncData['version'],
        'blob_hash' => $syncData['blob_hash'],
        'created_at' => date('Y-m-d H:i:s')
    ], 'Backup created successfully');
    
} catch (Exception $e) {
    error_log('Backup error: ' . $e->getMessage());
    sendError('Backup failed', 500);
}