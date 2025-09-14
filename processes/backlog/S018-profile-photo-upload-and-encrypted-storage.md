# Story S018*: Profile Photo Upload and Encrypted Storage

## Overview
Implement a comprehensive photo upload and encrypted storage system for user profile photos, supporting both web and mobile platforms with zero-knowledge encryption and secure cloud storage.

## Status
- **Priority**: P1
- **Status**: READY
- **Created**: 2025-09-13
- **Assigned**: Unassigned
- **Type**: UI
- **Epic**: Core Profile Management

## Background
Users need the ability to upload and store profile photos securely while maintaining the zero-knowledge encryption principles of the Manylla application. The current system supports photo display (line 49 in ChildProfile.js shows `photo` property exists) but lacks upload functionality. This feature will enhance user experience and personalization while ensuring data privacy through client-side encryption.

## Technical Architecture

### Security & Encryption Requirements
- All photos must be encrypted client-side using the existing ManyllaEncryptionService
- Photos stored as Base64-encoded encrypted blobs in MySQL database
- No plaintext photos ever transmitted to or stored on server
- Follow existing zero-knowledge encryption patterns (XSalsa20-Poly1305 via TweetNaCl)
- Photos included in sync data for cross-device availability

### Data Flow
1. **Upload**: User selects photo → Client-side resize/optimize → Encrypt with master key → Store as encrypted blob
2. **Display**: Retrieve encrypted blob → Decrypt with master key → Display as data URL
3. **Sync**: Photos included in encrypted profile data synced across devices
4. **Share**: Photos included in temporary encrypted shares (for print/export)

## Requirements

### Core Functionality
1. **Photo Upload Interface**
   - File picker supporting JPG, PNG, JPEG formats
   - Camera capture on mobile devices
   - Drag-and-drop upload on web
   - Replace existing photo functionality

2. **Image Processing**
   - Automatic resize to maximum 800x800 pixels for storage efficiency
   - Maintain aspect ratio during resize
   - Quality optimization (JPEG quality 85%)
   - File size limit: 2MB original, ~500KB after processing

3. **Encrypted Storage**
   - Store photos as Base64 encrypted strings in profile data
   - Photos included in existing sync mechanism
   - No separate photo storage table needed

4. **Cross-Platform Display**
   - Secure display of decrypted photos in ProfileOverview
   - Proper fallback to avatar placeholder
   - Responsive sizing for different screen sizes

### Integration Points

#### Extend Existing Components
- **ProfileEditDialog**: Add photo upload/change functionality
- **ProfileOverview**: Enhanced photo display (already partially implemented)
- **ChildProfile type**: Photo property already exists, ensure proper typing

#### Services Integration
- **ManyllaEncryptionService**: Extend to handle photo encryption/decryption
- **ManyllaMinimalSyncService**: Photos automatically included in profile sync
- **Share system**: Photos included in encrypted shares

## Technical Specifications

### File Structure
```
src/
├── components/
│   ├── Profile/
│   │   ├── PhotoUpload.js (NEW)
│   │   ├── ProfileEditDialog.js (MODIFY)
│   │   └── ProfileOverview.js (MODIFY - line 236-260 photo display)
│   └── Common/
│       └── ImagePicker.js (NEW - unified image selection)
├── services/
│   ├── photoService.js (NEW)
│   └── sync/
│       └── manyllaEncryptionService.js (EXTEND)
└── utils/
    └── imageUtils.js (NEW)
```

### New API Requirements
No new backend endpoints needed - photos stored in existing sync data structure.

### Database Schema Changes
No schema changes required - photos stored as encrypted strings within existing sync_data.encrypted_blob field.

### Component Specifications

#### PhotoUpload Component
```javascript
// src/components/Profile/PhotoUpload.js
export const PhotoUpload = ({
  currentPhoto,
  onPhotoChange,
  onPhotoRemove,
  disabled = false
}) => {
  // Cross-platform file/camera selection
  // Image preview
  // Remove photo functionality
  // Loading states during processing
}
```

#### ImagePicker Service
```javascript
// src/components/Common/ImagePicker.js
export const ImagePicker = {
  selectImage: () => Promise<ImageResult>,
  capturePhoto: () => Promise<ImageResult>, // Mobile only
  validateImage: (file) => ValidationResult,
}
```

#### Photo Service
```javascript
// src/services/photoService.js
export const PhotoService = {
  processImage: (imageFile) => Promise<ProcessedImage>,
  encryptPhoto: (imageData) => Promise<EncryptedPhoto>,
  decryptPhoto: (encryptedData) => Promise<DecryptedPhoto>,
  validateSize: (file) => boolean,
  resizeImage: (imageData, maxDimension) => Promise<ResizedImage>
}
```

## UI/UX Specifications

### Design Requirements
- **Platforms**: Web (React Native Web), iOS, Android
- **Uses Existing Components**: Extend ProfileEditDialog, enhance ProfileOverview
- **Responsive Design**: Adaptive photo sizes, mobile-optimized controls
- **Manylla Theme**: Manila envelope color scheme (#F4E4C1), existing button styles
- **Accessibility**: WCAG 2.1 AA compliance, screen reader support, keyboard navigation
- **Modal Type**: Photo selection within existing ProfileEditDialog

### Visual Design
- **Photo Display**: 120px circular avatar in ProfileOverview (existing styles.avatar)
- **Upload Interface**: Modern file picker with drag-drop, camera icon for mobile
- **Loading States**: Progress indicators during image processing/encryption
- **Error States**: Clear error messages for file format, size issues

### User Experience Flow
1. **Profile Edit**: User taps edit button → ProfileEditDialog opens
2. **Photo Section**: Dedicated photo section with current photo + change/remove options
3. **Upload Flow**: Tap change → File picker/camera → Preview → Confirm → Process/encrypt → Save
4. **Immediate Feedback**: Instant preview, processing indicators, success confirmation

## Implementation Phases

### Phase 1: Core Infrastructure (3-4 days)
- [ ] Create PhotoService with encryption/decryption
- [ ] Create ImageUtils for resize/optimization
- [ ] Extend ManyllaEncryptionService for photo handling
- [ ] Create cross-platform ImagePicker component

### Phase 2: UI Integration (2-3 days)
- [ ] Create PhotoUpload component
- [ ] Integrate into ProfileEditDialog
- [ ] Enhance ProfileOverview photo display
- [ ] Add loading and error states

### Phase 3: Testing & Polish (2 days)
- [ ] Cross-platform testing (Web, iOS, Android)
- [ ] Encryption/decryption validation
- [ ] Performance optimization
- [ ] Accessibility compliance

## Security Considerations

### Data Protection
- **Client-side encryption**: Photos never stored or transmitted unencrypted
- **Key management**: Use existing master key from ManyllaEncryptionService
- **Memory management**: Clear sensitive data from memory after use
- **Transport security**: HTTPS for encrypted blob transmission

### Privacy Requirements
- **Zero-knowledge**: Server cannot decrypt or view photos
- **Local storage**: No unencrypted photos in device cache
- **Sync security**: Photos encrypted in sync data
- **Share security**: Photos included in temporary encrypted shares only

### Validation & Sanitization
- **File type validation**: Strict allowlist (JPG, PNG, JPEG only)
- **File size limits**: 2MB upload, ~500KB after processing
- **Content validation**: Basic image header validation
- **Malicious file protection**: No execution of uploaded content

## Testing Requirements

### Unit Tests
- [ ] PhotoService encryption/decryption
- [ ] Image processing functions
- [ ] File validation logic
- [ ] Cross-platform ImagePicker

### Integration Tests
- [ ] Photo upload flow end-to-end
- [ ] ProfileEditDialog with photo functionality
- [ ] Sync service with photo data
- [ ] Share functionality including photos

### Platform Tests
- [ ] Web: Drag-drop, file picker, display
- [ ] iOS: Camera access, photo library, display
- [ ] Android: Camera access, gallery, display
- [ ] Cross-device: Photo sync verification

### Security Tests
- [ ] Encryption/decryption integrity
- [ ] File type validation bypass attempts
- [ ] Size limit enforcement
- [ ] Memory leak verification during processing

## Performance Requirements

### Image Processing
- **Processing time**: < 3 seconds for typical 2MB photo
- **Memory usage**: < 50MB peak during processing
- **UI responsiveness**: Non-blocking with progress indicators

### Storage Efficiency
- **Compressed size**: Target ~500KB for processed photos
- **Encryption overhead**: ~10% size increase from encryption
- **Sync impact**: Photos included in existing sync batches

### Display Performance
- **Decryption time**: < 500ms for photo display
- **Cache strategy**: Decrypt once, cache decrypted data URL
- **Memory management**: Clear cache on profile change

## Success Metrics

### Functional Verification
```bash
# Upload functionality
npm run test -- --testNamePattern="photo upload"

# Cross-platform display
npm run test:web && npm run test:ios && npm run test:android

# Encryption integrity
npm run test -- --testNamePattern="photo encryption"

# Sync verification
npm run test -- --testNamePattern="photo sync"
```

### Performance Benchmarks
- Photo processing < 3 seconds on mid-range devices
- UI remains responsive during processing
- Memory usage stays within 50MB during operations
- Sync time increase < 20% with photo data

### Security Validation
- All photos encrypted before storage/transmission
- No plaintext photos in network traffic (verify with proxy)
- Proper key derivation from master key
- Secure memory handling (no sensitive data in heap dumps)

## Deployment Considerations

### Build Requirements
- No additional dependencies beyond existing TweetNaCl, pako
- Web build size increase < 50KB
- Mobile bundle size impact < 100KB

### Migration Strategy
- Existing profiles without photos: No migration needed
- Future enhancement: Bulk photo import tool

### Monitoring
- Track photo upload success rates
- Monitor processing performance
- Alert on encryption failures

## Documentation Updates

### User Documentation
- Add photo upload instructions to user guide
- Update profile management documentation
- Privacy policy updates for photo handling

### Developer Documentation
- PhotoService API documentation
- Image processing pipeline documentation
- Security implementation notes

## Acceptance Criteria

### Core Functionality
- [ ] Users can upload photos from file picker (web) and camera/gallery (mobile)
- [ ] Photos automatically resized and optimized for storage
- [ ] All photos encrypted client-side before storage/transmission
- [ ] Photos display correctly in ProfileOverview across all platforms
- [ ] Users can replace or remove existing photos
- [ ] Photos included in profile sync across devices
- [ ] Photos included in share/export functionality

### Technical Requirements
- [ ] No plaintext photos ever stored or transmitted
- [ ] File size and format validation working correctly
- [ ] Cross-platform ImagePicker functionality
- [ ] Proper error handling and user feedback
- [ ] Memory management prevents leaks during processing
- [ ] Performance meets specified benchmarks

### Testing & Quality
- [ ] All unit and integration tests passing
- [ ] Cross-platform testing complete (Web, iOS, Android)
- [ ] Security testing validates encryption integrity
- [ ] Accessibility compliance verified
- [ ] No console errors or warnings
- [ ] Code review completed following ADVERSARIAL_REVIEW_PROCESS.md

### User Experience
- [ ] Intuitive photo upload interface
- [ ] Clear visual feedback during processing
- [ ] Appropriate error messages for failures
- [ ] Responsive design works on all screen sizes
- [ ] Loading states prevent user confusion

## Dependencies
- Existing ManyllaEncryptionService (functional)
- ProfileEditDialog component (exists, needs modification)
- ProfileOverview component (exists, needs enhancement)
- React Native permissions for camera access (mobile)

## Estimated Effort
**Total**: 7-9 days
- Phase 1 (Infrastructure): 3-4 days
- Phase 2 (UI Integration): 2-3 days
- Phase 3 (Testing & Polish): 2 days

## Implementation Notes
- Follow existing codebase patterns in /src/components/Profile/
- Use existing encryption service patterns from ManyllaEncryptionService
- Integrate with existing sync mechanism (no new sync logic needed)
- Photo property already exists in ChildProfile type (line 49)
- ProfileOverview already has basic photo display logic (lines 236-260)
- Must follow ADVERSARIAL_REVIEW_PROCESS.md for peer review

---
*Story ID: S018**
*Created: 2025-09-13*
*Status: READY*
