# Deploy Notes

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
