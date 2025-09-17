# Session 12: Storage & Persistence Testing Specification

**Date**: 2025-09-16
**Focus**: Test ProfileStorageService, cache management
**Primary Goal**: Data integrity and error recovery
**Expected Coverage**: +5% (targeting 24% → 29%)

## 🎯 EXECUTIVE SUMMARY

Session 12 focuses on testing the storage and persistence layer - critical components with 0% coverage. These services handle profile data persistence across web and mobile platforms.

## 📊 CURRENT STATE ANALYSIS

### Storage Service Files (ALL AT 0% COVERAGE)
```
src/services/
├── storageService.js              # 0% - Main storage service
├── webStorage.js                   # 0% - Web localStorage wrapper
└── storage/
    ├── ProfileStorageService.js   # 0% - Profile-specific storage
    ├── StorageAdapter.js          # 0% - Platform adapter
    └── storageService.js          # 0% - Duplicate/legacy?
```

### Critical Finding
**ALL storage services have 0% coverage** - this is a major testing gap for critical data persistence functionality.

## 🏗️ TESTING REQUIREMENTS

### 1. ProfileStorageService (Priority 1)
**File**: `src/services/storage/ProfileStorageService.js`
**Key Methods**:
- `saveProfiles()` - Persist profile data
- `loadProfiles()` - Retrieve stored profiles
- `deleteProfile()` - Remove profile data
- `clearAllData()` - Full data wipe
- Error handling for corrupted data

### 2. StorageAdapter (Priority 2)
**File**: `src/services/storage/StorageAdapter.js`
**Key Functions**:
- Platform detection (web vs mobile)
- localStorage vs AsyncStorage routing
- Fallback mechanisms
- Data migration between platforms

### 3. webStorage (Priority 3)
**File**: `src/services/webStorage.js`
**Key Methods**:
- `setItem()` - Store data with encryption
- `getItem()` - Retrieve and decrypt data
- `removeItem()` - Delete specific keys
- `clear()` - Clear all storage
- Storage quota handling

### 4. Main storageService
**File**: `src/services/storageService.js`
**Determine**: Is this active or legacy code?
- If active: Test core functionality
- If legacy: Skip or mark for removal

## 🎭 CRITICAL USER FLOWS

### Flow 1: Profile Save & Load
1. User creates/edits profile
2. Data persisted to storage
3. App restart/reload
4. Data successfully restored

### Flow 2: Data Corruption Recovery
1. Storage contains corrupted data
2. Load attempt detects corruption
3. Recovery mechanism activated
4. User notified, backup restored

### Flow 3: Storage Quota Exceeded
1. Storage approaching limit
2. Warning triggered
3. Old data pruned
4. Critical data preserved

### Flow 4: Platform Migration
1. User switches web ↔ mobile
2. Data export from platform A
3. Data import to platform B
4. Verification of data integrity

## 📋 SIMPLIFIED TEST PLAN

### Keep It Simple (Lessons from Sessions 10-11)
- Basic unit tests that actually run
- Mock storage APIs minimally
- Focus on happy paths first
- Add error cases incrementally
- No complex integration tests

### Test Implementation Strategy
```javascript
// Simple, working test pattern
describe('ProfileStorageService', () => {
  beforeEach(() => {
    // Minimal mocks
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
  });

  test('saves profiles to storage', async () => {
    const profiles = [{ id: '1', name: 'Test' }];
    await ProfileStorageService.saveProfiles(profiles);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'manylla_profiles',
      JSON.stringify(profiles)
    );
  });

  test('loads profiles from storage', async () => {
    const profiles = [{ id: '1', name: 'Test' }];
    localStorage.getItem.mockReturnValue(JSON.stringify(profiles));
    const result = await ProfileStorageService.loadProfiles();
    expect(result).toEqual(profiles);
  });
});
```

## 🎯 ACCEPTANCE CRITERIA

### Coverage Targets
- [ ] Overall coverage: 24% → 29% (+5%)
- [ ] ProfileStorageService: 0% → 70%+
- [ ] StorageAdapter: 0% → 60%+
- [ ] webStorage: 0% → 50%+
- [ ] No console.log/warn/error added

### Quality Requirements
- [ ] All tests pass first try
- [ ] No import errors
- [ ] Simple, maintainable tests
- [ ] Focus on actual functionality
- [ ] Team agreements followed

## 🚀 IMPLEMENTATION APPROACH

### Phase 1: Identify Active Services
1. Check which storage services are actually imported/used
2. Skip any legacy/unused code
3. Focus on actively used services

### Phase 2: Basic Happy Path Tests
1. Save and load operations
2. Update existing data
3. Delete operations
4. Clear all data

### Phase 3: Error Handling Tests
1. Corrupted data handling
2. Missing data handling
3. Storage quota errors
4. Platform-specific issues

### Phase 4: Verification
1. Run all tests
2. Check coverage metrics
3. Ensure no console violations
4. Verify build still works

## 📈 SUCCESS METRICS

### Quantitative
- Coverage: +5% increase minimum
- Tests: 30-40 simple tests
- Files: 3-4 storage services tested
- Pass rate: 100% on first run

### Qualitative
- Data integrity validated
- Error recovery tested
- Platform compatibility verified
- No regressions introduced

## 🔗 KEY LESSONS FROM PREVIOUS SESSIONS

### From Session 10 (Dialogs)
- Complex tests that don't run are worthless
- Import errors kill entire test suites
- Keep it simple

### From Session 11 (Sync)
- Console.warn/error count as violations
- Shallow "method exists" tests are padding
- Focus on actual functionality

### For Session 12
- Start with the simplest possible tests
- Verify imports before writing tests
- Mock only what's necessary
- Test real functionality, not just existence

---

**Implementation Note**: With all storage services at 0% coverage, this session has high potential for coverage gains. Focus on simple, working tests that validate actual storage operations.