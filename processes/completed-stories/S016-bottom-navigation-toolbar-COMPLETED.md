# Story S016: Replace Header Menu with Bottom Navigation Toolbar

## COMPLETED - IMPLEMENTATION REVISED
**Completion Date**: 2025-01-14
**Final Implementation**: Permanent bottom toolbar (not slide-up sheet)

## EPIC OVERVIEW
Redesigned Manylla's navigation system, replacing the cramped header menu with a permanent bottom toolbar that provides better mobile usability and clear labeling for all actions.

## STATUS
- **Priority**: P1 - High Priority
- **Status**: COMPLETED (with revised approach)
- **Created**: 2025-09-13
- **Completed**: 2025-01-14
- **Type**: UI/UX Major Feature
- **Effort**: L (Large - 20-30 hours)
- **Risk**: Medium (Core navigation change affects all users)
- **Platforms**: All (Web, iOS, Android)

## BACKGROUND & PROBLEM STATEMENT

### Original Problems (SOLVED)
1. **Space Constraints**: Header menu had 8 items crammed into limited horizontal space
2. **No Labels**: Icons only - users had to guess functionality
3. **Mobile Unfriendly**: Small tap targets in header were hard to hit
4. **No Growth Path**: Adding new features meant smaller buttons or hidden features
5. **Inconsistent Access**: Some features buried in hamburger menu, others visible

### Implemented Solution
Permanent bottom toolbar with:
- Always-visible navigation at bottom of screen
- Primary actions readily accessible
- Overflow menu for secondary actions
- Icons WITH labels for clarity
- Platform-optimized sizing
- Clean header with just logo and profile
- Profile always visible in top-right (no scroll animation needed)

## IMPLEMENTATION SUMMARY

### What Was Built
1. **BottomToolbar Component** (`src/components/Navigation/BottomToolbar.js`)
   - Permanent bottom navigation bar
   - Always visible, no slide-up animation needed
   - Contains all primary navigation actions
   - Overflow menu for additional options
   - Theme selector with light/dark/auto options

2. **Simplified Header** (`src/components/Layout/Header.js`)
   - Logo on left
   - Profile on right (always visible)
   - No menu items cluttering the header
   - Clean, minimal design

3. **Navigation Strategy**
   - Header: Branding and user identity
   - Footer: All navigation and actions
   - No hidden menus or drawers
   - Everything accessible with one tap

### Benefits Achieved
- ✅ Better mobile ergonomics (thumb-friendly bottom navigation)
- ✅ All actions visible and labeled
- ✅ Scalable for future features
- ✅ Consistent across all platforms
- ✅ Profile always visible for context
- ✅ Clean, uncluttered header

## ORIGINAL DETAILED REQUIREMENTS (ARCHIVED)

### 1. Header Modifications

#### 1.1 Remove Current Menu Items
- **File**: `src/components/Layout/Header.js`
- Remove all individual menu buttons from header
- Keep only: Logo/Title on left, Menu icon on right
- Maintain profile display if currently shown
- Preserve theme colors and styling

#### 1.2 Add Menu Trigger Button
```javascript
// Header right section - single menu button
<TouchableOpacity
  onPress={openBottomSheet}
  style={styles.menuButton}
  accessibilityLabel="Open navigation menu"
  accessibilityRole="button">
  <MenuIcon size={24} color={colors.text} />
</TouchableOpacity>
```

### 2. Bottom Sheet Component

#### 2.1 Component Structure
**New File**: `src/components/Navigation/BottomSheetMenu.js`

```javascript
// Core structure
const BottomSheetMenu = ({
  visible,
  onClose,
  onItemPress,
  theme,
  colors,
  syncStatus,
  profile
}) => {
  const [overflowExpanded, setOverflowExpanded] = useState(false);

  // Primary items (always visible)
  const primaryItems = [
    { id: 'share', label: 'Share', icon: ShareIcon },
    { id: 'print', label: 'Print', icon: PrintIcon },
    { id: 'sync', label: 'Sync', icon: CloudIcon },
    { id: 'categories', label: 'Categories', icon: LabelIcon }
  ];

  // Secondary items (in overflow)
  const secondaryItems = [
    { id: 'theme', label: 'Theme', icon: PaletteIcon },
    { id: 'privacy', label: 'Privacy', icon: PrivacyTipIcon },
    { id: 'support', label: 'Support', icon: SupportIcon },
    { id: 'close', label: 'Close Profile', icon: LogoutIcon }
  ];
}
```

#### 2.2 Animation Requirements
- **Entry**: Slide up from bottom (300ms ease-out)
- **Exit**: Slide down to bottom (250ms ease-in)
- **Overflow**: Expand/collapse with height animation (200ms)
- **Backdrop**: Fade in/out (200ms)
- **Use React Native Animated API** for cross-platform consistency

### 3. Layout Specifications

#### 3.1 Bottom Sheet Dimensions
```javascript
const SHEET_CONFIG = {
  // Base height for primary row
  baseHeight: platform.select({
    ios: 100,      // Account for home indicator
    android: 85,
    web: 90
  }),

  // Expanded height with overflow
  expandedHeight: platform.select({
    ios: 185,
    android: 170,
    web: 175
  }),

  // Icon button dimensions
  buttonSize: platform.select({
    web: { width: 80, height: 75 },
    ios: { width: 75, height: 70 },
    android: { width: 75, height: 70 }
  }),

  // Icon size
  iconSize: platform.select({
    web: 24,
    default: 22
  }),

  // Label font size
  labelSize: platform.select({
    web: 12,
    default: 11
  })
};
```

#### 3.2 Visual Design
```javascript
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    paddingBottom: platform.select({
      ios: 34, // Safe area for home indicator
      default: 0
    })
  },

  primaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider
  },

  overflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    opacity: 0, // Animated
    height: 0,  // Animated
  },

  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHEET_CONFIG.buttonSize
  },

  menuIcon: {
    marginBottom: 4
  },

  menuLabel: {
    fontSize: SHEET_CONFIG.labelSize,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500'
  },

  moreButton: {
    // Special styling for "More" button
    borderLeftWidth: 1,
    borderLeftColor: colors.divider
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)'
  }
});
```

### 4. Interaction Patterns

#### 4.1 Opening the Menu
```javascript
// In Header.js
const openBottomSheet = () => {
  setBottomSheetVisible(true);
  // Track analytics
  trackEvent('navigation_menu_opened');
};

// In BottomSheetMenu.js
useEffect(() => {
  if (visible) {
    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }
}, [visible]);
```

#### 4.2 Handling Item Presses
```javascript
const handleItemPress = (itemId) => {
  // Haptic feedback on mobile
  if (platform.OS !== 'web') {
    HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Light);
  }

  // Close menu first for better UX
  closeMenu();

  // Small delay to allow close animation
  setTimeout(() => {
    switch(itemId) {
      case 'share':
        onShare();
        break;
      case 'print':
        onPrintClick();
        break;
      case 'sync':
        onSyncClick();
        break;
      case 'categories':
        onCategoriesClick();
        break;
      case 'theme':
        onThemeToggle();
        showToast(`${getNextThemeName()} mode activated`, 'info');
        break;
      case 'privacy':
        onPrivacyClick();
        break;
      case 'support':
        onSupportClick();
        break;
      case 'close':
        onCloseProfile();
        break;
    }
  }, 100);
};
```

#### 4.3 More/Overflow Behavior
```javascript
const toggleOverflow = () => {
  const newExpanded = !overflowExpanded;
  setOverflowExpanded(newExpanded);

  // Animate height and opacity
  Animated.parallel([
    Animated.timing(overflowHeight, {
      toValue: newExpanded ? 85 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false
    }),
    Animated.timing(overflowOpacity, {
      toValue: newExpanded ? 1 : 0,
      duration: 150,
      useNativeDriver: true
    })
  ]).start();

  // Rotate more arrow
  Animated.timing(moreIconRotation, {
    toValue: newExpanded ? 1 : 0,
    duration: 200,
    useNativeDriver: true
  }).start();
};
```

### 5. Platform-Specific Adaptations

#### 5.1 iOS Considerations
```javascript
// Handle safe areas and home indicator
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
const bottomPadding = Math.max(insets.bottom, 20);

// Swipe down to close gesture
const panResponder = PanResponder.create({
  onMoveShouldSetPanResponder: (evt, gestureState) => {
    return gestureState.dy > 10; // Downward swipe
  },
  onPanResponderRelease: (evt, gestureState) => {
    if (gestureState.dy > 50) {
      closeMenu();
    }
  }
});
```

#### 5.2 Android Considerations
```javascript
// Handle back button
useEffect(() => {
  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    () => {
      if (visible) {
        closeMenu();
        return true;
      }
      return false;
    }
  );
  return () => backHandler.remove();
}, [visible]);

// Material Design elevation
androidElevation: 24
```

#### 5.3 Web Considerations
```javascript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e) => {
    if (!visible) return;

    // ESC to close
    if (e.key === 'Escape') {
      closeMenu();
    }

    // Number keys for quick access
    if (e.key >= '1' && e.key <= '4') {
      const index = parseInt(e.key) - 1;
      handleItemPress(primaryItems[index].id);
    }
  };

  if (platform.isWeb) {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }
}, [visible]);

// Responsive sizing
const { width } = useWindowDimensions();
const isTablet = width >= 768;
const buttonWidth = isTablet ? 90 : 75;
```

### 6. State Management

#### 6.1 Menu State
```javascript
// In App.js or main container
const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

// Pass down through context or props
<ThemeContext.Provider value={{
  ...existing,
  bottomSheetVisible,
  setBottomSheetVisible
}}>
```

#### 6.2 Sync Status Indicator
```javascript
// Show sync status on sync button
const SyncButton = ({ syncStatus }) => {
  const getStatusColor = () => {
    switch(syncStatus) {
      case 'syncing': return colors.warning;
      case 'error': return colors.error;
      case 'success': return colors.success;
      default: return colors.text;
    }
  };

  return (
    <View style={styles.menuButton}>
      <CloudIcon
        size={SHEET_CONFIG.iconSize}
        color={getStatusColor()}
      />
      {syncStatus === 'syncing' && (
        <ActivityIndicator
          size="small"
          style={styles.syncIndicator}
        />
      )}
      <Text style={styles.menuLabel}>Sync</Text>
    </View>
  );
};
```

### 7. Accessibility Requirements

#### 7.1 Screen Reader Support
```javascript
// Announce menu state changes
AccessibilityInfo.announceForAccessibility(
  visible ? 'Navigation menu opened' : 'Navigation menu closed'
);

// Proper ARIA labels
<TouchableOpacity
  accessibilityLabel={`${item.label}. Double tap to activate`}
  accessibilityRole="button"
  accessibilityState={{ selected: false }}
  accessibilityHint={getHintForItem(item.id)}
>
```

#### 7.2 Focus Management
```javascript
// Auto-focus first item when opened
const firstButtonRef = useRef(null);

useEffect(() => {
  if (visible && firstButtonRef.current) {
    // Delay to allow animation
    setTimeout(() => {
      firstButtonRef.current?.focus?.();
    }, 350);
  }
}, [visible]);
```

#### 7.3 High Contrast Support
```javascript
// Detect high contrast mode
const isHighContrast = useColorScheme() === 'high-contrast';

// Adjust styles
highContrastStyles: {
  borderWidth: 2,
  borderColor: colors.text,
  iconColor: colors.primary
}
```

### 8. Testing Requirements

#### 8.1 Unit Tests
```javascript
// __tests__/BottomSheetMenu.test.js
describe('BottomSheetMenu', () => {
  it('renders all primary menu items', () => {
    const { getByText } = render(<BottomSheetMenu {...props} />);
    expect(getByText('Share')).toBeTruthy();
    expect(getByText('Print')).toBeTruthy();
    expect(getByText('Sync')).toBeTruthy();
    expect(getByText('Categories')).toBeTruthy();
  });

  it('expands overflow when More pressed', () => {
    const { getByText, queryByText } = render(<BottomSheetMenu {...props} />);
    expect(queryByText('Theme')).toBeNull();

    fireEvent.press(getByText('More'));

    expect(getByText('Theme')).toBeTruthy();
    expect(getByText('Privacy')).toBeTruthy();
  });

  it('closes menu when item pressed', () => {
    const onClose = jest.fn();
    const onShare = jest.fn();
    const { getByText } = render(
      <BottomSheetMenu
        visible={true}
        onClose={onClose}
        onShare={onShare}
        {...props}
      />
    );

    fireEvent.press(getByText('Share'));

    expect(onShare).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
```

#### 8.2 Integration Tests
```javascript
describe('Navigation Integration', () => {
  it('opens bottom sheet from header menu button', async () => {
    const { getByLabelText, getByText } = render(<App />);

    const menuButton = getByLabelText('Open navigation menu');
    fireEvent.press(menuButton);

    await waitFor(() => {
      expect(getByText('Share')).toBeTruthy();
    });
  });

  it('maintains state through theme changes', () => {
    // Test that menu works correctly after theme toggle
  });

  it('handles rapid open/close without crashes', () => {
    // Stress test animations
  });
});
```

#### 8.3 E2E Tests
```javascript
// e2e/navigation.test.js
describe('Bottom Sheet Navigation E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should navigate through all menu items', async () => {
    // Open menu
    await element(by.id('header-menu-button')).tap();

    // Verify menu visible
    await expect(element(by.id('bottom-sheet-menu'))).toBeVisible();

    // Test share flow
    await element(by.text('Share')).tap();
    await expect(element(by.id('share-modal'))).toBeVisible();
    await element(by.id('close-share')).tap();

    // Test overflow
    await element(by.id('header-menu-button')).tap();
    await element(by.text('More')).tap();
    await expect(element(by.text('Theme'))).toBeVisible();
  });
});
```

### 9. Performance Optimization

#### 9.1 Lazy Loading
```javascript
// Only load menu when first opened
const BottomSheetMenu = lazy(() =>
  import('./components/Navigation/BottomSheetMenu')
);

// In render
{bottomSheetVisible && (
  <Suspense fallback={null}>
    <BottomSheetMenu {...props} />
  </Suspense>
)}
```

#### 9.2 Memoization
```javascript
// Memoize menu items to prevent recreating
const primaryItems = useMemo(() => [
  { id: 'share', label: 'Share', icon: ShareIcon },
  // ... other items
], []); // No dependencies - static

// Memoize expensive computations
const buttonWidth = useMemo(() => {
  return calculateButtonWidth(screenWidth, itemCount);
}, [screenWidth, itemCount]);
```

#### 9.3 Animation Performance
```javascript
// Use native driver where possible
useNativeDriver: true // For transform and opacity

// For height animations (can't use native driver)
// Use LayoutAnimation for better performance
LayoutAnimation.configureNext(
  LayoutAnimation.create(
    200,
    LayoutAnimation.Types.easeInEaseOut,
    LayoutAnimation.Properties.scaleY
  )
);
setOverflowExpanded(!overflowExpanded);
```

### 10. Migration Strategy

#### 10.1 Phase 1: Parallel Implementation (Week 1)
1. Create BottomSheetMenu component
2. Add feature flag: `useBottomSheetNav`
3. Keep existing header menu functional
4. Test bottom sheet in isolation

#### 10.2 Phase 2: Integration (Week 2)
1. Wire up bottom sheet to header button (behind flag)
2. Ensure all callbacks work correctly
3. Test on all platforms
4. Gather internal feedback

#### 10.3 Phase 3: Rollout (Week 3)
1. Enable for 10% of users
2. Monitor analytics and errors
3. Gradual rollout to 100%
4. Remove old header menu code

#### 10.4 Rollback Plan
```javascript
// Feature flag in config
const FEATURES = {
  useBottomSheetNav: process.env.ENABLE_BOTTOM_NAV === 'true'
};

// In Header.js
{FEATURES.useBottomSheetNav ? (
  <TouchableOpacity onPress={openBottomSheet}>
    <MenuIcon />
  </TouchableOpacity>
) : (
  <OldHeaderMenu {...props} />
)}
```

### 11. Analytics & Monitoring

#### 11.1 Track Usage
```javascript
const trackMenuAction = (action, item) => {
  analytics.track('menu_action', {
    action, // 'open', 'close', 'item_press', 'overflow_toggle'
    item,   // 'share', 'print', etc.
    method, // 'tap', 'swipe', 'keyboard'
    timestamp: Date.now()
  });
};
```

#### 11.2 Error Boundaries
```javascript
class MenuErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    console.error('BottomSheetMenu Error:', error);
    // Log to error reporting service
    errorReporter.log(error, {
      component: 'BottomSheetMenu',
      ...errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback to header menu button that shows alert
      return <FallbackMenuButton />;
    }
    return this.props.children;
  }
}
```

### 12. Documentation Updates

#### 12.1 User Documentation
- Update help docs with new navigation screenshots
- Create video tutorial for new menu
- Update onboarding flow to highlight menu button

#### 12.2 Developer Documentation
```markdown
# Bottom Sheet Navigation

## Overview
Manylla uses a bottom sheet navigation pattern for primary actions.

## Adding New Menu Items

### Primary Items (Always Visible)
Add to `primaryItems` array in `BottomSheetMenu.js`:
```javascript
{
  id: 'unique-id',
  label: 'Display Name',
  icon: IconComponent
}
```

### Secondary Items (Overflow)
Add to `secondaryItems` array.

## Styling
All styles use theme colors from `ThemeContext`.
Modify `SHEET_CONFIG` for sizing adjustments.

## Platform Differences
- iOS: Includes home indicator padding
- Android: Hardware back button closes menu
- Web: Keyboard shortcuts available
```

### 13. Success Metrics

#### 13.1 Functional Requirements (MUST PASS)
```bash
# All menu items accessible
✓ Share functionality works
✓ Print functionality works
✓ Sync functionality works
✓ Categories modal opens
✓ Theme toggles correctly
✓ Privacy policy opens
✓ Support modal opens
✓ Close profile works

# Animations smooth
✓ Open animation < 300ms
✓ Close animation < 250ms
✓ No jank on overflow toggle

# Platform compatibility
✓ Works on iOS
✓ Works on Android
✓ Works on Web (desktop)
✓ Works on Web (mobile)
```

#### 13.2 Performance Metrics
```javascript
// Measure and log
const menuOpenTime = performance.now();
// After animation complete
const openDuration = performance.now() - menuOpenTime;
console.assert(openDuration < 350, 'Menu open too slow');

// Bundle size impact
// Before: X KB
// After: < X + 10KB
```

#### 13.3 User Experience Metrics
- Menu discovery rate > 90% (users find and use menu)
- Average time to complete action reduced by 20%
- Error rate (misclicks) reduced by 50%
- User satisfaction score improved

### 14. Acceptance Criteria Checklist

#### Required for Story Completion
- [ ] Header menu button implemented and styled
- [ ] Bottom sheet component created with animations
- [ ] All 8 menu items functional
- [ ] Primary/overflow layout working
- [ ] Icons and labels displayed correctly
- [ ] More button toggles overflow row
- [ ] Backdrop dismisses menu
- [ ] Platform-specific adaptations complete
- [ ] Accessibility requirements met
- [ ] All existing functionality preserved
- [ ] No console errors or warnings
- [ ] Tests written and passing
- [ ] Works on all platforms (Web, iOS, Android)
- [ ] Performance targets met
- [ ] Analytics tracking implemented
- [ ] Documentation updated
- [ ] Code reviewed and approved

#### Definition of Done
- [ ] Deployed to qual environment
- [ ] Tested by at least 2 team members
- [ ] No critical bugs reported
- [ ] Performance metrics logged
- [ ] Rollback plan tested
- [ ] Old header menu code removed (after full rollout)

### 15. Technical Debt & Future Enhancements

#### Debt to Track
1. **Gesture Support**: Add swipe up to open (P3, M)
2. **Customization**: User-defined item order (P3, L)
3. **Animations**: Spring physics for more natural feel (P3, S)
4. **Tablet Mode**: Side panel option for landscape tablets (P2, M)

#### Future Enhancements
1. **Quick Actions**: Long press for sub-menus
2. **Search Integration**: Search bar in expanded view
3. **Recent Actions**: Smart ordering based on usage
4. **Contextual Items**: Different items based on current screen
5. **Widgets**: Mini app widgets in bottom sheet

### 16. Risk Mitigation

#### Identified Risks
1. **User Confusion**: Users can't find menu
   - Mitigation: Onboarding tooltip on first launch

2. **Performance Issues**: Animation lag on older devices
   - Mitigation: Reduce animation complexity, add low-power mode

3. **Accessibility Problems**: Screen readers confused
   - Mitigation: Extensive testing with VoiceOver/TalkBack

4. **Platform Inconsistencies**: Looks different per platform
   - Mitigation: Platform-specific QA checklist

### 17. Code Examples

#### 17.1 Complete Button Component
```javascript
const MenuButton = ({ item, onPress, theme, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.menuButton}
      accessibilityLabel={item.label}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.iconContainer}>
          <item.icon
            size={SHEET_CONFIG.iconSize}
            color={colors.text}
          />
        </View>
        <Text style={[styles.menuLabel, { color: colors.text }]}>
          {item.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
```

#### 17.2 Complete Animation Setup
```javascript
const BottomSheetMenu = ({ visible, onClose, ...props }) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const overflowHeight = useRef(new Animated.Value(0)).current;

  // Open animation
  const animateOpen = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  // Close animation
  const animateClose = (callback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(callback);
  };

  // Handle close
  const handleClose = () => {
    animateClose(() => {
      onClose();
      setOverflowExpanded(false);
    });
  };

  useEffect(() => {
    if (visible) {
      animateOpen();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.surface
          }
        ]}
      >
        {/* Content */}
      </Animated.View>
    </Modal>
  );
};
```

### 18. File Structure

```
src/
├── components/
│   ├── Layout/
│   │   └── Header.js (modified)
│   └── Navigation/
│       ├── BottomSheetMenu.js (new)
│       ├── MenuButton.js (new)
│       ├── OverflowRow.js (new)
│       └── __tests__/
│           └── BottomSheetMenu.test.js (new)
├── hooks/
│   └── useBottomSheet.js (new)
├── styles/
│   └── navigation.js (new)
└── utils/
    └── menuConfig.js (new)
```

### 19. Implementation Checklist

#### Week 1: Foundation
- [ ] Create feature branch `feature/S015-bottom-sheet-nav`
- [ ] Set up BottomSheetMenu component structure
- [ ] Implement basic animation framework
- [ ] Create MenuButton component
- [ ] Add primary items row
- [ ] Add overflow row structure
- [ ] Basic styling matching theme

#### Week 2: Functionality
- [ ] Wire up all menu item callbacks
- [ ] Implement More button toggle
- [ ] Add backdrop dismiss
- [ ] Platform-specific adjustments
- [ ] Accessibility features
- [ ] Animation fine-tuning
- [ ] Error handling

#### Week 3: Polish & Testing
- [ ] Unit tests complete
- [ ] Integration tests complete
- [ ] E2E tests written
- [ ] Performance optimization
- [ ] Documentation written
- [ ] Code review changes
- [ ] QA testing on all platforms
- [ ] Deploy to qual

### 20. Validation Script

```bash
#!/bin/bash
# scripts/validate-bottom-sheet-nav.sh

echo "=== Bottom Sheet Navigation Validation ==="

# Check component exists
if [ -f "src/components/Navigation/BottomSheetMenu.js" ]; then
  echo "✅ BottomSheetMenu component exists"
else
  echo "❌ BottomSheetMenu component missing"
  exit 1
fi

# Check all menu items functioning
echo "Testing menu items..."
npm test -- BottomSheetMenu --coverage

# Check animations
echo "Checking animation performance..."
# Add performance test

# Platform builds
echo "Building for all platforms..."
npm run build:web || exit 1
echo "✅ Web build successful"

# Check bundle size
echo "Checking bundle size impact..."
# Compare before/after

echo "=== Validation Complete ==="
```

## EPIC COMPLETE

This story encompasses a complete navigation system overhaul with clear requirements, implementation details, testing criteria, and rollout strategy. The bottom sheet pattern will provide Manylla with a scalable, user-friendly navigation system that grows with the product.

---
*Story ID: S016*
*Created: 2025-09-13*
*Status: READY*
*Assignee: Unassigned*
*Effort: L (20-30 hours)*