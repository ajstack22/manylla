# Manylla Database Setup Guide

## Overview

Manylla uses separate MySQL databases for qual (staging) and production environments, following the same pattern as StackMap. This ensures complete data isolation between environments.

## Database Structure

```
manylla_sync_qual/    # Staging database
manylla_sync_prod/    # Production database
```

Each database contains:
- `sync_data` - Stores encrypted profile backups
- `sync_shares` - Temporary share links with expiration
- `active_shares` - View for currently active shares

## Setup Instructions

### 1. Create Databases

#### Qual/Staging Database
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS stachblx_manylla_sync_qual;

-- Create user
CREATE USER 'stachblx_manylla_qual'@'localhost' 
IDENTIFIED BY 'your_secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON stachblx_manylla_sync_qual.* 
TO 'stachblx_manylla_qual'@'localhost';

FLUSH PRIVILEGES;
```

#### Production Database
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS stachblx_manylla_sync_prod;

-- Create user
CREATE USER 'stachblx_manylla_prod'@'localhost' 
IDENTIFIED BY 'different_secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON stachblx_manylla_sync_prod.* 
TO 'stachblx_manylla_prod'@'localhost';

FLUSH PRIVILEGES;
```

### 2. Create Tables

Run `api/sync/setup.sql` in each database:

```bash
# For qual database
mysql -u stachblx_manylla_qual -p stachblx_manylla_sync_qual < api/sync/setup.sql

# For production database
mysql -u stachblx_manylla_prod -p stachblx_manylla_sync_prod < api/sync/setup.sql
```

### 3. Configure Credentials

#### Update Qual Configuration
Edit `api/config/config.qual.php`:
```php
define('DB_NAME', 'stachblx_manylla_sync_qual');
define('DB_USER', 'stachblx_manylla_qual');
define('DB_PASS', 'your_qual_password_here'); // <-- Update this
```

#### Update Production Configuration
Edit `api/config/config.prod.php`:
```php
define('DB_NAME', 'stachblx_manylla_sync_prod');
define('DB_USER', 'stachblx_manylla_prod');
define('DB_PASS', 'your_prod_password_here'); // <-- Update this
```

### 4. Deploy Configuration

```bash
# Deploy to qual
./scripts/deploy-api-config.sh qual

# Deploy to production
./scripts/deploy-api-config.sh prod
```

## Environment Detection

The API automatically detects which environment it's running in:

- URLs containing `/qual/` → Uses qual database
- All other URLs → Uses production database
- Local development → Uses local database config

## File Structure

```
api/
├── config/
│   ├── config.php           # Environment detector
│   ├── config.qual.php      # Qual credentials
│   ├── config.prod.php      # Production credentials
│   ├── config.local.php     # Local dev credentials
│   └── database.php         # Database connection class
└── sync/
    ├── setup.sql            # Database schema
    ├── backup.php           # Store encrypted data
    └── restore.php          # Retrieve encrypted data
```

## Security Best Practices

1. **Never commit credentials** - All config.*.php files are gitignored
2. **Use strong passwords** - Different passwords for qual and prod
3. **Restrict permissions** - Config files are chmod 600 on server
4. **Encrypted data only** - Server never sees plaintext data
5. **Regular backups** - Database backups are automatic on deployment

## Testing

### Test Qual Environment
```bash
curl https://manylla.com/qual/api/sync/health.php
```

### Test Production Environment
```bash
curl https://manylla.com/api/sync/health.php
```

## Troubleshooting

### Database Connection Errors
1. Check credentials in config files
2. Verify database exists: `SHOW DATABASES;`
3. Check user permissions: `SHOW GRANTS FOR 'username'@'localhost';`
4. Review error logs: `api/logs/[env]_error.log`

### Environment Detection Issues
1. Check URL structure matches expected pattern
2. Verify config.php is deployed
3. Check Apache/PHP error logs

### Permission Errors
```bash
# Fix file permissions
ssh stackmap-cpanel
chmod 600 ~/public_html/manylla/api/config/config.*.php
chmod 755 ~/public_html/manylla/api/logs
```

## Maintenance

### Clean Up Expired Shares
```sql
-- Manual cleanup
DELETE FROM sync_shares 
WHERE expires_at < NOW();

-- Or use stored procedure
CALL cleanup_expired_shares();
```

### Monitor Usage
```sql
-- Check total profiles
SELECT COUNT(*) as total_profiles FROM sync_data;

-- Check active shares
SELECT COUNT(*) as active_shares FROM sync_shares 
WHERE expires_at > NOW();

-- Recent activity
SELECT recovery_hash, version, updated_at 
FROM sync_data 
ORDER BY updated_at DESC 
LIMIT 10;
```

## Rollback Procedure

If issues occur after deployment:

```bash
# Rollback production deployment
npm run deploy:prod rollback

# Restore database from backup (if needed)
mysql -u root -p stachblx_manylla_sync_prod < backup.sql
```

## Contact

For database access or server configuration, contact the system administrator.