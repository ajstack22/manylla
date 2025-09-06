# Deployment Checklist - Phase 3 to Qual
## Date: January 6, 2025

### Pre-Deployment Status
- [x] Phase 3 implementation complete
- [x] All backward compatibility removed
- [x] API endpoints updated for cloud storage
- [x] Frontend updated to use API directly
- [ ] Security audit (has dev dependency warnings only)

### Changes to Deploy

#### Backend (API)
1. **Enhanced Database Schema** (`api/sync/schema.sql`)
   - Updated sync_data table with blob storage
   - Added sync_backups table
   - Enhanced cleanup events

2. **Updated Endpoints**
   - `push_timestamp.php` - Now stores in database
   - `pull_timestamp.php` - Now retrieves from database
   - `backup.php` - Rewritten for Phase 3
   - `restore.php` - Rewritten for Phase 3
   - `cleanup.php` - New cleanup script

3. **Removed Features**
   - No more localStorage fallbacks
   - No backward compatibility

#### Frontend
1. **Updated Components**
   - `SharedView.tsx` - Uses API only
   - `ShareDialogOptimized.tsx` - Uses API only
   - `manyllaMinimalSyncService.js` - No fallbacks

2. **New Files**
   - `src/config/api.js` - API configuration
   - `test-phase3.js` - Testing script

### Deployment Steps

#### 1. Database Schema Update
```sql
-- Connect to qual database
-- Run: api/sync/schema.sql
```

#### 2. Deploy Application
```bash
# Using the deploy-qual.sh script
./scripts/deploy-qual.sh
```

This script will:
- Auto-increment version
- Commit changes to GitHub
- Build the application
- Deploy frontend to /qual
- Deploy API to /qual/api
- Update configurations

#### 3. Post-Deployment Testing
```bash
# Test API health
curl https://manylla.com/qual/api/sync/health.php

# Run Phase 3 tests (update API_BASE in test-phase3.js first)
node test-phase3.js
```

### Important Notes
1. **No Fallbacks**: The app now requires API to be working for sync/share features
2. **Database Required**: Phase 3 schema must be applied before deployment
3. **Breaking Changes**: Shares no longer use localStorage

### Rollback Plan
If issues occur:
1. Previous build is automatically backed up by deploy script
2. Can restore previous API version from Git
3. Database changes are additive (no data loss)

### Verification Checklist
- [ ] API health check passes
- [ ] Can create new shares
- [ ] Can access shares
- [ ] Sync push works
- [ ] Sync pull works
- [ ] Backup/restore works
- [ ] No console errors

### Contact
- Server: manylla.com
- SSH: adam@manylla.com
- Qual URL: https://manylla.com/qual
- API URL: https://manylla.com/qual/api