# UI/UX Specialist Role & Design System

## Core Responsibility
Maintain design consistency, enhance user experience, ensure accessibility, and protect brand identity across web and mobile platforms.

## Critical Standards & Metrics
```bash
# Design system compliance (MUST BE 100%)
grep -r "color:" src/ | grep -v "#A08670\|#F4E4C1\|theme\." | wc -l  # Goal: 0
grep -r "fontSize:" src/ | grep -v "theme\.\|responsive\." | wc -l   # Goal: 0

# Accessibility compliance
grep -r "onPress\|onClick" src/ | grep -v "aria-label\|accessibilityLabel" | wc -l  # Max: 5

# Modal consistency
find src -name "*Modal*" -o -name "*Dialog*" | xargs grep "Material-UI"  # Must be 0
```

## Decision Authority
**CAN**: UI patterns, color adjustments within palette, spacing, animations, modal behaviors
**CANNOT**: Architecture changes, new dependencies, breaking theme structure

## Design System Foundation

### Color Palette (IMMUTABLE)
```javascript
// Primary Brand Colors - Manila Envelope Theme
const colors = {
  primary: '#A08670',        // Main brown (NOT #8B7355)
  secondary: '#F4E4C1',      // Manila paper
  background: '#FAF9F6',     // Off-white
  surface: '#FFFFFF',        // Pure white
  text: '#2C2C2C',          // Dark gray
  textSecondary: '#666666',  // Medium gray
  border: '#E0E0E0',        // Light gray
  error: '#D32F2F',         // Red
  success: '#388E3C',       // Green
  warning: '#F57C00',       // Orange
  info: '#1976D2',          // Blue
};

// Dark Mode Adjustments
const darkColors = {
  ...colors,
  background: '#1A1A1A',
  surface: '#2C2C2C',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#404040',
};
```

### Typography System
```javascript
const typography = {
  // Font families
  fontFamily: Platform.select({
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ios: 'System',
    android: 'Roboto',
  }),
  
  // Size scale (use these ONLY)
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Weight scale
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing System (8px Grid)
```javascript
const spacing = {
  xs: 4,   // 0.5 unit
  sm: 8,   // 1 unit
  md: 16,  // 2 units
  lg: 24,  // 3 units
  xl: 32,  // 4 units
  '2xl': 48, // 6 units
  '3xl': 64, // 8 units
};
```

## Modal System Guidelines

### Modal Hierarchy
1. **AddEditProfileModal** - Primary data entry (highest priority)
2. **SyncDialog** - Critical system operations
3. **ShareDialog** - Secondary actions
4. **ConfirmDialog** - Destructive actions
5. **Toast/Snackbar** - Transient feedback (lowest priority)

### Modal Implementation Rules
```javascript
// CORRECT: Unified modal pattern
const ModalTemplate = ({ visible, onClose, title, children }) => {
  const theme = useTheme();
  
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
              <ModalHeader title={title} onClose={onClose} />
              <ScrollView style={styles.content}>
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// WRONG: Material-UI Dialog
import { Dialog } from '@mui/material';  // NEVER use this
```

### Modal Behaviors
- **Backdrop**: Always semi-transparent black (rgba(0,0,0,0.5))
- **Animation**: Fade for modals, slide for sheets
- **Dismissal**: Tap backdrop or explicit close button
- **Keyboard**: Must handle keyboard avoidance on mobile
- **Max Width**: 600px on web, 90% on mobile
- **Scrolling**: Content scrolls, header/footer fixed

## Component Patterns

### Button Hierarchy
```javascript
// Primary - Main actions
<Button variant="contained" color="primary">Save Profile</Button>

// Secondary - Alternative actions  
<Button variant="outlined" color="primary">Cancel</Button>

// Tertiary - Low emphasis
<Button variant="text" color="primary">Learn More</Button>

// Danger - Destructive actions
<Button variant="contained" style={{ backgroundColor: colors.error }}>Delete</Button>
```

### Form Components
```javascript
// Text Input Pattern
<TextInput
  label="Name"
  value={value}
  onChangeText={onChange}
  error={!!error}
  helperText={error || helper}
  style={[
    styles.input,
    { borderColor: error ? colors.error : colors.border }
  ]}
/>

// Switch Pattern (iOS style preferred)
<Switch
  value={value}
  onValueChange={onChange}
  trackColor={{ false: '#767577', true: colors.primary }}
  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : colors.primary}
/>
```

### Card Patterns
```javascript
const Card = ({ children, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.card,
      {
        backgroundColor: theme.colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
      }
    ]}
  >
    {children}
  </TouchableOpacity>
);
```

## Platform-Specific Considerations

### iOS Adaptations
```javascript
// Safe area handling
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Header adjustments
const headerHeight = Platform.OS === 'ios' ? 44 : 56;

// Gesture handling
const swipeThreshold = Platform.OS === 'ios' ? 50 : 100;
```

### Android Adaptations
```javascript
// Material Design elevation
elevation: 4,  // Instead of iOS shadows

// Ripple effects
android_ripple: { color: colors.primary + '20' },

// Status bar
StatusBar.setBackgroundColor(colors.primary);
```

### Web Adaptations
```javascript
// Hover states
onMouseEnter={() => setHovered(true)}
onMouseLeave={() => setHovered(false)}

// Focus indicators
outline: `2px solid ${colors.primary}`,
outlineOffset: 2,

// Responsive breakpoints
const isDesktop = width >= 1024;
const isTablet = width >= 768 && width < 1024;
const isMobile = width < 768;
```

## Accessibility Requirements

### Required Attributes
```javascript
// Mobile
accessibilityLabel="Save profile"
accessibilityHint="Double tap to save changes"
accessibilityRole="button"
accessible={true}

// Web
aria-label="Save profile"
role="button"
tabIndex={0}
```

### Focus Management
```javascript
// Auto-focus first input in modal
useEffect(() => {
  if (visible && inputRef.current) {
    inputRef.current.focus();
  }
}, [visible]);

// Trap focus in modal
const handleKeyDown = (e) => {
  if (e.key === 'Escape') onClose();
  if (e.key === 'Tab') {
    // Handle tab trapping
  }
};
```

## Animation Guidelines

### Supported Animations
```javascript
// Fade transitions
Animated.timing(opacity, {
  toValue: visible ? 1 : 0,
  duration: 200,
  useNativeDriver: true,
}).start();

// Scale effects (buttons)
Animated.spring(scale, {
  toValue: pressed ? 0.95 : 1,
  useNativeDriver: true,
}).start();

// Slide animations (sheets)
Animated.timing(translateY, {
  toValue: visible ? 0 : height,
  duration: 300,
  useNativeDriver: true,
}).start();
```

### Performance Rules
- Use `useNativeDriver: true` when possible
- Limit to opacity, transform animations
- Avoid animating layout properties
- Keep duration under 300ms for UI responses

## Common UI Mistakes to Avoid

### 1. Hard-Coded Colors
**WRONG**: `style={{ color: '#8B7355' }}`
**RIGHT**: `style={{ color: theme.colors.primary }}`

### 2. Platform-Specific Files
**WRONG**: `Button.ios.js`, `Button.android.js`
**RIGHT**: Single `Button.js` with `Platform.select()`

### 3. Material-UI Imports
**WRONG**: `import { Button } from '@mui/material'`
**RIGHT**: `import { Button } from '../components/common/Button'`

### 4. Inconsistent Spacing
**WRONG**: `padding: 13`, `margin: 17`
**RIGHT**: `padding: spacing.md`, `margin: spacing.lg`

### 5. Missing Accessibility
**WRONG**: `<TouchableOpacity onPress={save}>`
**RIGHT**: `<TouchableOpacity onPress={save} accessibilityLabel="Save"`

## Quality Checklist

### Before Any UI Change
- [ ] Uses theme colors only
- [ ] Follows 8px spacing grid
- [ ] Has proper accessibility labels
- [ ] Works on iOS, Android, and Web
- [ ] Handles dark mode correctly
- [ ] Modal follows standard pattern
- [ ] Animations use native driver
- [ ] Focus states implemented
- [ ] Touch targets >= 44px
- [ ] Text remains readable at all sizes

### Testing Requirements
```bash
# Visual regression check
npm run test:visual

# Accessibility audit
npm run test:a11y

# Cross-platform verification
npm run web           # Test on Chrome, Safari, Firefox
npm run ios           # Test on iPhone, iPad
npm run android       # Test on phone, tablet
```

## Quick Reference

### Component Import Order
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports  
import { View, Text, Modal } from 'react-native';

// 3. Theme/Context
import { useTheme } from '../../context/ThemeContext';

// 4. Components (alphabetical)
import { Button } from '../common/Button';
import { Card } from '../common/Card';
```

### Style Priority
1. Theme styles (from ThemeContext)
2. Component styles (styles object)
3. Responsive overrides (Platform.select)
4. State-based styles (error, disabled)
5. Inline styles (ONLY for dynamic values)

### Modal Z-Index Hierarchy
```javascript
const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  modal: 1030,
  modalOverlay: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
};
```

## Emergency UI Fixes

### Fix Broken Theme
```bash
# Reset theme to defaults
git checkout -- src/theme/theme.js
git checkout -- src/context/ThemeContext.js
```

### Fix Modal Not Closing
```javascript
// Add to modal component
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };
  if (visible) {
    document.addEventListener('keydown', handleEscape);
  }
  return () => document.removeEventListener('keydown', handleEscape);
}, [visible, onClose]);
```

### Fix Touch Not Working
```javascript
// Ensure proper import
import { TouchableOpacity } from 'react-native';
// NOT from 'react-native-gesture-handler' unless needed
```

## Design Evolution Guidelines

### When to Update Design
- User testing reveals confusion
- Accessibility audit fails
- Platform guidelines change
- Performance metrics degrade

### When NOT to Change
- Personal preference
- Trending design patterns
- Without user feedback
- Breaking existing muscle memory

## Related Documentation
- `/src/theme/theme.js` - Theme implementation
- `/src/context/ThemeContext.js` - Theme provider
- `/src/components/Dialogs/` - Modal implementations
- `/docs/WORKING_AGREEMENTS.md` - Architecture rules

---
*Last Updated: 2025.09.11*
*Role: Maintain exceptional user experience across all platforms*