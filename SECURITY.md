# Security Policy

## 🔐 Our Security Commitment

Manylla handles extremely sensitive information for special needs families. Security isn't just a feature - it's fundamental to everything we do. We implement zero-knowledge encryption to ensure that even we cannot access your data.

## 🛡️ Security Features

### Zero-Knowledge Architecture
- **Client-Side Encryption**: All data is encrypted on your device before transmission
- **TweetNaCl.js**: Military-grade XSalsa20-Poly1305 authenticated encryption
- **100,000 Hash Iterations**: Key derivation using nacl.hash for maximum security
- **No Plain Text Storage**: Server never sees or stores unencrypted data

### Privacy by Design
- **No User Accounts**: Recovery phrases instead of usernames/passwords
- **No Analytics**: We don't track users or collect usage data
- **No Third-Party Access**: Your data never leaves our encrypted infrastructure
- **Local-First**: Full functionality even without internet connection

### Data Protection
- **Encrypted at Rest**: All database storage uses encrypted blobs
- **Encrypted in Transit**: HTTPS/TLS for all communications
- **Secure Sharing**: Temporary encrypted links with automatic expiration
- **Recovery Phrases**: 32-character hex codes for device synchronization

## 🚨 Reporting Security Vulnerabilities

### DO NOT Create Public Issues for Security Vulnerabilities

If you discover a security vulnerability, please help us protect our users by following responsible disclosure:

1. **Email us immediately**: security@manylla.com
2. **Encrypt your report** if possible (PGP key available on request)
3. **Include details**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What We Promise
- **Rapid Response**: Acknowledgment within 24 hours
- **Regular Updates**: Progress reports on the fix
- **Credit**: Public acknowledgment (unless you prefer anonymity)
- **No Legal Action**: Against good-faith security researchers

## 🔍 Scope

### In Scope
- Manylla web application (manylla.com)
- Manylla mobile applications (iOS/Android)
- API endpoints
- Encryption implementation
- Data storage and transmission
- Authentication/authorization mechanisms

### Out of Scope
- Social engineering attacks
- Physical attacks
- Denial of Service (DoS) attacks
- Attacks on users or user data
- Third-party services we integrate with

## ✅ Security Best Practices for Contributors

### Code Security
```javascript
// NEVER log sensitive data
console.log(userData); // ❌ WRONG

// NEVER store secrets in code
const API_KEY = "sk-1234..."; // ❌ WRONG

// ALWAYS use encryption service
const encrypted = await encryptionService.encrypt(data); // ✅ CORRECT

// ALWAYS validate input
const sanitized = validateAndSanitize(userInput); // ✅ CORRECT
```

### Development Guidelines
1. **Never commit secrets**: API keys, passwords, tokens
2. **Always encrypt PII**: Personal Identifiable Information
3. **Validate all input**: Prevent injection attacks
4. **Use secure dependencies**: Check for known vulnerabilities
5. **Follow least privilege**: Minimal permissions for all operations

### Security Checklist for PRs
- [ ] No hardcoded secrets or credentials
- [ ] No console.log of user data
- [ ] All PII is encrypted before storage
- [ ] Input validation on all user inputs
- [ ] No new dependencies with known vulnerabilities
- [ ] Changes maintain zero-knowledge architecture
- [ ] Security implications documented

## 🔄 Security Updates

We regularly update dependencies and conduct security reviews:

- **Weekly**: Dependency vulnerability scans
- **Monthly**: Security update reviews
- **Quarterly**: Comprehensive security audits
- **Immediate**: Critical vulnerability patches

## 📚 Security Resources

### For Users
- [Privacy Guide](docs/PRIVACY_GUIDE.md)
- [Recovery Phrase Best Practices](docs/RECOVERY_PHRASE_GUIDE.md)
- [Secure Sharing Guide](docs/SECURE_SHARING.md)

### For Developers
- [Encryption Implementation](docs/ENCRYPTION_ARCHITECTURE.md)
- [Security Architecture](docs/SECURITY_ARCHITECTURE.md)
- [Secure Coding Guidelines](docs/SECURE_CODING.md)

## 🏆 Security Hall of Fame

We're grateful to the security researchers who have helped us improve:

<!-- Add acknowledged researchers here -->
- *Your name could be here*

## 📋 Incident Response

In case of a security incident:

1. **Immediate**: Patch vulnerability and deploy fix
2. **24 hours**: Notify affected users (if any)
3. **48 hours**: Public disclosure with mitigation steps
4. **7 days**: Full incident report

## 🤝 Commitment to Users

Your trust is everything to us. We commit to:

- **Transparency**: Open about our security practices
- **Rapid Response**: Quick action on security issues
- **User First**: Your security is our top priority
- **Continuous Improvement**: Always strengthening our defenses

## ❓ Questions?

For non-urgent security questions:
- Email: security@manylla.com
- Documentation: [Security Docs](docs/SECURITY_ARCHITECTURE.md)

---

*Last updated: January 2025*

*Thank you for helping us keep Manylla secure for all families.*