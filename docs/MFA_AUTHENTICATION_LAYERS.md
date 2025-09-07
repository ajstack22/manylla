# Multi-Factor Authentication (MFA) Layers Guide
*For Namecheap Shared Hosting*

## Overview of Authentication Layers

You have **THREE separate authentication systems** that can each have their own 2FA/MFA:

### 1. ✅ Namecheap Account (You just enabled this!)
- **What it protects**: Your Namecheap account dashboard
- **Access to**: Domain management, billing, service purchases
- **URL**: https://www.namecheap.com/myaccount/
- **2FA Methods**: TOTP (Google Authenticator), U2F, SMS, WebAuthn/FIDO

### 2. ⚠️ cPanel Account (Separate 2FA)
- **What it protects**: Your web hosting control panel
- **Access to**: File Manager, databases, email accounts, SSL certificates
- **URL**: https://manylla.com:2083/ or https://stackmap.app:2083/
- **2FA Methods**: TOTP apps (Google Authenticator, Authy)
- **Status**: Not yet configured (based on server check)

### 3. ⚠️ SSH/FTP Access
- **What it protects**: Command line and file transfer access
- **Access to**: Direct server file system
- **Current**: Password-only on port 21098
- **Can upgrade to**: SSH key authentication (recommended)

## How to Enable cPanel 2FA

### Method 1: Through cPanel Interface
1. Log into cPanel at https://manylla.com:2083/
2. Navigate to **Security** section
3. Click **Two-Factor Authentication**
4. Click **Set Up Two-Factor Authentication**
5. Scan QR code with authenticator app
6. Enter verification code
7. Save backup codes securely

### Method 2: Through WHM (if available)
1. Access WHM (Web Host Manager)
2. Navigate to **Security Center**
3. Click **Two-Factor Authentication**
4. Configure for cPanel users

## Setting Up SSH Key Authentication

Instead of password-based SSH, use key authentication:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy to server
ssh-copy-id -p 21098 stachblx@manylla.com

# Or manually add to server
cat ~/.ssh/id_ed25519.pub | ssh -p 21098 stachblx@manylla.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Test connection
ssh -p 21098 stachblx@manylla.com
```

## Authentication Best Practices

### For Each Layer:

#### Namecheap Account (✅ Done)
- Use TOTP (time-based) rather than SMS
- Save backup codes offline
- Consider hardware key (YubiKey) for highest security

#### cPanel (Recommended)
- Enable 2FA immediately after Namecheap 2FA
- Use same authenticator app for consistency
- Different from Namecheap password
- Store backup codes separately

#### SSH Access
- Disable password authentication after setting up keys
- Use passphrase on SSH key
- Consider separate keys for different devices

## Why Multiple Layers Matter

### Attack Scenarios Prevented:

1. **Namecheap Account Compromise**
   - Attacker can't access cPanel without separate 2FA
   - Can't modify DNS without your 2FA

2. **cPanel Breach**
   - Limited to hosting only, not domain control
   - Namecheap account still secure

3. **SSH Key Theft**
   - Passphrase protection prevents use
   - Other access methods remain secure

## Quick Security Checklist

### Already Done ✅
- [x] Namecheap account 2FA enabled
- [x] HTTPS enforced via HSTS
- [x] Security headers configured
- [x] File permissions hardened

### High Priority Actions ⚠️
- [ ] Enable cPanel 2FA (separate from Namecheap)
- [ ] Set up SSH key authentication
- [ ] Create unique, strong passwords for each layer
- [ ] Store backup codes securely (offline)

### Additional Recommendations
- [ ] Use password manager (Bitwarden, 1Password)
- [ ] Enable login notifications in cPanel
- [ ] Regular security audits (monthly)
- [ ] Monitor access logs

## Recovery Planning

### If Locked Out:

#### Namecheap Account
1. Use backup codes
2. Contact support with account verification
3. Recovery email process

#### cPanel
1. Access through Namecheap account portal
2. Use cPanel backup codes
3. Contact hosting support

#### SSH
1. Access through cPanel File Manager
2. Reset via cPanel Terminal
3. Modify authorized_keys through cPanel

## Monitoring Access

### Check Login History
```bash
# SSH login history
ssh -p 21098 stachblx@manylla.com "last -10"

# Check authentication logs
ssh -p 21098 stachblx@manylla.com "grep 'Accepted' /var/log/auth.log 2>/dev/null || echo 'Log not accessible'"
```

### cPanel Access Logs
- Check through cPanel → Metrics → Raw Access
- Review for unusual IP addresses
- Monitor failed login attempts

## Application-Level Security

Beyond infrastructure MFA, consider:

### For Manylla
- App-level authentication (future feature)
- Biometric unlock for mobile app
- Device-specific encryption keys

### For StackMap
- Multi-device verification
- Sync approval requirements
- Time-based access tokens

## Summary

You've enabled the **first layer** (Namecheap account) ✅

**Still recommended**:
1. **cPanel 2FA** - Protects hosting control panel
2. **SSH Keys** - Replaces password authentication
3. **Backup Codes** - Store securely offline

Each layer operates independently, providing defense in depth. Even if one layer is compromised, others remain secure.

## Resources

### Authenticator Apps (Use same for all)
- **Google Authenticator** (iOS/Android)
- **Authy** (Multi-device sync)
- **Microsoft Authenticator** (Backup features)
- **1Password** (Integrated with password manager)

### Hardware Keys (Optional Enhancement)
- YubiKey 5 Series
- Google Titan
- SoloKeys

### Documentation
- [Namecheap 2FA Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/9253/45/)
- [cPanel 2FA Setup](https://www.namecheap.com/support/knowledgebase/article.aspx/10036/2210/)
- [SSH Key Authentication](https://www.ssh.com/academy/ssh/keygen)

---

*Created: September 7, 2025*
*Security Level: With all layers = Maximum*
*Current Level: Medium (1 of 3 layers active)*