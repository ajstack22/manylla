# Deploy Notes

## 2025_09_06_01 - Phase 1 Security Hardening Complete
Completed all Phase 1 critical security tasks including share encryption fixes, API input validation, and comprehensive rate limiting on both client and server sides.

### Changes
- **Share Encryption Fix (Task 1.1)**
  - Fixed critical vulnerability: recipientName and note metadata now encrypted
  - All sensitive share data properly encrypted before localStorage
  - Backward compatibility maintained for existing shares
  - Fixed share URL routing for subdirectory deployments (/qual/)

- **API Input Validation (Task 1.2)**
  - Added validation to all sync API endpoints
  - Validates sync_id (32 hex chars), device_id (32 hex chars), invite codes (XXXX-XXXX format)
  - Uses centralized validation utilities for consistency
  - Proper error responses with appropriate HTTP status codes

- **Client-Side Rate Limiting (Task 1.3)**
  - Enforces 200ms minimum interval between API requests
  - Added makeRequest() wrapper for all API calls
  - Prevents API flooding and reduces server load
  - Console logging for rate limit debugging

- **Server-Side Rate Limiting (Task 1.4)**
  - Created comprehensive rate-limiter.php utility
  - IP-based limiting: 120 requests/minute
  - Device-based limiting: 60 requests/minute  
  - New device protection: 60-second delay before sync
  - Data reduction protection: Blocks >50% data loss attempts
  - Suspicious activity monitoring for rapid device switching

### Technical Details
- Rate limiting uses file-based caching (ready for Redis upgrade)
- All API endpoints now validate and rate limit before processing
- Share URLs use path format `/share/[token]#[key]` for clean URLs
- Added explicit RewriteRules in .htaccess for share and sync routes
- Fixed Apache routing issues with subdirectory deployments

---

## 2025_09_05_01 - Critical Security Enhancements
Implemented comprehensive security fixes for medical data protection including encrypted share storage, secure code generation, URL fragment clearing, rate limiting, and data integrity checks.

### Changes
- **Share Security**
  - Encrypted share data in localStorage using XSalsa20-Poly1305
  - Replaced Math.random() with crypto.getRandomValues() for share codes
  - Added decryption logic with backward compatibility
  - Share codes now use 8-character secure hex strings

- **Sync Security**
  - Added URL fragment clearing to prevent recovery phrase exposure in browser history
  - Implemented rate limiting (max 1 pull/2s, max 1 push/5s)
  - Added runaway pull prevention (stops after 100 attempts)
  - Recovery phrases cleared from memory after 30 seconds

- **Data Integrity**
  - Added HMAC authentication to encrypted medical data
  - Integrity verification on all sync operations
  - Backward compatibility maintained for existing data

- **React Fixes**
  - Fixed useCallback hook conditional call error in App.tsx
  - Removed duplicate hook definitions

### Technical Details
- Encryption: 1000 nacl.hash iterations for key derivation
- Share encryption uses share code as key source with salt
- Rate limiting prevents API abuse and runaway sync loops
- HMAC provides tamper detection for medical data
- All security fixes maintain backward compatibility

---

## 2025_09_04_03 - Onboarding Enhancement & Design System Improvements
Enhanced onboarding wizard with photo/birthday fields, implemented Atkinson Hyperlegible font for accessibility, created centralized theming system, and fixed deployment scripts.

### Changes
- **Onboarding Improvements**
  - Added optional birthday and photo upload to onboarding wizard
  - Applied Manylla theme colors throughout onboarding
  - Fixed TextField readability with white backgrounds and rounded corners
  - Removed preferred name field for simplification
  - Made fields responsive (side-by-side on wider screens)

- **Typography & Branding**
  - Implemented Atkinson Hyperlegible font across entire application
  - Created new favicon with lowercase "m" in manila colors
  - Updated page title format to "manylla - [Profile Name]"

- **Design System**
  - Created centralized theme configuration with exported `manyllaColors`
  - Built `modalTheme.ts` for consistent modal styling
  - Fixed all Avatar components to use theme colors (no hardcoded values)
  - Standardized modal panel layouts and styling

- **Technical Improvements**
  - Fixed deployment script to properly clean old files (rsync --delete)
  - Production script now rejects uncommitted changes (promotes from qual only)
  - Increased Node memory allocation to 6GB for builds

### Technical Details
- Atkinson Hyperlegible chosen for superior readability and accessibility
- Theme system now exports colors for use across components
- Modal theme provides consistent styling configurations
- Avatar default background: #5D4E37 (dark brown)
- Input fields: white background with 12px border radius
- Deployment uses promotion model: qual → production

---

## 2025_09_04_02 - Three-Mode Theme System & Sharing Enhancements
Implemented three-mode theme system (Light, Dark, Manylla) with authentic manila envelope aesthetic. Enhanced sharing with photo options and provider-focused Manylla-themed view.

### Changes
- Implemented three-mode theme system: Light, Dark, and Manylla (manila envelope)
- Created reusable toast service with theme-aware styling
- Updated theme toggle to use Palette icon with toast notifications
- Fixed Quick Info sharing as standard category
- Added option to share profile photo with providers
- Hardcoded Manylla colors in SharedView for consistent provider experience
- Added Manylla branding to shared view header

### Technical Details
- Manylla theme uses authentic manila envelope colors (#C4A66B background)
- Toast service uses ThemedToast component with theme detection
- SharedView always displays in Manylla mode regardless of user settings
- Photo sharing controlled by checkbox in share settings
- All categories now treated uniformly in sharing selection

---

## 2025_09_04_01 - Environment Configuration Fix
Fixed share URL generation in qual environment to use correct domain paths. Created environment-specific configuration files for staging and production builds.

### Changes
- Created `.env.staging` and `.env.production` configuration files
- Updated `deploy-qual.sh` to use staging environment variables
- Added fallback logic in ShareDialogNew.tsx for environment detection
- Share links now correctly generate with `/qual` path in staging
- Documentation reorganization for LLM optimization

### Technical Details
- Share URLs in qual now use `https://manylla.com/qual` instead of production URL
- Environment variables properly segregated between staging and production
- Deployment script now copies `.env.staging` to `.env.production.local` during build

---

## Previous Deployments

### 2025_09_04_00 - UI/UX Improvements
- Applied consistent design patterns across all modals
- Converted Share modal to 4-step wizard
- Fixed demo mode navigation issues
- Updated icons throughout application
- Created comprehensive documentation structure
