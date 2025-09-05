# Manylla Invite Code System

## Overview

The invite code system provides a user-friendly way to share backup access without requiring recipients to type or manage 32-character recovery phrases. This is especially helpful for grandparents, caregivers, and other family members who need access to the child's information.

## How It Works

### Creating an Invite (Parent with Backup Enabled)
1. Parent opens Settings → Backup & Sync
2. Taps "Create Invite Code"
3. App generates 8-character code: `ABCD-1234`
4. Creates shareable URL: `manylla.com/sync/ABCD-1234#[recovery-phrase]`
5. Parent can share:
   - The full URL (one-click setup)
   - Just the code "ABCD-1234" (manual entry)

### Joining via Invite (Grandparent/Caregiver)
1. **With URL**: Click link → App reads code + recovery phrase → Automatic setup
2. **With Code**: Enter `ABCD-1234` → App validates → Retrieves recovery phrase → Setup complete
3. Server never sees the recovery phrase (zero-knowledge)

## Security Architecture

```
┌─────────────────────────────────────────────┐
│           CREATING AN INVITE                 │
├─────────────────────────────────────────────┤
│ 1. Generate code: ABCD-1234                 │
│ 2. Store locally: code → phrase mapping     │
│ 3. Create URL with phrase in fragment (#)   │
│ 4. Share via text/email/etc                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           JOINING WITH INVITE                │
├─────────────────────────────────────────────┤
│ 1. User provides: ABCD-1234 or clicks URL   │
│ 2. App retrieves recovery phrase            │
│ 3. Enables sync with recovered phrase       │
│ 4. Data syncs within 60 seconds             │
└─────────────────────────────────────────────┘
```

## Implementation Details

### Invite Code Format
- Format: `XXXX-XXXX` (8 characters + hyphen)
- Character set: `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
  - Excludes confusing characters: 0/O, 1/I/L
- Case insensitive for user convenience
- Total combinations: 32^8 = 1.1 trillion
- Expiry: 24 hours (configurable)

### URL Structure
```
https://manylla.com/sync/ABCD-1234#a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

- /sync/ABCD-1234: Invite code in URL path
- #recovery-phrase: 32-char recovery phrase in fragment
- Fragment never sent to server (browser security)
```

### Local Storage (Current Implementation)
```javascript
// Stored in localStorage
{
  "ABCD-1234": {
    "syncId": "derived-sync-id",
    "recoveryPhrase": "32-char-hex",
    "createdAt": 1704931200000,
    "expiresAt": 1705017600000  // +24 hours
  }
}
```

### API Endpoints (Future Backend)
- `POST /api/sync/create_invite.php` - Generate invite code
- `GET /api/sync/validate_invite.php` - Check if code is valid
- `POST /api/sync/use_invite.php` - Mark invite as used

## User Experience

### For Parents (Creating Invites)
1. One-tap invite creation
2. Large, readable code display: `ABCD - 1234`
3. Copy code or link with single tap
4. Clear expiration notice
5. Multiple invites can be active

### For Recipients (Using Invites)
1. Click link OR enter 8-character code
2. Automatic backup restoration
3. No account creation needed
4. Works on any device/browser
5. Data available within 60 seconds

## Benefits Over Direct Recovery Phrase Sharing

| Aspect | Recovery Phrase | Invite Code |
|--------|-----------------|-------------|
| Length | 32 characters | 8 characters |
| User-Friendly | Hard to type/share | Easy to share |
| Expiration | Never | 24 hours |
| Typing Errors | High risk | Low risk |
| Phone Sharing | Difficult | Easy |
| Security | Always valid | Time-limited |

## Security Considerations

1. **Zero-Knowledge**: Recovery phrase never sent to server
2. **Time-Limited**: 24-hour expiration reduces risk
3. **Local Validation**: Can work offline with cached codes
4. **No Account Required**: Maintains privacy
5. **Traceable**: Know when invites are created/used

## Current Limitations

1. **Local Storage Only**: Currently uses browser localStorage
   - Invites only work on the device that created them
   - Will be resolved when backend is deployed

2. **No Cross-Device Invites**: Until API is connected
   - Temporary limitation
   - Full functionality ready for backend

3. **Manual Expiration**: Codes don't auto-delete yet
   - Cleanup function available
   - Will be automatic with backend

## Future Enhancements

1. **Server-Side Storage**: Full cross-device invite support
2. **Analytics**: Track invite usage patterns
3. **Custom Expiration**: Let parents set 1-7 day expiry
4. **Revocation**: Cancel active invites
5. **QR Codes**: Generate QR codes for easier sharing
6. **SMS Integration**: Direct text message invites

## Testing Invite Codes

### Create an Invite
```javascript
// In browser console (with sync enabled)
const invite = await manyllaMinimalSyncService.createInviteCode();
console.log('Invite Code:', invite.inviteCode);
console.log('Share URL:', invite.inviteUrl);
```

### Validate an Invite
```javascript
// Check if an invite code is valid
const result = await manyllaMinimalSyncService.validateInviteCode('ABCD-1234');
console.log('Valid:', result.valid);
```

### Manual Testing Flow
1. Enable backup on Device A
2. Create invite code
3. Open private/incognito window (simulates Device B)
4. Navigate to invite URL or enter code
5. Verify backup restoration
6. Make changes on either device
7. Confirm sync within 60 seconds

## Comparison with StackMap

Manylla's implementation follows StackMap's proven pattern with adjustments:

| Feature | StackMap | Manylla |
|---------|----------|---------|
| Code Format | XXXX-XXXX | XXXX-XXXX (same) |
| Expiration | 24 hours | 24 hours (same) |
| URL Pattern | /sync/[code]#[phrase] | /sync/[code]#[phrase] (same) |
| Pull Interval | 30 seconds | 60 seconds |
| Use Case | Daily activities | Infrequent updates |

## Troubleshooting

### "Invalid invite code"
- Check code format: XXXX-XXXX
- Ensure not expired (24 hours)
- Try uppercase letters
- Verify on creating device (if localStorage)

### "Invite code expired"
- Codes expire after 24 hours
- Create a new invite code
- Consider sharing recovery phrase for permanent access

### "Can't create invite"
- Ensure backup is enabled first
- Check browser localStorage isn't full
- Try refreshing the page

## Summary

The invite code system makes Manylla's backup feature accessible to all family members, regardless of technical expertise. By providing both one-click URLs and simple 8-character codes, parents can easily share access while maintaining security through time-limited invites and zero-knowledge encryption.

---

*Last Updated: January 2025*
*Status: Implemented (localStorage), API Ready*