# Manylla-Specific Implementation Patterns

*Auto-generated: 2025-09-12*
*Based on actual bugs and fixes in production*

## 🚨 TEAM AGREEMENTS ARE THE SOURCE OF TRUTH
**This document supplements but does NOT override:**
```bash
cat /Users/adamstack/manylla/docs/TEAM_AGREEMENTS.md
```

**TEAM_AGREEMENTS.md contains the complete framework for:**
- Architecture decisions
- Quality standards
- Testing requirements
- Performance thresholds
- Emergency procedures

## React Native Web Gotchas

### 1. CSS Class Override Issue (B003)
- **Issue**: RNW generates classes like `r-backgroundColor-14lw9ot` that override StyleSheet
- **Pattern**: Classes starting with `r-` are RNW generated
- **Solution**: Use inline styles with arrays for guaranteed override

### 2. Material Icons Compatibility
- **Issue**: Font may not load properly on web
- **Solution**: Use text characters (✕, ☰, ⚙️) instead of icon components

### 3. ThemedModal Implementation
- **Current**: Uses inline style array for headers
- **Location**: `src/components/Common/ThemedModal.js`
- **Pattern**: All modals should use ThemedModal, not direct Modal

## Webpack Configuration
- **Build**: Uses Webpack, NOT Create React App
- **Dev Server**: `npm run web` (port 3000)
- **Build Output**: `web/build/` directory
- **Deploy**: Must use `./scripts/deploy-qual.sh`

## Theme System
- **Primary Color**: #A08670 (manila brown)
- **Hook**: useTheme() from ThemeContext
- **Themes**: light, dark, manylla

## Current Architecture
- Unified React Native + Web codebase
- Single .js files (no .native.js or .web.js)
- Platform.select() for platform differences
- Material-UI v7 for web components
- React Native Elements for mobile

## Known Issues & Solutions
1. **Modal Headers** (B003) - Fixed with inline styles
2. **Platform Alias** (S001) - Completed migration
3. **Android Module Resolution** (B001) - Resolved

## Critical Commands
```bash
# Development
npm run web                          # Start webpack dev server

# Debugging RNW
grep -r "style=\[" src/ --include="*.js"  # Find style arrays
grep -r "r-" web/build/               # Find RNW classes in build

# Deployment
./scripts/deploy-qual.sh             # ONLY way to deploy
```

## Testing Requirements
- Web browser testing required for UI changes
- Screenshot evidence for visual bugs
- DOM inspection for style issues
- Cross-platform verification

---
*This file is updated automatically as bugs are fixed and patterns discovered*
