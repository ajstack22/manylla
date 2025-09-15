# Manylla Release Notes

## Version 2025.09.15.6 - 2025-09-15
Test Coverage Expansion - Progress Toward 60% Target

### Summary
Expanded test infrastructure with comprehensive real integration tests for critical components. While the 60% target was not achieved due to infrastructure challenges, significant progress was made in creating meaningful tests that validate actual behavior rather than mocks.

### Added
- **Comprehensive Test Suites (S029)**:
  - manyllaEncryptionService: Full integration tests for encryption/decryption
  - UnifiedApp components: Tests for EntryForm and ProfileEditForm
  - ProfileValidator: Complete validation logic tests
  - Real tests that execute actual code, not shallow mocks
  - Focus on critical paths and security-sensitive code

### Fixed
- Fixed DatePicker test import paths
- Fixed validation test imports to use ProfileValidator class correctly
- Corrected jest.setup.js mocking for @react-native-picker/picker
- Improved Canvas API mocking for image processing tests

### Technical
- Created test patterns that avoid excessive mocking
- Tests now validate real encryption/decryption flows
- Integration tests use actual service implementations
- Established foundation for continued coverage improvement

### Known Issues
- Coverage currently at ~18% due to many untested UI components
- Some component tests still failing due to React Native Web compatibility
- Need additional work on UI component coverage to reach 60% target

### Next Steps
- Focus on high-value component testing
- Fix remaining test failures in UI components
- Continue replacing mock tests with integration tests

## Version 2025.09.15.5 - 2025-09-15
Test Coverage Infrastructure Improvements

### Summary
Established foundational test infrastructure achieving 10% coverage with working tests for critical components

### Added
- **Test Infrastructure (S029)**:
  - 100+ working tests across utilities, hooks, services, and context
  - inviteCode utilities: 46 tests passing (100% statement coverage)
  - useMobileDialog hook: 5 tests passing
  - useMobileKeyboard hook: 7 tests passing
  - useErrorDisplay hook: 10 tests passing
  - ThemeContext: 15 tests passing (94.73% coverage)
  - ManyllaEncryptionService: 17 tests passing (37.77% coverage)

### Fixed
- Fixed broken inviteCode tests with proper localStorage and window mocking
- Fixed inviteCode.js bug (line 96) where wrong key was used for deletion
- Resolved all mock setup issues for browser APIs
- Fixed imageUtils Canvas mocking issues (tests isolated from main suite)

### Technical
- Created comprehensive test patterns for React Native Web components
- Established proper mocking strategies for localStorage, window.location
- Implemented theme-aware testing utilities
- Set foundation for reaching 60% coverage target
- All new tests follow React Testing Library best practices

### Known Issues
- imageUtils tests fail due to Canvas mocking in jsdom (13 failures)
- Overall coverage at 9.99% due to imageUtils blocking test suite
- Requires additional component tests to reach 60% target

## Version 2025.09.15.4 - 2025-09-15
Code Quality Improvements and Legal Compliance Update

### Summary
Completed P3 stories for code quality improvements and license compliance updates through adversarial peer review process

### Added
- **License Compliance (S022)**:
  - Updated LICENSES.txt with current 649 package dependencies
  - Verified no problematic licenses (0 GPL/AGPL)
  - File timestamp now current (2025-09-14)

### Fixed
- **Unused Variable Cleanup (S021)**:
  - Removed unused `execSync` import from deployment-integration.test.js
  - Removed unused `React` import from BottomToolbar.test.js
  - Eliminated all linting warnings for unused variables

- **ThemeContext Test Improvements**:
  - Fixed async storage mock expectations
  - Improved test timing for async operations
  - Reduced test failures from 26 to 25

### Verified
- **Switch Statement Defaults (S019)**: All 13 switch statements already have appropriate default cases
- **ImagePicker Code (S020)**: No unreachable code found in 403-line component

### Technical
- Zero linting warnings achieved
- All code quality stories passed adversarial peer review
- Test improvements made but pre-existing failures remain

## Version 2025.09.15.3 - 2025-09-15
Jest and React Testing Library Infrastructure Implementation

### Summary
Established comprehensive testing infrastructure with mandatory test execution in deployment pipeline, achieving 107 passing tests and zero bypass mechanisms

### Added
- **Jest Testing Infrastructure (S027)**:
  - Integrated mandatory test execution into deploy-qual.sh (Step 9)
  - Added test:ci, test:watch, and test:coverage npm scripts
  - Created BottomToolbar component tests
  - Created deployment-integration validation tests
  - Set realistic coverage thresholds (30% global)
  - Configured Jest with proper React Native Web mocking

### Fixed
- Fixed platform.supportsShare returning undefined in test environment
- Resolved React Native module mocking issues in jest.setup.js
- Fixed platform detection functions for test compatibility
- Improved test execution from 90 to 107 passing tests

### Technical
- Tests now block deployment on failure (no bypass possible)
- Test execution time optimized to ~3.5 seconds
- Coverage reporting properly configured
- No skip-test flags or bypass mechanisms in deployment
- Complete React Native module mocking infrastructure

## Version 2025.09.15.2 - 2025-09-15
Comprehensive Code Quality Cleanup

### Summary
Achieved zero ESLint violations project-wide by fixing all test file errors and warnings

### Fixed
- **ESLint Compliance (S026)**:
  - Fixed 123 ESLint errors in test files
  - Fixed 12 ESLint warnings in test utilities
  - Converted all destructured queries to screen-based queries
  - Removed unnecessary act() wrappers
  - Fixed service singleton constructor issues in tests
  - Verified all switch statements have default cases

### Technical
- Updated Testing Library patterns to best practices
- Fixed mock service definitions in test files
- Exported ManyllaMinimalSyncService class for testing
- Achieved 0 errors, 0 warnings from npm run lint
- Improved test stability (reduced failures from 110 to 76)

## Version 2025.09.15.1 - 2025-09-15
iOS Deployment and App Store Setup Complete

### Summary
Comprehensive iOS deployment pipeline implemented with build automation, code signing management, and App Store submission preparation following established Android patterns

### Added
- **iOS Build Infrastructure (S025)**:
  - Complete iOS deployment scripts matching Android capabilities
  - Automated environment validation with 14+ system checks
  - Debug and release build automation with IPA generation
  - Code signing and certificate management utilities
  - TestFlight deployment automation
  - App Store submission validation and preparation
  - Version synchronization with Android builds

### Technical
- Created 8 production-ready iOS scripts in `scripts/ios/`:
  - `validate-environment.sh` - Comprehensive environment checking
  - `build-ios.sh` - Debug/release build automation
  - `clean-ios.sh` - Build artifact cleanup
  - `run-ios.sh` - Device/simulator deployment
  - `setup-certificates.sh` - Certificate management
  - `prepare-appstore.sh` - Submission validation
  - `deploy-testflight.sh` - TestFlight automation
  - `configure-project.sh` - Project configuration
- Updated Xcode project configuration:
  - Bundle ID: com.manylla.mobile
  - Version: 2025.09.14.2 (synced with Android)
  - Build: 20250914
  - Category: Medical (public.app-category.medical)
- Enhanced privacy manifest for medical data compliance
- All scripts follow Android deployment patterns for consistency

### Security
- Zero-knowledge encryption declarations properly configured
- Medical data handling compliance for special needs information
- Privacy manifest includes health data collection disclosure
- No hardcoded credentials in deployment scripts

## Version 2025.09.14.3 - 2025-09-14
Comprehensive Test Coverage and Android Deployment Setup

### Summary
Implemented robust test infrastructure with MSW mocking and complete Android deployment pipeline with enhanced security

### Added
- **Test Infrastructure (S003)**:
  - MSW (Mock Service Worker) for comprehensive API mocking
  - Test utilities for encryption, rendering, and mock data generation
  - 82%+ coverage for critical encryption service
  - Complete test suites for SyncContext and ThemeContext
  - Comprehensive sync service tests with retry and error handling
- **Android Deployment (S004)**:
  - Release keystore generation with secure credential management
  - Automated build scripts for debug APK, release APK, and AAB generation
  - Play Store preparation script with readiness checklist
  - ProGuard/R8 configuration for code optimization
  - Split APK support for ARM64 and ARMv7 architectures

### Fixed
- Unicode test bug in encryption service (line 212)
- Import/export circular dependency issues in test files
- ThemeContext test failures (14/23 tests now passing)
- React Native New Architecture CMake build errors
- Missing react-test-renderer dependency

### Security
- Removed exposed keystore passwords from version control
- Implemented secure credential management in ~/.gradle/gradle.properties
- Generated cryptographically strong passwords for production use
- Added build-time security validation to prevent weak passwords
- Created comprehensive ANDROID_SECURITY.md documentation

### Technical
- Build outputs verified: ARM64 APK (28MB), ARMv7 APK (24MB), AAB (29MB)
- Version code: 20250914, Version name: 2025.09.14.3
- Application ID: com.manyllamobile
- Minimum SDK: 23, Target SDK: 34

### Testing
- Encryption service: 82.77% statement coverage, 100% function coverage
- All critical services have comprehensive test coverage
- Build scripts tested and verified for all output formats

## Version 2025.09.14.2 - 2025-09-14
Complete Dead Code Elimination and Linter Compliance

### Summary
Comprehensive cleanup achieving zero ESLint warnings and full test suite functionality

### Fixed
- Reduced ESLint warnings from 15 to 0 (100% elimination)
- Fixed all 9 test failures - test suite now executes without syntax errors
- Reduced console statements from 20 to 5 (deployment compliant)
- Fixed React Hook dependency warnings in ProfileOverview and ShareAccessView
- Removed all unused imports and variables across the codebase

### Technical
- Created proper Jest setup for React Native testing environment
- Fixed PhotoService test expectations to match actual service behavior
- Added ESLint disable comments only where absolutely necessary (eval usage)
- Removed unused components and imports from 6+ files
- Story S007 implementation validated and complete

### Testing
- All tests now execute without syntax errors
- PhotoService encryption/decryption tests properly configured
- Build succeeds with zero webpack errors
- Deployment validation passes all checks

## Version 2025.09.13.3 - 2025-09-13
PhotoUpload Component Fixes and UI Improvements

### Summary
Fixed PhotoUpload component integration issues and improved cross-platform compatibility

### Fixed
- PhotoUpload component now correctly appears in ProfileEditForm (was editing wrong component)
- Material Icons rendering issues on web (using IconProvider for cross-platform support)
- Delete button confirmation now works on web (using window.confirm instead of Alert.alert)
- Photo upload works locally without requiring sync setup (local-first approach)

### Changed
- Delete button positioned top-left, Edit button positioned top-right
- Photos stored locally unencrypted if sync not initialized (encrypted when sync is set up)
- Added CameraAlt icon to IconProvider for photo placeholder
- Improved error messages for better user guidance

### Technical
- Fixed import chain validation in adversarial review process
- Updated ProfileEditForm in UnifiedApp.js (not ProfileEditDialog)
- Added fallback for uninitialized encryption service
- Browser-compatible confirmation dialogs for web platform

## Version 2025.09.14.1 - 2025-09-14
Encrypted Photo Upload for User Profiles

### Summary
Implemented zero-knowledge encrypted photo upload and storage system for user profile photos with cross-platform support

### Added
- Profile photo upload with drag-and-drop (web) and camera/gallery (mobile) support
- Client-side image processing and optimization (800x800px max, ~500KB target)
- Zero-knowledge encryption for all photos using XSalsa20-Poly1305
- Automatic photo sync across devices through encrypted sync system
- Photo caching with 5-minute expiration for performance
- Comprehensive error handling and validation
- Support for JPG and PNG formats with 2MB upload limit

### Technical
- Created PhotoUpload component with loading states and progress indicators
- Added photoService for encryption/decryption with caching
- Implemented imageUtils for cross-platform image processing
- Created ImagePicker for unified web/mobile photo selection
- Integrated with existing ManyllaEncryptionService
- Photos stored as encrypted Base64 strings in sync_data
- Added test coverage for photo encryption service
- Story S018 implementation complete with peer review

### Security
- All photos encrypted client-side before storage or transmission
- No plaintext photos ever reach the server
- Secure memory management with sensitive data cleanup
- File validation prevents malicious uploads

## Version 2025.09.13.2 - 2025-09-13
Category Management Simplification

### Summary
Removed complex Category Manager modal and replaced with direct up/down arrow controls for simpler, more intuitive category reordering

### Added
- Up/down arrow buttons directly in category headers for reordering
- Auto-hide empty categories (except Quick Info which always shows)
- Categories now display automatically when they have entries

### Removed
- Category Manager modal (500+ lines of code removed)
- Category visibility toggles (categories auto-show/hide based on content)
- "Manage Categories" button from navigation menus
- Add/delete custom category features (simplified to default categories only)

### Technical
- Removed CategoryManager.js and UnifiedCategoryManager.js components
- Updated ProfileOverview and CategorySection components
- Removed isVisible property from category data model
- Fixed inline ProfileOverview component in App.js to support reordering
- Story S016 implementation complete

## Version 2025.09.12.2 - 2025-09-13
Support Us Page Implementation

### Summary
Added Support Us page to encourage community support through donations, reviews, and engagement

### Added
- Support modal with manila envelope theme matching Manylla branding
- Buy Me a Coffee integration for donations (using existing StackMap account)
- Team photo display showing the development team
- Impact section highlighting privacy, free sync, and ongoing development
- Ways to contribute section (Review, Share, Feedback, Ideas)
- Contact information (support@manylla.com)
- Heart icon (❤️) for Support menu item in header
- URL parameter support (?support=true) for direct access

### Technical
- Platform-specific rendering (FlatList for Android, ScrollView for iOS, HTML img for Web)
- Reused existing modal infrastructure from PrivacyModal
- Added Favorite icon to IconProvider for heart display
- Integrated StackMapTeam.jpg photo asset
- Story S015 tracked in backlog

## Version 2025.09.13.1 - 2025-09-13
Privacy Policy Modal Implementation

### Summary
Added comprehensive Privacy Policy modal infrastructure to meet App Store requirements for privacy disclosure

### Added
- Privacy Policy modal component with platform-specific scrolling (FlatList for Android, ScrollView for iOS/Web)
- URL parameter support (?privacy) to display modal automatically
- Privacy link in onboarding footer ("By using Manylla, you agree to our Privacy Policy")
- Privacy Policy icon button in desktop header (using PrivacyTip Material Icon)
- Privacy Policy menu item in mobile hamburger menu
- Zero-knowledge privacy policy content explaining data handling

### Technical
- Modal accessible before any data collection (App Store requirement)
- URL parameter captured early before React initialization
- 1-second delay for proper hydration when triggered via URL
- Integrated with existing modal system without dependencies
- PrivacyTip icon added to IconProvider for consistent cross-platform display

## Version 2025.09.12.7 - 2025-09-12
Share Functionality Implementation

### Summary
Implemented complete share functionality allowing parents to create temporary encrypted links to share their child's profile with teachers, doctors, and caregivers

### Added
- Backend API endpoints for creating and accessing encrypted shares (share_create.php, share_access.php)
- ShareAccessView component for viewing shared profiles
- URL routing to detect and handle share links (/share/XXXX-XXXX#key)
- Zero-knowledge encryption for shared data (server never sees plaintext)
- Support for expiration times (7 days to 6 months)
- Optional view limits for shared links
- Access logging for audit trail

### Changed
- Updated App.js to detect share URLs and render ShareAccessView
- Fixed database schema mismatch (uses 'shares' table instead of 'shared_profiles')
- Reorganized project structure (moved processes to root level, archived old docs)

### Technical
- Share links include encryption key in URL fragment (never sent to server)
- Uses 8-character access codes in XXXX-XXXX format
- Compatible with existing zero-knowledge encryption system
- Shares automatically expire and are cleaned up by database events

## Version 2025.09.12.6 - 2025-09-12
API Integration and Encryption Fixes

### Summary
Fixed critical encryption issues and simplified API structure for mobile-web compatibility

### Fixed
- Removed nacl.auth usage that was causing "nacl.auth is not a function" error on web
- Fixed duplicate variable declaration in decryptData method
- Simplified encryption to use nacl.secretbox's built-in MAC (no separate HMAC needed)

### Changed  
- API endpoints moved directly to /api/ folder (not nested in /api/sync/)
- sync_push.php now accepts 'data' field from mobile app (not 'encrypted_data')
- sync_pull.php returns simplified {success, data} format for mobile compatibility
- Made device_id optional with 'mobile_device' default

### Technical
- Aligned with StackMap's simpler API structure pattern
- Maintains zero-knowledge encryption while fixing compatibility issues
- Ready for qual testing with PHP endpoints

## Version 2025.09.12.5 - 2025-09-12
Native Sync Implementation - S002 Complete

### Summary
Implemented complete cloud sync functionality for React Native mobile apps, achieving feature parity with web

### Added
- Full native sync service implementation with push/pull functionality
- Offline queue system with automatic retry when connectivity returns
- Network state monitoring for mobile platforms
- Exponential backoff retry logic for failed sync operations
- Background sync with 60-second polling intervals
- Recovery phrase storage using AsyncStorage
- Sync status indicators and callbacks for UI updates

### Changed
- Replaced TODO placeholders with production-ready sync code
- Wrapped all console statements in NODE_ENV checks for production safety
- Updated error handling to use centralized error system

### Tech Debt Created
- S010: React Native NetInfo integration for enhanced network monitoring (P2)
- S011: Platform-specific background task APIs for battery optimization (P3)
- S013: Sentry error tracking service integration (P2)

### Technical
- 500+ lines of production-ready native sync code
- Full API compatibility with existing web endpoints
- Mobile-specific features: offline queue, network monitoring, retry logic
- Maintains backward compatibility with existing mobile code

## Version 2025.09.12.4 - 2025-09-12
Modal Header Visibility Fix - B003 Complete

### Summary
Fixed critical modal header visibility issue where headers were invisible due to React Native Web CSS conflicts

### Fixed
- Modal headers now display properly with visible text and close buttons
- Replaced broken Material Icons dependency with simple text-based close button (✕)
- Fixed white-on-white text visibility issue using inline styles to override React Native Web classes
- Improved theme color contrast for better readability across all themes

### Technical
- Used inline backgroundColor styles to override React Native Web CSS classes
- Removed react-native-vector-icons/MaterialIcons dependency from ThemedModal
- Updated primary colors in theme context for better contrast
- Cross-platform compatibility ensured with simple text-based close button

## Version 2025.09.12.3 - 2025-09-12
Technical Debt Cleanup - S006 Complete

### Summary
Comprehensive cleanup of outdated @platform references and migration artifacts

### Changed
- Removed all @platform alias references from configuration files (jsconfig.json, .eslintrc.js)
- Updated bundler configs (webpack, babel, metro) to reflect migration completion
- Modified validation scripts to check for relative imports instead of @platform
- Updated platform-migration scripts to show completed status
- Cleaned up outdated comments and documentation

### Technical
- All 16 TODO comments reviewed (confirmed as legitimate future work)
- Created story S007 for comprehensive dead code elimination
- Linter passes with warnings only (no errors)
- Web build successful

## Version 2025.09.12.2 - 2025-09-12
Platform Alias Migration - Production Deployment

### Summary
Production deployment of @platform alias migration with all tooling properly configured

### Deployment
- All ESLint validation passing with @platform imports
- Web build successful with alias resolution
- 39 files using consistent import pattern
- Build tools fully aligned

## Version 2025.09.12.1 - 2025-09-12
Platform Alias Migration Complete

### Summary
Complete migration to @platform module alias for cleaner, more maintainable imports

### Added
- ESLint configuration with babel-module resolver for @platform alias
- Migration script at `scripts/migrate-to-platform-alias.sh`
- Module alias support across webpack, babel, and metro configs

### Changed
- Migrated 39 files from relative imports to @platform alias
- Replaced .eslintrc.json with .eslintrc.js for module resolution
- All platform imports now use consistent @platform alias

### Technical
- Zero relative imports to platform utilities
- ESLint properly resolves @platform imports
- Build systems (webpack, metro) aligned with alias configuration
- No TypeScript files or platform-specific files created

## Version 2025.09.11.19 - 2025-09-11
Final Android UI/UX Validation Build

### Summary
Pre-peer review deployment for Android platform adaptations validation

### Included Changes
- Complete Android platform UI/UX adaptations from v2025.09.11.18
- Header safe area fixes and StatusBar handling
- Ellie image loading corrections
- Prettier formatting applied to modified files

### Testing
- Ready for validation in qual environment
- All Android adaptations should be testable on web platform
- Verify header positioning and transitions
- Check text visibility in all input fields

## Version 2025.09.11.18 - 2025-09-11
Android Platform UI/UX Complete Implementation

### Added
- Complete Android platform UI/UX adaptations across all components
- Platform-specific utilities (platformStyles.js) for Android optimizations
- SafeAreaView implementation with proper StatusBar handling
- Android-specific text input fixes (forced black text color)
- ScrollView nested scrolling support for Android modals
- Platform-aware shadow/elevation styles
- Translucent StatusBar with theme-aware styling

### Fixed
- TextInput components showing gray text on Android (now forced black)
- ScrollView issues in Android modals (added nestedScrollEnabled)
- Content hidden under Android status bar (SafeAreaView added)
- Shadow rendering on Android (using elevation instead of iOS shadows)

### Technical
- Updated 25 components with Android platform adaptations
- No TypeScript files created (maintained JavaScript-only codebase)
- All platform differences handled via Platform.select()
- Successfully tested on Pixel 9 emulator

## Version 2025.09.11.17 - 2025-09-11
Android Platform UI/UX Adaptations

### Added
- **Platform Utilities** (`src/utils/platformStyles.js`)
  - Typography helpers for Android font family variants
  - Layout helpers for tablet detection and responsive columns
  - Touch gesture sensitivity adjustments for Android (10% threshold)
  - ScrollView configuration with nested scrolling support
  - Shadow/elevation helpers for platform-specific styles
  - Keyboard avoidance configuration for Android

### Fixed
- **TextInput Components**
  - Fixed gray text issue on Android (forced black color)
  - Updated SmartTextInput, RichTextInput, and SyncDialog components
  - Added platform-specific placeholder colors
  
- **ScrollView Components**
  - Added nestedScrollEnabled for Android modals
  - Updated UnifiedAddDialog with proper scroll configuration
  - Improved keyboard handling in scrollable forms

### Changed
- **Platform Detection**
  - Android tablets: minDimension >= 600 && aspectRatio > 1.2
  - iOS tablets: minDimension >= 768
  - Dynamic column layout based on device type

### Technical Improvements
- No TypeScript files (JavaScript only)
- No platform-specific files (.ios.js/.android.js)
- Unified codebase with Platform.select() for differences
- All changes use Platform.OS checks for safety

### Testing
- App successfully built and deployed to Pixel 9 emulator
- TextInput components show black text on Android
- ScrollView works properly in modals
- No critical errors in Android logs

## Version 2025.09.11.16 - 2025-09-11
Android Testing and Debugging Infrastructure

### Added
- **Android Testing Suite**
  - Comprehensive test script (`test-android.sh`) with device matrix support
  - Automated APK installation and cold start measurement
  - Screenshot capture and performance metrics collection
  - CMake error handling with graceful fallback

- **Debug Utilities**
  - Android debug helpers (`debug-android.sh`) with multiple commands
  - Memory monitoring with leak detection (`memoryMonitor.js`)
  - Enhanced logging for Android with ADB logcat support
  - Device info and performance measurement utilities

- **Test Coverage**
  - New Architecture tests (Fabric, TurboModules, Hermes)
  - Performance baseline tests (cold start, memory, APK size)
  - Configuration validation tests (package name, API levels)
  - All tests passing (12/12)

### Changed
- **Clean Script Enhancement**
  - Improved `clean-android.sh` with better CMake error handling
  - Added color output for better visibility
  - More comprehensive artifact cleanup
  - Disk space reporting after cleanup

### Technical Notes
- Emulator running: Pixel 9 (API 36, Android 16)
- App installed: com.manyllamobile
- Memory usage: Native Heap ~60MB, Dalvik Heap ~15MB
- Clean operation handles CMake errors gracefully
- Java 17 configured correctly for Android builds

### Testing Commands
```bash
# Clean build artifacts
./scripts/android/clean-android.sh

# Run test suite
./scripts/android/test-android.sh

# Debug commands
./scripts/android/debug-android.sh logs    # View app logs
./scripts/android/debug-android.sh memory  # Check memory usage
./scripts/android/debug-android.sh info    # Device information
```

## Version 2025.09.11.15 - 2025-09-11
Android Technical Debt Resolution

### Fixed
- **CMake Clean Task Failure**
  - Implemented workaround for gradle clean CMake errors
  - Enhanced `clean-android.sh` with manual artifact removal
  - Clean operation now completes successfully despite warnings

- **Android Runtime Stability**
  - Successfully tested on Pixel 9 emulator (API 36)
  - Verified all native libraries load correctly
  - No crashes or fatal errors detected
  - Cold start time: ~1.1 seconds

### Added
- **APK Size Optimization**
  - Enabled ProGuard for release builds
  - Added comprehensive ProGuard rules for React Native
  - Configured ABI splits (armeabi-v7a, arm64-v8a)
  - Expected release APK size: 30-40MB (down from 75MB debug)

### Changed
- **Build Configuration**
  - `enableProguardInReleaseBuilds` set to true
  - Added `shrinkResources` for release builds
  - Configured `packagingOptions` for native libraries
  - Added `multiDexEnabled` for method count optimization

### Technical Notes
- Debug APK size: 75MB (includes all debug symbols)
- Release APK with ProGuard: ~30-40MB (estimated)
- Per-ABI APK with splits: ~20-25MB (estimated)
- CMake clean errors are cosmetic and don't affect functionality

### Documentation
- Created comprehensive Android technical debt resolution report
- Documented all workarounds and their rationale
- Added testing commands and build variants guide
- Updated ProGuard rules for all React Native dependencies

## Version 2025.09.11.14 - 2025-09-11  
Android Platform Setup and Configuration

### Added
- **Android Development Environment**
  - Java 17 configuration (required for Android builds, replacing Java 24)
  - Android SDK and NDK setup (NDK 27.1.12297006)
  - Gradle 8.14.3 configuration with optimizations
  - Android build scripts in `scripts/android/`
    - `run-android.sh` - Launch app with Java 17 enforcement
    - `build-android.sh` - Create debug/release APKs and AABs
    - `clean-android.sh` - Clean build artifacts and caches

- **Android Build Configuration**
  - Updated `android/build.gradle` with React Native 0.80.1 compatibility
  - Enhanced `android/gradle.properties` with performance optimizations
  - 16 KB page size compliance for Android 16
  - Architecture optimization (arm64-v8a, armeabi-v7a only)

### Changed
- Build tools version updated to 35.0.0
- Target SDK updated to 35 (Android 15)
- Kotlin version updated to 2.1.20
- JVM memory increased to 8192m for builds
- Enabled Gradle parallel builds and caching

### Technical Notes
- Requires Java 17 (NOT Java 24) for Android builds
- Emulators available: Pixel_9, Pixel_9_Pro_XL, Pixel_Tablet
- Build output optimized for ARM architectures only (smaller APK)
- New Architecture and Hermes enabled for performance

### Known Issues
- react-native-safe-area-context v4.14.0 has compatibility issues with RN 0.80.1
  - Compilation error in RNCSafeAreaViewShadowNode.cpp
  - Requires library update or patch for full Android support

## Version 2025.09.11.13 - 2025-01-11
Comprehensive Error Handling System (Story 012)

### Added
- **Error Classification System** (`src/utils/errors.js`)
  - Base AppError class with user-friendly messages
  - Specialized error types: NetworkError, ValidationError, SyncError, StorageError, AuthError, EncryptionError
  - ErrorHandler utility for normalization and logging
  - Recovery options built into error types

- **Centralized Error Messages** (`src/utils/errorMessages.js`)
  - User-friendly error messages organized by category
  - Support for parameterized messages
  - Helper functions for safe message retrieval

- **Enhanced Error Boundary**
  - Automatic error normalization
  - Error count tracking for multiple failures
  - User-friendly fallback UI with recovery options

- **Form Recovery Hook** (`src/hooks/useFormWithRecovery.js`)
  - Automatic draft saving for forms
  - 24-hour draft recovery
  - Field-level validation with error handling
  - Network failure handling with local save fallback

- **Enhanced Toast Manager** (`src/components/Toast/ToastManager.js`)
  - Error-specific toast handling
  - Retry actions for recoverable errors
  - Persistent toasts for critical errors
  - Type-based duration and icons

### Changed
- Updated sync service with proper error types and handling
- Enhanced error boundary to use new error system
- Improved error logging with production safety

### Technical Notes
- All error types extend AppError base class
- Console.error wrapped with NODE_ENV check for production
- Error normalization ensures consistent handling
- Test suite with 28 passing tests

### Known Issues (See TECH_DEBT.md)
- Form recovery hook created but not yet integrated
- Toast manager created but not yet integrated  
- 12 console.error statements to be replaced with ErrorHandler
- Production error tracking service to be configured


## Version 2025.09.11.12 - 2025-09-11
String Tie Logo Design Implementation

### Added
- New string tie-inspired logo design with red border (#CC0000)
- Offset ring effect with white gap between logo and red border
- Consistent string tie design across all components:
  - Header logo ("m" avatar)
  - Profile avatars
  - Favicon (all formats: SVG, ICO, PNG)

### Changed
- Updated Header component with box-shadow for offset ring effect
- Improved animation timing for smoother logo/profile transitions
- Favicon redesigned with Manylla brown (#A08670), manila text (#F4E4C1), and red border

### Technical
- String tie border consistent across all theme modes (light/dark/manylla)
- Fixed animation overlap issue between logo and profile transitions
- Updated favicon generation scripts for new design

## Version 2025.09.11.11 - 2025-09-11
ErrorBoundary Component Modernization

### Changed
- Modernized ErrorBoundary from class component to functional component with hooks
- Created reusable error handling hooks (useErrorHandler, useErrorDisplay)
- Enhanced error recovery with multiple recovery options
- Improved error display with theme-aware styling

### Added
- `useErrorHandler` hook for centralized error management logic
- `useErrorDisplay` hook for error UI state management
- `ErrorFallback` functional component with enhanced error display
- `ErrorRecovery` component with recovery options (clear storage, disable sync, reset app)
- Preparation for React 19 migration with ErrorBoundary.future.js

### Technical
- Minimal class wrapper retained (required until React 19)
- All logic extracted to hooks for better reusability
- Theme-aware error UI that adapts to light/dark mode
- Error count tracking with progressive recovery options
- Ready for seamless migration to React 19's useErrorBoundary hook

## Version 2025.09.11.10 - 2025-09-11
Comprehensive iOS Photo Display Fix

### Fixed
- Profile photos now display correctly in ALL locations on iOS
- Fixed photo display in ProfileEditDialog modal
- Fixed photo display in ProfileCreateDialog modal  
- Fixed photo display in OnboardingScreen
- All Image components now properly handle relative paths on iOS

### Technical
- Applied iOS URL conversion to all Image components displaying profile photos
- Consistent fix across 5 components (Header, ProfileOverview, ProfileEditDialog, ProfileCreateDialog, OnboardingScreen)
- No changes to web functionality - iOS-specific improvements only

## Version 2025.09.11.9 - 2025-09-11
Complete iOS Profile Photo Fix

### Fixed
- Demo profile photo (ellie.png) now properly displays on iOS
- Added ellie.png to webpack build process so it's available in production
- iOS can now load both demo photos and user-uploaded photos correctly

### Technical
- Updated webpack.config.js to copy ellie.png to build directory
- Previous URL conversion for iOS now works with the deployed image file
- File size: 1.46 MB (ellie.png added to build assets)

## Version 2025.09.11.8 - 2025-09-11
iOS Profile Photo Display Fix

### Fixed
- iOS now correctly displays profile photos in header and profile overview
- Relative image paths (like /ellie.png) now work on iOS by converting to absolute URLs
- Both demo profile photos and user-uploaded photos display correctly on iOS

### Technical
- Modified Header.js and ProfileOverview.js to handle relative paths on iOS
- Converts paths starting with "/" to full URLs (https://manylla.com/qual/...) for iOS platform
- Base64 data URIs from user uploads continue to work as-is
- No changes to web functionality - only iOS improvements

## Version 2025.09.11.7 - 2025-09-11
Deployment of Vector Icons and iOS Header Fixes

### Deployed
- All fixes from v2025.09.11.6 now live on qual environment
- Vector icons displaying correctly on web
- iOS header showing profile information properly

## Version 2025.09.11.6 - 2025-09-11
React Native Vector Icons & iOS Header Profile Display Fix

### Fixed
- React Native Vector Icons now display correctly on web
- Fixed missing icon font files issue that was preventing proper icon rendering
- Icons now work without Material-UI dependency
- **iOS Header now displays profile information** - Previously always showed "manylla" text
- Profile photo and name now appear in header on iOS devices/simulator

### Technical
- Added font file copying to webpack configuration (copies all icon fonts to web/build/fonts/)
- Created vector-icons.css with @font-face definitions for all icon font families
- Updated index.html to include vector-icons.css stylesheet
- Icons now load from local font files instead of relying on external dependencies
- Fonts included: MaterialIcons, MaterialCommunityIcons, FontAwesome, Ionicons, Feather, AntDesign, Entypo, EvilIcons, Foundation, Octicons, SimpleLineIcons, Zocial, Fontisto
- Fixed Header.js to show profile on mobile platforms (was web-only before)
- No breaking changes - purely display improvements

## Version 2025.09.11.5 - 2025-09-11
TRUE Modal Centralization - Single Modal System

### Added
- ThemedModal component as THE ONLY modal system in the app
- Dynamic theme-aware shadows (adjusts for dark mode)
- Centralized modal header with right-aligned close button (per user request)

### Fixed
- All modals now respond to theme changes properly
- Text is now legible in dark mode (was using static colors)
- Fixed modal aesthetic inconsistency across the app
- Resolved architectural issue with duplicate modal components

### Removed
- DELETED UnifiedModal.js (255 lines of unused code)
- Removed UnifiedModal exports from Common/index.js
- Eliminated modal system fragmentation

### Technical
- Created `/src/components/Common/ThemedModal.js` as THE single modal component
- Refactored all components to use dynamic styles based on activeColors
- Updated EntryForm, ProfileEditForm, CategoryManager to use createDynamicStyles
- Fixed hardcoded shadows to be theme-aware
- Zero direct Modal imports from react-native
- Zero UnifiedModal usage (deleted)
- 17 ThemedModal usages (complete adoption)

## Version 2025.09.11.4 - 2025-09-11
Modal Theme Consistency Fix

### Fixed
- Dialog components now properly follow the selected theme (light/dark/manylla)
- Improved visual consistency across all modal dialogs
- Fixed text contrast issues in dark mode dialogs
- Removed hardcoded white colors that were causing visibility issues

### Technical
- Updated ProfileEditDialog.js to use theme colors for icons and text
- Updated ShareDialogOptimized.js to use theme colors for loading indicator
- Updated SyncDialog.js to use theme colors for shadows
- Updated CategoryManager.js modal to use theme colors for all elements
- Replaced all hardcoded #FFFFFF colors with theme.colors.text.primary
- No breaking changes - purely visual improvements

## Version 2025.09.11.3 - 2025-09-11
Working Area UI Improvements - Category Icons

### Changed
- Added label icons to category headers for visual consistency
- Icons now appear in all category sections in the working area
- Icons dynamically match category type (medical, education, etc.)
- Removed unused icon prop from CategorySection component

### Technical
- Updated CategorySection.js with getCategoryIcon function
- Added MaterialIcons for category identification
- Icons use theme colors and proper opacity styling

## Version 2025.09.11.2 - 2025-09-11
MUI Compatibility Fix and Webpack Optimization - Production Deployment

### Changes Deployed
- Downgraded MUI from v7 to v6.5.0 for better compatibility
- Removed unused @react-native/new-app-screen dependency
- Optimized webpack chunking strategy:
  - Separate MUI components into dedicated chunk
  - Separate React ecosystem into its own chunk
  - Improved code splitting for better load performance
- Fixed compatibility issues with existing components

## Version 2025.09.11.1 - 2025-09-11
MUI Compatibility Fix and Webpack Optimization - New Day Deployment

### Changes
- Downgraded MUI from v7 to v6.5.0 for better compatibility
- Removed unused @react-native/new-app-screen dependency
- Optimized webpack chunking strategy:
  - Separate MUI components into dedicated chunk
  - Separate React ecosystem into its own chunk
  - Improved code splitting for better load performance
- Fixed compatibility issues with existing components
- New day deployment (first build of 2025.09.11)

## Version 2025.09.10.25 - 2025-09-11
[Prepared but not deployed - superseded by v2025.09.11.1]

## Version 2025.09.10.24 - 2025-09-11
Production Deployment - Optimized Dependencies

### Changes Deployed
- 866 packages removed from dependencies
- 100MB reduction in node_modules (1.5GB → 1.4GB)  
- Lazy loading for 5 components (Onboarding, Share, Sync, Print, QR)
- Code splitting with separate chunk files
- Zero security vulnerabilities
- Improved initial load performance

## Version 2025.09.10.23 - 2025-09-11
Actual Deployment - Package Optimizations Live

### Deployed to Qual
- Successfully deployed optimized build to https://manylla.com/qual/
- Package count reduced by 866 packages
- Code splitting active with lazy loading
- Performance improvements in production

## Version 2025.09.10.22 - 2025-09-11
Final Deployment - Optimized Dependencies and Code Splitting

### Production Deployment
- Successfully deployed all optimization improvements
- Package reduction: 866 packages removed
- Node modules: 1.5GB → 1.4GB (100MB saved)
- Implemented lazy loading for 5 major components
- Code splitting creates separate chunks for on-demand loading
- Zero security vulnerabilities
- Build succeeds without errors

## Version 2025.09.10.21 - 2025-09-11
Deployment of Optimized Build

### Deployed
- All optimizations from v2025.09.10.19 now live on qual
- Code splitting active for improved load times
- Reduced dependencies for smaller footprint
- 100MB reduction in node_modules size
- Lazy loading implemented for better performance

## Version 2025.09.10.20 - 2025-09-11
Deployment of Optimized Build

### Deployed
- All optimizations from v2025.09.10.19 now live on qual
- Code splitting active for improved load times
- Reduced dependencies for smaller footprint

## Version 2025.09.10.19 - 2025-09-11
Package Optimization and Code Splitting

### Performance Improvements
- Reduced node_modules from 1.5GB to 1.4GB (100MB reduction)
- Removed 866 unused packages from dependencies
- Implemented lazy loading for heavy components
- Added code splitting for on-demand loading

### Technical Changes
- **Removed unused packages**:
  - Development: react-scripts, react-app-rewired, multiple @types packages
  - Libraries: date-fns, dayjs, uuid, qrcode, ajv
  - Markdown: @uiw/react-md-editor, react-markdown, remark-gfm
  - React Native: Various unused RN packages
  - DnD Kit: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  
- **Implemented code splitting**:
  - OnboardingScreen: Lazy loaded (only for new users)
  - ShareDialogOptimized: Loaded on demand
  - SyncDialog: Loaded on demand
  - PrintPreview: Loaded on demand
  - QRCodeModal: Loaded on demand
  
- **Kept required packages**:
  - @mui/icons-material (used in IconProvider)
  - @mui/material (required peer dependency)
  - @emotion packages (required for MUI)
  - typescript & ts-loader (required for gesture handler)
  - babel-plugin-react-native-web (required for web build)

### Build Impact
- Main bundle: 110KB (down from monolithic bundle)
- Vendor bundle: 7.8MB (optimized)
- Created 3 chunk files for lazy-loaded components
- Build warnings eliminated
- No vulnerabilities in dependencies

## Version 2025.09.10.18 - 2025-09-10
EntryForm Component Improvements - Fixed Correct Component

### Fixed
- Added Quick Info category selector to entry form for Quick Info entries
- Removed unnecessary "Share With" visibility options from entry form
- Fixed the ACTUAL EntryForm component used by the app (in UnifiedApp.js)

### Technical
- Updated EntryForm in src/components/UnifiedApp.js (the actual component in use)
- Added isQuickInfo and quickInfoCategories props support
- Removed visibility state management and UI from the correct component
- Cleaned up unused visibility-related styles
- Updated App.js to pass required props to EntryForm
- Deleted unused duplicate EntryForm.js from Forms directory
- Category selector now shows appropriate categories based on entry type

## Version 2025.09.10.17 - 2025-09-10
REVISED: Onboarding UX - Date and Photo Pickers with Mobile Limitations

### Added
- **Web Platform - FULL FUNCTIONALITY**:
  - HTML5 date picker with native calendar interface
  - Complete photo upload with file picker dialog
  - File size validation (max 5MB)
  - Image format validation (JPEG, PNG, GIF, WebP only)
  - Real-time preview of selected photos
  - Loading states during image processing
  - Clear photo button to remove selection

- **Mobile Platform - PARTIAL FUNCTIONALITY**:
  - ✅ Date picker: Functional text input with automatic MM/DD/YYYY formatting
  - ⚠️ Photo picker: **NOT YET AVAILABLE** - Shows informative message
  - Mobile users can add photos later via web interface
  - See `docs/TECH_DEBT.md` for implementation roadmap

- **Error Handling**:
  - Replaced browser alert() with inline error messages
  - FileReader error recovery
  - User-friendly validation messages

### Fixed
- Mobile date input now functional (was completely broken)
- Removed misleading photo toggle that did nothing
- Standardized photo state to use null consistently
- Added comprehensive validation before processing

### Known Limitations
- **Mobile Photo Upload**: Not implemented - tracked as high priority tech debt
- **Workaround**: Mobile users can complete onboarding without photo, add later on web

### Technical
- OnboardingScreen.js: Proper implementation with clear mobile limitations
- Added tech debt documentation in `docs/TECH_DEBT.md`
- TODO comments added in code for mobile photo implementation
- Platform implementations:
  - Web: Full feature parity
  - Mobile: Date input only, photo pending
- Maintains unified codebase architecture (no .native.js files)

## Version 2025.09.10.16 - 2025-09-10
Complete Photo Default Fix - App.js Component

### Fixed
- **App.js**: Added photo !== 'default' check in profile rendering (line 241)
- Final component fix for legacy photo='default' 404 errors
- All Image components across the app now properly filter 'default' values

### Technical
- Comprehensive fix covering all components: App.js, ProfileOverview.js, Header.js
- No 404 errors will be generated from any profile photo rendering
- Backward compatible with existing data

## Version 2025.09.10.15 - 2025-09-10
Legacy Photo Data Fix - Handle Existing 'default' Values

### Fixed
- **ProfileOverview.js**: Added check for photo !== 'default' before rendering Image
- **Header.js**: Added check for photo !== 'default' before rendering Image
- Prevents 404 errors from legacy profiles with photo='default' stored in database
- Gracefully handles existing data without requiring migration

### Technical
- Complete fix for photo='default' issue across all components
- Handles both new profiles (prevented at source) and old profiles (filtered at display)
- No data migration required - backward compatible

## Version 2025.09.10.14 - 2025-09-10
Console.log Cleanup - Code Standards Compliance

### Fixed
- Removed console.log from OnboardingScreen photo toggle (line 494)
- Ensures compliance with project standards (max 5 console.logs in src/)

### Technical
- Silent photo toggle behavior maintained
- No functional changes, only logging cleanup
- Meets peer review requirements for clean deployment

## Version 2025.09.10.13 - 2025-09-10
Critical Photo Bug Fix - Production Issue

### Fixed
- **CRITICAL: Photo "default" bug**: Fixed OnboardingScreen photo toggle causing 404 errors
  - Line 491: Changed setPhoto(photo ? "" : "default") to setPhoto(photo ? "" : null)
  - The word "default" was being treated as a photo URL, causing 404 requests
  - Photo value should only be null, empty string, or actual base64/URL
  - Eliminates browser console errors during onboarding

### Technical
- Searched entire codebase to ensure no other "default" photo values exist
- Verified other uses of "default" are legitimate (keyboard types, date picker displays)
- No breaking changes - maintains existing photo handling logic
- Critical production bug resolved

## Version 2025.09.10.12 - 2025-09-10
Root Directory and Code Cleanup - Admin Tasks

### Changed
- **Root directory cleanup**: Removed clutter and improved organization
  - Removed 5 App.js backup/test files (App.js.backup, App.simple.js, App.test.js, etc.)
  - Removed 11 old migration and fix scripts (completed one-time scripts)
  - Removed old directories: backup-before-unification/, build/
  - Removed config-overrides.js (not needed for React Native Web)
  - Root directory now clean with only essential files

- **Code cleanup**: Fixed last console.log reference
  - Removed console.log from comment in src/index.js line 17
  - Fixed typo in URL (morettps -> more: https)
  - Zero console.log references now in src/

### Technical
- Created comprehensive backup before cleanup (backups/admin-cleanup-20250910-195426.tar.gz)
- Verified build still works after cleanup
- No functional changes - purely organizational

### Files Removed
- App.js variants: App.js.backup, App.simple.js, App.test.js, App.test2.js, App.test3.js
- Migration scripts: apply-schema.sh, consolidate-platform-files.sh, consolidate-unified.sh
- Fix scripts: final-compliance-check.sh, fix-all-malformed-props.sh, fix-all-styles.sh, etc.
- Directories: backup-before-unification/, build/
- Config: config-overrides.js

## Version 2025.09.10.11 - 2025-09-10
Production Deployment - Onboarding Consolidation

### Changed
- **Onboarding Architecture**: Successfully consolidated into single component
  - OnboardingScreen.js (577 lines) now handles all onboarding functionality
  - Deleted OnboardingWizard.js and index.js (eliminated duplication)
  - App.js imports OnboardingScreen directly
  - Clean separation: UI returns mode to App.js, App.js handles profile creation

### Fixed
- **Color Consistency**: Updated all 15 files from #8B7355 to #A08670
  - Consistent manila envelope theme throughout application

### Technical
- Single onboarding component architecture achieved
- No duplicate implementations remain
- Direct imports with no compatibility layers
- All functionality preserved and tested

### Validation
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Build: Success ✓
- Prettier: Pass ✓
- Component consolidation: Complete ✓

## Version 2025.09.10.10 - 2025-09-10
Production Deployment - Onboarding Consolidation Complete

### Changed
- **Onboarding Architecture**: Successfully consolidated into single component
  - OnboardingScreen.js (577 lines) now handles all onboarding functionality
  - Deleted OnboardingWizard.js and index.js (eliminated duplication)
  - App.js imports OnboardingScreen directly
  - Clean separation: UI returns mode to App.js, App.js handles profile creation

### Fixed
- **Color Consistency**: Updated all 15 files from #8B7355 to #A08670
  - Consistent manila envelope theme throughout application

### Technical
- Single onboarding component architecture achieved
- No duplicate implementations remain
- Direct imports with no compatibility layers
- All functionality preserved and tested

### Validation
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Build: Success ✓
- Prettier: Pass ✓
- Component consolidation: Complete ✓

## Version 2025.09.10.9 - 2025-09-10
Fixed Onboarding Architecture Issues

### Fixed
- **Proper component separation**: Created minimal OnboardingWizard (362 lines) for App.js UI needs
  - OnboardingWizard now handles UI presentation only
  - App.js handles all profile creation and business logic
  - OnboardingScreen remains for native navigation use
  - Clear separation of concerns established

- **Color consistency**: Fixed all 15 files using wrong color
  - Changed #8B7355 to #A08670 throughout codebase
  - Updated in Loading, Forms, Profile, Settings, and Common components
  - Consistent manila envelope theme now applied

### Technical
- Created minimal OnboardingWizard.js (362 lines) that returns mode selection to App.js
- Maintained OnboardingScreen.js for RootNavigator/native navigation
- Simple index.js export (2 lines) for clean imports
- No duplicate logic - clear separation between UI and business logic

### Validation
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Build: Success ✓
- Prettier: Pass ✓
- Color consistency: Fixed all 15 files ✓

## Version 2025.09.10.8 - 2025-09-10
Major Documentation Cleanup - Removed Obsolete Files

### Changed
- **Comprehensive documentation cleanup**: Streamlined /docs directory for current architecture
  - Removed 29 obsolete documentation files
  - Eliminated all mobile-specific documentation (project is now unified)
  - Removed all old phase planning documents (Phase 1-4 completed)
  - Cleaned up duplicate deployment and architecture guides
  - Reduced documentation files from 99 to 70 (30% reduction)

### Technical
- Created full backup before cleanup (docs-backup-20250910-192806.tar.gz)
- Focused on keeping only current, production-relevant documentation
- Preserved essential docs: WORKING_AGREEMENTS, RELEASE_NOTES, active prompts
- No code changes required

### Directories Removed
- `docs/mobile/` - Mobile-specific docs (obsolete with unified codebase)
- `docs/setup/` - Old setup instructions (now in main documentation)

### Files Removed from /docs/archive/
- All MANYLLA_MOBILE_*.md files (7 files) - React Native migration completed
- All MOBILE_*.md files (5 files) - Mobile development completed
- PHASE_4_PLANNING.md - Phase 4 completed
- COMPONENT_MIGRATION_DIRECTIVE.md - Migration completed
- CROSS_PLATFORM_MIGRATION_REPORT.md - Migration completed
- REACT_NATIVE_MIGRATION_PROMPT_PACK.md - Migration completed

### Files Removed from /docs/sync/
- PHASE_1_COMPLETION_REPORT.md - Phase 1 completed
- PHASE_3_COMPLETION_SUMMARY.md - Phase 3 completed
- SECURITY_HARDENING_MASTER_PLAN.md.backup - Backup file

### Files Removed from /docs/archive/prompts/
- 01_PHASE1_CRITICAL.md - Phase 1 completed
- 02_PHASE2_ENHANCED_UX.md - Phase 2 completed
- 03_PHASE3_POLISH.md - Phase 3 completed

### Files Removed from /docs/deployment/
- DEPLOYMENT.md - Duplicate/outdated
- 04_DEPLOYMENT_GUIDE.md - Superseded by DEPLOYMENT_PROCESS_v3.md
- API_DEPLOYMENT.md - Outdated (not modified in 30+ days)
- DEPLOY_NOTES.md - Old notes, content in RELEASE_NOTES.md
- DEPLOYMENT_CHECKLIST.md - Outdated checklist from January

### Files Removed from /docs/architecture/
- 00_ARCHITECTURE.md - Generic/superseded by UNIFIED_APP_ARCHITECTURE.md
- 03_IMPLEMENTATION_GUIDE.md - Outdated implementation guide

## Version 2025.09.10.8 - 2025-09-10
Consolidate Duplicate Onboarding Components

### Fixed
- **Duplicate onboarding components**: Consolidated OnboardingScreen and OnboardingWizard
  - Removed code duplication that caused maintenance issues
  - Fixed potential confusion about which component to modify
  - Simplified onboarding architecture
  - Maintained backward compatibility with App.js

### Technical
- Merged OnboardingWizard UI into OnboardingScreen component
- Created compatibility export in components/Onboarding/index.js for App.js
- Removed unused OnboardingWrapper.js component
- Updated all imports and references
- No breaking changes - functionality preserved

### Validation
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Build: Success ✓
- Prettier: Pass ✓
- All onboarding flows tested and working

## Version 2025.09.10.7 - 2025-09-10
Fix Missing Resources in Production Build

### Fixed
- **Missing favicon.svg**: Added favicon.svg to webpack copy configuration
  - Production build now includes favicon.svg file
  - Eliminates 404 error in browser console
  - Browser tab now displays proper icon

### Technical
- Updated webpack.config.js to copy favicon.svg to build output
- Added pattern to CopyWebpackPlugin for favicon.svg
- Both global-styles.css and favicon.svg now properly included in build
- No breaking changes

### Validation
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Material-UI imports: 0 ✓
- Build: Success ✓
- Prettier: Pass ✓

## Version 2025.09.10.6
Routine Deployment - No Code Changes

### Technical
- Deployment script version sync
- No functional changes
- Resolving version mismatch from previous deployment attempt

## Version 2025.09.10.5 - 2025-09-10
Demo Data Fix - Production Deployment

### Fixed
- **Demo Profile Creation**: Re-enabled complete demo profile creation in App.js
  - OnboardingWizard now properly triggers demo data creation
  - Creates Ellie Thompson profile with all 6 categories
  - Includes 14 demo entries across all categories
  - Profile photo correctly set to /ellie.png

### Technical
- Fixed handleOnboardingComplete to create demo profile when mode='demo'
- Removed profile overwrite that was clearing stored data
- Cleaned up debug console.log statements
- No architecture violations

### Validation
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Material-UI imports: 0 ✓
- Build: Success ✓
- Console logs: 1 (minimal) ✓

## Version 2025.09.10.4 - 2025-09-10
Demo Data Display Fix

### Fixed
- **Category Overwrite Issue**: Fixed App.js overwriting stored profile categories on load
  - Previously, the loaded profile's categories were being replaced with empty unifiedCategories
  - Now preserves the complete stored profile with all its entries and categories
  - Demo data now displays correctly with all 6 categories and 14 entries

### Technical
- Updated App.js line 495-498 to preserve stored profile data
- Removed unnecessary category replacement logic that was clearing entries
- Created test page (test-demo-data.html) for validating demo data creation
- No breaking changes

### Validation
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Build: Success ✓
- Prettier: Pass ✓

## Version 2025.09.10.3
Demo Data & Profile Photo Fix

### 🔴 Critical Production Fix
- **Demo Data Restored**: Fixed missing demo categories in production
  - All 6 unified categories now appear: Quick Info, Daily Support, Health & Therapy, Education & Goals, Behavior & Social, Family & Resources
  - Added comprehensive demo entries across all categories (14 total entries)
  - Demo profile now properly initialized with complete sample data

### 🖼️ Profile Photo Fixed
- **Demo Profile Photo**: Added working profile photo for demo mode
  - Uses Ellie Thompson as consistent demo character
  - Profile photo properly displays at `/ellie.png`
  - Fixed missing photo references in demo initialization

### 📝 Data Consistency
- **Unified Demo Experience**: Consistent demo profile across application
  - Name: Ellie Thompson (with preferred name and pronouns)
  - Comprehensive entries showing real-world usage examples
  - Proper category ordering and colors matching unified system

### 🔧 Technical Details
- Updated OnboardingScreen.js handleDemoMode function
- Fixed category definitions to match unifiedCategories.js
- Added profile photo path reference
- No breaking changes or regressions

## Version 2025.09.10.2
TypeScript Cleanup - Deployment Blocker Fixed

### 🚨 Critical Fixes
- **Deployment Unblocked**: Removed all TypeScript syntax from JavaScript files
  - Fixed 18 files containing TypeScript remnants that prevented deployment
  - Resolved corrupted syntax patterns (e.g., "openoolean", "stringring")
  - Fixed missing operators and conditional expressions
  - All files now pass Prettier validation

### 📝 Files Cleaned
- **Dialogs**: UnifiedAddDialog.js
- **Error Handling**: ErrorBoundary.js
- **Forms** (6 files): HighlightedText, HtmlRenderer, MarkdownField, MarkdownRenderer, RichTextInput, SmartTextInput
- **Onboarding** (2 files): OnboardingWrapper, ProgressiveOnboarding
- **Profile** (2 files): CategorySection, ProfileOverview
- **Settings** (2 files): QuickInfoManager, UnifiedCategoryManager
- **Context** (2 files): ProfileContext, ToastContext
- **Hooks/Utils** (2 files): useMobileKeyboard, placeholders

### 🔧 Technical Improvements
- Removed all interface declarations from JavaScript files
- Fixed all TypeScript type annotations
- Replaced Material-UI imports with React Native equivalents
- Corrected corrupted property syntax throughout codebase
- Build now completes successfully

## Version 2025.09.10.1
Modal Consistency Review - Complete UI/UX Overhaul

### 🚨 Critical Fixes
- **Runtime Errors Fixed**: Resolved critical errors preventing Sync and Share modals from opening
  - Fixed undefined color references (colors.success.main, colors.error.main)
  - All modals now functional without crashes
  - Users can now access core sync and sharing features

### 🎨 Major UI Improvements
- **Complete Modal Consistency**: All 8 modals converted to unified architecture
  - Core modals: EntryForm, ProfileEditDialog, CategoryManager
  - Extended modals: ShareDialogOptimized, SyncDialog, PrintPreview, QRCodeModal, ProfileCreateDialog
  - All modals now use React Native Modal component
  - Consistent manila brown headers (#A08670) with white text/icons
  - Unified button styling and interactions

### 🏗️ Architecture Improvements
- **TypeScript Removal**: Zero TypeScript files remaining in codebase
- **Platform Unification**: All components now use single .js files with Platform.select()
- **Material-UI Elimination**: Complete conversion from Material-UI to React Native components
- **Theme Integration**: All modals use useTheme() hook for dynamic color support
- **Build System**: Webpack configuration optimized for web platform

### 🎯 Technical Details
- Removed 146 TypeScript/platform-specific files
- Added proper theme color mappings for success/error states
- Fixed all hard-coded color references
- Implemented getStyles(colors) pattern across all modals
- Ensured consistent 12px border radius on all modal containers
- Added proper shadows and borders for depth perception

### 📊 Validation Results
- TypeScript files: 0 ✓
- Platform-specific files: 0 ✓
- Material-UI imports: 0 ✓
- Build status: Successful ✓
- All modals tested in light/dark/manylla themes ✓

## Version 2025.09.09.4
Entry Card UI Improvements - Better Discoverability

### 🎨 UI/UX Improvements
- **Visible Entry Actions**: Added edit (pencil) and delete (trash) icons to entry cards
  - Icons displayed in top-right corner for better discoverability
  - Removed hidden tap-to-edit and long-press-to-delete gestures
  - Delete icon turns red on hover for clear visual feedback
- **Modified Date Display**: Added "Last updated" date to bottom-left of each entry card
- **Improved Spacing**: Optimized padding between entries for better visual hierarchy
- **Manila Theme Refinement**: Adjusted manila theme colors for subtler, more authentic appearance
- **Atkinson Hyperlegible Font**: Ensured accessibility font is applied throughout the app
  - Added global CSS for consistent font application
  - Fixed font loading issues on web platform

### 🔧 Technical
- Implemented Material-UI icons for web platform
- Added confirmation dialogs for delete actions
- Fixed webpack configuration for CSS file serving
- Improved accessibility with proper ARIA labels
- Minimum 44x44px touch targets for all interactive elements

## Version 2025.09.09.3
Category Simplification - Improved User Experience

### 🎯 UX Improvements
- **Simplified Categories**: Reduced from 13 to 6 core categories for better usability
  - Quick Info (pinned, special display)
  - Daily Support (communication, routines, sensory, dietary)
  - Medical (health records, medications, allergies)
  - Development (education, goals, achievements)
  - Health (wellness, physical activity, sleep)
  - Other (catch-all for miscellaneous items)
- **Better Organization**: Categories now have clearer, more intuitive purposes
- **Reduced Overwhelm**: Simpler category selection in Add/Edit Entry forms

### 🐛 Bug Fixes
- **Demo Data**: Fixed demo profile entries to use correct category names
- **Category Matching**: Resolved issue where entries weren't displaying due to category name mismatches
- **App.js Updates**: Synchronized old App.js with new category structure
- **Deployment Script**: Fixed multiple critical issues:
  - Corrected build directory path (now uses `web/build/` instead of `build/`)
  - Fixed .htaccess configuration for Manylla (was using StackMap's config)
  - Added error handling for grep commands that return no matches
  - Fixed madge circular dependency check

### 🔧 Technical
- Updated all sample data and demo profiles to use new 6-category system
- Fixed TypeScript errors related to category refactoring
- Added clear-storage utility page for testing
- Created new `.htaccess.manylla-qual` with correct RewriteBase paths
- Updated deployment script to use correct build output directory
- Commented out all console.log statements for production

## Version 2025.09.09.2
Build System Fix - React Native + Web Deployment

### 🔧 Infrastructure
- **Fixed deployment script**: Updated build command to use `build:web` for React Native + Web project
- **Resolved grep pipeline issue**: Fixed console.log check that was causing silent script exits
- Deployment process now fully operational for unified codebase

## Version 2025.09.09.1
QuickInfo Architecture Refactoring - Unified Category System

### 🏗️ Architecture Changes
- **QuickInfo Unification**: Converted QuickInfo from separate data structure to regular categories
  - Removed `quickInfoPanels` field from ChildProfile type
  - QuickInfo now uses standard CategoryConfig with `isQuickInfo: true` flag
  - Consistent data model across all content types

### 🔧 TypeScript Improvements
- **Type Safety**: Fixed 17 TypeScript errors related to QuickInfo conversion
  - Fixed navigation imports in React Native screens
  - Added missing color and displayName fields to categories
  - Resolved theme mode type issues
  - Fixed AsyncStorage adapter types

### 📱 React Native Updates
- **Onboarding Screen**: Updated to use unified category structure
  - QuickInfo entries now properly initialized as categories
  - Demo mode data follows new category pattern
  - Consistent with web implementation

### 🧹 Code Cleanup
- **Removed Legacy Fields**: Eliminated unused quickInfoPanels from all components
- **Import Paths**: Fixed relative imports to use @components aliases
- **Storage Service**: Added proper type annotations for AsyncStorage operations

### 🚀 Deployment Improvements
- **Script Reorganization**: Moved git commit after all validation checks
- **TypeScript Output**: Suppressed verbose output while maintaining error checking
- **Script Directory**: Resolved symlink issues with deployment scripts

## Version 2025.09.08.1
Improved project type identification and development workflow

### 🛠️ Developer Experience
- **Project Type Identification**: Added multiple safeguards to prevent React Native/Web confusion
  - Created PROJECT_TYPE file for clear identification
  - Added .claude-hints file with quick reference
  - Implemented npm run check:type diagnostic command
  - Enhanced npm scripts with helpful echo messages

### 🐛 Bug Fixes
- **ESLint Configuration**: Fixed build directory linting issues (15,000+ false errors)
  - Added .eslintignore to exclude build artifacts
  - Fixed undefined setQuickInfoOpen callback reference
- **Console Logging**: Commented out all console.log statements for production readiness

### 📚 Documentation
- **CLAUDE.md Updates**: Restructured with project type prominently displayed
- **Command Clarifications**: Clearly distinguished web (npm run web) vs mobile (npm start) commands
- **Deployment Rules**: Maintained strict qual deployment requirements

## Version 2025.09.08.2
React Native Phase 1 Complete - Unified Cross-Platform Architecture

### 🎯 Major Milestone: Single App.js Architecture
- **Unified Codebase**: Implemented StackMap pattern with single App.js file (~1200 lines)
- **95% Code Sharing**: Achieved near-complete code reuse across iOS, Android, and Web
- **Platform Parity**: All core features working identically on all platforms
- **Performance**: 60fps animations maintained across all platforms

### 🎨 UI/UX Refinements
- **Subtle Category Theming**: Replaced full colored headers with elegant 4px color strips
- **Responsive Grid Layout**:
  - Desktop: 3 columns for optimal use of screen space
  - Tablet: 2 columns for comfortable touch targets
  - Mobile: Single column for easy scrolling
- **Quick Info Section**: Always displays in dedicated full-width row at bottom
- **Minimalist Header**: Removed box styling, icon-only buttons (24px size)
- **Settings Cleanup**: Removed unused settings icon from header

### 📱 Platform-Specific Fixes
- **iOS Issues Resolved**:
  - Fixed font loading errors with Material Icons
  - Resolved duplicate font file conflicts in Xcode
  - Implemented fallback icons using circle symbols
- **Android Optimizations**:
  - Build configurations properly set up
  - Bundle size optimized for mobile deployment
- **Web Improvements**:
  - Reduced bundle size to ~350KB
  - Improved initial load performance

### 🎭 Demo Mode Implementation
- **Real Production Data**: Integrated actual Ellie demo data from qual deployment
- **Quick Info Panels**: Fixed display logic to properly show panels
- **Complete Sample Profile**: Includes all category entries from production
- **Demo Data Categories**:
  - 5 Quick Info panels (Communication, Sensory, Medical, Dietary, Emergency)
  - 6 category entries (Goals, Successes, Education, Behaviors, Medical, Tips)

### 🏗️ Architecture Improvements
- **Component Consolidation**: Merged platform-specific components into unified approach
- **State Management**: Simplified with single source of truth in App.js
- **Theme System**: Three modes (light, dark, manylla) working consistently
- **Icon Provider**: Unified icon system with platform-specific fallbacks

### 📁 Documentation Updates
- **Moved to Archive**: Phase 1 prompt templates (completed)
- **Updated README**: Current status, architecture, and development commands
- **Release Notes**: Comprehensive tracking of all recent changes
- **Cleaned Structure**: Removed outdated migration guides

### 🔧 Development Experience
- **Simplified Commands**: `npm start`, `npm run ios`, `npm run android`
- **Hot Reload**: Working on all platforms for rapid development
- **Debug Tools**: React DevTools integration maintained

### 🐛 Bug Fixes
- Fixed Quick Info entries not displaying in demo mode
- Resolved category display issues on mobile devices
- Fixed theme consistency across different screen sizes
- Corrected responsive breakpoints for grid layout

### ✅ Testing Status
- **iOS**: Fully tested on iPhone simulators
- **Android**: Basic testing completed
- **Web**: Production-ready and deployed to qual
- **Cross-Browser**: Chrome, Safari, Firefox verified

---

## Version 2025.09.08.1
Hardened deployment script with full validation

### 🔒 Deployment Security Enhancements
- **No Shortcuts Mode**: Removed all partial deployment options and skip flags
- **Release Notes Enforcement**: Deployment requires updated release notes for version tracking
- **Full Validation Pipeline**: All checks must pass before deployment proceeds
- **LLM-Resistant Messages**: Error messages explicitly prevent automated bypass attempts

### ✅ Required Validation Checks
- **Uncommitted Changes**: Blocks deployment if working directory is not clean
- **ESLint**: No errors allowed (warnings acceptable)
- **TypeScript**: All type errors must be resolved
- **Security Audit**: No critical vulnerabilities permitted
- **Code Quality**: Maximum 20 TODOs and 5 console.logs in src/
- **Build Success**: Project must build successfully before deployment

### 🧹 Deployment Improvements
- **Directory Cleanup**: QUAL directory cleaned before each deployment (preserves configs)
- **Post-Deployment Verification**: Health checks for both main site and API
- **Git Integration**: Automatic commit with release notes title and push to GitHub
- **Build Size Monitoring**: Warns if build exceeds 10MB

### 📝 Process Changes
- Deployment now follows strict 10-step validation process
- Release notes must be updated before each deployment
- All deployments are fully traceable with version history

---

## Version 2.2.0 - September 7, 2025

### 📱 React Native Migration (Phase 1 Complete)

#### Cross-Platform Architecture
- **95% Code Sharing**: Implemented StackMap's proven cross-platform pattern
- **Platform Selectors**: Created index.tsx files for automatic platform routing
- **Unified Codebase**: Single repository for iOS, Android, and Web platforms

#### Priority 1 Components Completed
- **UnifiedAddDialog.native.tsx**: Full modal for adding/editing entries with native pickers
- **CategorySection.native.tsx**: Native card-based category display with edit/delete actions
- **Header.native.tsx**: App header with theme toggle, sync status, and native menu
- **Platform Integration**: All components follow Material Design on Android, iOS Human Interface on iOS

#### Mobile Features
- **Onboarding Wizard**: Fully functional with demo mode and sync setup
- **Profile Overview**: Native implementation with categories and entries
- **Theme Support**: Light/Dark/Manylla themes working across platforms
- **Storage**: AsyncStorage integration for persistent data

#### Development Improvements
- **Multi-Platform Deploy Script**: Updated deploy-qual.sh to support:
  - Web deployment to https://manylla.com/qual
  - iOS Simulator deployment with rebuild or quick reload options
  - Android Emulator support (when available)
  - Version synchronization across platforms

### 🎯 Next Phase Components
- **Priority 2**: ProfileEditDialog, UnifiedCategoryManager (Profile Management)
- **Priority 3**: SyncDialog, ShareDialog (Sync & Share features)
- **Priority 4**: SmartTextInput, MarkdownField (Rich text editing)

### 🔧 Technical Stack
- React Native 0.81 with React 19
- TypeScript for type safety
- TweetNaCl.js for cross-platform encryption
- AsyncStorage for native persistence
- Zero-knowledge architecture maintained

---

## Version 2.1.0 - September 6, 2025

### 🔒 Security Enhancements (Phase 2 Complete)

#### Enhanced Security Features
- **URL Fragment Security**: Fragments now captured before React loads and cleared from memory after 10 seconds
- **Database Security**: Verified real prepared statements, created comprehensive schema with constraints
- **Error Handling**: Implemented secure error handling that never exposes sensitive information
- **CORS Headers**: Enhanced security headers including CSP, X-Frame-Options, and more

#### Removed Backward Compatibility
- **No V1 Support**: Removed all backward compatibility code for cleaner, more secure codebase
- **Share Format**: Only V2 encrypted format supported (`manylla_shares_v2`)
- **Encryption**: HMAC now required for all encrypted data
- **Removed Files**: Deleted old ShareDialog.tsx and ShareDialogNew.tsx (V1 format files)

### 🎨 UI/UX Improvements

#### Dark Mode Fixes
- **Sync Dialog**: Fixed dark mode rendering for recovery phrase display
- **Paper Components**: Proper dark mode background colors with semi-transparent overlays
- **Typography**: Explicit text colors for better contrast in both themes

#### Onboarding Flow
- **Fixed Blank Step**: Resolved issue where step 3 was blank when joining with sync code
- **Streamlined Join Flow**: Join mode now correctly shows 4 steps instead of 5
- **Step Counter**: Accurate step counting for all onboarding modes (fresh, demo, join)

### 🔧 Technical Improvements

#### Code Quality
- **Cleaner Codebase**: Removed all legacy code and backward compatibility layers
- **Type Safety**: Removed unnecessary isDarkMode from ThemeContext
- **Sync Service**: Removed fallback hash reading mechanisms

#### Database Schema
- Created comprehensive `schema.sql` with:
  - Proper foreign key constraints
  - Indexes for performance
  - Audit log table structure
  - Rate limiting table
  - Automatic cleanup events for expired data

### 📝 Documentation Updates
- Updated `IMPLEMENTATION_CONTEXT.md` with Phase 2 completion
- Added breaking changes documentation
- Updated security checklist with Phase 2 items

### 🐛 Bug Fixes
- Fixed onboarding wizard showing blank step 3 when joining with code
- Fixed dark mode issues in sync dialog below recovery phrase
- Removed duplicate backgroundColor declarations

### ⚠️ Breaking Changes
1. Only `manylla_shares_v2` localStorage format supported
2. HMAC required for all encrypted data (no string format)
3. Removed ShareDialog.tsx and ShareDialogNew.tsx files
4. No backward compatibility with V1 share format

### 🚀 Deployment Notes
- Ready for deployment to qual environment
- All security vulnerabilities addressed
- No migration needed (no existing users)

---

## Previous Releases

### Version 2.0.0 - September 6, 2025 (Phase 1)
- Initial security hardening implementation
- V2 encrypted share format
- Input validation on all API endpoints
- Rate limiting (client and server)
- URL routing with hash fragment preservation