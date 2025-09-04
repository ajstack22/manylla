# Implementation Guide

## Frontend Implementation

### State Management
```typescript
// Profile state in App.tsx
interface AppState {
  profile: ChildProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  showOnboarding: boolean;
}

// Local storage keys
STORAGE_KEYS = {
  profile: 'manylla_profile',
  onboarding: 'manylla_onboarding_completed',
  shares: 'manylla_shares',
  theme: 'manylla_theme_preference'
}
```

### Component Communication
```typescript
// Props drilling pattern for modals
<ShareDialog
  open={shareDialogOpen}
  onClose={() => setShareDialogOpen(false)}
  profile={profile}
/>

// Context for cross-component state
const ThemeContext = React.createContext();
const SyncContext = React.createContext();
```

### Form Handling
```typescript
// Standard form pattern
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!validateForm()) return;
  
  // Save operation
  setIsSaving(true);
  try {
    await saveData();
    onClose();
  } finally {
    setIsSaving(false);
  }
};
```

### Error Boundaries
```typescript
// Wrap components in error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    // Log to service
  }
}
```

## Backend Implementation

### Request Handling
```php
// Standard request pattern
header('Content-Type: application/json');

// CORS headers
header('Access-Control-Allow-Origin: ' . $allowed_origin);
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Input validation
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['required_field'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid input']));
}

// Sanitization
$sanitized = filter_var($input['field'], FILTER_SANITIZE_STRING);
```

### Database Operations
```php
// Connection pattern
function getDbConnection() {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}

// Prepared statements
$stmt = $conn->prepare("INSERT INTO table (col1, col2) VALUES (?, ?)");
$stmt->bind_param("ss", $val1, $val2);
$stmt->execute();
```

### Rate Limiting
```php
function checkRateLimit($identifier, $endpoint, $limit, $window) {
    $conn = getDbConnection();
    
    // Clean old entries
    $conn->query("DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL $window HOUR)");
    
    // Check current count
    $stmt = $conn->prepare("
        SELECT request_count FROM rate_limits 
        WHERE identifier = ? AND endpoint = ? 
        AND window_start > DATE_SUB(NOW(), INTERVAL $window HOUR)
    ");
    $stmt->bind_param("ss", $identifier, $endpoint);
    $stmt->execute();
    
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        if ($row['request_count'] >= $limit) {
            return false; // Rate limit exceeded
        }
        // Increment counter
        $conn->query("UPDATE rate_limits SET request_count = request_count + 1 WHERE identifier = '$identifier' AND endpoint = '$endpoint'");
    } else {
        // Create new entry
        $conn->query("INSERT INTO rate_limits (identifier, endpoint) VALUES ('$identifier', '$endpoint')");
    }
    
    return true;
}
```

## Encryption Implementation

### Client-Side Encryption
```javascript
// Using TweetNaCl.js
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// Generate key from recovery phrase
function deriveKey(recoveryPhrase) {
    const hash = sha256(recoveryPhrase);
    return nacl.util.decodeBase64(hash);
}

// Encrypt data
function encrypt(data, key) {
    const nonce = nacl.randomBytes(24);
    const message = naclUtil.decodeUTF8(JSON.stringify(data));
    const encrypted = nacl.secretbox(message, nonce, key);
    
    return {
        nonce: naclUtil.encodeBase64(nonce),
        encrypted: naclUtil.encodeBase64(encrypted)
    };
}

// Decrypt data
function decrypt(encryptedData, nonce, key) {
    const decrypted = nacl.secretbox.open(
        naclUtil.decodeBase64(encryptedData),
        naclUtil.decodeBase64(nonce),
        key
    );
    
    if (!decrypted) throw new Error('Decryption failed');
    return JSON.parse(naclUtil.encodeUTF8(decrypted));
}
```

### Recovery Phrase Generation
```javascript
// Using BIP39 word list
function generateRecoveryPhrase() {
    const words = [];
    for (let i = 0; i < 12; i++) {
        const index = Math.floor(Math.random() * 2048);
        words.push(BIP39_WORDLIST[index]);
    }
    return words.join(' ');
}

// Validate recovery phrase
function validateRecoveryPhrase(phrase) {
    const words = phrase.trim().toLowerCase().split(/\s+/);
    if (words.length !== 12) return false;
    
    return words.every(word => BIP39_WORDLIST.includes(word));
}
```

## Share Implementation

### Creating Share Links
```typescript
// Generate access code
function generateAccessCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Store share data
function createShare(profile: ChildProfile, options: ShareOptions) {
    const code = generateAccessCode();
    const shares = getStoredShares();
    
    shares[code] = {
        profile: filterProfileData(profile, options.categories),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000),
        recipientName: options.recipientName,
        note: options.note
    };
    
    localStorage.setItem('manylla_shares', JSON.stringify(shares));
    return code;
}
```

### Accessing Shared Data
```typescript
// Retrieve shared profile
function getSharedProfile(code: string) {
    const shares = getStoredShares();
    const share = shares[code];
    
    if (!share) throw new Error('Invalid share code');
    if (new Date() > new Date(share.expiresAt)) {
        delete shares[code];
        localStorage.setItem('manylla_shares', JSON.stringify(shares));
        throw new Error('Share link expired');
    }
    
    return share;
}
```

## Sync Implementation

### Multi-Device Setup
```typescript
// Initialize sync
async function setupSync(recoveryPhrase: string) {
    const recoveryHash = sha256(recoveryPhrase);
    
    // Create or join sync group
    const response = await fetch('/api/sync/create-group.php', {
        method: 'POST',
        body: JSON.stringify({ recoveryHash })
    });
    
    if (!response.ok && response.status !== 409) {
        throw new Error('Failed to setup sync');
    }
    
    const data = await response.json();
    return data.groupId;
}

// Sync data
async function syncData(profile: ChildProfile, recoveryPhrase: string) {
    const key = deriveKey(recoveryPhrase);
    const encrypted = encrypt(profile, key);
    const dataHash = sha256(JSON.stringify(profile));
    
    const response = await fetch('/api/sync/save.php', {
        method: 'POST',
        body: JSON.stringify({
            groupId: getGroupId(),
            recoveryHash: sha256(recoveryPhrase),
            encryptedData: encrypted.encrypted,
            nonce: encrypted.nonce,
            dataHash,
            deviceId: getDeviceId()
        })
    });
    
    if (!response.ok) {
        throw new Error('Sync failed');
    }
}
```

### Conflict Resolution
```typescript
// Check for conflicts before sync
async function checkConflicts(profile: ChildProfile, recoveryPhrase: string) {
    const dataHash = sha256(JSON.stringify(profile));
    
    const response = await fetch('/api/sync/check-conflict.php', {
        method: 'POST',
        body: JSON.stringify({
            groupId: getGroupId(),
            recoveryHash: sha256(recoveryPhrase),
            dataHash
        })
    });
    
    const result = await response.json();
    
    if (result.hasConflict) {
        // Handle conflict - show UI for resolution
        return handleConflictResolution(profile, result);
    }
    
    return profile;
}
```

## Testing Patterns

### Component Testing
```typescript
// Using React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';

test('ShareDialog creates share link', async () => {
    const profile = mockProfile;
    render(<ShareDialog open={true} profile={profile} />);
    
    // Select recipient type
    fireEvent.click(screen.getByText('School Teacher'));
    
    // Continue through wizard
    fireEvent.click(screen.getByText('Next'));
    
    // Verify share code generated
    await screen.findByText(/Access Code:/);
});
```

### API Testing
```bash
# Test share endpoint
curl -X POST https://manylla.com/api/share/create.php \
  -H "Content-Type: application/json" \
  -d '{"profile": {...}, "expiresAt": "2024-12-31T23:59:59Z"}'

# Test sync endpoint
curl -X GET "https://manylla.com/api/sync/get.php?groupId=xxx&recoveryHash=yyy"
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const PrintPreview = React.lazy(() => import('./components/Sharing/PrintPreview'));
const SyncDialog = React.lazy(() => import('./components/Sync/SyncDialog'));
```

### Memoization
```typescript
// Memoize expensive computations
const filteredEntries = useMemo(() => {
    return entries.filter(e => e.category === selectedCategory);
}, [entries, selectedCategory]);

// Memoize components
const EntryCard = React.memo(({ entry }) => {
    // Component implementation
});
```

### LocalStorage Optimization
```typescript
// Batch localStorage operations
function saveToStorage(data: any) {
    // Debounce saves
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(data));
    }, 500);
}

// Use compression for large data
function compressData(data: any): string {
    return LZString.compress(JSON.stringify(data));
}
```