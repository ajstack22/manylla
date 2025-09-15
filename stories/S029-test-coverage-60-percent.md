# Story S029: Implement Real Integration Tests to Achieve 60% Code Coverage

## Story Header
- **Story ID**: S029
- **Title**: Implement Real Integration Tests to Achieve 60% Code Coverage
- **Priority**: P0 (Blocking deployment)
- **Epic**: Testing and Quality Assurance
- **Type**: TESTING
- **Status**: READY
- **Estimated Hours**: 40-60 hours (XL effort)
- **Created**: 2025-09-14
- **Assigned**: Unassigned

## Current State Analysis

### Exact Coverage Numbers (As of 2025-09-14)
From `npm run test:coverage` output:
```
All files                            | 20.91 | 13.93 | 15.63 | 21.07 |
```
**Global Coverage**: Statements: 20.91%, Branches: 13.93%, Functions: 15.63%, Lines: 21.07%

**CRITICAL FINDING**: Current coverage is actually 20.91%, NOT the 3.5% mentioned. However, this is still far below the 60% target and failing the 7% deployment threshold in some categories (branches: 13.93%).

### Coverage by Directory
```
src/                                 |       0 |        0 |       0 |       0 |
src/components                       |       0 |        0 |       0 |       0 |
src/services                         |   (varies by component)
src/context                          |   (partially covered)
src/utils                            |   (partially covered)
```

### Files with 0% Coverage That Have "Tests"
Based on coverage analysis, many components have 0% coverage despite test files existing:
1. **UnifiedApp.js** - 0% coverage (main app component)
2. **UnifiedAddDialog.js** - 0% coverage (critical data entry)
3. **ShareDialogOptimized.js** - 0% coverage (sharing functionality)
4. **SyncDialog.js** - 0% coverage (sync setup)
5. **ProfileCard.js** - 0% coverage (profile display)
6. **BottomSheetMenu.js** - 0% coverage (navigation)
7. **ThemeSwitcher.js** - 10.71% coverage (theme switching)
8. **DatePicker.js** - 0% coverage (date input)
9. **ErrorBoundary.js** - 0% coverage (error handling)

### Bad Mocking Patterns Currently in Use
Analysis of existing test files reveals several bad patterns:

1. **Shallow Mocking** in `manyllaEncryptionService.basic.test.js`:
```javascript
// ❌ BAD: Mock returns same value regardless of input
jest.mock("tweetnacl", () => ({
  hash: jest.fn((input) => new Uint8Array(64).fill(2)), // Always returns same hash
  secretbox: jest.fn((plaintext, nonce, key) => new Uint8Array(plaintext.length + 16))
}));
```

2. **No Real Behavior Testing** in component tests:
```javascript
// ❌ BAD: Only tests if component renders, no behavior
it('renders without crashing', () => {
  render(<Component />);
  expect(screen.getByTestId('component')).toBeInTheDocument();
});
```

3. **Overly Aggressive Mocking** in `SyncContext.test.js`:
```javascript
// ❌ BAD: Mocks everything, tests nothing real
jest.mock("../../services/sync/manyllaMinimalSyncService", () => ({
  init: jest.fn(async () => true), // Always succeeds
  push: jest.fn(async () => ({ success: true })), // Always succeeds
}));
```

### Total Source Files vs Test Files
- **Total Source Files**: 112 (excluding tests)
- **Existing Test Files**: 19
- **Coverage Ratio**: Only 17% of source files have any test coverage

## Acceptance Criteria (Extremely Specific)

### Minimum Coverage Targets
- [ ] **Global Statements**: >= 60% (currently 20.91%)
- [ ] **Global Branches**: >= 60% (currently 13.93%)
- [ ] **Global Functions**: >= 60% (currently 15.63%)
- [ ] **Global Lines**: >= 60% (currently 21.07%)

### Critical Files That MUST Have Coverage
- [ ] `src/components/UnifiedApp.js`: >= 70% (main app component)
- [ ] `src/services/sync/manyllaEncryptionService.js`: >= 80% (security critical)
- [ ] `src/services/sync/manyllaMinimalSyncServiceWeb.js`: >= 80% (data sync)
- [ ] `src/context/SyncContext.tsx`: >= 75% (sync state management)
- [ ] `src/context/ThemeContext.tsx`: >= 75% (theme state)
- [ ] `src/components/Dialogs/UnifiedAddDialog.js`: >= 65% (data entry)
- [ ] `src/components/Sharing/ShareDialogOptimized.js`: >= 65% (sharing)
- [ ] `src/components/Profile/ProfileCard.js`: >= 60% (profile display)
- [ ] `src/components/Navigation/BottomToolbar.js`: >= 60% (navigation)
- [ ] `src/utils/validation.js`: >= 85% (data validation)

### Specific Test Types Required
- [ ] **Unit Tests**: Individual function testing for all utilities
- [ ] **Integration Tests**: Component interaction testing
- [ ] **User Journey Tests**: Complete workflow testing (create profile → add entry → share)
- [ ] **Error Path Tests**: Network failures, validation errors, storage failures
- [ ] **Edge Case Tests**: Empty data, null values, invalid inputs

### Performance Requirements
- [ ] Test suite execution time increase < 100ms from current baseline
- [ ] Individual test files complete in < 10 seconds
- [ ] `npm run test:ci` completes in < 3 minutes

## Technical Implementation Guide

### Phase 1: Infrastructure & High-Value Services (Target: +25% coverage)

#### 1.1 Fix Existing Test Infrastructure (2-3 hours)
1. **Update jest.setup.js** with proper mocks:
```javascript
// Add real behavior mocks instead of simple stubs
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock crypto for encryption tests
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn(() => new Uint8Array(32).map(() => Math.floor(Math.random() * 256))),
    subtle: {
      importKey: jest.fn(),
      exportKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    }
  }
});
```

2. **Create test utility library** at `src/test/utils/component-test-utils.js`:
```javascript
export const renderWithProviders = (component, options = {}) => {
  const { initialSyncState, initialTheme } = options;

  return render(
    <ThemeProvider theme={theme}>
      <SyncProvider initialState={initialSyncState}>
        <ThemeProvider value={initialTheme}>
          {component}
        </ThemeProvider>
      </SyncProvider>
    </ThemeProvider>
  );
};

export const mockApiResponse = (endpoint, response, delay = 0) => {
  global.fetch.mockImplementation((url) => {
    if (url.includes(endpoint)) {
      return Promise.resolve({
        ok: true,
        json: () => new Promise(resolve =>
          setTimeout(() => resolve(response), delay)
        ),
      });
    }
    return Promise.reject(new Error(`Unexpected API call to ${url}`));
  });
};
```

#### 1.2 Real Encryption Service Tests (8-10 hours)
**Target File**: `src/services/sync/manyllaEncryptionService.js` (currently has mock tests)

**New Test File**: `src/services/sync/__tests__/manyllaEncryptionService.real.test.js`

**Test Categories**:
1. **Real Encryption/Decryption Flows**:
```javascript
describe('Real Encryption Workflows', () => {
  test('should encrypt and decrypt actual profile data', async () => {
    const profileData = createTestProfileData();

    await service.init(TEST_RECOVERY_PHRASE);
    const encrypted = service.encryptData(profileData);
    const decrypted = service.decryptData(encrypted);

    expect(decrypted).toEqual(profileData);
    expect(encrypted).not.toEqual(profileData);
    expect(typeof encrypted).toBe('string');
  });

  test('should handle large profile data (>100KB)', async () => {
    const largeProfile = createLargeTestProfile(150000); // 150KB

    await service.init(TEST_RECOVERY_PHRASE);
    const startTime = Date.now();
    const encrypted = service.encryptData(largeProfile);
    const decrypted = service.decryptData(encrypted);
    const endTime = Date.now();

    expect(decrypted).toEqual(largeProfile);
    expect(endTime - startTime).toBeLessThan(1000); // < 1 second
  });
});
```

2. **Key Derivation Edge Cases**:
```javascript
describe('Key Derivation Security', () => {
  test('should produce different keys for different phrases', async () => {
    const result1 = await service.deriveKeyFromPhrase('phrase1');
    const result2 = await service.deriveKeyFromPhrase('phrase2');

    expect(result1.syncId).not.toBe(result2.syncId);
    expect(result1.salt).not.toBe(result2.salt);
  });

  test('should consistently derive same key from same phrase', async () => {
    const result1 = await service.deriveKeyFromPhrase('test-phrase', 'fixed-salt');
    const result2 = await service.deriveKeyFromPhrase('test-phrase', 'fixed-salt');

    expect(result1.syncId).toBe(result2.syncId);
    expect(result1.key).toEqual(result2.key);
  });
});
```

3. **Error Handling and Recovery**:
```javascript
describe('Error Handling', () => {
  test('should handle corrupted encrypted data gracefully', () => {
    service.masterKey = new Uint8Array(32);

    expect(() => service.decryptData('corrupted-data')).toThrow('Decryption failed');
    expect(() => service.decryptData('')).toThrow('Invalid encrypted data');
    expect(() => service.decryptData(null)).toThrow('Invalid encrypted data');
  });

  test('should handle storage quota exceeded', async () => {
    const mockStorage = {
      setItem: jest.fn().mockRejectedValue(new Error('QuotaExceededError')),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Test graceful handling of storage errors
    await expect(service.saveToStorage('test', mockStorage)).resolves.toBe(false);
  });
});
```

#### 1.3 Real Sync Service Tests (8-10 hours)
**Target File**: `src/services/sync/manyllaMinimalSyncServiceWeb.js`

**New Test File**: `src/services/sync/__tests__/manyllaMinimalSyncServiceWeb.real.test.js`

**Test Categories**:
1. **API Integration Tests** (using dev environment):
```javascript
describe('Real API Integration', () => {
  test('should complete full sync workflow with dev API', async () => {
    process.env.API_ENV = 'dev';

    const testProfile = createTestProfileData();

    // Initialize sync
    await service.init(TEST_RECOVERY_PHRASE);

    // Push data
    const pushResult = await service.pushData(testProfile);
    expect(pushResult.success).toBe(true);

    // Pull data
    const pulledData = await service.pullData();
    expect(pulledData).toEqual(testProfile);
  });

  test('should handle network failures gracefully', async () => {
    // Mock network failure
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await service.pushData(createTestProfileData());
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });
});
```

2. **Data Conflict Resolution**:
```javascript
describe('Conflict Resolution', () => {
  test('should handle last-write-wins conflicts', async () => {
    const profile1 = createTestProfileData();
    const profile2 = { ...profile1, name: 'Updated Name', lastModified: Date.now() + 1000 };

    await service.pushData(profile1);
    await service.pushData(profile2);

    const result = await service.pullData();
    expect(result.name).toBe('Updated Name');
  });
});
```

#### 1.4 Context Provider Real Tests (6-8 hours)
**Target Files**:
- `src/context/SyncContext.tsx` (extend existing)
- `src/context/ThemeContext.tsx` (extend existing)

**Enhanced SyncContext Tests**:
```javascript
describe('Real SyncContext Workflows', () => {
  test('should handle complete sync setup workflow', async () => {
    const onProfileReceived = jest.fn();

    render(
      <SyncProvider onProfileReceived={onProfileReceived}>
        <TestConsumer />
      </SyncProvider>
    );

    // Generate recovery phrase
    fireEvent.click(screen.getByTestId('generate-phrase'));
    await waitFor(() => {
      expect(screen.getByTestId('recovery-phrase')).toHaveTextContent(/^[a-f0-9]{32}$/);
    });

    // Enable sync
    fireEvent.click(screen.getByTestId('enable-sync'));
    await waitFor(() => {
      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
    });

    // Push profile data
    const testProfile = createTestProfileData();
    fireEvent.click(screen.getByTestId('push-data'));

    await waitFor(() => {
      expect(ManyllaMinimalSyncService.pushData).toHaveBeenCalledWith(testProfile);
    });
  });

  test('should handle sync errors and recovery', async () => {
    // Mock sync failure then success
    ManyllaMinimalSyncService.enableSync
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce(true);

    render(
      <SyncProvider>
        <TestConsumer />
      </SyncProvider>
    );

    // First attempt fails
    fireEvent.click(screen.getByTestId('enable-sync'));
    await waitFor(() => {
      expect(screen.getByTestId('sync-status')).toHaveTextContent('error');
    });

    // Second attempt succeeds
    fireEvent.click(screen.getByTestId('enable-sync'));
    await waitFor(() => {
      expect(screen.getByTestId('sync-status')).toHaveTextContent('active');
    });
  });
});
```

### Phase 2: Core Component Integration Tests (Target: +20% coverage)

#### 2.1 UnifiedApp Component Tests (6-8 hours)
**Target File**: `src/components/UnifiedApp.js` (currently 0% coverage)

**New Test File**: `src/components/__tests__/UnifiedApp.test.js`

**Test Categories**:
1. **App Initialization**:
```javascript
describe('UnifiedApp Initialization', () => {
  test('should render with default profile state', () => {
    renderWithProviders(<UnifiedApp />);

    expect(screen.getByTestId('unified-app')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-toolbar')).toBeInTheDocument();
  });

  test('should load existing profiles from storage', async () => {
    const mockProfiles = [createTestProfileData(), createTestProfileData()];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProfiles));

    renderWithProviders(<UnifiedApp />);

    await waitFor(() => {
      expect(screen.getAllByTestId('profile-card')).toHaveLength(2);
    });
  });
});
```

2. **Profile Management Workflows**:
```javascript
describe('Profile Management', () => {
  test('should create new profile through workflow', async () => {
    renderWithProviders(<UnifiedApp />);

    // Open create dialog
    fireEvent.click(screen.getByTestId('add-profile-button'));
    await waitFor(() => {
      expect(screen.getByTestId('profile-create-dialog')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/profile name/i), {
      target: { value: 'Test Child' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  test('should handle profile deletion', async () => {
    const mockProfiles = [createTestProfileData()];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProfiles));

    renderWithProviders(<UnifiedApp />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    });

    // Delete profile
    fireEvent.click(screen.getByTestId('delete-profile-button'));
    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
    });
  });
});
```

#### 2.2 Critical Dialog Tests (8-10 hours)
**Target Files**:
- `src/components/Dialogs/UnifiedAddDialog.js` (0% coverage)
- `src/components/Sharing/ShareDialogOptimized.js` (0% coverage)

**UnifiedAddDialog Tests**:
```javascript
describe('UnifiedAddDialog Real Workflows', () => {
  test('should add entry with all field types', async () => {
    const mockProfile = createTestProfileData();
    const onSave = jest.fn();

    renderWithProviders(
      <UnifiedAddDialog
        open={true}
        profile={mockProfile}
        onSave={onSave}
        onClose={jest.fn()}
      />
    );

    // Fill text field
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Medical Appointment' }
    });

    // Add markdown content
    fireEvent.change(screen.getByTestId('markdown-editor'), {
      target: { value: '**Doctor**: Dr. Smith\n\n*Notes*: Regular checkup' }
    });

    // Select category
    fireEvent.click(screen.getByTestId('category-select'));
    fireEvent.click(screen.getByText('Medical'));

    // Save entry
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Medical Appointment',
          content: expect.stringContaining('Dr. Smith'),
          category: 'Medical'
        })
      );
    });
  });

  test('should validate required fields', async () => {
    renderWithProviders(<UnifiedAddDialog open={true} />);

    // Try to save without title
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  test('should handle markdown preview toggle', async () => {
    renderWithProviders(<UnifiedAddDialog open={true} />);

    // Enter markdown
    fireEvent.change(screen.getByTestId('markdown-editor'), {
      target: { value: '# Heading\n\n**Bold text**' }
    });

    // Toggle preview
    fireEvent.click(screen.getByTestId('preview-toggle'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading');
      expect(screen.getByText('Bold text')).toHaveStyle('font-weight: bold');
    });
  });
});
```

### Phase 3: Navigation and Layout Tests (Target: +10% coverage)

#### 3.1 Navigation Component Tests (4-6 hours)
**Target Files**:
- `src/components/Navigation/BottomToolbar.js` (extend existing)
- `src/components/Navigation/BottomSheetMenu.js` (0% coverage)

**BottomSheetMenu Tests**:
```javascript
describe('BottomSheetMenu Interactions', () => {
  test('should open and close menu with animations', async () => {
    renderWithProviders(<BottomSheetMenu />);

    // Menu starts closed
    expect(screen.queryByTestId('menu-content')).not.toBeInTheDocument();

    // Open menu
    fireEvent.click(screen.getByTestId('menu-trigger'));

    await waitFor(() => {
      expect(screen.getByTestId('menu-content')).toBeInTheDocument();
    });

    // Close by clicking backdrop
    fireEvent.click(screen.getByTestId('menu-backdrop'));

    await waitFor(() => {
      expect(screen.queryByTestId('menu-content')).not.toBeInTheDocument();
    });
  });

  test('should navigate to different sections', async () => {
    const mockNavigate = jest.fn();
    renderWithProviders(<BottomSheetMenu navigate={mockNavigate} />);

    fireEvent.click(screen.getByTestId('menu-trigger'));

    await waitFor(() => {
      expect(screen.getByTestId('menu-content')).toBeInTheDocument();
    });

    // Click settings
    fireEvent.click(screen.getByText(/settings/i));

    expect(mockNavigate).toHaveBeenCalledWith('settings');
  });
});
```

### Phase 4: Utility Functions and Edge Cases (Target: +5% coverage)

#### 4.1 Validation Utility Tests (3-4 hours)
**Target File**: `src/utils/validation.js` (currently low coverage)

**Test Categories**:
```javascript
describe('Validation Edge Cases', () => {
  test('should validate profile data completely', () => {
    const validProfile = createTestProfileData();
    expect(validateProfile(validProfile)).toBe(true);

    // Test each required field
    expect(validateProfile({ ...validProfile, name: '' })).toBe(false);
    expect(validateProfile({ ...validProfile, id: null })).toBe(false);
    expect(validateProfile({ ...validProfile, entries: null })).toBe(false);
  });

  test('should validate entry data with all field types', () => {
    const validEntry = createTestEntry();
    expect(validateEntry(validEntry)).toBe(true);

    // Test markdown content
    const markdownEntry = { ...validEntry, content: '# Heading\n\n**Bold**' };
    expect(validateEntry(markdownEntry)).toBe(true);

    // Test empty content
    expect(validateEntry({ ...validEntry, content: '' })).toBe(false);
  });

  test('should sanitize input data', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });
});
```

## Critical Files Priority List (with reasoning)

### Top 10 Files That Need Coverage Most Urgently

1. **`src/components/UnifiedApp.js`** (Current: 0%, Target: 70%)
   - **Why Critical**: Main application component, orchestrates entire app
   - **Impact**: 90% of users interact with this component
   - **Test Priority**: Profile management, state persistence, error boundaries

2. **`src/services/sync/manyllaEncryptionService.js`** (Current: ~40%, Target: 80%)
   - **Why Critical**: Zero-knowledge encryption, data security
   - **Impact**: All user data depends on this for security
   - **Test Priority**: Real encryption/decryption, key derivation, error handling

3. **`src/services/sync/manyllaMinimalSyncServiceWeb.js`** (Current: ~50%, Target: 80%)
   - **Why Critical**: Multi-device sync, data persistence
   - **Impact**: Data loss prevention, cloud backup
   - **Test Priority**: API integration, conflict resolution, network failures

4. **`src/components/Dialogs/UnifiedAddDialog.js`** (Current: 0%, Target: 65%)
   - **Why Critical**: Primary data entry point for all user content
   - **Impact**: 100% of data creation flows through this
   - **Test Priority**: Form validation, markdown editing, category selection

5. **`src/context/SyncContext.tsx`** (Current: ~66%, Target: 75%)
   - **Why Critical**: Global sync state management
   - **Impact**: Sync status affects entire app behavior
   - **Test Priority**: State transitions, error recovery, persistence

6. **`src/components/Sharing/ShareDialogOptimized.js`** (Current: 0%, Target: 65%)
   - **Why Critical**: Core sharing functionality, privacy controls
   - **Impact**: Primary feature for data sharing between users
   - **Test Priority**: Share creation, access controls, QR codes

7. **`src/utils/validation.js`** (Current: ~25%, Target: 85%)
   - **Why Critical**: Data integrity, input sanitization
   - **Impact**: Prevents data corruption and XSS attacks
   - **Test Priority**: Edge cases, malicious input, data types

8. **`src/components/Profile/ProfileCard.js`** (Current: 0%, Target: 60%)
   - **Why Critical**: Primary UI for profile display and interaction
   - **Impact**: Main interface for profile management
   - **Test Priority**: Edit actions, data display, responsive behavior

9. **`src/components/Navigation/BottomToolbar.js`** (Current: ~10%, Target: 60%)
   - **Why Critical**: Primary navigation component
   - **Impact**: All user navigation depends on this
   - **Test Priority**: Navigation actions, state management, responsive design

10. **`src/context/ThemeContext.tsx`** (Current: ~66%, Target: 75%)
    - **Why Critical**: Global theme state, accessibility
    - **Impact**: Affects entire app appearance and accessibility
    - **Test Priority**: Theme switching, persistence, system theme detection

## Testing Patterns Library

### 1. Encryption Service Testing Pattern
```javascript
// src/services/sync/__tests__/serviceTemplate.test.js
import EncryptionService from '../serviceFile';

describe('EncryptionService Real Implementation', () => {
  beforeEach(async () => {
    // Reset service state
    await EncryptionService.clear();
  });

  test('should encrypt and decrypt real data', async () => {
    const testData = { sensitive: 'information', array: [1, 2, 3] };

    await EncryptionService.init('test-recovery-phrase');
    const encrypted = EncryptionService.encryptData(testData);
    const decrypted = EncryptionService.decryptData(encrypted);

    expect(decrypted).toEqual(testData);
    expect(encrypted).not.toEqual(testData);
    expect(typeof encrypted).toBe('string');
  });

  test('should handle encryption errors gracefully', async () => {
    // Test without initialization
    expect(() => EncryptionService.encryptData({})).toThrow('Encryption not initialized');

    // Test with corrupted data
    await EncryptionService.init('test-phrase');
    expect(() => EncryptionService.decryptData('corrupted')).toThrow('Decryption failed');
  });
});
```

### 2. API Integration Testing Pattern
```javascript
// src/services/__tests__/apiTemplate.test.js
import ApiService from '../apiService';

describe('ApiService Integration', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('should handle successful API response', async () => {
    const mockResponse = { success: true, data: { id: '123' } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await ApiService.postData({ test: 'data' });

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ test: 'data' }),
      })
    );
  });

  test('should handle network failures', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(ApiService.postData({})).rejects.toThrow('Network error');
  });

  test('should handle HTTP error responses', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    await expect(ApiService.postData({})).rejects.toThrow('HTTP 400: Bad Request');
  });
});
```

### 3. React Component Testing Pattern
```javascript
// src/components/__tests__/componentTemplate.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentName from '../ComponentName';
import { renderWithProviders } from '../../test/utils/component-test-utils';

describe('ComponentName', () => {
  test('should render with required props', () => {
    renderWithProviders(<ComponentName requiredProp="value" />);

    expect(screen.getByTestId('component-name')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  test('should handle user interactions', async () => {
    const mockCallback = jest.fn();
    renderWithProviders(<ComponentName onAction={mockCallback} />);

    fireEvent.click(screen.getByRole('button', { name: /action/i }));

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  test('should handle error states', () => {
    renderWithProviders(<ComponentName error="Test error message" />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('should handle loading states', () => {
    renderWithProviders(<ComponentName loading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('component-content')).not.toBeInTheDocument();
  });
});
```

### 4. Context Provider Testing Pattern
```javascript
// src/context/__tests__/contextTemplate.test.js
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { ContextProvider, useContext } from '../ContextFile';

const TestConsumer = ({ onContextUpdate }) => {
  const context = useContext();

  React.useEffect(() => {
    if (onContextUpdate) {
      onContextUpdate(context);
    }
  }, [context, onContextUpdate]);

  return (
    <div>
      <div data-testid="context-state">{JSON.stringify(context.state)}</div>
      <button data-testid="action-button" onClick={context.action}>
        Action
      </button>
    </div>
  );
};

describe('ContextProvider', () => {
  test('should provide initial state', () => {
    let capturedContext;

    render(
      <ContextProvider>
        <TestConsumer onContextUpdate={(ctx) => (capturedContext = ctx)} />
      </ContextProvider>
    );

    expect(capturedContext.state).toEqual(expectedInitialState);
  });

  test('should update state through actions', async () => {
    render(
      <ContextProvider>
        <TestConsumer />
      </ContextProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('action-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('context-state')).toHaveTextContent(expectedUpdatedState);
    });
  });
});
```

### 5. Utility Function Testing Pattern
```javascript
// src/utils/__tests__/utilityTemplate.test.js
import { utilityFunction } from '../utilityFile';

describe('utilityFunction', () => {
  test('should handle valid input correctly', () => {
    const input = { valid: 'data' };
    const result = utilityFunction(input);

    expect(result).toEqual(expectedOutput);
  });

  test('should handle edge cases', () => {
    // Empty input
    expect(utilityFunction({})).toEqual(defaultOutput);

    // Null input
    expect(utilityFunction(null)).toEqual(defaultOutput);

    // Undefined input
    expect(utilityFunction(undefined)).toEqual(defaultOutput);

    // Large input
    const largeInput = new Array(10000).fill('test').join('');
    expect(utilityFunction(largeInput)).toBeDefined();
  });

  test('should validate input and throw appropriate errors', () => {
    expect(() => utilityFunction('invalid')).toThrow('Expected object, got string');
    expect(() => utilityFunction(-1)).toThrow('Value must be positive');
    expect(() => utilityFunction({ malformed: true })).toThrow('Invalid format');
  });

  test('should handle asynchronous operations', async () => {
    const result = await utilityFunction(asyncInput);

    expect(result).resolves.toEqual(expectedAsyncOutput);
  });
});
```

## Adversarial Review Preparation

### Checklist Developer Must Complete Before Submission

#### Pre-Submission Verification Commands
```bash
# 1. Run full test suite and verify coverage
npm run test:coverage > coverage-report.txt
grep "All files" coverage-report.txt  # Must show >= 60% on all metrics

# 2. Verify CI environment passes
npm run test:ci
echo "Exit code: $?"  # Must be 0

# 3. Check for test quality (no padding)
grep -r "expect.*toBeInTheDocument" src/**/*.test.js | wc -l  # Should be substantial
grep -r "toMatchSnapshot" src/ || echo "No snapshot tests found (good)"

# 4. Verify no regressions
npm run lint  # Must pass
npm run typecheck  # Must pass
npm run build:web  # Must succeed

# 5. Performance check
time npm run test:ci  # Note execution time

# 6. Check test file count
find src -name "*.test.js" | wc -l  # Should show significant increase

# 7. Verify critical file coverage
npm run test:coverage | grep "UnifiedApp.js"  # Must show >= 70%
npm run test:coverage | grep "manyllaEncryptionService.js"  # Must show >= 80%
```

#### Required Documentation Artifacts
1. **APPROACH.md** - Testing strategy and decisions
2. **coverage-before.txt** - Coverage report before implementation
3. **coverage-after.txt** - Coverage report after implementation
4. **test-run-output.txt** - Complete test suite execution log
5. **verification-commands.txt** - All verification commands with outputs

### Common Rejection Reasons to Avoid

1. **Coverage Padding**:
   - ❌ Tests that only call functions without meaningful assertions
   - ❌ Tests that mock everything and test nothing real
   - ❌ Duplicate tests with different names

2. **Insufficient Edge Case Testing**:
   - ❌ No error handling tests
   - ❌ No null/undefined input tests
   - ❌ No network failure simulation

3. **Poor Test Quality**:
   - ❌ Tests that test implementation details instead of behavior
   - ❌ Tests with hard-coded expectations that break easily
   - ❌ Tests that don't clean up after themselves

4. **Missing Integration Testing**:
   - ❌ Only unit tests without component interaction tests
   - ❌ No user workflow testing
   - ❌ No cross-component state sharing tests

### Evidence to Include in Submission Report

#### Coverage Evidence
```bash
# Before and after comparison
echo "BEFORE IMPLEMENTATION:"
cat coverage-before.txt | grep "All files"

echo "AFTER IMPLEMENTATION:"
cat coverage-after.txt | grep "All files"

echo "IMPROVEMENT:"
# Calculate and show percentage point improvements
```

#### Test Quality Evidence
```bash
# Count of meaningful test assertions
grep -r "expect(" src/**/*.test.js | grep -v "toBeInTheDocument" | wc -l

# User interaction tests
grep -r "fireEvent\|userEvent" src/**/*.test.js | wc -l

# Error handling tests
grep -r "toThrow\|rejects" src/**/*.test.js | wc -l

# Integration tests (multi-component)
grep -r "renderWithProviders" src/**/*.test.js | wc -l
```

#### Performance Evidence
```bash
# Test execution time
time npm run test:ci 2>&1 | tee test-performance.txt

# Individual slow tests (>5 seconds)
npm test -- --verbose 2>&1 | grep -E "(PASS|FAIL).*\([0-9]+ms\)" | grep -E "\([5-9][0-9]{3,}ms\|\([1-9][0-9]{4,}ms\)"
```

## Success Metrics

### Exact Coverage Numbers Required
```bash
# Global coverage targets (ALL must be met):
Statements   : 60.00% minimum (currently 20.91%)
Branches     : 60.00% minimum (currently 13.93%)
Functions    : 60.00% minimum (currently 15.63%)
Lines        : 60.00% minimum (currently 21.07%)

# Critical file targets:
src/components/UnifiedApp.js                                : 70%
src/services/sync/manyllaEncryptionService.js              : 80%
src/services/sync/manyllaMinimalSyncServiceWeb.js           : 80%
src/context/SyncContext.tsx                                : 75%
src/components/Dialogs/UnifiedAddDialog.js                 : 65%
```

### Performance Benchmarks
```bash
# Test suite performance targets:
npm run test:ci                    : < 3 minutes total
Individual test files              : < 10 seconds each
Coverage report generation         : < 30 seconds
Memory usage during tests          : < 2GB
```

### Deployment Validation Steps
```bash
# These commands MUST all pass for deployment approval:
npm run test:coverage              # Show >= 60% all metrics
npm run test:ci                    # Exit code 0
npm run lint                       # No errors
npm run typecheck                  # No errors
npm run build:web                  # Success
./scripts/deploy-qual.sh --dry-run # Pre-deployment validation passes
```

## Risk Mitigation

### Common Pitfalls and How to Avoid Them

1. **Over-Mocking Leading to Useless Tests**
   - **Pitfall**: Mocking so much that tests don't test real behavior
   - **Solution**: Use `renderWithProviders` helper, mock only external dependencies
   - **Example**: Mock `fetch` but not React components or internal services

2. **Coverage Padding with Meaningless Tests**
   - **Pitfall**: Writing tests that execute code but don't validate behavior
   - **Solution**: Every test must have meaningful assertions about user-visible behavior
   - **Validation**: Each test should fail if the feature breaks

3. **Breaking Existing Functionality**
   - **Pitfall**: New tests or test setup breaking existing code
   - **Solution**: Run full test suite after each phase
   - **Rollback**: Keep git commits granular for easy rollback

4. **Test Environment Configuration Issues**
   - **Pitfall**: Tests pass locally but fail in CI
   - **Solution**: Test frequently with `npm run test:ci`
   - **Prevention**: Use `jest-environment-jsdom` consistently

### Rollback Plan
If tests break existing functionality:

1. **Immediate Rollback**:
```bash
# Identify breaking commit
git log --oneline -10

# Rollback to last working state
git reset --hard <last-working-commit>

# Re-run verification
npm run test:ci
npm run build:web
```

2. **Incremental Recovery**:
```bash
# Apply test additions in smaller chunks
git cherry-pick <safe-commit-1>
npm run test:ci  # Verify

git cherry-pick <safe-commit-2>
npm run test:ci  # Verify
```

3. **Test-Specific Rollback**:
```bash
# Remove only problematic test files
rm src/components/__tests__/ProblematicComponent.test.js
npm run test:ci  # Should pass

# Reimplement with safer approach
```

### Time Estimates for Each Phase

**Phase 1: Infrastructure & Services (20-25 hours)**
- Test infrastructure setup: 3 hours
- Encryption service real tests: 8 hours
- Sync service real tests: 8 hours
- Context provider extensions: 6 hours

**Phase 2: Core Components (15-20 hours)**
- UnifiedApp tests: 8 hours
- Critical dialog tests: 8 hours
- Profile component tests: 4 hours

**Phase 3: Navigation & Layout (8-12 hours)**
- Navigation component tests: 6 hours
- Layout component tests: 4 hours
- Common component tests: 2 hours

**Phase 4: Utilities & Edge Cases (3-5 hours)**
- Validation utility tests: 2 hours
- Error handling tests: 2 hours
- Platform-specific tests: 1 hour

**Review & Refinement (5-8 hours)**
- Adversarial review cycles: 4 hours
- Performance optimization: 2 hours
- Documentation completion: 2 hours

## Developer Submission Report Template

### Required Sections

#### 1. Implementation Summary
```markdown
## Implementation Summary

### Files Created/Modified
- Total test files created: X
- Total test files modified: X
- Total source files with new tests: X

### Coverage Improvement
- Previous global coverage: XX.XX%
- New global coverage: XX.XX%
- Improvement: +XX.XX percentage points

### Test Categories Added
- Unit tests: X files
- Integration tests: X files
- User workflow tests: X files
- Error handling tests: X files
```

#### 2. Verification Evidence
```markdown
## Verification Evidence

### Coverage Verification
```bash
npm run test:coverage | grep "All files"
# Output: All files | XX.XX | XX.XX | XX.XX | XX.XX |
```

### CI Integration
```bash
npm run test:ci
echo $?
# Output: 0 (success)
```

### Build Verification
```bash
npm run build:web
# Output: Build completed successfully
```
```

#### 3. Test Quality Assessment
```markdown
## Test Quality Assessment

### Meaningful Assertions Count
grep -r "expect(" src/**/*.test.js | grep -v "toBeInTheDocument" | wc -l
# Output: XXX meaningful assertions

### User Interaction Tests
grep -r "fireEvent\|userEvent" src/**/*.test.js | wc -l
# Output: XXX interaction tests

### Error Handling Coverage
grep -r "toThrow\|rejects" src/**/*.test.js | wc -l
# Output: XXX error handling tests
```

#### 4. Critical File Coverage
```markdown
## Critical File Coverage

- UnifiedApp.js: XX.XX% (target: 70%)
- manyllaEncryptionService.js: XX.XX% (target: 80%)
- manyllaMinimalSyncServiceWeb.js: XX.XX% (target: 80%)
- [Include all critical files with current coverage]
```

#### 5. Performance Impact
```markdown
## Performance Impact

### Test Execution Time
- Before: X.XX minutes
- After: X.XX minutes
- Increase: +X.XX minutes (within 100ms target: PASS/FAIL)

### Slowest Test Files
[List any files taking >5 seconds with justification]
```

#### 6. Tech Debt and Issues Discovered
```markdown
## Tech Debt and Issues Discovered

### Code Quality Issues Found
- [List any code quality issues discovered during testing]

### Test Infrastructure Improvements Made
- [List improvements to test setup, mocks, utilities]

### Recommendations for Future
- [List recommendations for maintaining test quality]
```

#### 7. Completion Confidence
```markdown
## Completion Confidence: XX%

### High Confidence Areas (90%+)
- [List areas where implementation is solid]

### Medium Confidence Areas (70-89%)
- [List areas that may need minor adjustments]

### Low Confidence Areas (<70%)
- [List areas that may need significant work in review]

### Specific Concerns
- [List any specific concerns for peer review]
```

## Definition of Done

### Technical Completion Checklist
- [ ] Global test coverage >= 60% (statements, branches, functions, lines)
- [ ] All critical files meet individual coverage targets
- [ ] All new tests pass in local and CI environments
- [ ] All existing tests continue to pass (zero regressions)
- [ ] `npm run test:ci` completes successfully
- [ ] `npm run build:web` succeeds
- [ ] `npm run lint` passes with no errors
- [ ] `npm run typecheck` passes with no errors
- [ ] Test suite performance within acceptable limits

### Quality Completion Checklist
- [ ] Tests follow React Testing Library best practices
- [ ] Critical business logic has comprehensive test coverage
- [ ] Error conditions and edge cases are tested
- [ ] User workflows are tested end-to-end
- [ ] No snapshot tests added (unless explicitly justified)
- [ ] Tests are maintainable and well-documented
- [ ] Mocking strategy is appropriate and minimal

### Process Completion Checklist
- [ ] Adversarial peer review completed with APPROVAL
- [ ] All verification commands pass independently
- [ ] Developer submission report completed with all sections
- [ ] Performance impact assessed and within limits
- [ ] Coverage thresholds updated in `package.json`
- [ ] Documentation updated with any new testing patterns
- [ ] Tech debt documented and addressed or scheduled

## Notes

This is a **CRITICAL P0 story** that blocks deployment quality gates. The 60% coverage requirement is non-negotiable for deployment approval.

**Success depends on**:
- Focus on business-critical components first
- Real behavior testing, not coverage gaming
- Comprehensive error handling and edge cases
- Maintainable test patterns for future development

**The peer review process is mandatory** and will independently verify all requirements. Prepare thoroughly and provide complete evidence to avoid rejection cycles.