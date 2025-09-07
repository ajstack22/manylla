# Manual Database Schema Application for Phase 3

Since SSH connections are blocked from this environment, please follow these manual steps:

## SSH Connection
Since StackMap and Manylla are on the same server, use:

```bash
ssh stachblx@manylla.com
# or if you need a specific port:
ssh -p 22 stachblx@manylla.com
```

## Step-by-Step Instructions

### 1. Connect to the server
```bash
ssh stachblx@manylla.com
```

### 2. Navigate to Manylla's qual API sync directory
```bash
cd ~/public_html/qual/api/sync
```

### 3. Verify the schema file exists
```bash
ls -la schema.sql
```

### 4. Apply the Phase 3 database schema
```bash
mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual < schema.sql
```

### 5. Verify the tables were created/updated
```bash
mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual
```

Then run these SQL commands:
```sql
SHOW TABLES;
-- You should see: share_links, sync_backups, sync_data, sync_groups, sync_invites

DESCRIBE sync_data;
-- Should show new columns: encrypted_blob, blob_hash, version

DESCRIBE sync_backups;
-- This is a new table in Phase 3

EXIT;
```

## What Phase 3 Schema Adds

1. **Enhanced sync_data table**:
   - `encrypted_blob` (MEDIUMTEXT) - Stores full encrypted data
   - `blob_hash` (VARCHAR 64) - SHA-256 hash for integrity
   - `version` (INT) - Version tracking for updates

2. **New sync_backups table**:
   - Stores versioned backups of sync data
   - Allows restore to previous versions
   - Automatic cleanup of old backups

3. **Updated share_links table**:
   - Stores encrypted share data in database
   - No more localStorage dependency

## Testing After Schema Application

Once the schema is applied, test at https://manylla.com/qual:

1. **Test Share Creation**:
   - Open a profile
   - Click "Share" 
   - Generate a share link
   - Should work without errors now (recipientType issue is fixed)

2. **Test Sync**:
   - Go to Settings > Backup & Sync
   - Create a new sync group
   - Should save to database

3. **Check API endpoints**:
   ```bash
   # From your local machine, test the API
   curl https://manylla.com/qual/api/sync/health.php
   ```

## If Schema Application Fails

If you get errors during schema application, it might be because some tables already exist. In that case:

```bash
# Connect to MySQL
mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual

# Drop and recreate (CAUTION: This will delete existing data)
DROP TABLE IF EXISTS sync_backups;
DROP TABLE IF EXISTS sync_data;

# Then exit and reapply schema
EXIT;
mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual < schema.sql
```

## Production Deployment (Later)

When ready for production:
```bash
cd ~/public_html/api/sync
mysql -u stachblx_manyprod -p'[PROD_PASSWORD]' stachblx_manylla_sync_prod < schema.sql
```

## Summary

The application is already deployed with:
- ✅ Fixed recipientType error in share dialog
- ✅ Phase 3 code deployed to qual
- ⏳ Database schema needs to be applied manually

Once you apply the schema, Phase 3 Cloud Data Storage will be fully operational!