# Session 11: Sync Services Core Testing Specification

**Date**: 2025-09-16
**Focus**: Test manyllaMinimalSyncService (web/native)
**Primary Goal**: Encryption, conflict resolution, sync operations
**Expected Coverage**: +6% (targeting 23.99% → 29.99%)

## 🎯 EXECUTIVE SUMMARY

Session 11 focuses on testing the core sync services that power Manylla's zero-knowledge encrypted multi-device synchronization. These services are critical for data integrity and security.

## 📊 CURRENT STATE ANALYSIS

### Sync Service Architecture
```
src/services/sync/
├── manyllaMinimalSyncService.js       # Main entry point (router)
├── manyllaMinimalSyncServiceWeb.js    # Web implementation
├── manyllaMinimalSyncServiceNative.js # Native implementation
├── manyllaEncryptionService.js        # Encryption/decryption
├── conflictResolver.js                # Conflict resolution
└── photoSyncExclusion.js              # Photo sync handling
```

### Existing Test Coverage
- `manyllaEncryptionService`: Has comprehensive tests (41+ test cases)
- `manyllaMinimalSyncServiceWeb`: Has comprehensive tests
- `conflictResolver`: Has basic tests
- `photoSyncExclusion`: Has tests (30 passing)
- **Gap**: Integration tests between services

## 🏗️ TESTING REQUIREMENTS

### 1. Core Sync Operations
**File**: `manyllaMinimalSyncService.js`
- Platform detection and routing
- Service initialization
- Method delegation to platform-specific implementations

### 2. Encryption Service
**File**: `manyllaEncryptionService.js`
**Current Coverage**: Good (existing tests)
**Additional Testing Needed**:
- Edge cases for malformed data
- Performance with large datasets
- Key derivation edge cases
- Recovery phrase validation

### 3. Web Sync Service
**File**: `manyllaMinimalSyncServiceWeb.js`
**Key Methods to Test**:
- `initialize()` - Setup and key management
- `enable()` - Enable sync with recovery phrase
- `push()` - Push encrypted data to server
- `pull()` - Pull and decrypt data from server
- `disable()` - Clean up sync state

### 4. Native Sync Service
**File**: `manyllaMinimalSyncServiceNative.js`
**Similar to Web but with**:
- AsyncStorage integration
- React Native specific error handling
- Platform-specific photo handling

### 5. Conflict Resolution
**File**: `conflictResolver.js`
**Test Scenarios**:
- Last-write-wins strategy
- Merge conflicts for profile data
- Category conflict resolution
- Entry deduplication

## 🎭 CRITICAL USER FLOWS

### Flow 1: Enable Sync
1. User generates recovery phrase
2. Service derives encryption key
3. Initial data encrypted and pushed
4. Sync state persisted

### Flow 2: Join Existing Sync
1. User enters recovery phrase
2. Service validates phrase format
3. Pull existing data from server
4. Decrypt and merge with local data

### Flow 3: Sync Conflict Resolution
1. Pull detects newer remote data
2. Conflict resolver compares timestamps
3. Merge strategy applied
4. Resolved data saved locally

### Flow 4: Disable Sync
1. User disables sync
2. Local sync state cleared
3. Recovery phrase removed
4. Data remains encrypted locally

## 📋 TEST IMPLEMENTATION PLAN

### Priority 1: Integration Tests
Create integration tests that verify the complete sync flow:
- Enable → Push → Pull → Disable cycle
- Conflict resolution during pull
- Encryption/decryption round trips
- Error recovery scenarios

### Priority 2: Edge Cases
- Invalid recovery phrases (wrong length, invalid chars)
- Network failures during push/pull
- Corrupted encrypted data
- Large profile datasets (100+ entries)
- Concurrent sync operations

### Priority 3: Security Tests
- Key derivation consistency
- Encryption strength validation
- No plaintext leaks in errors
- Recovery phrase security

### Priority 4: Performance Tests
- Sync time for various data sizes
- Memory usage during encryption
- Key derivation performance
- Batch operations efficiency

## 🧪 TESTING STRATEGY

### Test Organization
```
src/services/sync/__tests__/
├── integration/
│   ├── syncFlow.test.js           # Complete sync workflows
│   ├── conflictResolution.test.js # Conflict scenarios
│   └── errorRecovery.test.js      # Error handling
├── manyllaMinimalSyncService.test.js  # Router tests
└── security.test.js                    # Security validations
```

### Mock Strategy
1. **API Mocks**: Mock fetch for push/pull operations
2. **Storage Mocks**: Mock AsyncStorage for native
3. **Crypto Mocks**: Use real crypto for security tests
4. **Time Mocks**: Control timestamps for conflict tests

### Test Patterns
```javascript
// Integration test pattern
describe('Sync Flow Integration', () => {
  let syncService;

  beforeEach(() => {
    syncService = new ManyllaMinimalSyncService();
    // Reset mocks
  });

  test('complete enable-push-pull-disable cycle', async () => {
    // 1. Enable with new phrase
    const phrase = await syncService.enable();
    expect(phrase).toMatch(/^[a-f0-9]{32}$/);

    // 2. Push data
    const pushResult = await syncService.push(testData);
    expect(pushResult.success).toBe(true);

    // 3. Pull data
    const pullResult = await syncService.pull();
    expect(pullResult).toEqual(testData);

    // 4. Disable
    await syncService.disable();
    expect(await syncService.isEnabled()).toBe(false);
  });
});
```

## 🎯 ACCEPTANCE CRITERIA

### Coverage Targets
- [ ] Overall coverage increase of +6% (to ~30%)
- [ ] Sync service files at 70%+ coverage
- [ ] Integration tests covering all user flows
- [ ] Security tests validating encryption

### Quality Criteria
- [ ] All critical paths tested
- [ ] Error scenarios handled
- [ ] Performance benchmarks established
- [ ] No console.logs in production code
- [ ] Tests follow team agreements

### Functional Requirements
- [ ] Enable/disable sync tested
- [ ] Push/pull operations verified
- [ ] Conflict resolution validated
- [ ] Encryption round-trips confirmed
- [ ] Recovery phrase management tested

## 🚀 IMPLEMENTATION APPROACH

### Phase 1: Setup Integration Test Structure
- Create integration test directory
- Setup comprehensive mocks
- Establish test utilities

### Phase 2: Core Flow Tests
- Enable sync flow
- Push/pull operations
- Disable sync flow
- Recovery phrase validation

### Phase 3: Conflict & Error Tests
- Conflict resolution scenarios
- Network error handling
- Data corruption recovery
- Concurrent operation handling

### Phase 4: Security & Performance
- Encryption validation
- Key derivation tests
- Performance benchmarks
- Memory usage tests

## 📈 SUCCESS METRICS

### Quantitative
- Coverage: +6% increase achieved
- Tests: 30+ new test cases
- Flows: 4 complete user flows tested
- Performance: Benchmarks established

### Qualitative
- Critical sync operations validated
- Security measures verified
- Error handling robust
- Integration points tested

## 🔗 REFERENCES

### Service Files
- `src/services/sync/manyllaMinimalSyncService.js` - Router
- `src/services/sync/manyllaMinimalSyncServiceWeb.js` - Web implementation
- `src/services/sync/manyllaMinimalSyncServiceNative.js` - Native implementation
- `src/services/sync/manyllaEncryptionService.js` - Encryption
- `src/services/sync/conflictResolver.js` - Conflict resolution

### Related Sessions
- Session 3: Encryption service tests
- Session 12: Storage & Persistence
- Session 13: Context Providers (SyncContext)

---

**Implementation Note**: Focus on integration tests that validate the complete sync flow rather than unit tests for individual methods. The sync service is critical for data integrity, so comprehensive testing is essential.