# Session 1: Fixed Header Infrastructure

## Objective
Establish a sticky header with proper scroll layering and consistent height for the Manylla application, preparing the foundation for dynamic profile content transitions.

## Context
You are working on Manylla, a React Native + Web application for managing special needs information. The app uses a manila envelope aesthetic with warm, paper-like colors. This session focuses on converting the existing header to a fixed/sticky position that allows content to scroll beneath it.

## Current State
- **Tech Stack**: React Native + Web (unified codebase, JavaScript only), Webpack for web builds
- **Header Location**: `src/components/Layout/Header.js`
- **Design System**: Located at `/docs/architecture/01_DESIGN_SYSTEM.md`
- **Color Palette**: Primary manila brown (#A08670), off-white background (#FAF9F6)

## Requirements for Session 1

### 1. Header Positioning
- Convert header from current positioning to fixed/sticky
- Measure and lock current header height (must remain constant)
- Set appropriate z-index (e.g., 1000) to ensure header floats above scroll content
- Add subtle elevation/shadow for visual depth

### 2. ScrollView Configuration
- Adjust main ScrollView to start at `top: 0`
- Content should render under the header (not start below it)
- Add top padding to first content element equal to header height
- Ensure smooth scrolling without janky behavior

### 3. Scroll Position Detection Hook
Create a new hook `useHeaderProfileTransition.js` that:
- Monitors scroll position (throttled to ~16ms for 60fps)
- Calculates when profile photo reaches trigger point
- Trigger point: when bottom edge of profile photo (or 75% of photo height) passes behind header
- Returns `isProfileHidden` boolean state
- Handles initial mount (check if already scrolled)

### 4. Platform Considerations
**Web**:
- Use `position: fixed` or `position: sticky` 
- Consider `-webkit-sticky` for Safari compatibility
- Use CSS `will-change` or `transform: translateZ(0)` for GPU acceleration

**Mobile**:
- Account for SafeAreaView insets
- Handle StatusBar height on Android
- Consider notch/dynamic island on iOS

## Implementation Steps

### Step 1: Measure Current Header
```javascript
// Get current header height before making changes
// This height must be preserved throughout all states
const HEADER_HEIGHT = /* measure current height */;
```

### Step 2: Update Header Component
```javascript
// src/components/Layout/Header.js
// Add fixed positioning with consistent height
const headerStyle = {
  position: 'fixed', // or 'sticky'
  top: 0,
  left: 0,
  right: 0,
  height: HEADER_HEIGHT,
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // subtle elevation
};
```

### Step 3: Create Scroll Detection Hook
```javascript
// src/hooks/useHeaderProfileTransition.js
export const useHeaderProfileTransition = () => {
  const [isProfileHidden, setIsProfileHidden] = useState(false);
  
  useEffect(() => {
    const handleScroll = throttle(() => {
      // Calculate trigger point based on profile photo position
      // Set isProfileHidden when threshold is passed
    }, 16); // ~60fps
    
    // Check initial scroll position on mount
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { isProfileHidden };
};
```

### Step 4: Adjust Content Container
```javascript
// Main content container needs top padding
const contentStyle = {
  paddingTop: HEADER_HEIGHT,
  // Ensure content can scroll under header
};
```

## Testing Checklist
- [ ] Header stays fixed at top during all scroll positions
- [ ] Header height remains constant (no layout shifts)
- [ ] Content scrolls smoothly under header
- [ ] No visual glitches or z-index conflicts
- [ ] Scroll detection accurately identifies when profile is hidden
- [ ] Performance remains at 60fps during scroll
- [ ] Works correctly on web (Chrome, Safari, Firefox)
- [ ] Works correctly on iOS devices
- [ ] Works correctly on Android devices
- [ ] Initial render with pre-scrolled position works correctly

## Success Metrics
- Zero layout shift score
- 60fps scroll performance
- Correct trigger point detection (±5px accuracy)
- No regression in existing header functionality

## Files to Modify
1. `src/components/Layout/Header.js` - Add fixed positioning and height lock
2. Create: `src/hooks/useHeaderProfileTransition.js` - Scroll detection logic
3. Update: Main app container - Adjust ScrollView/content padding

## Edge Cases to Handle
- Page refresh while scrolled down
- Rapid scroll direction changes
- Browser zoom levels
- Mobile keyboard appearance
- Orientation changes on mobile

## Performance Considerations
- Use `throttle` not `debounce` for scroll events
- Consider `IntersectionObserver` API on web for better performance
- Minimize re-renders by using React.memo where appropriate
- Use CSS transforms rather than position changes

## Notes for Next Session
Session 2 will build upon this foundation to add:
- Profile photo/name display in header
- Smooth crossfade transition
- Button collapse logic
- Click handlers for profile editing

## Definition of Done
- Header is fixed/sticky with consistent height
- Content scrolls properly underneath
- Scroll position detection is accurate and performant
- No visual regressions or layout shifts
- Code is clean, commented, and follows project patterns