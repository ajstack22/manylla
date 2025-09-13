# Manylla

A zero-knowledge encrypted profile management application for special needs information, built with React Native for iOS/Android and React for web.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (`gem install cocoapods`)

### Installation

```bash
# Install dependencies
npm install

# iOS only: Install pods
cd ios && pod install && cd ..
```

### Running the App

#### iOS
```bash
npx react-native run-ios
# or for specific simulator
npx react-native run-ios --simulator="iPhone 16 Pro"
```

#### Android
```bash
npx react-native run-android
```

#### Web Development
```bash
cd /Users/adamstack/Desktop/manylla-app
npm start
```

## 🏗️ Architecture

This is a unified codebase supporting:
- **iOS & Android**: React Native 0.81
- **Web**: React 19 with Material-UI
- **95% code sharing** between platforms using platform-specific file extensions

### Key Features
- 🔐 Zero-knowledge encryption (client-side only)
- 📱 Cross-platform (iOS, Android, Web)
- 🔄 Multi-device sync with recovery phrases
- 🔗 Temporary encrypted sharing
- 🎨 Material Design (Android) & iOS Human Interface Guidelines
- 📌 Quick Info panel for priority information
- ➕ Material Design Floating Action Button (FAB)
- 📐 Responsive layouts (Desktop: 2-column grid, Mobile: stacked)

## 📂 Project Structure

```
/src
  /components     # UI components with .native.tsx variants
  /services       # Business logic (encryption, sync, storage)
  /context        # React Context providers
  /types          # TypeScript definitions
  /utils          # Utility functions
/docs            # Comprehensive documentation
/api             # PHP backend (deployed separately)
/scripts         # Deployment and utility scripts
```

## 🚀 Deployment

```bash
# Deploy to staging (qual) - handles both web and mobile
./scripts/deploy-qual.sh

# Options:
# 1) Web only
# 2) Mobile simulators only  
# 3) Both
# 4) Quick reload mobile
```

## 📖 Documentation

See [/docs/README.md](./docs/README.md) for comprehensive documentation including:
- Architecture guides
- API reference
- Mobile development guides
- Deployment procedures
- Security implementation
- [Git commit conventions](./processes/GIT_COMMIT_CONVENTIONS.md)

## 🔒 Security

- All data encrypted client-side before storage/transmission
- Server never has access to plaintext data
- 32-character hex recovery phrases for device sync
- No user accounts or personal information required

## 🛠️ Development

### Current Status
- ✅ Phase 1: Core CRUD components (Complete)
- 🚧 Phase 2: Profile management components
- 📋 Phase 3: Sync & Share components
- 📋 Phase 4: Rich text editing

### Key Commands

```bash
# Run tests
npm test

# Type checking
npm run typescript

# Linting
npm run lint

# Build for production
npm run build
```

## 📄 License

Copyright © 2025 Manylla. All rights reserved.

## 🤝 Contributing

This is a private repository. For development guidelines, see `/CLAUDE.md`.

## 🔗 Links

- **Production**: https://manylla.com
- **Staging**: https://manylla.com/qual
- **Documentation**: [/docs/](./docs/)
- **Release Notes**: [/docs/RELEASE_NOTES.md](./docs/RELEASE_NOTES.md)