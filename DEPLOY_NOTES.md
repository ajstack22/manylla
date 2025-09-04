# Deploy Notes

## 2025_01_04_01 - Environment Configuration Fix
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

### 2025_01_04_00 - UI/UX Improvements
- Applied consistent design patterns across all modals
- Converted Share modal to 4-step wizard
- Fixed demo mode navigation issues
- Updated icons throughout application
- Created comprehensive documentation structure
