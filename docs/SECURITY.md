# Security Documentation

This document outlines the security measures implemented in the Manylla application.

## Security Hotspot Resolution (Story S054)

### Overview
As part of Story S054, we conducted a comprehensive security audit and resolved identified hotspots while maintaining appropriate logging for debugging purposes.

### 1. DOM Manipulation Vulnerability Fix

**Location**: `src/utils/platform.js` - print function (lines 440-492)

**Issue**: The print function previously used unsanitized user input in CSS template literals, allowing potential CSS injection attacks.

**Solution**:
- Added `isValidElementId()` validation function that strictly validates CSS ID selectors
- Validation regex: `/^[a-zA-Z_-][a-zA-Z0-9_-]*$/` ensures only safe characters
- Maximum length limit of 100 characters to prevent abuse
- Invalid IDs fall back to full page printing instead of creating CSS rules

**Security Benefits**:
- Prevents CSS injection attacks via malicious elementId parameters
- Prevents XSS attempts through script tag injection
- Protects against CSS selector manipulation
- Maintains functionality while ensuring security

**Test Coverage**: 35 security tests covering various attack vectors

### 2. Console Statement Audit

**Approach**: Reviewed all 31 console statements in production code and categorized them based on security impact.

**Actions Taken**:
- **Protected invite code operations**: Added development-only guards to invite code console.warn statements in `src/utils/inviteCode.js`
- **Maintained critical logging**: Kept essential error logging for production debugging while ensuring no sensitive data exposure
- **Security-conscious logging**: All production console statements only log `error.message` (not full error objects) to prevent information leakage

**Console Statement Categories**:

1. **Development-Only** (Protected with NODE_ENV checks):
   - Error details in `src/utils/errors.js`
   - Photo upload failures in `src/components/Profile/PhotoUpload.js`
   - Sync operation failures in `src/context/SyncContext.js`
   - Invite code operations in `src/utils/inviteCode.js`
   - ElementId validation warnings in `src/utils/platform.js`

2. **Production-Safe** (Appropriate for production monitoring):
   - Storage operation warnings (profile loading, clearing)
   - Share operation warnings (native share failures)
   - QR code sharing warnings

**Security Rationale**:
- Critical errors should be logged for production debugging
- Only safe error messages (not full error objects) are logged
- Sensitive operations like invite codes are development-only
- User experience errors (sharing, storage) remain visible for support

### 3. Security Testing

**Test File**: `src/utils/__tests__/platform.security.test.js`

**Coverage**:
- **Valid Input Testing**: 7 test cases for legitimate element IDs
- **Injection Attack Prevention**: 12 test cases for various attack vectors
- **Type Safety**: 7 test cases for invalid data types
- **CSS Injection Prevention**: 5 test cases for CSS manipulation attempts
- **Edge Cases**: 4 test cases for boundary conditions

**Attack Vectors Tested**:
- CSS rule injection: `valid; } body { background: red !important; }`
- XSS attempts: `test'><script>alert('xss')</script>`
- CSS selector manipulation: `element.with.dots`
- Attribute injection: `test onclick=alert(1)`
- Comment injection: `test/*malicious*/`
- Length-based attacks: Strings over 100 characters

### 4. Security Guidelines

**For Developers**:

1. **Element ID Validation**: Always use `isValidElementId()` when processing user-provided element IDs
2. **Console Logging**:
   - Use development-only guards for sensitive debugging information
   - Only log `error.message` in production, never full error objects
   - Avoid logging user data, tokens, or encrypted content
3. **Input Validation**: Apply strict validation patterns for any user input used in DOM manipulation
4. **Error Handling**: Fail securely - invalid input should degrade gracefully without exposing system details

**Security Principles Applied**:
- **Defense in Depth**: Multiple layers of validation and sanitization
- **Least Privilege**: Only necessary information is logged
- **Fail Secure**: Invalid input falls back to safe defaults
- **Information Disclosure Prevention**: No sensitive data in logs

### 5. Monitoring and Maintenance

**Ongoing Security Practices**:
- Regular audit of console statements when adding new logging
- Security test updates when modifying validation logic
- Review of error handling patterns in code reviews
- Documentation updates when security requirements change

**Future Considerations**:
- Consider implementing Content Security Policy (CSP) for additional protection
- Monitor for new attack vectors in web security advisories
- Regular security dependency updates
- Consider implementing automated security testing in CI/CD pipeline

---

*Last Updated*: September 2025
*Story*: S054 - Security Hotspot Review and Resolution
*Reviewed By*: Development Team