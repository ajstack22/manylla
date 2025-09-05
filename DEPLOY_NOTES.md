# Deploy Notes

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
