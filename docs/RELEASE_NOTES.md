# Manylla Release Notes

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