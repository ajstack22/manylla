# cPanel Database Setup for Manylla

## Manual Steps Required in cPanel

Since we cannot create databases via SSH on Namecheap's shared hosting, you need to create them through cPanel:

### 1. Login to cPanel
- Go to https://manylla.com:2083/ or your cPanel URL
- Login with your credentials

### 2. Create Qual Database
Navigate to **Databases → MySQL Databases**

1. **Create Database:**
   - Database name: `stachblx_manylla_sync_qual`
   
2. **Create User:**
   - Username: `stachblx_manylla_qual` 
   - Password: Generate a strong password (save it!)
   - Suggested: Use a password generator for 16+ characters

3. **Add User to Database:**
   - Add user `stachblx_manylla_qual` to database `stachblx_manylla_sync_qual`
   - Grant **ALL PRIVILEGES**

### 3. Create Production Database (for later)
Repeat the above steps for production:

1. **Database:** `stachblx_manylla_sync_prod`
2. **User:** `stachblx_manylla_prod`
3. **Password:** Generate different strong password
4. **Privileges:** ALL PRIVILEGES

### 4. Apply Database Schema

Once databases are created, SSH into the server and run:

```bash
# Connect via SSH (Namecheap uses port 21098)
ssh -p 21098 stachblx@manylla.com

# For Qual database
cd ~/public_html/qual/api/sync
mysql -u stachblx_manylla_qual -p'YOUR_PASSWORD' stachblx_manylla_sync_qual < setup_manylla_qual.sql

# For Production database (later)
cd ~/public_html/api/sync  
mysql -u stachblx_manylla_prod -p'YOUR_PASSWORD' stachblx_manylla_sync_prod < setup_manylla_prod.sql
```

### 5. Update Configuration Files

Update `/qual/api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'stachblx_manylla_sync_qual');
define('DB_USER', 'stachblx_manylla_qual');
define('DB_PASS', 'YOUR_QUAL_PASSWORD');
```

Update `/api/config.php` (production):
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'stachblx_manylla_sync_prod');
define('DB_USER', 'stachblx_manylla_prod');
define('DB_PASS', 'YOUR_PROD_PASSWORD');
```

## Database Structure

### Manylla Databases:
- `stachblx_manylla_sync_qual` - Staging/testing environment
- `stachblx_manylla_sync_prod` - Production environment

### Tables (Phase 3):
- `sync_groups` - Sync group metadata
- `sync_data` - Encrypted user data with versioning
- `sync_backups` - Versioned backups
- `sync_invites` - Invite codes for sync groups
- `share_links` - Temporary encrypted shares

## Security Notes

1. **Never commit passwords** to git
2. **Use different passwords** for qual and prod
3. **Backup databases** before major updates
4. **Monitor disk usage** - encrypted blobs can be large

## Testing

After setup, test the API:
```bash
curl https://manylla.com/qual/api/sync/health.php
```

Should return:
```json
{"success": true, "status": "healthy", "database": "connected"}
```