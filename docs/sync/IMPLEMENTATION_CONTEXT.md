# Manylla Security Implementation Context

## Essential Files for Reference

### Current Implementation Files
These files contain the existing code that will be modified:

1. **Sync Service**: `src/services/sync/manyllaMinimalSyncService.js`
   - Current sync implementation with 60-second pull interval
   - Has basic fragment extraction but needs hardening

2. **Encryption Service**: `src/services/sync/manyllaEncryptionService.js`
   - TweetNaCl implementation with manual UTF-8 encoding
   - 100,000 iterations matching StackMap

3. **Share Dialog**: `src/components/Sharing/ShareDialog.tsx`
   - CRITICAL: Currently stores medical data in PLAINTEXT
   - Line ~145 has the vulnerability

4. **Conflict Resolver**: `src/services/sync/conflictResolver.js`
   - Basic implementation, needs additive merging

### API Structure
All endpoints in `api/sync/` are skeleton files ready for implementation:
- Currently commented out pending backend deployment
- No validation, rate limiting, or security measures yet

### StackMap Reference Implementation
Located at: `/Users/adamstack/StackMap/StackMap/`
- Their sync service has proven security patterns
- Check their actual implementation, not just docs
- They learned from production issues we can avoid

## Key Security Decisions Already Made

1. **32-character hex recovery phrases** (matching StackMap)
2. **60-second pull interval** (vs StackMap's 30 - optimized for our use case)
3. **Manual UTF-8 encoding** for iOS compatibility
4. **100,000 nacl.hash iterations** for key derivation
5. **"Backup" messaging** instead of "Sync" for user clarity

## Testing Approach

### Local Testing
```bash
cd manylla-app
npm start  # Runs on http://localhost:3000
```

### Test Data
No production data exists. Use test profiles freely:
- Create test shares to verify encryption
- Test with various medical data formats
- Use browser DevTools to inspect localStorage

### Security Testing Commands
```bash
# Check for plaintext in localStorage
# 1. Create a share in the app
# 2. Open DevTools > Application > Local Storage
# 3. Search for any medical terms - should find NONE after fix

# Test API validation (when implemented)
curl -X POST http://localhost:3000/api/sync/push_timestamp.php \
  -H "Content-Type: application/json" \
  -d '{"sync_id": "INVALID!", "device_id": "12345"}'
# Should return 400 error after validation is added
```

## Breaking Changes Are OK

Since we have **ZERO users**, feel free to:
- Completely restructure data formats
- Change encryption methods
- Modify API contracts
- Alter storage schemas
- Remove backward compatibility code

## What NOT to Touch

1. **Core user experience** - Keep the simple, parent-friendly interface
2. **Manila envelope theme** - (#F4E4C1 color palette)
3. **Single profile design** - Don't add multi-child complexity
4. **Offline-first approach** - Must work without internet

## Common Pitfalls to Avoid

1. **Don't trust the StackMap docs** - Always verify against their actual code
2. **Test on iOS Safari** - Most parents will use iPhones
3. **Keep medical data private** - Never log sensitive information
4. **Maintain zero-knowledge** - Server should never see plaintext
5. **Test offline scenarios** - Parents often have poor connectivity

## Environment Notes

- React 19 with TypeScript
- Material-UI v7
- Create React App (not ejected)
- PHP backend (ready but not deployed)
- localStorage for persistence
- No user accounts system

## Questions During Implementation

If stuck, check:
1. How does StackMap handle this? (Check their code)
2. Is this change breaking? (It's OK if it is)
3. Does this maintain zero-knowledge? (Critical requirement)
4. Will this work offline? (Must always work offline)
5. Is the medical data encrypted? (Never store plaintext)

## Phase Completion Checklist

Before marking any phase complete:
1. Run all test commands provided
2. Manually test the feature in browser
3. Check localStorage for any plaintext data
4. Verify offline functionality still works
5. Update the master plan with notes and timestamps

## Getting Help

- StackMap implementation: `/Users/adamstack/StackMap/StackMap/src/services/sync/`
- Current Manylla code: `/Users/adamstack/manylla/manylla-app/src/`
- This context doc: `/Users/adamstack/manylla/manylla-app/docs/sync/IMPLEMENTATION_CONTEXT.md`
- Master plan: `/Users/adamstack/manylla/manylla-app/docs/sync/SECURITY_HARDENING_MASTER_PLAN.md`