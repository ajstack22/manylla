# Manylla Architecture Overview

## System Design
- **Type**: Progressive Web Application (PWA)
- **Frontend**: React 19 + TypeScript + Material-UI v7
- **Backend**: PHP 8.0+ REST API
- **Database**: MySQL 8.0+
- **Storage**: Browser localStorage (primary), MySQL (sync)
- **Encryption**: TweetNaCl.js (XSalsa20-Poly1305)
- **Deployment**: Static frontend + PHP backend

## Core Principles
1. **Zero-Knowledge Architecture**: All data encrypted client-side before transmission
2. **No User Accounts**: Recovery phrase-based authentication only
3. **Privacy First**: No tracking, analytics, or personal data collection
4. **Offline First**: Full functionality without network connection
5. **Progressive Enhancement**: Works on all devices, optimized for mobile

## Data Flow
```
User Device → Encryption Layer → localStorage
     ↓              ↓                ↓
   Input      TweetNaCl.js      Primary Store
     ↓              ↓                ↓
   Forms       Recovery Key      Sync (Optional)
                    ↓                ↓
              Deterministic      Encrypted API
               Key Derive         Transfer
```

## Component Architecture
```
App.tsx (Root)
├── Context Providers
│   ├── ThemeContext (light/dark mode)
│   └── SyncContext (multi-device sync)
├── Layout Components
│   └── Header (navigation bar)
├── Feature Components
│   ├── ProfileOverview (main dashboard)
│   ├── EntryForm (add/edit entries)
│   ├── ShareDialog (wizard-based sharing)
│   ├── SyncDialog (device synchronization)
│   └── CategoryManager (organize categories)
└── Onboarding
    └── ProgressiveOnboarding (first-time setup)
```

## Security Model
- **Client-Side Encryption**: All sensitive data encrypted before leaving device
- **Recovery Phrase**: 12-word BIP39 mnemonic for key generation
- **Share Tokens**: 6-character temporary access codes
- **Rate Limiting**: API-level protection against abuse
- **CORS**: Strict origin validation
- **Input Validation**: Client and server-side sanitization

## File Structure
```
manylla-app/
├── src/
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Business logic & API
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
├── api/                # PHP backend (deployment ready)
├── docs/               # Documentation
└── scripts/            # Deployment scripts
```

## Key Technologies
- **React 19.0**: UI framework with concurrent features
- **TypeScript 5.x**: Type-safe JavaScript
- **Material-UI 7.x**: Component library
- **TweetNaCl.js**: Cryptography library
- **PHP 8.0+**: Backend API
- **MySQL 8.0+**: Database for sync/sharing
- **Create React App 5**: Build tooling