# Tech Debt: Native Sync Service Implementation

## Story ID: 011
## Priority: 06 (High)
## Type: Tech Debt - Mobile Feature Gap

## Background

The native sync service (`manyllaMinimalSyncServiceNative.js`) contains TODO comments indicating incomplete implementation. This blocks mobile app deployment and creates feature parity issues between web and mobile platforms. The service needs to implement actual cloud sync for React Native environments.

## Current State

### Incomplete Implementation:
```javascript
// Current TODOs in manyllaMinimalSyncServiceNative.js:
// TODO: Implement actual push to server when API is ready
// TODO: Implement actual pull from server when API is ready
```

### Impact:
- Mobile apps cannot sync data
- No multi-device support on mobile
- Share system doesn't work on mobile
- Users stuck with local-only storage on phones

### Existing Web Implementation Works:
- Web sync service fully operational
- API endpoints tested and working
- Database structure proven stable

## Requirements

### Primary Goal
Implement complete cloud sync functionality for React Native, achieving feature parity with web implementation while handling mobile-specific challenges.

### Mobile-Specific Considerations

1. **Network Reliability**
   - Handle intermittent connectivity
   - Queue sync operations when offline
   - Retry failed operations
   - Provide offline indicators

2. **Background Sync**
   - Implement background task for iOS
   - Implement background service for Android
   - Handle app suspension/resume
   - Respect battery optimization

3. **Storage Integration**
   - Use AsyncStorage for queue persistence
   - Handle storage limits
   - Implement cleanup strategies
   - Maintain encryption keys securely

## Implementation Tasks

### Phase 1: Core Sync Implementation

1. **Update manyllaMinimalSyncServiceNative.js**
   ```javascript
   import NetInfo from '@react-native-community/netinfo';
   
   class ManyllaMinimalSyncServiceNative {
     constructor() {
       this.syncQueue = [];
       this.isOnline = true;
       this.setupNetworkListener();
     }
     
     async push(encryptedData) {
       if (this.isOnline) {
         return await this.pushToServer(encryptedData);
       } else {
         return await this.queueForSync('push', encryptedData);
       }
     }
     
     async pushToServer(encryptedData) {
       const response = await fetch(`${API_BASE}/sync_push.php`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           backup_code: this.backupCode,
           encrypted_data: encryptedData,
           client_version: '2.0',
           platform: Platform.OS
         })
       });
       
       if (!response.ok) {
         throw new Error(`Sync failed: ${response.status}`);
       }
       
       return await response.json();
     }
   }
   ```

2. **Implement Offline Queue**
   ```javascript
   class OfflineQueue {
     async add(operation, data) {
       const queue = await this.getQueue();
       queue.push({
         id: generateId(),
         operation,
         data,
         timestamp: Date.now(),
         retries: 0
       });
       await AsyncStorage.setItem('@sync_queue', JSON.stringify(queue));
     }
     
     async process() {
       const queue = await this.getQueue();
       for (const item of queue) {
         try {
           await this.executeOperation(item);
           await this.removeFromQueue(item.id);
         } catch (error) {
           await this.handleRetry(item);
         }
       }
     }
   }
   ```

3. **Network State Management**
   ```javascript
   setupNetworkListener() {
     NetInfo.addEventListener(state => {
       const wasOffline = !this.isOnline;
       this.isOnline = state.isConnected && state.isInternetReachable;
       
       if (wasOffline && this.isOnline) {
         this.processOfflineQueue();
       }
       
       this.emitNetworkStatus(this.isOnline);
     });
   }
   ```

### Phase 2: Background Sync

1. **iOS Background Task**
   ```javascript
   import BackgroundFetch from 'react-native-background-fetch';
   
   export const configureBackgroundSync = () => {
     BackgroundFetch.configure({
       minimumFetchInterval: 15, // minutes
       stopOnTerminate: false,
       startOnBoot: true,
       enableHeadless: true
     }, async (taskId) => {
       await syncService.performBackgroundSync();
       BackgroundFetch.finish(taskId);
     }, (taskId) => {
       BackgroundFetch.finish(taskId);
     });
   };
   ```

2. **Android Background Service**
   ```javascript
   import BackgroundService from 'react-native-background-actions';
   
   const syncTask = async () => {
     await BackgroundService.updateNotification({
       taskDesc: 'Syncing your data...'
     });
     
     await syncService.performBackgroundSync();
   };
   
   export const startBackgroundSync = async () => {
     await BackgroundService.start(syncTask, {
       taskName: 'Manylla Sync',
       taskTitle: 'Syncing Data',
       taskDesc: 'Keeping your profiles up to date',
       taskIcon: { name: 'ic_launcher', type: 'mipmap' },
       linkingURI: 'manylla://sync',
       parameters: { delay: 60000 }
     });
   };
   ```

### Phase 3: Error Handling & Recovery

1. **Implement Retry Logic**
   ```javascript
   async retryWithBackoff(operation, maxRetries = 3) {
     let lastError;
     
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await operation();
       } catch (error) {
         lastError = error;
         const delay = Math.min(1000 * Math.pow(2, i), 10000);
         await new Promise(resolve => setTimeout(resolve, delay));
       }
     }
     
     throw lastError;
   }
   ```

2. **Conflict Resolution**
   ```javascript
   async resolveConflict(localData, serverData) {
     // Last-write-wins strategy (matching web)
     const localTimestamp = localData.lastModified;
     const serverTimestamp = serverData.lastModified;
     
     if (localTimestamp > serverTimestamp) {
       await this.push(localData);
       return localData;
     } else {
       await this.saveLocal(serverData);
       return serverData;
     }
   }
   ```

### Phase 4: User Feedback

1. **Sync Status Indicators**
   ```javascript
   export const SyncStatus = {
     IDLE: 'idle',
     SYNCING: 'syncing',
     SUCCESS: 'success',
     ERROR: 'error',
     OFFLINE: 'offline'
   };
   
   class SyncStatusManager {
     emitStatus(status, details = {}) {
       EventEmitter.emit('syncStatus', { status, ...details });
     }
     
     showNotification(message, type = 'info') {
       if (Platform.OS === 'ios') {
         Alert.alert('Sync Status', message);
       } else {
         ToastAndroid.show(message, ToastAndroid.SHORT);
       }
     }
   }
   ```

2. **Progress Tracking**
   ```javascript
   async syncWithProgress(profiles) {
     const total = profiles.length;
     let completed = 0;
     
     for (const profile of profiles) {
       await this.syncProfile(profile);
       completed++;
       this.emitProgress(completed, total);
     }
   }
   ```

## Testing Requirements

### Unit Tests
```javascript
describe('ManyllaMinimalSyncServiceNative', () => {
  test('queues operations when offline');
  test('processes queue when coming online');
  test('retries failed operations');
  test('handles network errors gracefully');
  test('maintains data integrity');
});
```

### Integration Tests
```javascript
describe('Native Sync Integration', () => {
  test('syncs data between devices');
  test('handles app suspension');
  test('recovers from crashes');
  test('respects battery optimization');
});
```

### Manual Testing Checklist
- [ ] Test with airplane mode
- [ ] Test with slow connection
- [ ] Test with connection drops
- [ ] Test background sync on iOS
- [ ] Test background sync on Android
- [ ] Test app kill and restart
- [ ] Test battery saver mode
- [ ] Test with large data sets

## Acceptance Criteria

1. **Feature Parity**
   - All web sync features work on mobile
   - Share system functional
   - Multi-device sync operational

2. **Reliability**
   - Handles offline scenarios
   - Recovers from errors
   - No data loss

3. **Performance**
   - Sync completes in < 5 seconds
   - Background sync doesn't drain battery
   - Minimal data usage

4. **User Experience**
   - Clear sync status indicators
   - Helpful error messages
   - Seamless offline/online transition

## Implementation Order

1. Core sync methods (push/pull)
2. Offline queue system
3. Network state management
4. Error handling and retry
5. Background sync for iOS
6. Background sync for Android
7. User feedback systems
8. Testing and refinement

## Native Dependencies

```json
{
  "dependencies": {
    "@react-native-community/netinfo": "^9.0.0",
    "react-native-background-fetch": "^4.0.0",
    "react-native-background-actions": "^3.0.0"
  }
}
```

## Platform-Specific Configuration

### iOS (Info.plist)
```xml
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
  <string>remote-notification</string>
</array>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

## Risk Mitigation

1. **Data Loss**: Implement robust queue persistence
2. **Battery Drain**: Use exponential backoff
3. **API Compatibility**: Match web service exactly
4. **Platform Differences**: Abstract platform-specific code

## Success Metrics

- Mobile sync success rate > 95%
- Background sync works on both platforms
- No data loss reports
- Battery impact < 2%
- User satisfaction with sync

## Documentation Updates

1. Update README with mobile sync setup
2. Document background sync configuration
3. Add troubleshooting guide
4. Create sync architecture diagram

## Notes

- Priority is high due to mobile deployment blocker
- Leverage existing web implementation patterns
- Consider adding sync analytics
- Plan for future selective sync feature
- Keep encryption consistent with web

## Estimated Effort

- Core implementation: 2 days
- Background sync: 1 day
- Testing & debugging: 2 days
- Platform-specific fixes: 1 day

**Total: ~1 week of focused development**

---

*Created: 2025-01-11*
*Story Type: Tech Debt - Feature Gap*
*Priority: High (blocks mobile deployment)*