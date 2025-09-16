# S042 - Test Coverage for Sync Services (P1)

**Status**: Ready
**Type**: Test Implementation
**Effort**: Large (40h+)
**Coverage Target**: 80%+ for sync services, +20% overall

## Context
Sync services are critical security components handling encryption and data synchronization. Current coverage is insufficient for such critical code. This story will add comprehensive tests to achieve 80%+ coverage.

## Requirements for Adversarial Review
1. Achieve 80%+ coverage for ALL sync services
2. Test encryption/decryption edge cases
3. Test network failure scenarios
4. Test conflict resolution logic
5. Mock external dependencies properly
6. Overall coverage increase ≥20%
7. All tests must be meaningful (not padding)
8. Performance tests for encryption operations

## Implementation Steps

### 0. Cleanup Existing Test Debt
```bash
# Fix or remove broken existing tests
# Files with issues:
# - Remove tests that reference non-existent methods
# - Fix import paths
# - Update mock configurations
# - Establish clean baseline

# Run existing tests to identify failures
npm test -- src/services/sync --no-coverage

# Document and fix each failure before adding new tests
```

### 1. Current State Analysis
```bash
# Check current coverage
npm test -- --coverage src/services/sync

# Files to cover:
# - src/services/sync/manyllaEncryptionService.js
# - src/services/sync/manyllaMinimalSyncService.js
# - src/services/sync/manyllaMinimalSyncServiceWeb.js
# - src/services/sync/manyllaMinimalSyncServiceNative.js
# - src/services/sync/photoSyncExclusion.js
# - src/services/sync/index.js

# Current baseline: ~33% overall, sync services coverage TBD
# Target: 80%+ for sync services, 50%+ overall
```

### 2. Test Categories Required

#### A. Encryption Service Tests
```javascript
describe('ManyllaEncryptionService', () => {
  describe('Key Derivation', () => {
    it('should derive consistent keys from same recovery phrase');
    it('should handle invalid recovery phrases');
    it('should use correct iteration count (100,000)');
    it('should handle empty/null phrases');
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt data correctly');
    it('should handle large data (>1MB)');
    it('should handle special characters and UTF-8');
    it('should handle empty data');
    it('should produce different ciphertext for same plaintext');
  });

  describe('iOS Compatibility', () => {
    it('should use manual UTF-8 encoding for iOS');
    it('should handle emoji and special unicode');
    it('should match StackMap encryption format');
  });

  describe('Error Handling', () => {
    it('should handle corrupted ciphertext');
    it('should handle wrong keys gracefully');
    it('should handle malformed base64');
  });

  describe('Performance', () => {
    it('should encrypt 1MB in <100ms');
    it('should derive keys in <500ms');
  });
});
```

#### B. Sync Service Tests
```javascript
describe('ManyllaMinimalSyncService', () => {
  describe('Push Operations', () => {
    it('should push encrypted data to server');
    it('should handle network failures with retry');
    it('should validate data before push');
    it('should handle 413 payload too large');
    it('should update last sync timestamp');
  });

  describe('Pull Operations', () => {
    it('should pull and decrypt data');
    it('should handle 60-second interval correctly');
    it('should merge with local changes');
    it('should handle empty server response');
    it('should validate decrypted data structure');
  });

  describe('Conflict Resolution', () => {
    it('should use last-write-wins strategy');
    it('should preserve user data on conflicts');
    it('should handle version mismatches');
    it('should log conflicts for debugging');
  });

  describe('Share System', () => {
    it('should create temporary shares');
    it('should expire shares after timeout');
    it('should handle share URL format');
    it('should encrypt share data separately');
  });

  describe('Error Recovery', () => {
    it('should handle API errors gracefully');
    it('should fallback to local on sync failure');
    it('should queue failed pushes');
    it('should validate recovery phrases');
  });
});
```

#### C. Platform-Specific Tests
```javascript
describe('Platform Compatibility', () => {
  describe('Web Implementation', () => {
    it('should use localStorage for web');
    it('should handle storage quota exceeded');
    it('should work with service workers');
  });

  describe('Native Implementation', () => {
    it('should use AsyncStorage for native');
    it('should handle iOS keychain');
    it('should handle Android secure storage');
  });
});
```

### 3. Mock Requirements
```javascript
// API Mocks
jest.mock('../../utils/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  handleResponse: jest.fn()
}));

// Storage Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}));

// Crypto Mocks (careful - some tests need real crypto)
// Use real nacl for encryption tests
// Mock for network/storage tests
```

### 4. Edge Cases to Test
- Recovery phrase with spaces/special chars
- Data exactly at size limits
- Rapid push/pull sequences
- Clock skew between client/server
- Partial encryption failures
- Network interruption mid-sync
- Corrupted localStorage
- Browser private mode restrictions
- React Native bridge failures

### 5. Test Data Fixtures
```javascript
// fixtures/syncTestData.js
export const testProfiles = {
  minimal: { /* single profile */ },
  maxSize: { /* 100 profiles with photos */ },
  specialChars: { /* UTF-8, emoji, etc */ },
  corrupted: { /* invalid structure */ }
};

export const testRecoveryPhrases = {
  valid: '1234567890abcdef1234567890abcdef',
  invalid: 'too-short',
  spaces: '  1234567890abcdef1234567890abcdef  ',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};
```

## Validation Commands
```bash
# Coverage before
npm test -- --coverage src/services/sync > coverage-before.txt

# Run new tests
npm test -- src/services/sync --coverage

# Coverage after (must show 80%+ for sync, 20%+ overall increase)
npm test -- --coverage > coverage-after.txt

# Check for meaningful tests (not just coverage padding)
grep -c "expect(" src/services/sync/__tests__/*.test.js

# Performance tests
npm test -- --testNamePattern="Performance"

# Integration tests
npm test -- --testNamePattern="Integration"
```

## Success Criteria for Peer Review
- [ ] Coverage ≥80% for ALL sync service files
- [ ] Overall coverage increased by ≥20%
- [ ] All critical paths tested
- [ ] Error scenarios thoroughly tested
- [ ] Mocks properly configured
- [ ] No flaky tests
- [ ] Performance benchmarks met
- [ ] Tests are meaningful (multiple assertions per test)
- [ ] Edge cases covered

## Developer Context
You're testing the most critical security component. Focus on:
- Real-world failure scenarios
- Security edge cases
- Performance under load
- Platform-specific issues
- Making tests that would catch real bugs

## Peer Reviewer Validation Script
```bash
#!/bin/bash
echo "=== SYNC SERVICES TEST COVERAGE VALIDATION ==="

# Check coverage for sync services
COVERAGE=$(npm test -- --coverage src/services/sync 2>/dev/null | grep -A 20 "File" | grep "sync")
echo "$COVERAGE"

# Extract coverage percentage
SYNC_COVERAGE=$(echo "$COVERAGE" | awk '{print $4}' | sed 's/%//' | head -1)

# Check overall coverage increase
BEFORE=$(cat coverage-before.txt | grep "All files" | awk '{print $4}')
AFTER=$(npm test -- --coverage 2>/dev/null | grep "All files" | awk '{print $4}')

echo "Sync services coverage: ${SYNC_COVERAGE}%"
echo "Overall coverage: ${BEFORE} -> ${AFTER}"

# Check test quality
TEST_COUNT=$(find src/services/sync -name "*.test.js" -exec grep -c "it(" {} \; | paste -sd+ | bc)
EXPECT_COUNT=$(find src/services/sync -name "*.test.js" -exec grep -c "expect(" {} \; | paste -sd+ | bc)

echo "Tests written: $TEST_COUNT"
echo "Assertions: $EXPECT_COUNT"
echo "Assertions per test: $(($EXPECT_COUNT / $TEST_COUNT))"

if [ "$SYNC_COVERAGE" -lt 80 ]; then
  echo "❌ REJECTED: Sync coverage below 80%"
  exit 1
fi

if [ $(($EXPECT_COUNT / $TEST_COUNT)) -lt 2 ]; then
  echo "❌ REJECTED: Tests lack meaningful assertions"
  exit 1
fi

echo "✅ Sync services test coverage validated"
```

## Test Quality Standards
- Minimum 2-3 assertions per test
- Each test should test ONE behavior
- Use descriptive test names
- Group related tests in describe blocks
- Include both positive and negative cases
- Mock external dependencies
- Test actual business logic, not mocks

## Integration Test Requirements
At least one full integration test:
```javascript
it('should complete full sync cycle', async () => {
  // 1. Create data
  // 2. Encrypt
  // 3. Push to server
  // 4. Pull from server
  // 5. Decrypt
  // 6. Verify data integrity
});
```

## Notes
- This is P1 because sync is critical infrastructure
- Tests must be comprehensive - this is security-critical code
- Consider adding performance benchmarks
- Document any discovered bugs for separate fixing
- Peer Reviewer will thoroughly validate test quality