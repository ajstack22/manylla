# Session 2: Profile Transition & Button Management

## Objective
Add dynamic content switching to the fixed header, displaying the child's profile photo and name when scrolled, with intelligent button collapse to prevent overlap.

## Prerequisites (From Session 1 Implementation)
- ✅ Fixed header with `HEADER_HEIGHT = 64px` exported from `src/components/Layout/Header.js`
- ✅ `useHeaderProfileTransition` hook at `src/hooks/useHeaderProfileTransition.js` provides:
  - `isProfileHidden`: boolean indicating when profile photo is scrolled behind header
  - `scrollY`: current scroll position (throttled at 16ms for 60fps performance)
  - `setProfilePhotoRef`: method to set reference to profile photo element
  - `headerHeight`: returns HEADER_HEIGHT constant (64px)
  - ✅ Proper cleanup of event listeners (no memory leaks)
  - ✅ Checks initial scroll position on mount
- ✅ Header component already accepts `isProfileHidden` prop (currently shows test chip)
- ✅ Header positioned with `position: fixed`, z-index: theme.zIndex.appBar, shadow, and blur backdrop
- ✅ Content has top padding equal to HEADER_HEIGHT
- ✅ Mobile: SafeAreaView handling with Platform.select() in unified Header.js

## Context
Building upon the fixed header infrastructure from Session 1, this session implements the visual transition that replaces "manylla" branding with the current child's profile information during scroll. The manila envelope aesthetic should be maintained with smooth, subtle animations.

### Current Implementation Details from Session 1:

#### Architecture Notes (Post-Consolidation):
- **✅ Unified Codebase**: All components are now unified .js files with Platform.select()
- **⚠️ Prop Drilling Problem**: `isProfileHidden` is passed through App.js → Header, causing unnecessary re-renders
  - **Fix**: Header should use `useHeaderProfileTransition` hook directly
  - This avoids re-rendering entire App component on every scroll
- **Profile Data**: Currently NO profile prop passed to Header (needs to be added)
- **Test Indicator**: Chip at lines 147-154 shows "Profile Hidden" (remove this)

#### Component Details:
- **Profile Photo in Main View**: ProfileOverview.js lines 85-101
  - 120x120px Avatar with manila color fallback (#F4E4C1)
  - First letter shown if no photo
  - Click handler at line 98: `onClick={() => onUpdateProfile && setProfileEditOpen(true)}`
- **"manylla" Logo**: Lines 126-145 in Header.js
  - Typography with gradient text, 48px font
  - Inside Box with `flexGrow: 1` (will complicate absolute positioning)
  - Position: inline-block with padding

#### Button Configuration:
- **Desktop Buttons** (all visible):
  1. Categories (LabelIcon) - line 213-220
  2. Share (ShareIcon) - line 222-230  
  3. Sync (CloudUploadIcon/CloudDoneIcon/CloudAlertIcon) - line 232-240
  4. Theme (PaletteIcon) - line 242-249
  5. Close Profile (LogoutIcon) - line 250-258
- **Mobile**: Only Categories + MoreVert menu (contains all others)
- **Priority for collapse**: Close Profile → Theme → Sync → Share → Categories (last to hide)

## Requirements for Session 2

### 1. Profile Display Components
Create header-specific profile display that:
- Shows circular photo (36-40px diameter)
- Displays child's name immediately to the right
- Falls back to letter badge if no photo exists
- Matches the visual style of the main ProfileCard

### 2. Crossfade Transition
Implement smooth transition between states:
- Duration: 200-300ms
- "manylla" fades out as profile fades in
- No position shifts (both elements occupy same space)
- Use absolute positioning during transition
- No header height changes

### 3. Click Behavior
- Clicking profile photo/name in header triggers same action as ProfileCard
- Opens profile edit dialog
- Minimum touch target of 44px (add invisible padding if needed)
- Cursor: pointer on web

### 4. Button Collapse Logic
Intelligent space management:
- Calculate available space between profile name and right edge
- When name would overlap buttons (within 16px), collapse left-most button into menu
- Continue collapsing buttons as needed
- Maintain priority order (less important → more important)
- Smooth transition when buttons hide/show

### 5. Reverse Transition
When scrolling back up:
- Profile fades out, "manylla" fades in
- Collapsed buttons re-emerge if space permits
- Same timing as forward transition

## Implementation Steps

### Step 1: Profile Display Component
```javascript
// src/components/Layout/HeaderProfile.js
const HeaderProfile = ({ profile, visible, onClick }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        transform: 'translateZ(0)', // GPU acceleration
        willChange: 'opacity',
        position: 'absolute',
        left: 0, // Match parent Box positioning
        right: 0, // Take full width like manylla text container
        cursor: 'pointer',
        minWidth: 44, // Touch target
        minHeight: 44,
        pointerEvents: visible ? 'auto' : 'none', // Prevent clicks when invisible
      }}
      onClick={onClick}
    >
      {profile.photoUrl ? (
        <Avatar
          src={profile.photoUrl}
          sx={{ width: 40, height: 40, mr: 1 }}
        />
      ) : (
        <Avatar
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 1,
            bgcolor: 'primary.main' 
          }}
        >
          {profile.name?.[0]?.toUpperCase()}
        </Avatar>
      )}
      <Typography variant="h6">
        {profile.name}
      </Typography>
    </Box>
  );
};
```

### Step 2: Update Header with Transitions
```javascript
// src/components/Layout/Header.js
// Note: Header already receives isProfileHidden prop from App.js
// Need to add profile prop to Header interface and pass from App.js

interface HeaderProps {
  // ... existing props
  isProfileHidden?: boolean; // Already exists from Session 1
  profile?: ChildProfile; // Add this
}

const Header = ({ profile, isProfileHidden, ...otherProps }) => {
  // Remove the test chip that currently shows "Profile Hidden"
  
  return (
    <AppBar position="fixed" sx={{ height: HEADER_HEIGHT }}>
      {/* Manylla branding - currently at lines 126-145 */}
      <Typography
        sx={{
          // ... existing styles
          opacity: isProfileHidden ? 0 : 1,
          transition: 'opacity 0.2s ease',
          position: 'relative', // Change from current inline-block
        }}
      >
        manylla
      </Typography>
      
      {/* Profile display - add this new component */}
      {profile && (
        <HeaderProfile
          profile={profile}
          visible={isProfileHidden}
          onClick={() => /* trigger profile edit */}
        />
      )}
      
      {/* Existing action buttons - need to add collapse logic */}
    </AppBar>
  );
};
```

### Step 3: Button Collapse Calculator
```javascript
// Calculate which buttons need to collapse
const calculateCollapsedButtons = (name, isProfileVisible) => {
  if (!isProfileVisible) return [];
  
  const nameWidth = /* calculate based on character count or measure */;
  const availableSpace = /* header width - name position - minimum padding */;
  
  const buttonsToCollapse = [];
  let currentWidth = nameWidth;
  
  buttonWidths.forEach((button, index) => {
    currentWidth += button.width + 16; // button + padding
    if (currentWidth > availableSpace) {
      buttonsToCollapse.push(button.id);
    }
  });
  
  return buttonsToCollapse;
};
```

### Step 4: Handle Edge Cases
```javascript
// Name truncation for very long names
const truncateName = (name, maxWidth) => {
  // Measure text width and add ellipsis if needed
  if (textWidth > maxWidth) {
    return name.slice(0, maxChars) + '...';
  }
  return name;
};

// Hysteresis to prevent flickering at boundary
const useScrollWithHysteresis = (threshold, buffer = 10) => {
  const [isHidden, setIsHidden] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (!isHidden && scrollY > threshold + buffer) {
        setIsHidden(true);
      } else if (isHidden && scrollY < threshold - buffer) {
        setIsHidden(false);
      }
    };
    // ... throttling logic
  }, [isHidden, threshold, buffer]);
  
  return isHidden;
};
```

## Testing Checklist
- [ ] "manylla" to profile transition triggers at correct scroll point
- [ ] Crossfade completes in 200-300ms
- [ ] No layout shifts or height changes during transition
- [ ] Profile photo renders as circle (with image or letter)
- [ ] Name displays correctly (truncated if too long)
- [ ] Click on profile opens edit dialog
- [ ] Touch target is at least 44px
- [ ] Buttons collapse before overlapping name
- [ ] Collapsed buttons move to hamburger menu
- [ ] Reverse scroll restores original state smoothly
- [ ] Transitions work identically on web and mobile
- [ ] No flickering at scroll boundary
- [ ] Performance remains at 60fps

## Success Metrics
- Transition timing: 200-300ms (±50ms)
- Zero layout shift during transitions
- Touch target: minimum 44px
- Text/button spacing: minimum 16px
- No overlapping elements
- Smooth 60fps animations

## Files to Modify
1. `src/components/Layout/Header.js` - Add transition logic, remove test chip, add profile prop
2. Create: `src/components/Layout/HeaderProfile.js` - Profile display component
3. `src/App.js` - Pass profile prop to Header component (line ~534-541)
4. Optional: `src/hooks/useHeaderProfileTransition.js` - Add hysteresis if flickering occurs
5. Optional: Update button components for collapse behavior

## Edge Cases to Handle
- **Very long names**: Truncate with ellipsis
- **Missing profile**: Keep "manylla" always visible
- **No photo**: Show letter badge
- **Rapid scrolling**: Smooth transitions without flickering
- **Window resize**: Recalculate button collapse
- **Profile updates**: Update header immediately
- **Multiple profiles**: Use currently active profile

## Responsive Behavior
**Desktop (>1024px)**:
- Full name display
- Multiple action buttons visible
- Gradual button collapse

**Tablet (768-1024px)**:
- Full or truncated name based on space
- Some buttons may start collapsed

**Mobile (<768px)**:
- Most buttons already in hamburger menu
- More space for name
- Consider shorter name on very small screens

## Animation Details
```css
/* CSS for smooth transitions */
.header-transition {
  transition: opacity 0.2s ease;
  will-change: opacity;
}

/* Prevent paint flashing */
.header-profile {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

## Accessibility Considerations
- Announce profile change to screen readers (aria-live region)
- Maintain focus management when buttons collapse
- Ensure contrast ratios remain WCAG AA compliant
- Label interactive elements appropriately

## Performance Optimizations
- **Critical**: Move `useHeaderProfileTransition` hook into Header component (not App.js)
- Use React.memo for HeaderProfile component
- CSS transitions with `will-change: opacity` and `transform: translateZ(0)` for GPU acceleration
- Minimize re-renders with proper dependency arrays
- Pre-calculate button widths to avoid layout thrashing
- Consider using CSS `contain: layout` on transitioning elements
- For React Native: Use Animated API, not opacity style changes

## Definition of Done
- Profile photo/name replaces "manylla" during scroll
- Smooth 200-300ms crossfade transition
- Click functionality matches ProfileCard behavior
- Buttons intelligently collapse to prevent overlap
- Reverse scroll restores original state
- No performance degradation
- No accessibility regressions
- Code follows project patterns and is well-documented