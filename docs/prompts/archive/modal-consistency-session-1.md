# Session 1: Modal Consistency Review - Core Modals

## 🔴 MANDATORY: READ WORKING AGREEMENTS FIRST
**CRITICAL**: Review `/docs/WORKING_AGREEMENTS.md` before ANY implementation.
This document defines non-negotiable standards that WILL be enforced during review.

## ⚠️ CRITICAL IMPLEMENTATION REQUIREMENTS

### WORKING AGREEMENTS - NON-NEGOTIABLE STANDARDS

#### 🚫 ABSOLUTE PROHIBITIONS (AUTOMATIC FAILURE)
```bash
# These commands MUST return 0 or your work is REJECTED:
find src -name "*.tsx" -o -name "*.ts" | wc -l      # NO TypeScript
find src -name "*.native.*" -o -name "*.web.*" | wc -l  # NO platform files
```

#### ✅ MANDATORY PATTERNS
1. **ONE .js file per component** - Use Platform.select() for differences
2. **JavaScript ONLY** - No TypeScript in this project
3. **Unified codebase** - Follow StackMap architecture exactly
4. **React Native Web** - NOT Material-UI directly
5. **Import order** - React → React Native → Third-party → Local → Relative

#### 🎯 You Will Be Judged On:
- **Architecture Compliance**: Single unified .js files
- **Color Accuracy**: Exact hex values (#A08670 primary, not #8B7355)
- **Pattern Consistency**: Platform.select() usage
- **Build Success**: `npm run build:web` must succeed
- **Zero Regressions**: All existing features must still work

### Adversarial Review Process (FROM WORKING AGREEMENTS)
Your code will undergo BRUTAL review with NO PARTIAL CREDIT:
1. **Compliance Check**: All prohibition commands must return 0
2. **Functional Testing**: Every modal on every platform
3. **Code Quality**: Must follow all patterns exactly
4. **Performance**: 60fps animations, no layout shifts

**FAILURE = START OVER. There is no "almost passing".**

### Project Architecture Reminders
- **THIS IS A UNIFIED CODEBASE** - Single .js files with Platform.select(), NOT separate implementations
- **Use .js extensions ONLY** - No TypeScript (.tsx) files
- **Follow StackMap patterns** - This project mirrors StackMap's architecture
- **React Native Web** - Use React Native components that work on web, not Material-UI directly
- **Build process**: `npm run build:web` outputs to `web/build/` (NOT `build/`)

## Manylla Design Language Specifications

### Core Philosophy: Manila Envelope Metaphor
Every modal should feel like opening a manila envelope - warm, tactile, professional yet approachable. This means:

1. **Color Temperature**: Warm browns and creams, never cold grays
2. **Depth**: Subtle shadows suggesting paper layers
3. **Borders**: Soft edges like folded paper, not sharp digital boundaries
4. **Typography**: Clear, accessible (Atkinson Hyperlegible), handwritten-inspired weights
5. **Interactions**: Smooth, paper-like transitions, not jarring digital snaps

### Exact Color Specifications
```javascript
// THESE ARE THE ONLY ACCEPTABLE COLOR VALUES
// ANY DEVIATION WILL FAIL REVIEW

// Light Theme
const lightTheme = {
  primary: "#A08670",        // Manila brown - headers, primary buttons, icons
  primaryLight: "#B8A088",   // Lighter manila - hover states
  primaryDark: "#8A7058",    // Darker manila - active states
  secondary: "#F4E4C1",      // Cream - secondary backgrounds
  background: {
    default: "#F5F5F5",      // Main background
    paper: "#FFFFFF",        // Modal backgrounds
    manila: "#F4E4C1",       // Accent panels
  },
  text: {
    primary: "#333333",      // Main text
    secondary: "#666666",    // Secondary text
    disabled: "#999999",     // Disabled text
  },
  border: "#E0E0E0",         // Subtle borders
  divider: "#E8E8E8",        // Softer dividers
  shadow: "rgba(160, 134, 112, 0.15)", // Manila-tinted shadows
};

// Dark Theme  
const darkTheme = {
  primary: "#A08C74",        // Adjusted manila for dark
  primaryLight: "#B89C84",
  primaryDark: "#907C64",
  secondary: "#3A3528",      // Dark cream
  background: {
    default: "#1A1A1A",
    paper: "#2A2A2A",        // Modal backgrounds in dark
    manila: "#3A3528",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#AAAAAA",
    disabled: "#666666",
  },
  border: "#404040",
  divider: "#383838",
  shadow: "rgba(0, 0, 0, 0.3)",
};

// Manylla Theme (signature theme)
const manyllaTheme = {
  primary: "#9D8B73",        // Balanced manila
  primaryLight: "#AD9B83",
  primaryDark: "#8D7B63",
  secondary: "#8A7862",      // Complementary brown
  background: {
    default: "#EBD9C3",      // Manila paper background
    paper: "#F7F0E6",        // Off-white modal background
    manila: "#DCC8AA",       // Medium manila accent
  },
  text: {
    primary: "#3D3028",      // Rich brown text
    secondary: "#5D4E42",
    disabled: "#8A7862",
  },
  border: "#C8B59B",         // Manila border
  divider: "#D4C2A8",
  shadow: "rgba(157, 139, 115, 0.2)", // Manila shadow
};
```

## Detailed Modal Anatomy

### 1. Modal Backdrop
```javascript
// EXACT IMPLEMENTATION REQUIRED
modalBackdrop: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: Platform.select({
    web: 'rgba(0, 0, 0, 0.5)',
    ios: 'rgba(0, 0, 0, 0.4)',
    android: 'rgba(0, 0, 0, 0.5)',
  }),
  ...Platform.select({
    web: {
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
    },
    default: {}
  }),
  zIndex: 999,
  // Animation
  ...Platform.select({
    web: {
      animation: 'fadeIn 0.2s ease-out',
    },
    default: {}
  })
}
```

### 2. Modal Container Specifications
```javascript
modalContainer: {
  backgroundColor: colors.background.paper,
  borderRadius: 12, // Consistent for manila envelope feel
  maxWidth: Platform.select({
    web: 600,
    default: '90%',
  }),
  marginHorizontal: Platform.select({
    web: 'auto',
    default: 20,
  }),
  ...Platform.select({
    web: {
      boxShadow: `0 10px 40px ${colors.shadow}`,
      border: `1px solid ${colors.border}`,
    },
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),
  overflow: 'hidden', // Critical for border radius on children
}
```

### 3. Modal Header Requirements
```javascript
modalHeader: {
  backgroundColor: colors.primary,
  paddingVertical: 16,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: colors.primaryDark,
  // NO borderRadius here - overflow:hidden on container handles it
}

modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#FFFFFF', // Always white on colored header
  fontFamily: Platform.select({
    web: '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
  letterSpacing: 0.15,
}

modalCloseButton: {
  padding: 8,
  marginRight: -8, // Align with edge
  borderRadius: 20,
  ...Platform.select({
    web: {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
    default: {}
  }),
}

// Close icon MUST be white
closeIconColor: '#FFFFFF'
closeIconSize: 24
```

### 4. Modal Body Specifications
```javascript
modalBody: {
  padding: 20,
  backgroundColor: colors.background.paper,
  // Scrollable area setup
  maxHeight: Platform.select({
    web: 'calc(80vh - 140px)', // Account for header and footer
    default: '70%',
  }),
  ...Platform.select({
    web: {
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      // Custom scrollbar for web
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-track': {
        backgroundColor: colors.background.default,
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: colors.primary,
        borderRadius: '4px',
        opacity: 0.5,
      },
    },
    default: {}
  }),
}

// Form field styling within modal
modalInput: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 6,
  padding: 12,
  fontSize: 16,
  color: colors.text.primary,
  backgroundColor: colors.background.paper,
  ...Platform.select({
    web: {
      outline: 'none',
      transition: 'border-color 0.2s ease',
      ':focus': {
        borderColor: colors.primary,
        boxShadow: `0 0 0 3px ${colors.primary}33`, // 20% opacity
      },
    },
    default: {}
  }),
}

modalLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: colors.text.secondary,
  marginBottom: 6,
  letterSpacing: 0.1,
}
```

### 5. Modal Footer/Actions Specifications
```javascript
modalFooter: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: 16,
  borderTopWidth: 1,
  borderTopColor: colors.divider,
  backgroundColor: colors.background.paper,
  gap: 12, // Space between buttons
}

// PRIMARY BUTTON (Save, Confirm, etc.)
primaryButton: {
  backgroundColor: colors.primary,
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 6,
  minWidth: 100,
  alignItems: 'center',
  justifyContent: 'center',
  ...Platform.select({
    web: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: colors.primaryDark,
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 8px ${colors.shadow}`,
      },
      ':active': {
        transform: 'translateY(0)',
        boxShadow: `0 2px 4px ${colors.shadow}`,
      },
    },
    default: {}
  }),
}

primaryButtonText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '600',
  letterSpacing: 0.3,
}

// SECONDARY BUTTON (Cancel, Close)
secondaryButton: {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 6,
  minWidth: 100,
  alignItems: 'center',
  justifyContent: 'center',
  ...Platform.select({
    web: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: colors.background.default,
        borderColor: colors.primary,
      },
    },
    default: {}
  }),
}

secondaryButtonText: {
  color: colors.text.primary,
  fontSize: 15,
  fontWeight: '500',
  letterSpacing: 0.3,
}
```

## Specific Modal Implementation Requirements

### EntryForm Modal (`src/components/UnifiedApp/EntryForm.js`)

#### Current Issues to Fix:
1. Header uses wrong color (currently Material-UI default blue)
2. Icons are inconsistent colors (mix of black and gray)
3. Save button doesn't match primary button spec
4. Visibility selector icons need to be `colors.primary`
5. Date picker theming is incorrect
6. Text inputs don't have focus states

#### Required Implementation:
```javascript
// Modal wrapper structure
<Modal visible={visible} transparent animationType="fade">
  <View style={styles.modalBackdrop}>
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          {entry ? 'Edit Entry' : 'Add Entry'}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
          <CloseIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.modalBody}>
        {/* Form fields with proper styling */}
        <View style={styles.formField}>
          <Text style={styles.modalLabel}>Title</Text>
          <TextInput 
            style={styles.modalInput}
            placeholderTextColor={colors.text.disabled}
          />
        </View>
        {/* More fields... */}
      </ScrollView>
      
      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>Save Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

### ProfileEditForm Modal (`src/components/UnifiedApp/ProfileEditForm.js`)

#### Current Issues to Fix:
1. Photo upload buttons use default blue
2. Camera/gallery icons wrong color
3. Date picker doesn't respect theme
4. Field labels inconsistent with design
5. Missing proper focus states
6. Save button placement inconsistent

#### Photo Selection Buttons:
```javascript
photoButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.primary,
  backgroundColor: `${colors.primary}10`, // 10% opacity
  marginVertical: 8,
  gap: 8,
}

photoButtonText: {
  color: colors.primary,
  fontSize: 15,
  fontWeight: '500',
}

// Icons MUST be colors.primary
<CameraIcon size={20} color={colors.primary} />
<ImageIcon size={20} color={colors.primary} />
```

### CategoryManager Modal (`src/components/UnifiedApp/CategoryManager.js`)

#### Current Issues to Fix:
1. List items don't have proper hover states
2. Delete icons wrong color
3. Reorder drag handles inconsistent
4. Toggle switches don't match theme
5. Add category input styling wrong
6. No empty state design

#### Category List Item:
```javascript
categoryItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: colors.divider,
  backgroundColor: colors.background.paper,
  ...Platform.select({
    web: {
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: `${colors.primary}08`, // Very subtle manila tint
      },
    },
    default: {}
  }),
}

categoryItemSelected: {
  backgroundColor: `${colors.primary}15`, // Slightly stronger tint
}

// Action icons
actionIcon: {
  padding: 8,
  marginHorizontal: 4,
}

// ALL icons must use colors.primary
<EditIcon size={20} color={colors.primary} />
<DeleteIcon size={20} color={colors.primary} />
<DragHandleIcon size={20} color={colors.primary} />
```

## Testing Checklist

### Visual Consistency Tests
- [ ] All modals have identical header heights (56px)
- [ ] All modals use same border radius (12px)
- [ ] All close buttons positioned identically
- [ ] All primary buttons same size and color
- [ ] All icons are `colors.primary` (NO exceptions)
- [ ] Shadows consistent across all modals
- [ ] Font sizes match specifications exactly

### Theme Switching Tests
- [ ] Switch from light to dark - all colors update
- [ ] Switch from dark to manylla - all colors update
- [ ] Switch from manylla to light - all colors update
- [ ] No color values "stick" during transitions
- [ ] Shadows adjust appropriately per theme
- [ ] Text remains readable in all themes

### Interaction Tests
- [ ] Backdrop click closes modal
- [ ] Escape key closes modal (web)
- [ ] Tab navigation works through all inputs
- [ ] Focus states visible on all interactive elements
- [ ] Hover states work on web
- [ ] Touch feedback works on mobile
- [ ] Scroll works within modal body when content overflows

### Platform Tests
- [ ] Web: Test in Chrome, Firefox, Safari
- [ ] iOS: Test on iPhone and iPad
- [ ] Android: Test on phone and tablet
- [ ] Responsive: Test at 320px, 768px, 1024px, 1920px widths

## Code Quality Requirements

### No TypeScript
```javascript
// ❌ WRONG
const EntryForm: React.FC<Props> = ({ visible, onClose }) => {

// ✅ CORRECT
const EntryForm = ({ visible, onClose }) => {
```

### Use Platform.select Properly
```javascript
// ❌ WRONG - Separate platform files
// EntryForm.web.js
// EntryForm.ios.js

// ✅ CORRECT - Single file with Platform.select
// EntryForm.js
const styles = StyleSheet.create({
  container: {
    padding: Platform.select({ web: 20, default: 16 }),
  }
});
```

### Import Patterns
```javascript
// ✅ CORRECT imports for unified codebase
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ❌ WRONG - Don't import Material-UI directly
import { Dialog } from '@mui/material';
```

## Adversarial Review Criteria

Your implementation will be reviewed against:

1. **Color Accuracy**: Every hex value must match exactly
2. **Spacing Consistency**: All padding/margins must match specs
3. **Typography Precision**: Font sizes, weights, families exact
4. **Icon Standardization**: ALL icons use colors.primary
5. **Platform Handling**: Proper use of Platform.select()
6. **Theme Integration**: All three themes work perfectly
7. **Animation Smoothness**: Transitions are 0.2s ease
8. **Code Structure**: Single .js files, no TypeScript
9. **Import Correctness**: React Native imports only
10. **Interaction States**: Hover, focus, active all implemented

## Handoff to Dev 2

After Dev 1 completes implementation:
1. Document any deviations from spec with justification
2. List any discovered edge cases
3. Provide screenshots of all three themes
4. Note any performance optimizations made
5. Update Session 2 prompt with lessons learned

**Dev 2 will build upon this foundation - any shortcuts or inconsistencies will compound.**