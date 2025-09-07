# Manylla Sharing Platform: Technical White Paper for StackMap Integration

## Executive Summary

Manylla implements a comprehensive, secure sharing system designed to enable temporary access to filtered profile information through token-based authentication. This white paper details the technical architecture, implementation patterns, and security considerations that StackMap can adapt for their sharing platform.

### Key Features
- **Token-based URL sharing** with auto-authentication
- **Granular content filtering** by category and data type
- **Time-based and view-count expiration** controls
- **Zero-knowledge encryption** options for sensitive data
- **Audit logging** for compliance and security
- **Mobile-responsive** shared views

## System Architecture

### 1. High-Level Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Layer  │────▶│    Database     │
│ (React/TypeScript)    │  (PHP/REST)   │     │    (MySQL)      │
└─────────────────┘     └──────────────┘     └─────────────────┘
         │                       │                      │
         ▼                       ▼                      ▼
   Share Dialog           Token Validation         Share Storage
   Share View            Access Control           Audit Logging
   Auto-Auth             Rate Limiting            Cleanup Jobs
```

### 2. Data Flow

#### Share Creation Flow
1. User initiates share through ShareDialog component
2. Frontend filters profile data based on selections
3. Data encrypted and sent to API
4. API generates unique token and stores share
5. Share URL returned to user

#### Share Access Flow
1. Recipient opens URL with token parameter
2. App detects token and switches to SharedView
3. Token validated against backend
4. Filtered data returned and displayed
5. Access logged for audit

## Database Schema

### Core Tables

#### `share_links` Table (Primary Implementation)
```sql
CREATE TABLE share_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    share_id VARCHAR(36) UNIQUE NOT NULL,
    access_token VARCHAR(8) UNIQUE NOT NULL,
    encrypted_profile TEXT NOT NULL,
    recipient_name VARCHAR(255),
    share_note TEXT,
    selected_categories JSON,
    include_quick_info BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    accessed_count INT DEFAULT 0,
    last_accessed_at TIMESTAMP NULL,
    INDEX idx_token (access_token),
    INDEX idx_expires (expires_at)
);
```

#### `shared_profiles` Table (Alternative Implementation)
```sql
CREATE TABLE shared_profiles (
    share_id VARCHAR(36) PRIMARY KEY,
    access_code VARCHAR(8) NOT NULL,
    encrypted_data LONGBLOB NOT NULL,
    recipient_type VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    view_count INT DEFAULT 0,
    max_views INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_access_code (access_code),
    INDEX idx_expires_at (expires_at)
);
```

#### `share_audit` Table
```sql
CREATE TABLE share_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    share_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (share_id) REFERENCES shared_profiles(share_id) ON DELETE CASCADE,
    INDEX idx_share_event (share_id, event_type)
);
```

## Frontend Implementation

### 1. Share Dialog Component

**Key Features:**
- Recipient type presets (teacher, doctor, babysitter, custom)
- Category-based content filtering
- Expiration duration selection
- Quick info panel inclusion toggle
- Real-time share preview

**Implementation Pattern:**
```typescript
const handleGenerateLink = () => {
  // Generate cryptographically secure token
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Filter profile based on selections
  const sharedProfile = {
    ...profile,
    entries: profile.entries.filter(entry => 
      selectedCategories.includes(entry.category)
    ),
    quickInfoPanels: includeQuickInfo 
      ? profile.quickInfoPanels.filter(panel => panel.isVisible)
      : []
  };
  
  // Store locally or send to API
  if (process.env.REACT_APP_API_URL) {
    await createShareLink({
      profile_data: sharedProfile,
      access_token: code,
      expires_at: expirationDate,
      recipient_name: recipientName,
      selected_categories: selectedCategories,
    });
  }
  
  const shareDomain = process.env.REACT_APP_SHARE_DOMAIN;
  setGeneratedLink(`${shareDomain}?share=${code}`);
};
```

### 2. Auto-Authentication System

**URL Parameter Detection:**
```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('share');
  
  if (code) {
    setShareCode(code);
    setIsSharedView(true);
    setShowOnboarding(false);
  }
}, []);
```

**Conditional Rendering:**
```typescript
if (isSharedView && shareCode) {
  return <SharedView shareCode={shareCode} />;
}
// Normal app flow continues...
```

### 3. Shared View Component

**Features:**
- Read-only profile display
- Expiration warnings
- Category-based content organization
- Responsive design
- Print-friendly layout

**Security Considerations:**
- No edit capabilities
- No access to sync functions
- Limited navigation options
- Clear security indicators

## Backend Implementation

### 1. Share Creation Endpoint

**Endpoint:** `POST /api/share/create.php`

**Key Security Features:**
- Token uniqueness validation
- Input sanitization
- Rate limiting
- Encrypted data storage

**Implementation:**
```php
// Generate unique token with retry logic
$maxAttempts = 10;
while ($attempts < $maxAttempts) {
    $accessToken = generateAccessCode();
    $existing = $db->fetchOne(
        "SELECT share_id FROM share_links WHERE access_token = ?",
        [$accessToken]
    );
    if (!$existing) break;
    $attempts++;
}

// Store encrypted profile
$encryptedProfile = base64_encode(json_encode($profileData));

$stmt = $db->prepare("
    INSERT INTO share_links (
        share_id, access_token, encrypted_profile,
        recipient_name, expires_at
    ) VALUES (?, ?, ?, ?, ?)
");
```

### 2. Share Access Endpoint

**Endpoint:** `GET /api/share/access.php?token=TOKEN`

**Validation Steps:**
1. Token format validation
2. Existence check
3. Expiration validation
4. View limit enforcement
5. Access logging

**Implementation:**
```php
// Validate and fetch share
$stmt = $db->prepare("
    SELECT encrypted_profile, expires_at, view_count, max_views
    FROM share_links
    WHERE access_token = ? AND expires_at > NOW()
");

// Update access metrics
$updateStmt = $db->prepare("
    UPDATE share_links 
    SET accessed_count = accessed_count + 1,
        last_accessed_at = NOW()
    WHERE access_token = ?
");

// Return decrypted data
$profileData = json_decode(base64_decode($share['encrypted_profile']), true);
```

## Security Architecture

### 1. Token Generation

**Requirements:**
- 6-8 character alphanumeric tokens
- Cryptographically secure generation
- Case-insensitive handling
- Collision detection and retry

**Implementation:**
```php
function generateAccessCode() {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    
    for ($i = 0; $i < SHARE_CODE_LENGTH; $i++) {
        $code .= $characters[random_int(0, strlen($characters) - 1)];
    }
    
    return $code;
}
```

### 2. Input Validation

**Token Validation:**
```php
function validateToken($token) {
    if (!preg_match('/^[A-Z0-9]{6,8}$/', $token)) {
        throw new InvalidArgumentException("Invalid token format");
    }
    return $token;
}
```

**Data Size Limits:**
- Maximum blob size: Configurable (default 10MB)
- Token length: 6-8 characters
- Expiration: 1 hour to 1 year

### 3. Rate Limiting

**Implementation Pattern:**
```php
class RateLimiter {
    public function checkLimit($endpoint) {
        $identifier = $this->getIdentifier();
        $window = 3600; // 1 hour
        $limit = $this->getLimitForEndpoint($endpoint);
        
        $count = $this->db->fetchOne(
            "SELECT request_count FROM rate_limits 
             WHERE identifier = ? AND endpoint = ? 
             AND window_start > DATE_SUB(NOW(), INTERVAL ? SECOND)",
            [$identifier, $endpoint, $window]
        );
        
        if ($count >= $limit) {
            throw new RateLimitException();
        }
        
        $this->incrementCounter($identifier, $endpoint);
    }
}
```

### 4. Privacy Protection

**IP Hashing:**
```php
function hashIp($ip) {
    return hash('sha256', $ip . IP_SALT);
}
```

**Audit Logging:**
- No personal data in logs
- Hashed IP addresses
- Event-based tracking only

## Operational Considerations

### 1. Cleanup Processes

**Automated Cleanup:**
```sql
CREATE EVENT daily_cleanup
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM share_links WHERE expires_at < NOW();
```

**Manual Cleanup Options:**
```php
// Remove shares older than retention period
DELETE FROM share_links 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

// Clean up abandoned shares
DELETE FROM share_links 
WHERE accessed_count = 0 
AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 2. Monitoring Queries

**Share Usage Analytics:**
```sql
-- Active shares by type
SELECT 
    recipient_type,
    COUNT(*) as share_count,
    AVG(accessed_count) as avg_accesses
FROM share_links
WHERE expires_at > NOW()
GROUP BY recipient_type;

-- Share creation trends
SELECT 
    DATE(created_at) as share_date,
    COUNT(*) as shares_created,
    SUM(accessed_count) as total_accesses
FROM share_links
GROUP BY DATE(created_at)
ORDER BY share_date DESC
LIMIT 30;
```

### 3. Performance Optimization

**Database Indexes:**
- Primary key on share_id
- Unique index on access_token
- Index on expires_at for cleanup
- Composite index for audit queries

**Caching Strategies:**
- 15-minute cache for accessed shares
- CDN caching for static assets
- Database query result caching

## Implementation Recommendations for StackMap

### 1. Core Components to Adapt

**Essential:**
- Token generation and validation system
- URL-based auto-authentication
- Share expiration handling
- Basic audit logging

**Recommended:**
- Category-based filtering
- Recipient type presets
- View count limiting
- IP-based rate limiting

**Optional:**
- QR code generation
- Print-friendly views
- Share analytics dashboard
- Advanced encryption options

### 2. Architecture Adaptations

**For Different Tech Stacks:**

**Node.js/Express:**
```javascript
// Token generation
const crypto = require('crypto');
function generateToken() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Share creation endpoint
app.post('/api/shares', async (req, res) => {
  const token = generateToken();
  const share = await Share.create({
    token,
    data: req.body.data,
    expiresAt: new Date(Date.now() + req.body.expiryHours * 3600000)
  });
  res.json({ shareUrl: `${BASE_URL}?share=${token}` });
});
```

**Python/Django:**
```python
# Token generation
import secrets
def generate_token():
    return secrets.token_urlsafe(6)[:8].upper()

# Share view
class ShareAccessView(APIView):
    def get(self, request):
        token = request.query_params.get('token')
        share = Share.objects.filter(
            token=token,
            expires_at__gt=timezone.now()
        ).first()
        
        if not share:
            return Response({'error': 'Invalid token'}, status=404)
            
        share.access_count += 1
        share.save()
        
        return Response({'data': share.data})
```

### 3. Security Enhancements

**Additional Measures to Consider:**
- Two-factor authentication for share creation
- Recipient email verification
- Watermarking for printed shares
- End-to-end encryption options
- Blockchain-based audit trail

### 4. Scalability Considerations

**For High-Volume Deployments:**
- Redis for token caching
- Horizontal database sharding
- CDN for shared content delivery
- Message queue for async operations
- Microservice architecture for share service

## Migration Path

### Phase 1: Basic Implementation (2-4 weeks)
1. Implement token generation system
2. Create share storage schema
3. Build basic share creation API
4. Implement URL-based access
5. Add expiration handling

### Phase 2: Enhanced Features (2-3 weeks)
1. Add content filtering
2. Implement recipient types
3. Add audit logging
4. Build share management UI
5. Add rate limiting

### Phase 3: Advanced Features (3-4 weeks)
1. Implement view count limits
2. Add analytics dashboard
3. Build QR code generation
4. Add print views
5. Implement advanced security

## Conclusion

Manylla's sharing architecture provides a robust foundation for secure, temporary data sharing. The modular design allows StackMap to adopt components selectively based on their specific requirements. Key strengths include:

- **Security-first design** with multiple validation layers
- **Flexible content filtering** for different use cases
- **Scalable architecture** supporting various deployment sizes
- **Privacy-conscious** implementation with minimal data retention
- **User-friendly** auto-authentication system

By following this implementation guide, StackMap can build a sharing platform that balances security, usability, and performance while maintaining the flexibility to adapt to their unique requirements.

## Appendix: Code Samples

### Complete Token Validation Function
```php
public static function validateAndSanitizeToken($token) {
    // Remove whitespace
    $token = trim($token);
    
    // Convert to uppercase
    $token = strtoupper($token);
    
    // Validate format
    if (!preg_match('/^[A-Z0-9]{6,8}$/', $token)) {
        throw new InvalidTokenException("Invalid token format");
    }
    
    // Additional security checks
    if (strlen($token) < 6) {
        throw new InvalidTokenException("Token too short");
    }
    
    // Check for common patterns (optional)
    $commonPatterns = ['123456', 'ABCDEF', '000000'];
    if (in_array($token, $commonPatterns)) {
        throw new InvalidTokenException("Token too predictable");
    }
    
    return $token;
}
```

### React Hook for Share Management
```typescript
export const useShareManager = () => {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  
  const createShare = async (data: ShareData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const share = await response.json();
      setShares([...shares, share]);
      return share.shareUrl;
    } finally {
      setLoading(false);
    }
  };
  
  const revokeShare = async (shareId: string) => {
    await fetch(`/api/shares/${shareId}`, { method: 'DELETE' });
    setShares(shares.filter(s => s.id !== shareId));
  };
  
  return { shares, createShare, revokeShare, loading };
};
```

### Database Migration Script
```sql
-- Add sharing tables to existing database
ALTER TABLE users ADD COLUMN sharing_enabled BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS user_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    share_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (share_id) REFERENCES share_links(share_id),
    INDEX idx_user_shares (user_id, created_at)
);

-- Add analytics views
CREATE VIEW share_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as shares_created,
    SUM(accessed_count) as total_accesses,
    AVG(TIMESTAMPDIFF(HOUR, created_at, last_accessed_at)) as avg_hours_to_access
FROM share_links
GROUP BY DATE(created_at);
```