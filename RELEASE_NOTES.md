# Manylla Release Notes

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