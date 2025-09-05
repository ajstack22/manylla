# Manylla Security Fixes - Simplified Implementation

## Core Principle
Medical data requires strong security, but not complex security. Do the basics right.

## Critical Fixes Required (Priority Order)

### 1. Fix Unencrypted Share Storage (CRITICAL - Unique to Manylla)

**File:** `src/components/Sharing/ShareDialog.tsx`

```javascript
// CURRENT - Line ~145 - INSECURE
shares[code] = {
  profile: sharedProfile,  // ❌ Medical data in plaintext!
  createdAt: new Date(),
  expiresAt: new Date(...)
};

// FIXED - Encrypt before storage
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

// Simple encryption using share code as key source
const encryptShare = (data, shareCode) => {
  // Derive key from share code
  const codeBytes = new TextEncoder().encode(shareCode + 'ManyllaShare2025');
  let key = codeBytes;
  for (let i = 0; i < 1000; i++) {
    key = nacl.hash(key);
  }
  key = key.slice(0, 32);
  
  // Encrypt
  const nonce = nacl.randomBytes(24);
  const dataBytes = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = nacl.secretbox(dataBytes, nonce, key);
  
  // Combine nonce + encrypted
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);
  
  return util.encodeBase64(combined);
};

// In handleGenerateLink
shares[code] = {
  encrypted: encryptShare(sharedProfile, code),  // ✅ Encrypted
  expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
};
```

**File:** `src/components/Sharing/SharedView.tsx`

```javascript
// Add decryption when loading share
const decryptShare = (encryptedData, shareCode) => {
  // Derive same key
  const codeBytes = new TextEncoder().encode(shareCode + 'ManyllaShare2025');
  let key = codeBytes;
  for (let i = 0; i < 1000; i++) {
    key = nacl.hash(key);
  }
  key = key.slice(0, 32);
  
  // Decrypt
  const combined = util.decodeBase64(encryptedData);
  const nonce = combined.slice(0, 24);
  const ciphertext = combined.slice(24);
  
  const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
  if (!decrypted) throw new Error('Invalid share code');
  
  return JSON.parse(new TextDecoder().decode(decrypted));
};
```

### 2. Fix Math.random() Security Issue

**File:** `src/components/Sharing/ShareDialog.tsx`

```javascript
// CURRENT - Line ~126 - WEAK
const code = Math.random().toString(36).substring(2, 8).toUpperCase();

// FIXED - Use crypto.getRandomValues
const generateSecureCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

const code = generateSecureCode();
```

### 3. Clear URL Fragments After Reading

**File:** `src/services/sync/manyllaMinimalSyncService.js`

```javascript
// Add to constructor
constructor() {
  // ... existing code
  
  // Extract and clear recovery phrase from URL
  if (typeof window !== 'undefined' && window.location.hash) {
    const fragment = window.location.hash.substring(1);
    
    // Clear immediately
    window.history.replaceState(null, '', 
      window.location.pathname + window.location.search);
    
    // Check if it looks like a recovery phrase
    if (fragment.match(/^[a-f0-9]{32}$/)) {
      this.pendingRecoveryPhrase = fragment;
      
      // Clear from memory after 30 seconds
      setTimeout(() => {
        this.pendingRecoveryPhrase = null;
      }, 30000);
    }
  }
}
```

### 4. Add Basic Rate Limiting

**File:** `src/services/sync/manyllaMinimalSyncService.js`

```javascript
// Add to constructor
this.lastPull = 0;
this.lastPush = 0;
this.pullAttempts = 0;

// Update pullData method
async pullData(forceFullPull = false) {
  // Rate limit: Max 1 pull per 2 seconds
  const now = Date.now();
  if (now - this.lastPull < 2000) {
    console.log('[ManyllaSync] Rate limited, skipping pull');
    return;
  }
  this.lastPull = now;
  
  // Prevent runaway pulls
  this.pullAttempts++;
  if (this.pullAttempts > 100) {
    console.error('[ManyllaSync] Too many pull attempts, stopping');
    this.stopPullInterval();
    return;
  }
  
  // ... existing pull code
}

// Update pushData method
async pushData(profile) {
  // Rate limit: Max 1 push per 5 seconds
  const now = Date.now();
  if (now - this.lastPush < 5000) {
    console.log('[ManyllaSync] Rate limited, delaying push');
    return;
  }
  this.lastPush = now;
  
  // ... existing push code
}
```

### 5. Add Integrity Check for Medical Data

**File:** `src/services/sync/manyllaEncryptionService.js`

```javascript
// Add simple HMAC for data integrity
encryptData(data) {
  if (!this.masterKey) {
    throw new Error('Encryption not initialized');
  }
  
  const dataString = JSON.stringify(data);
  let dataBytes = this.encodeUTF8(dataString);
  
  // ... existing encryption code ...
  
  // Add integrity check
  const hmac = nacl.auth(combined, this.masterKey);
  
  // Return with HMAC
  return {
    data: util.encodeBase64(combined),
    hmac: util.encodeBase64(hmac)
  };
}

// Update decryptData to verify HMAC
decryptData(encryptedPayload) {
  if (!this.masterKey) {
    throw new Error('Encryption not initialized');
  }
  
  // Verify HMAC first
  const combined = util.decodeBase64(encryptedPayload.data);
  const hmac = util.decodeBase64(encryptedPayload.hmac);
  
  if (!nacl.auth.verify(hmac, combined, this.masterKey)) {
    throw new Error('Data integrity check failed');
  }
  
  // ... existing decryption code ...
}
```

## What We're NOT Doing (Avoiding Over-Engineering)

❌ **Client-side security monitoring** - Server logs are enough  
❌ **Checksums on share codes** - Just validate they exist  
❌ **Progressive enhancement** - Pick one approach and stick with it  
❌ **Complex rate limiting** - Simple time-based limits work fine  
❌ **Device fingerprinting** - Random IDs are sufficient  
❌ **Argon2 migration** - Current 100k iterations are adequate for now  

## Testing the Fixes

```javascript
// Quick test to verify encryption is working
function testShareEncryption() {
  const testData = { name: 'Test Child', medical: 'Sensitive Info' };
  const code = 'TESTCODE';
  
  // Encrypt
  const encrypted = encryptShare(testData, code);
  console.log('Encrypted:', encrypted);
  console.log('Contains "Test Child"?', encrypted.includes('Test Child')); // Should be false
  
  // Decrypt
  const decrypted = decryptShare(encrypted, code);
  console.log('Decrypted:', decrypted);
  console.log('Match?', JSON.stringify(decrypted) === JSON.stringify(testData));
}

// Run in browser console
testShareEncryption();
```

## Implementation Timeline

### Day 1 (4 hours)
1. Fix unencrypted shares (2 hours)
2. Fix Math.random() (30 min)
3. Test thoroughly (1.5 hours)

### Day 2 (2 hours)
1. Add URL fragment clearing (30 min)
2. Add rate limiting (30 min)
3. Add integrity checks (1 hour)

### Day 3 (2 hours)
1. Final testing
2. Deploy

Total: ~8 hours of work

## Key Differences from StackMap

1. **We MUST encrypt shares** - They don't have this issue
2. **We need integrity checks** - Medical data requires tamper detection
3. **We keep it simple** - No progressive enhancement or fallbacks
4. **We use what we have** - nacl.hash is fine, no need for Argon2 yet

## Success Criteria

✅ Share data is encrypted in localStorage  
✅ No Math.random() for security-sensitive operations  
✅ URL fragments don't persist in browser history  
✅ Basic rate limiting prevents abuse  
✅ Medical data has integrity verification  

## Notes

- These fixes address REAL security issues
- No over-engineering or unnecessary complexity
- Focus on medical data protection
- Can be implemented quickly without breaking changes
- Server-side security can be added when backend is deployed

---

*Keep it simple. Protect the medical data. Ship it.*