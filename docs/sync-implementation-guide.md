# Manylla Sync Implementation Guide

## Overview
This document outlines the recommended sync architecture for Manylla based on analysis of StackMap's proven sync system and Manylla's specific requirements for special needs family data management.

## Core Principles
- **Offline-first**: Must work without internet (critical for emergencies)
- **Simple sync**: Last-write-wins, no complex merging
- **User control**: Manual conflict resolution when needed
- **Privacy-focused**: Zero-knowledge encryption maintained

## Architecture Decision: Simple Over Complex

### Why Not Full StackMap-Style Sync
After analyzing both systems, we determined that Manylla's use case differs significantly from StackMap:
- **Single primary editor** (usually one parent manages the profile)
- **Infrequent updates** (not like a task app with constant changes)
- **Read-heavy usage** (checking info vs editing)
- **Critical availability need** (must work offline in emergencies)

### Recommended Approach: Progressive Enhancement

## Phase 1: Basic Backup/Restore (Current Priority)

### Implementation
```typescript
// services/syncService.ts
interface BasicSyncService {
  // Manual backup to cloud
  backup: async () => {
    const profile = StorageService.getProfile();
    if (!profile) return;
    
    const encrypted = await encryptionService.encrypt(profile);
    const response = await api.post('/sync/backup', {
      blob: encrypted,
      version: Date.now(),
      deviceId: getDeviceId()
    });
    
    StorageService.setLastSyncTime(Date.now());
    return response.success;
  },
  
  // Manual restore from cloud
  restore: async () => {
    const response = await api.get('/sync/latest');
    if (!response.blob) return false;
    
    const decrypted = await encryptionService.decrypt(response.blob);
    return StorageService.saveProfile(decrypted);
  },
  
  // Check for updates (manual trigger)
  checkForUpdates: async () => {
    const localVersion = StorageService.getVersion();
    const response = await api.get('/sync/version');
    
    if (response.version > localVersion) {
      return {
        hasUpdate: true,
        localVersion,
        serverVersion: response.version
      };
    }
    return { hasUpdate: false };
  }
}
```

### UI Components Needed
- "Backup to Cloud" button in settings
- "Restore from Cloud" button with confirmation
- "Check for Updates" with manual download option
- Version indicator showing last sync time

## Phase 2: Auto-Check on Launch (After Basic Works)

### Implementation
```typescript
// Add to App.tsx useEffect
useEffect(() => {
  const checkSync = async () => {
    if (!navigator.onLine) return;
    
    const update = await syncService.checkForUpdates();
    if (update.hasUpdate) {
      setUpdateAvailable({
        local: update.localVersion,
        server: update.serverVersion
      });
    }
  };
  
  checkSync();
}, []);
```

### UI Components
- Toast notification: "Newer version available"
- Update dialog with "Download" / "Skip" options
- Conflict resolution: Show both versions, let user choose

## Phase 3: Mobile-Ready Sync (When Needed)

### Platform-Specific Fixes from StackMap
```typescript
// services/mobileSyncService.ts
import { Platform } from 'react-native';

class MobileSyncService extends BasicSyncService {
  // iOS-specific UTF-8 handling
  private encodeText(text: string): Uint8Array {
    if (Platform.OS === 'ios') {
      // Manual UTF-8 encoding (tweetnacl-util bug on iOS)
      const encoder = new TextEncoder();
      return encoder.encode(text);
    }
    return nacl.util.decodeUTF8(text);
  }
  
  // Android-specific delay handling
  private async saveWithDelay(data: any): Promise<void> {
    await AsyncStorage.setItem('profile', JSON.stringify(data));
    if (Platform.OS === 'android') {
      // Pixel Tablet issue workaround
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

### Compression (Only if Needed)
```typescript
// Only add if entries become large (photos/attachments)
import pako from 'pako';

const compress = (data: string): Uint8Array | string => {
  if (data.length < 1024) return data; // Skip small data
  return pako.deflate(data);
};
```

## Phase 4: Advanced Features (Only If Requested)

### What NOT to Implement Unless Users Ask
- **Field-level timestamps** - Overkill for single editor
- **Automatic merging** - Parents want control
- **Real-time sync** - Not needed for this use case
- **Collaborative editing** - Single primary caregiver typical

### If Multiple Editors Become Common
```typescript
// Only implement if users report lost updates
interface ConflictResolution {
  strategy: 'last-write-wins' | 'manual-merge',
  priorityCategories: ['emergency', 'medical'], // Always preserve these
  mergeWindow: 3000 // Within 3 seconds = likely same person
}
```

## Backend Requirements

### API Endpoints Needed
```php
// /api/sync/backup.php
POST: Store encrypted blob with version
Required: recovery_phrase_hash, encrypted_blob, version, device_id

// /api/sync/restore.php
GET: Retrieve latest encrypted blob
Required: recovery_phrase_hash
Returns: encrypted_blob, version, last_updated

// /api/sync/version.php
GET: Check latest version without downloading
Required: recovery_phrase_hash
Returns: version, last_updated, device_id
```

### Database Schema
```sql
CREATE TABLE sync_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recovery_hash VARCHAR(64) NOT NULL,
  encrypted_blob LONGTEXT NOT NULL,
  version BIGINT NOT NULL,
  device_id VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recovery_version (recovery_hash, version)
);
```

## Security Considerations

### Keep From Current Implementation
- TweetNaCl encryption (proven secure)
- Client-side only recovery phrases
- Zero-knowledge server architecture

### Upgrade When Adding Sync
- PBKDF2 with 100k iterations (from current basic derivation)
- Add salt to key derivation
- Version flag in encrypted data for future upgrades

## Testing Strategy

### Critical Test Cases
1. **Offline functionality** - App works without network
2. **Data integrity** - Encryption/decryption roundtrip
3. **Version conflicts** - User sees clear options
4. **Recovery phrase loss** - Clear warnings about data loss

### User Acceptance Criteria
- Parent can backup profile in < 3 taps
- Restore shows clear preview before overwriting
- Sync never happens without user consent
- Works offline in emergency room scenario

## Implementation Priority

### Do First (Tech Debt)
1. ✅ Centralized storage service
2. Error boundaries for crash protection
3. Loading states for async operations
4. Data validation on save/load

### Do Next (Basic Sync)
1. Backup/restore buttons in settings
2. Version tracking in storage service
3. Basic encryption service upgrade
4. Manual update checking

### Do Later (If Needed)
1. Auto-check on app launch
2. Compression for large data
3. Mobile platform handlers
4. Conflict resolution UI

## Success Metrics
- Zero data loss incidents
- < 5 second sync operations
- 100% offline availability
- User-initiated sync only (no surprises)

## References
- StackMap sync implementation: Proven mobile sync patterns
- Manylla current encryption: Working TweetNaCl implementation
- User feedback: Single editor, emergency access critical

---

**Remember**: Start simple with manual backup/restore. Only add complexity when users specifically request it. The goal is reliability and trust, not technical sophistication.