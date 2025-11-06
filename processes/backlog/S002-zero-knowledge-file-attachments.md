# Story S002*: Zero-Knowledge File Attachments

## Overview
Add encrypted file attachment support for documents and images with automatic sync

## Status
- **Priority**: P1
- **Status**: READY
- **Created**: 2025-11-06
- **Assigned**: Unassigned
- **Type**: FEATURE

## Background
Users need to attach important documents (IEPs, medical reports) and images (therapy progress photos) to their child's profile entries while maintaining zero-knowledge encryption. This is a critical feature blocking adoption for many caregivers who need comprehensive document management alongside text notes.

## Requirements
1. Support file attachments (PDF, DOC/DOCX, TXT, JPG, PNG, HEIC) up to 50MB per file
2. Client-side encryption using existing NaCl approach (XSalsa20-Poly1305)
3. Store encrypted files on server filesystem at /public_html/manylla/qual/user-files/
4. Sync file metadata with 60-second pull interval (consistent with profile sync)
5. In-app preview for images, external app launch for documents
6. Queue failed uploads for retry on next sync cycle
7. Include files optionally in temporary shares
8. Support offline viewing of cached files

## Success Metrics
```bash
# Verification commands
npm test -- --testPathPattern=FileAttachment    # All file tests pass
grep -r "FileAttachment" src/ | wc -l          # Components integrated
ls -la api/file_*.php                          # API endpoints exist
curl https://manylla.com/qual/api/file_health.php  # API health check
# Manual verification:
# - Upload 50MB file successfully
# - Files sync across 2 devices within 60 seconds
# - Encrypted files unreadable on server
# - Share with file attachment works
```

## Implementation Guidelines
- Build on existing photoService.js patterns
- Extend manyllaEncryptionService for binary data
- NO TypeScript files (JavaScript only per team agreements)
- Use Platform.select() for platform differences
- Store file metadata in Entry.attachments array
- Implement chunked upload (1MB chunks) for large files
- Add to existing EntryDialog component

## Acceptance Criteria
- [ ] File picker works on iOS (UIDocumentPicker), Android (Intent), Web (HTML5)
- [ ] Files encrypted client-side before upload (verified unreadable on server)
- [ ] Files under 5MB upload in < 10 seconds on 4G
- [ ] File metadata stored in profile JSON and syncs properly
- [ ] Image thumbnails display in entry view
- [ ] Tap to preview/open works for all file types
- [ ] Failed uploads retry automatically with user feedback
- [ ] Storage warnings appear when approaching limits
- [ ] Files included correctly in shares when selected
- [ ] Delete attachment works with confirmation
- [ ] All platforms tested (Web at /qual/, iOS simulator, Android emulator)
- [ ] Zero console.logs in production code
- [ ] Tests achieve 30% coverage minimum

## Dependencies
- Existing sync infrastructure (sync_push.php, sync_pull.php)
- manyllaEncryptionService.js for encryption
- photoService.js patterns for image handling
- Server filesystem access at /public_html/manylla/qual/

## Estimated Effort
**Total**: L (Large - 3-4 hours focused work)

## Notes
*Story created via create-story-with-details.sh*

---
*Story ID: S002**
*Created: 2025-11-06*
*Status: READY*
