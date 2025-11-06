# User Files Directory

This directory stores encrypted file attachments for Manylla users.

## Structure

```
user-files/
├── .htaccess                          # Prevents direct web access
├── {hashed_sync_id}/                 # SHA-256 hash of user's recovery phrase
│   ├── {file_id_1}.enc               # Encrypted file (UUID v4 filename)
│   ├── {file_id_2}.enc
│   └── ...
└── {another_hashed_sync_id}/
    └── ...
```

## Security

- All files are encrypted client-side before upload (XSalsa20-Poly1305)
- Filenames are UUIDs (original names encrypted in database)
- Directory names are hashed recovery phrases (SHA-256)
- Direct web access blocked by .htaccess
- Files only accessible via authenticated API endpoint

## Permissions

- Directories: 0750 (rwxr-x---)
- Files: 0640 (rw-r-----)

## Quota

- Maximum 50MB per file
- Maximum 500MB total per user
- Enforced server-side during upload

## Cleanup

- Deleted files kept for 30 days (soft delete)
- Orphaned temp chunks cleaned after 24 hours
- See: api/cron/cleanup_orphaned_files.php
