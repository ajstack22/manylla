# Manylla Documentation

Welcome to the Manylla documentation. This repository contains comprehensive documentation for the Manylla application - a zero-knowledge encrypted profile management system for special needs information.

## 📚 Documentation Structure

### 🏗️ [Architecture](./architecture/)
Core system design and technical architecture
- `00_ARCHITECTURE.md` - System overview and design principles
- `01_DESIGN_SYSTEM.md` - UI/UX design system and components
- `03_IMPLEMENTATION_GUIDE.md` - Development implementation guide
- `UNIFIED_APP_ARCHITECTURE.md` - Single App.js architecture pattern
- `ZERO_KNOWLEDGE_SYNC_ARCHITECTURE.md` - Encryption and sync design

### 📱 [Mobile](./mobile/)
React Native and cross-platform development
- `REACT_NATIVE_STATUS.md` - Current RN implementation status
- `CROSS_PLATFORM_GUIDE.md` - Cross-platform development guide
- `IOS_ANDROID_SETUP.md` - Platform-specific setup instructions
- `BUILD_AND_DEPLOY.md` - Mobile build and deployment procedures

### 🔌 [API](./api/)
Backend API and sync services
- `02_API_REFERENCE.md` - API endpoints documentation
- `SYNC_API_REFERENCE.md` - Sync system API reference
- `SYNC_SECURITY_IMPLEMENTATION_GUIDE.md` - Security implementation

### 🚀 [Deployment](./deployment/)
Deployment guides and server configuration
- `04_DEPLOYMENT_GUIDE.md` - Main deployment guide
- `API_DEPLOYMENT.md` - API deployment specifics
- `DEPLOYMENT_ARCHITECTURE.md` - Infrastructure overview
- `NAMECHEAP_CPANEL_GUIDE.md` - Hosting setup guide
- `QUAL_DEPLOYMENT.md` - Quality environment procedures

### 🔒 [Security](./security/)
Security implementation and guidelines
- `CPANEL_SECURITY_RECOMMENDATIONS.md` - Server security
- `SECURITY_IMPLEMENTATION_SUMMARY.md` - Security overview
- `ZERO_KNOWLEDGE_IMPLEMENTATION.md` - Encryption details

### 🔄 [Sync](./sync/)
Sync system documentation
- `IMPLEMENTATION_CONTEXT.md` - Current implementation status
- `SYNC_PROTOCOL.md` - Sync protocol specification
- `RECOVERY_PHRASE_SYSTEM.md` - Recovery phrase implementation

### 📦 [Archive](./archive/)
Historical documentation and completed phases
- Phase 1 prompt templates (completed)
- Previous implementation attempts
- Migration guides from earlier versions

## 🎯 Current Status

**Version**: 2025.09.08  
**Phase**: React Native Phase 1 Complete - Unified Cross-Platform App

### ✅ Recent Accomplishments (September 2025)
- **Unified Codebase**: Single App.js architecture (StackMap pattern) working across iOS, Android, and Web
- **Feature Parity**: All core features working identically on all platforms
- **UI Refinements**: 
  - Subtle category theming with 4px color strips
  - Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
  - Minimalist header with icon-only buttons
  - Quick Info section with dedicated row
- **Demo Mode**: Implemented with actual Ellie demo data from production
- **Platform Fixes**:
  - iOS font loading issues resolved
  - Android build configurations optimized
  - Web bundle size reduced

### 🚀 Live Deployments
- **Production (Web)**: https://manylla.com
- **Quality Environment**: https://manylla.com/qual/
- **Mobile**: iOS and Android apps via React Native

### 📊 Code Metrics
- **Code Sharing**: ~95% shared code between platforms
- **File Count**: Single App.js file (~1200 lines)
- **Bundle Size**: Web ~350KB, Mobile ~2MB
- **Performance**: 60fps animations on all platforms

## 🛠️ For Developers

### Getting Started
1. Read `/CLAUDE.md` for project-specific AI assistant instructions
2. Review this documentation for system overview
3. Check recent updates in `RELEASE_NOTES.md`
4. Follow platform-specific setup in `/mobile` docs

### Development Commands
```bash
# Web development
npm start          # Start web dev server at localhost:3000

# Mobile development
npm run ios       # Start iOS simulator
npm run android   # Start Android emulator

# Build commands
npm run build     # Production web build
npm run build:ios # iOS release build
npm run build:android # Android release build

# Deployment (QUAL environment only)
./scripts/deploy-qual.sh  # Full validation and deployment
```

### Project Structure
```
/manylla
├── App.js              # Main application (all platforms)
├── index.js            # Entry point
├── package.json        # Dependencies
├── ios/               # iOS specific files
├── android/           # Android specific files
├── public/            # Web assets
├── src/
│   ├── components/    # Platform-specific components
│   ├── context/       # React contexts
│   ├── services/      # Business logic
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utilities
└── docs/              # This documentation
```

## 🔑 Key Technical Decisions

### Architecture Pattern
- **StackMap Pattern**: Single App.js file containing all application logic
- **Platform Detection**: Using `Platform.select()` and conditional rendering
- **Shared Business Logic**: 95% code reuse across platforms
- **Platform-Specific UI**: Minimal divergence only where necessary

### Technology Stack
- **React Native 0.75.2** - Cross-platform framework
- **React 19.0.0-rc** - UI library
- **AsyncStorage** - Local persistence
- **TweetNaCl.js** - Zero-knowledge encryption
- **Material-UI** (Web) / **React Native Paper** (Mobile)

### Security Architecture
- Client-side encryption (zero-knowledge)
- 32-character hex recovery phrases
- No user accounts required
- Temporary encrypted share links
- All data encrypted before leaving device

## 📝 Documentation Updates

### Recent Updates (September 8, 2025)
- Moved Phase 1 prompts to archive (complete)
- Updated status to reflect unified App.js architecture
- Documented UI refinements and responsive layout
- Added actual Ellie demo data implementation
- Cleaned up outdated migration guides

### Next Documentation Tasks
- Update mobile build guides for production deployment
- Document App Store and Play Store submission process
- Create user guide for new features
- Update API documentation with latest endpoints

## 🔗 Quick Links

- **Main Project README**: [/README.md](../README.md)
- **Release Notes**: [RELEASE_NOTES.md](./RELEASE_NOTES.md)
- **Project Instructions**: [/CLAUDE.md](../CLAUDE.md)
- **Quality Environment**: https://manylla.com/qual/
- **GitHub Issues**: [Report bugs and request features]

## 📄 License

This documentation is part of the Manylla project. All rights reserved.

---
*Last Updated: September 8, 2025*