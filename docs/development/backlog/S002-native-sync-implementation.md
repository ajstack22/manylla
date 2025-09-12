# Story S002: Native Sync Service Implementation

## Overview
Implement complete cloud sync functionality for React Native mobile apps, achieving feature parity with the web implementation. The native sync service currently has TODO placeholders and needs full implementation to enable multi-device support on mobile platforms.

## Status
- **Priority**: P1 (High)
- **Status**: READY
- **Created**: 2025-09-12
- **Type**: Tech Debt - Mobile Feature Gap
- **Assigned**: Unassigned

## Background
The native sync service (`manyllaMinimalSyncServiceNative.js`) contains TODO comments indicating incomplete implementation. This blocks mobile app deployment and creates feature parity issues between web and mobile platforms. The web sync is fully operational with working API endpoints and stable database structure.

### Current Impact
- Mobile apps cannot sync data
- No multi-device support on mobile
- Share system doesn't work on mobile
- Users stuck with local-only storage on phones

## Requirements

### 1. Core Sync Functionality
- Implement push to server for React Native
- Implement pull from server for React Native
- Handle sync conflicts (last-write-wins)
- Support background sync on both platforms

### 2. Mobile-Specific Features
- Handle intermittent connectivity
- Queue sync operations when offline
- Retry failed operations with exponential backoff
- Provide offline/online indicators

### 3. Platform Integration
- iOS: Implement background task handling
- Android: Implement background service
- Handle app suspension/resume events
- Respect battery optimization settings

### 4. Security & Storage
- Use AsyncStorage for recovery phrase
- Implement secure storage for sensitive data
- Handle encryption/decryption properly
- Validate server responses

## Success Metrics
```bash
# Verify sync service implementation
grep -r "TODO.*sync" src/services/sync/ | wc -l  # Should be 0

# Test sync functionality
npm test -- sync.test.js  # All tests pass

# Verify API calls work
curl -X POST https://manylla.com/qual/api/sync_push.php  # Returns success
curl -X GET https://manylla.com/qual/api/sync_pull.php   # Returns data

# Check mobile builds
npx react-native run-ios     # Sync works on iOS
npx react-native run-android # Sync works on Android
```

## Implementation Guidelines

### Phase 1: Core Implementation
1. Copy web sync logic to native service
2. Replace fetch with React Native compatible networking
3. Integrate with AsyncStorage for persistence
4. Add proper error handling

### Phase 2: Mobile Optimization
1. Add network state monitoring
2. Implement offline queue
3. Add retry logic with backoff
4. Create sync status indicators

### Phase 3: Background Processing
1. iOS: Use BackgroundFetch API
2. Android: Use Headless JS
3. Test background sync thoroughly
4. Handle edge cases (app killed, etc.)

## Acceptance Criteria
- [ ] All TODOs removed from native sync service
- [ ] Push/pull functionality working on iOS
- [ ] Push/pull functionality working on Android
- [ ] Offline queue implemented and tested
- [ ] Background sync operational
- [ ] Network error handling robust
- [ ] Recovery phrase storage secure
- [ ] Sync status visible to users
- [ ] All sync tests passing
- [ ] No regressions in web sync

## Technical Details

### Key Files to Modify
```javascript
// src/services/sync/manyllaMinimalSyncServiceNative.js
// Current structure to maintain:
class ManyllaMinimalSyncServiceNative {
  async push(encryptedData, recoveryPhrase) {
    // TODO: Implement actual push to server
  }
  
  async pull(recoveryPhrase) {
    // TODO: Implement actual pull from server
  }
}
```

### API Endpoints (Already Working)
- POST `/api/sync_push.php` - Push encrypted data
- GET `/api/sync_pull.php` - Pull encrypted data
- POST `/api/share_create.php` - Create share
- GET `/api/share_access.php` - Access share

## Dependencies
- React Native NetInfo for network monitoring
- AsyncStorage for data persistence
- Background Fetch (iOS) / Headless JS (Android)
- Existing web sync implementation as reference

## Estimated Effort
- Research: 4 hours (study web implementation)
- Implementation: 16 hours (core sync + mobile features)
- Testing: 8 hours (iOS + Android + edge cases)
- **Total**: Large (28 hours)

## Risk Mitigation
- Test thoroughly on both platforms before release
- Implement feature flag to disable if issues arise
- Monitor error rates after deployment
- Have rollback plan ready

## Notes
- Web implementation in `manyllaMinimalSyncService.js` serves as reference
- API endpoints already tested and stable
- Database structure proven with web implementation
- Consider using React Native Firebase for future enhancement

---
*Story ID: S002*
*Created: 2025-09-12*
*Converted from: docs/prompts/active/06-native-sync-implementation.md*