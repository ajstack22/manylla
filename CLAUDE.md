# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Run the development server at http://localhost:3000
- `npm run build` - Create production build in the `build` folder
- `npm test` - Run tests in interactive watch mode

### Working Directory
All commands should be run from the `manylla-app` directory.

## Current Status - Phase 3 Complete ✅

**Production Deployment**: https://manylla.com/qual/
- All data now stored in cloud (MySQL database)
- Zero-knowledge encryption fully operational
- No localStorage fallbacks - pure cloud storage
- 5 API endpoints deployed and working

## Architecture

### Project Structure
This is a React application built with Create React App, Material-UI, and TypeScript. The application implements a zero-knowledge encrypted data management system for special needs information with full cloud storage backend.

### Core Technologies
- **React 19** with TypeScript for the frontend
- **Material-UI v7** for component library
- **TweetNaCl.js** for client-side encryption
- **React Context API** for state management
- **React Scripts 5** for build tooling
- **PHP/MySQL** backend (Phase 3 - deployed)
- **Namecheap cPanel** hosting

### Key Architectural Components

#### Data Flow (Phase 3 - Cloud Storage)
1. **Cloud Storage**: All data stored encrypted in MySQL database
2. **Encryption Layer**: Data is encrypted client-side before transmission
3. **Zero-Knowledge Sync**: Uses 32-char hex recovery phrases, 60-second pull interval
4. **Share System**: Database-backed temporary shares with `/share/[id]#[key]` URLs

#### Service Layer (`src/services/`)
- `sync/manyllaEncryptionService.js` - Encryption/decryption with manual UTF-8 for iOS compatibility
- `sync/manyllaMinimalSyncService.js` - Backup/sync orchestration with 60-second pull interval
- Both use nacl.hash iterations (100,000) matching StackMap's approach

#### Context Providers (`src/context/`)
- `ThemeContext.tsx` - Manages light/dark theme state
- `SyncContext.tsx` - Manages sync state and encryption operations

#### Component Organization (`src/components/`)
- `Dialogs/` - Modal dialogs for unified add/edit operations
- `Forms/` - Reusable form components including Markdown editor
- `Layout/` - Header and layout components
- `Onboarding/` - First-time user wizard
- `Profile/` - Profile management and category sections
- `Settings/` - Category and quick info management
- `Sharing/` - Share dialog, print preview, and shared views
- `Sync/` - Sync dialog for multi-device setup

### Data Models (`src/types/`)
- `ChildProfile.ts` - Core data structures for profiles, entries, and categories

### Security Architecture
The application implements zero-knowledge encryption:
- 32-character hex recovery phrases (backup codes) for device sync
- All data encrypted with XSalsa20-Poly1305 (via TweetNaCl)
- 100,000 nacl.hash iterations for key derivation
- Manual UTF-8 encoding/decoding for iOS compatibility
- Server never sees plaintext data (when backend is connected)
- No user accounts or personal information required

### Sync/Backup System (Phase 3 - Operational)
Optimized for Manylla's usage pattern (infrequent updates):
- **Pull Interval**: 60 seconds (vs StackMap's 30 seconds)
- **Push Strategy**: Immediate on profile changes (rare events)
- **Conflict Resolution**: Last-write-wins (single user typical)
- **Storage**: MySQL database with encrypted blobs
- **Recovery Phrase**: 32-char hex matching StackMap's format
- **Backup**: Automatic versioning in sync_data table

### API Structure (Phase 3 - Deployed)
PHP endpoints operational at https://manylla.com/qual/api/:
- `/api/sync_health.php` - Health check endpoint
- `/api/sync_push.php` - Push encrypted sync data
- `/api/sync_pull.php` - Pull encrypted sync data
- `/api/share_create.php` - Create temporary encrypted share
- `/api/share_access.php` - Access encrypted share

### Database Structure (Phase 3)
MySQL tables in `stachblx_manylla_sync_qual`:
- `sync_data` - Encrypted sync blobs with versioning
- `shares` - Temporary encrypted shares
- `sync_backups` - Version history
- `active_shares` - Share access tracking
- `audit_log` - Security audit trail

## Important Notes

### Styling
- Uses Material-UI theming system
- Manila envelope-inspired color palette (#F4E4C1)
- Responsive design with mobile-first approach

### State Management
- Uses React hooks and Context API
- Local storage for persistence
- No external state management libraries

### Testing
- Uses React Testing Library
- Run with `npm test` from `manylla-app` directory

### Deployment (Phase 3 - Active)
- **Qual Environment**: https://manylla.com/qual/ (LIVE)
- **SSH Access**: `ssh -p 21098 stachblx@manylla.com`
- **Database**: stachblx_manylla_sync_qual
- **Build Command**: `npm run build` (may need NODE_OPTIONS=--max-old-space-size=8192)
- **Deploy Command**: `rsync -avz -e "ssh -p 21098" build/ stachblx@manylla.com:~/public_html/manylla/qual/`
- **Important**: Manylla is deployed to `/public_html/manylla/` not `/public_html/qual/` (that's StackMap's)