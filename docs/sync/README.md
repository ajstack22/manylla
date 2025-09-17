# Manylla Backup & Sync System

## Recent Updates (January 2025)

Based on StackMap's latest implementation, we've incorporated:

### ✅ Conflict Resolution System
- Field-level conflict resolution with 3-second merge window
- Priority-based merging (medical info > general info)
- Automatic deduplication of medications, contacts, categories
- Validation of merged data structures

### ✅ iOS UTF-8 Compatibility  
- Manual UTF-8 encoding/decoding implementation
- Fixes tweetnacl-util issues on iOS devices
- Handles emoji and special characters correctly

### ✅ Enhanced Error Handling
- Comprehensive error logging with context
- Custom error events for UI feedback
- Graceful degradation on sync failures
- Better device ID generation with crypto.randomUUID

## Overview

Manylla implements a **zero-knowledge, encrypted backup system** that enables secure data synchronization across devices without server access to user data. Based on StackMap's proven sync architecture but optimized for Manylla's single-profile, low-frequency update pattern.

## Key Differences from StackMap

| Feature | StackMap | Manylla |
|---------|----------|---------|
| **Update Frequency** | Multiple daily | Weekly/Monthly |
| **Devices** | Many (whole family) | Few (parent's devices) |
| **Pull Interval** | 30 seconds | 60 seconds |
| **Primary Purpose** | Real-time collaboration | Backup & device switching |
| **Data Model** | Multiple users | Single profile |
| **Recovery Phrase** | 32-char hex | 32-char hex (same) |
| **Messaging** | "Sync" | "Backup" |

## Architecture

### Core Components

```
Frontend (React)
├── manyllaMinimalSyncService.js - Sync orchestrator (60-sec interval)
├── manyllaEncryptionService.js - TweetNaCl crypto with manual UTF-8
├── conflictResolver.js - NEW: Field-level conflict resolution
├── SyncContext.tsx - React context for sync state
└── SyncDialog.tsx - UI for backup management

Backend (PHP/MySQL - Future)
├── create_timestamp.php - Initialize backup group
├── push_timestamp.php - Store encrypted blob
├── pull_timestamp.php - Retrieve encrypted blob
└── join_timestamp.php - Join existing backup
└── MySQL: manylla_sync_data table (encrypted blobs only)
```

## Implementation Details

### 1. Recovery Phrase (Backup Code)

```javascript
// 32-character hex string (matches StackMap)
generateRecoveryPhrase() {
  const bytes = nacl.randomBytes(16);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
// Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 2. Key Derivation

```javascript
// 100,000 nacl.hash iterations (not PBKDF2)
deriveKeyFromPhrase(recoveryPhrase) {
  const fixedSalt = 'ManyllaSyncSalt2025';
  let key = encodeUTF8(recoveryPhrase + fixedSalt);
  
  for (let i = 0; i < 100000; i++) {
    key = nacl.hash(key);
  }
  
  return key.slice(0, 32); // 32-byte key
}
```

### 3. Sync Strategy

- **Pull**: Every 60 seconds + on app focus + manual button
- **Push**: Immediate on profile save (rare events)
- **Conflict Resolution**: NEW - Field-level merge with 3-sec window
  - Medical info takes priority
  - Automatic deduplication
  - Validates merged structure
- **Data**: Complete profile + entries + categories as single blob

### 4. Manual UTF-8 (iOS Compatibility)

```javascript
// Manual implementation for cross-platform support
encodeUTF8(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    if (char < 0x80) {
      bytes.push(char);
    } else if (char < 0x800) {
      bytes.push(0xc0 | (char >> 6));
      bytes.push(0x80 | (char & 0x3f));
    }
    // ... handle multi-byte chars
  }
  return new Uint8Array(bytes);
}
```

## User Experience

### Creating a Backup

1. Open Settings → Backup & Sync
2. Choose "Enable Backup on This Device"
3. System generates 32-character backup code
4. Save code in password manager
5. Data automatically backs up on changes

### Restoring on New Device

1. Open Settings → Backup & Sync
2. Choose "Restore from Backup"
3. Enter 32-character backup code
4. Data syncs within 60 seconds
5. Continue where you left off

### Parent-Friendly Messaging

- "Backup" instead of "Sync"
- "Backup Code" instead of "Recovery Phrase"
- Emphasis on security and privacy
- Clear instructions for password manager storage

## Security Model

### Zero-Knowledge Architecture
- **Client-side encryption**: Server never sees plaintext
- **nacl.secretbox**: Symmetric encryption (XSalsa20-Poly1305)
- **No accounts**: No user registration or personal info
- **Backup code only**: 32-char hex is the only credential

### Privacy Features
- All encryption happens on device
- Server stores only encrypted blobs
- No analytics or tracking
- Backup code never sent to server (only its hash)

## Current Implementation Status

### ✅ Completed
- manyllaMinimalSyncService.js with 60-second interval
- manyllaEncryptionService.js with manual UTF-8
- conflictResolver.js for field-level merging
- Enhanced error handling and logging
- Improved device ID generation
- Invite code system implementation
- SyncContext.tsx integration
- SyncDialog.tsx with backup code UI
- API endpoint templates (ready for deployment)
- localStorage fallback for initial release

### 🔄 In Progress
- Testing with multiple devices
- Documentation updates

### 📋 Future
- Backend API deployment
- Database setup
- Production server configuration

## API Endpoints (Future)

### POST /api/sync/create_timestamp.php
Creates new backup group for a recovery phrase.

### POST /api/sync/push_timestamp.php
Stores encrypted profile data.

### GET /api/sync/pull_timestamp.php
Retrieves latest encrypted data since timestamp.

### POST /api/sync/join_timestamp.php
Joins existing backup group with recovery phrase.

## Testing

### Local Testing
```javascript
// 1. Enable backup
const { recoveryPhrase } = await enableSync(true);

// 2. Make profile changes
updateProfile({ name: 'Updated Name' });

// 3. Verify push happened
// Check console for '[ManyllaSync] Pushing data...'

// 4. Simulate second device
await enableSync(false, recoveryPhrase);

// 5. Verify pull within 60 seconds
// Check console for '[ManyllaSync] Pulling data...'
```

## Troubleshooting

### "Backup not working"
1. Check browser console for [ManyllaSync] logs
2. Verify localStorage not full
3. Try manual sync button
4. Check backup code is correct (32 chars, 0-9, a-f)

### "Can't restore backup"
1. Verify backup code format
2. Check network connection
3. Try manual sync after entering code
4. Wait up to 60 seconds for automatic sync

## Comparison with Share System

| Feature | Backup/Sync | Share |
|---------|------------|-------|
| Purpose | Device sync | Temporary access |
| Duration | Permanent | Time-limited |
| Access | Backup code | Share link |
| Updates | Live sync | Snapshot only |
| Encryption | Always | Always |
| Recipients | Self only | Anyone with link |

## License & Credits

Based on StackMap's sync architecture with adaptations for Manylla's specific use case. Uses TweetNaCl for encryption and follows zero-knowledge principles.

---

*Last Updated: January 2025*
*Version: 1.0 (localStorage implementation)*