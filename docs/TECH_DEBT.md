# Technical Debt Register

## High Priority

### 1. Mobile Photo Picker Implementation
**Date Identified**: 2025-09-10  
**Component**: `src/screens/Onboarding/OnboardingScreen.js` (lines 141-149)  
**Status**: Open  
**Priority**: HIGH  

**Current State**:
- Mobile users see error message: "Photo selection is currently only available on web"
- No photo upload capability during mobile onboarding
- Web implementation fully functional with validation

**Impact**:
- 100% of mobile users cannot add profile photos during onboarding
- Affects user experience on iOS and Android
- Users must switch to web to add photos later

**Proposed Solution**:
1. Install `react-native-image-picker` library
2. Implement platform-specific photo selection for iOS/Android
3. Add image compression for mobile (photos often larger)
4. Ensure consistent validation with web implementation

**Implementation Notes**:
```javascript
// Required packages
npm install react-native-image-picker
cd ios && pod install

// Implementation approach
import {launchImageLibrary} from 'react-native-image-picker';

const options = {
  mediaType: 'photo',
  includeBase64: true,
  maxWidth: 500,
  maxHeight: 500,
  quality: 0.7
};

launchImageLibrary(options, (response) => {
  if (response.assets && response.assets[0]) {
    const base64 = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
    setPhoto(base64);
  }
});
```

**Workaround**:
- Users can add photos after initial setup via web interface
- Photo is optional field, not blocking profile creation

**Acceptance Criteria**:
- [ ] Photo picker works on iOS
- [ ] Photo picker works on Android
- [ ] File size validation matches web (5MB)
- [ ] Image compression implemented
- [ ] Error handling for camera permissions
- [ ] Loading states during processing

---

## Medium Priority

### 2. Native Date Picker for Mobile
**Date Identified**: 2025-09-10  
**Component**: `src/screens/Onboarding/OnboardingScreen.js`  
**Status**: Partially Addressed  
**Priority**: MEDIUM  

**Current State**:
- Text input with automatic MM/DD/YYYY formatting
- Functional but not optimal UX

**Proposed Enhancement**:
- Implement native date picker using `@react-native-community/datetimepicker`
- Provide calendar interface on mobile devices

---

## Completed

### ✅ ErrorBoundary Modernization
**Date Identified**: 2025-01-11  
**Date Completed**: 2025-09-11  
**Component**: `src/components/ErrorBoundary/ErrorBoundary.js`  
**Status**: COMPLETED  

**What Was Done**:
- Modernized from class component to functional component with hooks
- Created `useErrorHandler` hook for error management logic
- Created `useErrorDisplay` hook for UI state management
- Built `ErrorFallback` component with theme-aware styling
- Built `ErrorRecovery` component with recovery options
- Prepared for React 19 migration with future implementation file

**Technical Solution**:
- Kept minimal class wrapper (required for error boundaries in React 18)
- Extracted all logic to reusable hooks
- Created functional components for all UI
- Ready for seamless migration to React 19's useErrorBoundary hook

---

## Low Priority

### 3. Image Optimization Pipeline
**Date Identified**: 2025-09-10  
**Component**: Photo handling across app  
**Status**: Open  
**Priority**: LOW  

**Current State**:
- Base64 encoded images stored directly
- No compression or optimization

**Proposed Enhancement**:
- Client-side image compression before storage
- Progressive image loading
- Thumbnail generation for list views

---

## Resolved Items

*None yet*

---

## Notes

- Tech debt items are reviewed monthly
- High priority items should be addressed within 2 sprints
- Each item should have clear acceptance criteria
- Document workarounds for unresolved items

Last Updated: 2025-09-10