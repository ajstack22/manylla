#!/bin/bash

# apply-role-learnings.sh
# Non-interactive script to apply learnings to role definitions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ROLES_DIR="$PROJECT_ROOT/processes/roles"
LEARNINGS_DIR="$PROJECT_ROOT/processes/learnings"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Applying B003 Learnings to Role Definitions ===${NC}"

# Update Developer Role with B003 learnings
echo -e "${YELLOW}Updating Developer Role...${NC}"

# Append B003 specific learnings to Developer role
cat >> "$ROLES_DIR/DEVELOPER_ROLE_AND_LEARNINGS.md" << 'EOF'

## React Native Web Specific Patterns (Added 2025-09-12 from B003)

### 🔴 CRITICAL: React Native Web CSS Override Issue
**Problem**: RNW generates CSS classes that override StyleSheet properties
**Solution**: Use inline styles for guaranteed specificity

```javascript
// ✅ CORRECT - Inline style overrides RNW classes
<View 
  style={[
    styles.header,
    { backgroundColor: headerBackground } // Forces override
  ]}
>

// ❌ WRONG - Can be overridden by RNW classes
<View style={styles.header}>  // backgroundColor might not apply
```

### 🔴 Material Icons Web Compatibility
**Problem**: MaterialIcons font may not load on web
**Solution**: Use text characters for cross-platform reliability

```javascript
// ✅ CORRECT - Works everywhere
<Text style={{ fontSize: 24, color: iconColor }}>✕</Text>

// ❌ WRONG - May show broken glyph on web
<Icon name="close" size={24} color={iconColor} />
```

### 🔴 Debugging React Native Web UI Issues
When styles aren't applying:
1. Inspect DOM for `r-[property]-[hash]` classes
2. These RNW classes may override your styles
3. Use inline styles to force override
4. Create browser console debug scripts

```javascript
// Debug script for browser console
document.querySelectorAll('[class*="r-backgroundColor"]').forEach(el => {
  console.log('RNW override:', el.className, getComputedStyle(el).backgroundColor);
});
```

EOF

echo -e "${GREEN}✓ Developer Role updated${NC}"

# Update Peer Reviewer Role with B003 learnings
echo -e "${YELLOW}Updating Peer Reviewer Role...${NC}"

cat >> "$ROLES_DIR/PEER_REVIEWER_ROLE_AND_LEARNINGS.md" << 'EOF'

## React Native Web Validation (Added 2025-09-12 from B003)

### 🔴 UI Bug Verification Requirements
**MANDATORY for UI fixes**:
1. Request screenshot proof of fix
2. Cannot approve without visual verification
3. Multiple fix attempts = missing root cause
4. Require DOM inspection for web issues

### 🔴 React Native Web Specific Checks
```bash
# Check for RNW override patterns
grep -r "style=\[" src/ --include="*.js" | grep backgroundColor

# Verify inline style usage for overrides
grep -r "{ backgroundColor:" src/ --include="*.js"

# Check Material Icons usage (should use text)
grep -r "MaterialIcons" src/ --include="*.js"
```

### 🔴 Red Flags from B003 Experience
- Developer claims "fix implemented" without screenshots
- Multiple iterations without root cause identification  
- Style changes without inline override pattern
- Material Icons on web platform

### 🔴 Required Evidence for UI Fixes
1. Before/after screenshots
2. Browser console output showing styles
3. DOM inspection showing applied classes
4. Cross-browser testing proof

EOF

echo -e "${GREEN}✓ Peer Reviewer Role updated${NC}"

# Create a summary of Manylla-specific patterns
echo -e "${YELLOW}Creating Manylla-specific patterns summary...${NC}"

cat > "$ROLES_DIR/MANYLLA_SPECIFIC_PATTERNS.md" << 'EOF'
# Manylla-Specific Implementation Patterns

*Auto-generated: 2025-09-12*
*Based on actual bugs and fixes in production*

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
EOF

echo -e "${GREEN}✓ Manylla-specific patterns documented${NC}"

# Update CLAUDE.md with new patterns
echo -e "${YELLOW}Updating CLAUDE.md with RNW patterns...${NC}"

# Check if the pattern already exists
if ! grep -q "React Native Web CSS Override" "$PROJECT_ROOT/CLAUDE.md"; then
    cat >> "$PROJECT_ROOT/CLAUDE.md" << 'EOF'

## React Native Web Patterns (Critical)

### CSS Override Issue
React Native Web generates CSS classes that can override StyleSheet properties.
Solution: Use inline styles with arrays for guaranteed specificity.

```javascript
// Correct pattern for RNW overrides
<View style={[styles.base, { backgroundColor: color }]} />
```

### Material Icons on Web
Material Icons may not render properly on web. Use text characters instead:
- Close: ✕
- Menu: ☰  
- Settings: ⚙️

### Debugging Web UI Issues
1. Inspect DOM for `r-[property]-[hash]` classes
2. Use browser console to check computed styles
3. Apply inline styles to force overrides

EOF
    echo -e "${GREEN}✓ CLAUDE.md updated${NC}"
else
    echo "CLAUDE.md already contains RNW patterns"
fi

echo ""
echo -e "${BLUE}=== Role Definitions Updated Successfully ===${NC}"
echo ""
echo "Applied learnings:"
echo "✓ React Native Web CSS override patterns"
echo "✓ Material Icons compatibility issues"
echo "✓ UI debugging requirements"
echo "✓ Peer review validation for UI fixes"
echo ""
echo "Updated files:"
echo "- $ROLES_DIR/DEVELOPER_ROLE_AND_LEARNINGS.md"
echo "- $ROLES_DIR/PEER_REVIEWER_ROLE_AND_LEARNINGS.md"
echo "- $ROLES_DIR/MANYLLA_SPECIFIC_PATTERNS.md"
echo ""
echo "The roles are now more specific to Manylla's current implementation!"