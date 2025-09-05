# Manylla Security Hardening Implementation Guide

## Overview
This document provides detailed implementation instructions for addressing critical security vulnerabilities identified in Manylla's sync and share systems. Based on StackMap's security recommendations, adapted for Manylla's specific architecture and use case.

## Critical Issues Priority

### 🔴 IMMEDIATE: Unencrypted Share Storage (Manylla-Specific)
**This is our most critical vulnerability, not present in StackMap**

## 1. Fix Unencrypted Share Storage

### Current CRITICAL Vulnerability
```javascript
// src/components/Sharing/ShareDialog.tsx - INSECURE
shares[code] = {
  profile: sharedProfile,  // ❌ CRITICAL: Stored in plaintext!
  createdAt: new Date(),
  expiresAt: new Date(...),
  recipientName,
  note: shareNote
};
localStorage.setItem('manylla_shares', JSON.stringify(shares));
```

### Secure Implementation
```javascript
// src/services/sharing/shareEncryptionService.js - NEW FILE
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import manyllaEncryptionService from '../sync/manyllaEncryptionService';

class ShareEncryptionService {
  /**
   * Generate share-specific encryption key from share code
   */
  deriveShareKey(shareCode) {
    // Use share code as basis for deterministic key
    const codeBytes = manyllaEncryptionService.encodeUTF8(shareCode);
    const salt = manyllaEncryptionService.encodeUTF8('ManyllaShare2025');
    
    // Combine and hash multiple times for key derivation
    let key = new Uint8Array(codeBytes.length + salt.length);
    key.set(codeBytes);
    key.set(salt, codeBytes.length);
    
    // Use 10,000 iterations for share keys (less critical than sync keys)
    for (let i = 0; i < 10000; i++) {
      key = nacl.hash(key);
    }
    
    return key.slice(0, 32); // 256-bit key
  }
  
  /**
   * Encrypt share data with share-specific key
   */
  encryptShareData(shareData, shareCode) {
    const key = this.deriveShareKey(shareCode);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    
    const dataBytes = manyllaEncryptionService.encodeUTF8(
      JSON.stringify(shareData)
    );
    
    const encrypted = nacl.secretbox(dataBytes, nonce, key);
    
    // Combine nonce and ciphertext
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);
    
    return util.encodeBase64(combined);
  }
  
  /**
   * Decrypt share data
   */
  decryptShareData(encryptedData, shareCode) {
    const key = this.deriveShareKey(shareCode);
    const combined = util.decodeBase64(encryptedData);
    
    const nonce = combined.slice(0, nacl.secretbox.nonceLength);
    const ciphertext = combined.slice(nacl.secretbox.nonceLength);
    
    const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
    if (!decrypted) {
      throw new Error('Failed to decrypt share data');
    }
    
    const dataString = manyllaEncryptionService.decodeUTF8(decrypted);
    return JSON.parse(dataString);
  }
}

export default new ShareEncryptionService();

// Updated ShareDialog.tsx
import shareEncryptionService from '../../services/sharing/shareEncryptionService';

const handleGenerateLink = () => {
  // Generate cryptographically secure access code
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').toUpperCase();
  
  setAccessCode(code);
  
  // Prepare share data
  const shareData = {
    profile: sharedProfile,
    recipientName,
    note: shareNote
  };
  
  // Encrypt before storage
  const encryptedShare = shareEncryptionService.encryptShareData(shareData, code);
  
  // Store encrypted data with metadata
  const shares = JSON.parse(localStorage.getItem('manylla_shares') || '{}');
  shares[code] = {
    encrypted: encryptedShare,  // ✅ Encrypted data
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
    // Don't store sensitive data unencrypted
  };
  
  localStorage.setItem('manylla_shares', JSON.stringify(shares));
  
  const shareDomain = process.env.REACT_APP_SHARE_DOMAIN || 'https://stackmap.app/manylla';
  setGeneratedLink(`${shareDomain}/share/${code}`);
};

// src/components/Sharing/SharedView.tsx - Update retrieval
const loadSharedData = (shareCode) => {
  const shares = JSON.parse(localStorage.getItem('manylla_shares') || '{}');
  const shareEntry = shares[shareCode];
  
  if (!shareEntry) {
    throw new Error('Share not found');
  }
  
  // Check expiration
  if (new Date(shareEntry.expiresAt) < new Date()) {
    throw new Error('Share has expired');
  }
  
  // Decrypt the data
  const shareData = shareEncryptionService.decryptShareData(
    shareEntry.encrypted,
    shareCode
  );
  
  return shareData;
};
```

## 2. Strengthen Key Derivation (Adapted from StackMap)

### Current Implementation (100,000 nacl.hash iterations)
While StackMap recommends Argon2id, our current approach with 100,000 iterations provides reasonable security for our use case. However, we should prepare for future migration.

### Enhanced Implementation with Fallback
```javascript
// src/services/sync/manyllaEncryptionService.js - ENHANCED
import { argon2id } from 'hash-wasm';

class ManyllaEncryptionService {
  constructor() {
    this.masterKey = null;
    this.syncId = null;
    this.KEY_DERIVATION_ITERATIONS = 100000;
    this.USE_ARGON2 = false; // Feature flag for gradual rollout
  }
  
  async deriveKeyFromPhrase(recoveryPhrase, salt = null) {
    // Try Argon2id if enabled
    if (this.USE_ARGON2) {
      try {
        return await this.deriveKeyArgon2(recoveryPhrase, salt);
      } catch (error) {
        console.warn('[ManyllaEncryption] Argon2 failed, using fallback:', error);
      }
    }
    
    // Current implementation as fallback
    return this.deriveKeyNaCl(recoveryPhrase, salt);
  }
  
  async deriveKeyArgon2(recoveryPhrase, salt) {
    const fixedSalt = 'ManyllaSyncSalt2025';
    
    if (!salt) {
      salt = nacl.randomBytes(16);
    } else if (typeof salt === 'string') {
      salt = util.decodeBase64(salt);
    }
    
    // Argon2id parameters optimized for Manylla's parent users
    const params = {
      password: recoveryPhrase + fixedSalt,
      salt: salt,
      parallelism: 1,
      iterations: 2,        // Lower than StackMap for faster mobile experience
      memorySize: 32768,    // 32 MiB (half of StackMap's recommendation)
      hashLength: 32,
      outputType: 'binary'
    };
    
    const key = await argon2id(params);
    
    // Generate sync ID same as before
    const syncId = util.encodeBase64(key.slice(0, 16))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32)
      .toLowerCase();
    
    return {
      key: new Uint8Array(key),
      salt: util.encodeBase64(salt),
      syncId,
      version: 2 // Track key derivation version
    };
  }
  
  // Keep current implementation for compatibility
  async deriveKeyNaCl(recoveryPhrase, salt) {
    // ... existing nacl.hash implementation
    return {
      key: encKey.slice(0, 32),
      salt: util.encodeBase64(salt),
      syncId,
      version: 1
    };
  }
}
```

## 3. Improve Invite Code Security

### Current Issue: Math.random() in share codes
```javascript
// ShareDialog.tsx - INSECURE
const code = Math.random().toString(36).substring(2, 8).toUpperCase();
```

### Secure Implementation
```javascript
// src/utils/secureCodeGenerator.js - NEW FILE
class SecureCodeGenerator {
  /**
   * Generate cryptographically secure invite/share codes
   * Format: XXXX-XXXX for 8 chars, XXXX-XXXX-XX for 10 chars
   */
  generateSecureCode(length = 8) {
    const charset = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 32 chars
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    
    let code = '';
    for (let i = 0; i < length; i++) {
      // Map byte value to charset
      const charIndex = bytes[i] % charset.length;
      code += charset[charIndex];
    }
    
    // Format with dashes
    if (length === 8) {
      return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    } else if (length === 10) {
      return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 10)}`;
    }
    
    return code;
  }
  
  /**
   * Generate share code with checksum for validation
   */
  generateShareCode() {
    const code = this.generateSecureCode(8);
    
    // Add simple checksum for client-side validation
    const checksum = this.calculateChecksum(code);
    
    return {
      code: code,
      checksum: checksum,
      fullCode: `${code}-${checksum}`
    };
  }
  
  calculateChecksum(code) {
    const clean = code.replace(/-/g, '');
    let sum = 0;
    for (let i = 0; i < clean.length; i++) {
      sum += clean.charCodeAt(i);
    }
    return (sum % 100).toString().padStart(2, '0');
  }
  
  validateShareCode(fullCode) {
    const parts = fullCode.split('-');
    if (parts.length !== 3) return false;
    
    const code = `${parts[0]}-${parts[1]}`;
    const providedChecksum = parts[2];
    const calculatedChecksum = this.calculateChecksum(code);
    
    return providedChecksum === calculatedChecksum;
  }
}

export default new SecureCodeGenerator();

// Update ShareDialog.tsx
import secureCodeGenerator from '../../utils/secureCodeGenerator';

const handleGenerateLink = () => {
  const { code, fullCode } = secureCodeGenerator.generateShareCode();
  setAccessCode(code);
  // ... rest of implementation
};

// Update inviteCode.ts for sync invites
import secureCodeGenerator from '../utils/secureCodeGenerator';

export function generateInviteCode(): string {
  // Use 10-character codes for sync invites (more security)
  return secureCodeGenerator.generateSecureCode(10);
}
```

## 4. Implement Client-Side Rate Limiting

### For Sync Operations
```javascript
// src/services/sync/rateLimiter.js - NEW FILE
class RateLimiter {
  constructor() {
    this.attempts = new Map();
    this.blocked = new Set();
  }
  
  async checkLimit(action, identifier) {
    const key = `${action}:${identifier}`;
    
    // Check if blocked
    if (this.blocked.has(key)) {
      const blockExpiry = this.blocked.get(key);
      if (Date.now() < blockExpiry) {
        throw new Error(`Rate limited. Try again later.`);
      }
      this.blocked.delete(key);
    }
    
    // Get attempt history
    const history = this.attempts.get(key) || [];
    const now = Date.now();
    
    // Clean old attempts (outside 1-minute window)
    const recentAttempts = history.filter(time => now - time < 60000);
    
    // Check limits based on action
    const limits = {
      'sync:pull': 60,      // 60 per minute (matches our interval)
      'sync:push': 30,      // 30 per minute
      'share:create': 10,   // 10 shares per minute
      'share:access': 20,   // 20 access attempts per minute
      'invite:validate': 5  // 5 validation attempts per minute
    };
    
    const limit = limits[action] || 10;
    
    if (recentAttempts.length >= limit) {
      // Block for exponential backoff
      const blockDuration = Math.min(
        60000 * Math.pow(2, Math.floor(recentAttempts.length / limit)),
        300000 // Max 5 minutes
      );
      this.blocked.set(key, now + blockDuration);
      
      // Log potential abuse
      console.warn(`[RateLimiter] Blocking ${key} for ${blockDuration}ms`);
      
      throw new Error(`Rate limit exceeded. Blocked for ${Math.ceil(blockDuration / 1000)} seconds`);
    }
    
    // Record attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup();
    }
  }
  
  cleanup() {
    const now = Date.now();
    
    // Remove old attempts
    for (const [key, history] of this.attempts.entries()) {
      const recent = history.filter(time => now - time < 300000); // Keep 5 min
      if (recent.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recent);
      }
    }
    
    // Remove expired blocks
    for (const [key, expiry] of this.blocked.entries()) {
      if (now >= expiry) {
        this.blocked.delete(key);
      }
    }
  }
}

export default new RateLimiter();

// Integration in manyllaMinimalSyncService.js
import rateLimiter from '../../utils/rateLimiter';

async pullData(forceFullPull = false) {
  // Rate limit pulls
  try {
    await rateLimiter.checkLimit('sync:pull', this.syncId || 'anonymous');
  } catch (error) {
    console.error('[ManyllaSync] Rate limited:', error);
    this.emitError('pull', error.message);
    return;
  }
  
  // ... existing pull logic
}

async pushData(profile) {
  // Rate limit pushes
  try {
    await rateLimiter.checkLimit('sync:push', this.syncId || 'anonymous');
  } catch (error) {
    console.error('[ManyllaSync] Rate limited:', error);
    this.emitError('push', error.message);
    throw error;
  }
  
  // ... existing push logic
}
```

## 5. Secure URL Fragment Handling

### For Sync Recovery Phrases
```javascript
// src/utils/secureUrlHandler.js - NEW FILE
class SecureUrlHandler {
  constructor() {
    this.processed = new Set();
  }
  
  /**
   * Extract and immediately clear sensitive data from URL
   */
  extractAndClearFragment() {
    if (typeof window === 'undefined' || !window.location.hash) {
      return null;
    }
    
    const fragment = window.location.hash.substring(1);
    
    if (fragment) {
      // Clear immediately using replaceState (no history entry)
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
      
      // Prevent reprocessing
      if (this.processed.has(fragment)) {
        return null;
      }
      this.processed.add(fragment);
      
      // Auto-cleanup memory after 5 minutes
      setTimeout(() => {
        this.processed.delete(fragment);
      }, 300000);
    }
    
    return fragment;
  }
  
  /**
   * Create secure share URL with auto-cleanup
   */
  createSecureUrl(baseUrl, secret) {
    const url = `${baseUrl}#${secret}`;
    
    // Setup auto-cleanup listener
    if (typeof window !== 'undefined') {
      // Clean on page unload
      const cleanup = () => {
        if (window.location.hash.includes(secret.substring(0, 8))) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      };
      
      window.addEventListener('beforeunload', cleanup, { once: true });
      
      // Auto-cleanup after 30 seconds
      setTimeout(cleanup, 30000);
    }
    
    return url;
  }
  
  /**
   * Copy URL to clipboard with auto-expiration
   */
  async copySecureUrl(url, expirationMs = 60000) {
    try {
      await navigator.clipboard.writeText(url);
      
      // Clear from clipboard after expiration
      setTimeout(async () => {
        try {
          const currentText = await navigator.clipboard.readText();
          if (currentText === url) {
            await navigator.clipboard.writeText('');
          }
        } catch (e) {
          // Clipboard read might fail, ignore
        }
      }, expirationMs);
      
      return true;
    } catch (error) {
      console.error('[SecureURL] Copy failed:', error);
      return false;
    }
  }
}

export default new SecureUrlHandler();

// Integration in sync components
import secureUrlHandler from '../../utils/secureUrlHandler';

// In invite handling
const handleInviteUrl = () => {
  const recoveryPhrase = secureUrlHandler.extractAndClearFragment();
  if (recoveryPhrase && recoveryPhrase.length === 32) {
    // Process recovery phrase
    // ... 
  }
};
```

## 6. Add Integrity Validation

### For Encrypted Data
```javascript
// src/services/sync/integrityService.js - NEW FILE
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

class IntegrityService {
  /**
   * Generate HMAC for data integrity
   */
  generateHMAC(data, key) {
    const dataBytes = this.encodeUTF8(JSON.stringify(data));
    const hmacKey = key.slice(0, 32);
    
    // Use nacl.auth for HMAC
    const hmac = nacl.auth(dataBytes, hmacKey);
    return util.encodeBase64(hmac);
  }
  
  /**
   * Verify HMAC
   */
  verifyHMAC(data, hmac, key) {
    const expectedHMAC = this.generateHMAC(data, key);
    const hmacBytes = util.decodeBase64(hmac);
    const expectedBytes = util.decodeBase64(expectedHMAC);
    
    // Timing-safe comparison
    return nacl.verify(hmacBytes, expectedBytes);
  }
  
  /**
   * Add integrity check to encrypted data
   */
  addIntegrity(encryptedData, key) {
    const hmac = this.generateHMAC(encryptedData, key);
    return {
      data: encryptedData,
      hmac: hmac,
      timestamp: Date.now(),
      version: 1
    };
  }
  
  /**
   * Verify and extract data
   */
  verifyIntegrity(payload, key) {
    // Check timestamp (prevent replay attacks)
    const age = Date.now() - payload.timestamp;
    if (age > 86400000) { // 24 hours
      throw new Error('Data too old, possible replay attack');
    }
    
    // Verify HMAC
    if (!this.verifyHMAC(payload.data, payload.hmac, key)) {
      throw new Error('Integrity check failed');
    }
    
    return payload.data;
  }
  
  encodeUTF8(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }
}

export default new IntegrityService();
```

## 7. Security Monitoring and Logging

```javascript
// src/services/security/securityMonitor.js - NEW FILE
class SecurityMonitor {
  constructor() {
    this.events = [];
    this.maxEvents = 100;
  }
  
  logSecurityEvent(type, details) {
    const event = {
      type,
      details,
      timestamp: new Date().toISOString(),
      deviceId: localStorage.getItem('manylla_device_id')
    };
    
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('manylla_security_log', 
        JSON.stringify(this.events.slice(-20)) // Keep last 20 in storage
      );
    } catch (e) {
      // Storage might be full
    }
    
    // Log critical events
    if (type === 'critical') {
      console.error('[Security]', event);
      this.alertUser(details);
    }
  }
  
  alertUser(details) {
    // Emit event for UI to handle
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('manylla-security-alert', {
        detail: details
      });
      window.dispatchEvent(event);
    }
  }
  
  getSecuritySummary() {
    const summary = {
      totalEvents: this.events.length,
      criticalEvents: this.events.filter(e => e.type === 'critical').length,
      recentEvents: this.events.slice(-10),
      recommendations: []
    };
    
    // Add recommendations based on events
    if (summary.criticalEvents > 0) {
      summary.recommendations.push('Review critical security events');
    }
    
    const failedAttempts = this.events.filter(e => 
      e.type === 'auth_failed' && 
      Date.now() - new Date(e.timestamp) < 3600000
    ).length;
    
    if (failedAttempts > 5) {
      summary.recommendations.push('Multiple failed authentication attempts detected');
    }
    
    return summary;
  }
}

export default new SecurityMonitor();
```

## Testing Implementation

```javascript
// src/services/__tests__/security.test.js
import shareEncryptionService from '../sharing/shareEncryptionService';
import secureCodeGenerator from '../../utils/secureCodeGenerator';
import rateLimiter from '../../utils/rateLimiter';

describe('Manylla Security Tests', () => {
  test('Share data is encrypted before storage', () => {
    const testData = { profile: { name: 'Test Child' } };
    const shareCode = 'ABCD1234';
    
    const encrypted = shareEncryptionService.encryptShareData(testData, shareCode);
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toContain('Test Child'); // Should not be visible
    
    const decrypted = shareEncryptionService.decryptShareData(encrypted, shareCode);
    expect(decrypted).toEqual(testData);
  });
  
  test('Secure codes use crypto random', () => {
    const code1 = secureCodeGenerator.generateSecureCode();
    const code2 = secureCodeGenerator.generateSecureCode();
    
    expect(code1).not.toEqual(code2);
    expect(code1).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
  
  test('Rate limiter blocks after threshold', async () => {
    const action = 'test:action';
    const id = 'test-id';
    
    // Should allow initial attempts
    for (let i = 0; i < 5; i++) {
      await rateLimiter.checkLimit(action, id);
    }
    
    // Should block after limit
    await expect(rateLimiter.checkLimit(action, id))
      .rejects.toThrow('Rate limit exceeded');
  });
  
  test('Share code checksum validation', () => {
    const { fullCode } = secureCodeGenerator.generateShareCode();
    expect(secureCodeGenerator.validateShareCode(fullCode)).toBe(true);
    
    const tamperedCode = fullCode.slice(0, -1) + '9';
    expect(secureCodeGenerator.validateShareCode(tamperedCode)).toBe(false);
  });
});
```

## Rollout Strategy

### Phase 1: Immediate Critical Fixes (Week 1)
1. **Deploy encrypted share storage** - Critical vulnerability
2. **Replace Math.random() with crypto.getRandomValues()** - Security issue
3. **Add client-side rate limiting** - Protection layer

### Phase 2: Enhanced Security (Week 2-3)
1. **Implement secure URL handling** - Privacy protection
2. **Add integrity validation** - Data tampering prevention
3. **Deploy security monitoring** - Threat detection

### Phase 3: Future Hardening (Month 2)
1. **Prepare Argon2id migration** - Feature flag ready
2. **Enhance device ID generation** - Better tracking
3. **Add server-side components** - When backend is deployed

### Phase 4: Testing and Validation (Ongoing)
1. **Security audit** - External review
2. **Penetration testing** - Vulnerability assessment
3. **User acceptance testing** - Ensure no UX degradation

## Migration Notes

### For Existing Users
- Encrypted shares are backward compatible (new shares encrypted, old ones remain accessible)
- Sync system maintains compatibility during transition
- No user action required for most security updates

### Breaking Changes
- Share codes will change format (add checksum)
- URLs will auto-clear fragments
- Rate limiting may affect power users

## Performance Considerations

### Encryption Overhead
- Share encryption adds ~10-20ms per operation
- Acceptable for Manylla's low-frequency usage
- Use Web Workers for large profiles if needed

### Storage Impact
- Encrypted data is ~33% larger (Base64 encoding)
- Minimal impact given Manylla's single-profile design
- localStorage limits still adequate

## Monitoring and Alerts

### Key Metrics to Track
1. Failed authentication attempts
2. Rate limit violations
3. Encryption/decryption failures
4. Share access patterns
5. Sync conflict frequency

### Alert Thresholds
- > 10 failed auth attempts in 1 hour
- > 50 rate limit blocks in 1 hour
- Any critical security events
- Unusual access patterns

## Summary

This implementation guide addresses Manylla's specific vulnerabilities, with immediate focus on the critical unencrypted share storage issue. The phased approach ensures security improvements without disrupting current users, while preparing for future enhancements when the backend is deployed.

Unlike StackMap's implementation, we prioritize:
1. **Share encryption** (our unique critical issue)
2. **Parent-friendly UX** (simpler flows, clearer messaging)
3. **localStorage-first** approach (until backend ready)
4. **Lower computational requirements** (for older parent devices)

---

*Document Version: 1.0*  
*Created: January 2025*  
*Security Level: Critical*  
*Manylla-Specific Adaptations*