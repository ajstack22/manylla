# Session 2: Modal Consistency Review - Sharing & Secondary Modals

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
6. **Reuse Session 1 components** - DO NOT recreate modal bases

#### 🎯 You Will Be Judged On:
- **Pattern Consistency**: EXACT match to Session 1 components
- **Color Accuracy**: #A08670 primary (NOT #8B7355)
- **No Duplicated Code**: Use shared components from Session 1
- **Cross-Platform Parity**: Identical behavior on all platforms
- **Performance**: 60fps, no flicker, smooth transitions

### Adversarial Review Process (FROM WORKING AGREEMENTS)
Your code will undergo BRUTAL review with NO PARTIAL CREDIT:
1. **Session 1 Compliance**: Must use ALL patterns from Session 1
2. **Zero TypeScript**: Not a single .tsx file
3. **Platform Unity**: One .js file with Platform.select()
4. **Build Success**: `npm run build:web` with zero errors

**FAILURE = START OVER. There is no "almost passing".**

### Updated Requirements from Dev 1
*[This section will be populated by Dev 1 after Session 1 completion]*
- Lessons learned:
- Pattern adjustments:
- Performance notes:
- Edge cases discovered:

### Project Architecture Reminders
- **Unified codebase**: Single .js files ONLY
- **No TypeScript**: This is React Native Web, not a TS project
- **Platform.select()**: Use for ALL platform differences
- **Shared components**: MUST use components created in Session 1
- **Build output**: `web/build/` NOT `build/`

## Manila Envelope Design Language - Sharing Context

### Sharing as "Sealing and Sending"
The sharing experience should feel like:
1. **Sealing**: Preparing information in a secure envelope
2. **Addressing**: Choosing recipients and access levels
3. **Stamping**: Setting duration/expiry like a postmark
4. **Sending**: The satisfying action of dispatching
5. **Tracking**: Knowing your envelope's status

### Visual Metaphors for Sharing
- **QR Codes**: Like a wax seal - official and secure
- **Share Links**: Like an address label - clear and direct
- **Duration**: Like a postmark date - visible and authoritative
- **Copy Action**: Like carbon copy - instant duplication
- **Sync**: Like registered mail - tracked and verified

## Detailed Modal Specifications

### 1. Share Dialog (`src/components/Sharing/ShareDialogOptimized.js`)

#### Current Issues to Fix:
1. Share buttons use random colors
2. QR code has no manila-themed container
3. Duration selector looks like default HTML select
4. Copy button doesn't match primary button style
5. No loading states during link generation
6. Success feedback inconsistent

#### Required Share Dialog Structure:
```javascript
// Share Dialog Container
shareDialogContainer: {
  ...modalContainer, // Inherit from Session 1
  maxWidth: Platform.select({
    web: 500, // Slightly narrower for share dialog
    default: '85%',
  }),
}

// Share Options Section
shareOptionsContainer: {
  backgroundColor: `${colors.secondary}20`, // Light manila tint
  borderRadius: 8,
  padding: 16,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: `${colors.primary}30`,
}

// Individual Share Button
shareButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.background.paper,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 6,
  paddingVertical: 12,
  paddingHorizontal: 16,
  marginVertical: 6,
  gap: 10,
  ...Platform.select({
    web: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}05`,
        transform: 'translateX(2px)', // Subtle slide effect
      },
    },
    default: {}
  }),
}

shareButtonText: {
  color: colors.text.primary,
  fontSize: 15,
  fontWeight: '500',
  flex: 1,
}

// ALL share icons MUST use colors.primary
shareButtonIcon: {
  color: colors.primary, // NO EXCEPTIONS
  size: 22,
}

// Duration Selector
durationSelector: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 6,
  backgroundColor: colors.background.paper,
  paddingVertical: 10,
  paddingHorizontal: 12,
  fontSize: 15,
  color: colors.text.primary,
  ...Platform.select({
    web: {
      appearance: 'none', // Remove default styling
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='%23${colors.primary.replace('#', '')}' d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '20px',
      paddingRight: 40,
      cursor: 'pointer',
      outline: 'none',
      ':focus': {
        borderColor: colors.primary,
        boxShadow: `0 0 0 3px ${colors.primary}20`,
      },
    },
    default: {}
  }),
}

// Create Share Link Button (Primary Action)
createShareButton: {
  ...primaryButton, // From Session 1
  width: '100%',
  marginTop: 20,
}

// Loading State
loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: `${colors.background.paper}EE`, // Semi-transparent
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12,
  zIndex: 10,
}

loadingSpinner: {
  color: colors.primary,
  size: 32,
}
```

#### Share Options Implementation:
```javascript
const shareOptions = [
  { 
    id: 'email', 
    label: 'Share via Email', 
    icon: EmailIcon,
    action: () => shareViaEmail(shareLink)
  },
  { 
    id: 'sms', 
    label: 'Share via SMS', 
    icon: SmsIcon,
    action: () => shareViaSMS(shareLink)
  },
  { 
    id: 'copy', 
    label: 'Copy Link', 
    icon: CopyIcon,
    action: () => copyToClipboard(shareLink)
  },
];

// Render share options
{shareOptions.map(option => (
  <TouchableOpacity 
    key={option.id}
    style={styles.shareButton}
    onPress={option.action}
  >
    <option.icon size={22} color={colors.primary} />
    <Text style={styles.shareButtonText}>{option.label}</Text>
    <ChevronRightIcon size={18} color={colors.primary} />
  </TouchableOpacity>
))}
```

### 2. QR Code Modal (`src/components/Sharing/QRCodeModal.js`)

#### Current Issues to Fix:
1. QR code has no styled container
2. Instructions text not themed
3. Action buttons inconsistent
4. No visual hierarchy
5. Missing download QR option
6. Close button wrong style

#### QR Code Display Specifications:
```javascript
// QR Code Container - Like a wax seal
qrCodeContainer: {
  backgroundColor: colors.background.paper,
  borderRadius: 12,
  padding: 24,
  alignItems: 'center',
  marginVertical: 20,
  borderWidth: 2,
  borderColor: colors.primary,
  borderStyle: Platform.select({
    web: 'dashed',
    default: 'solid',
  }),
  ...Platform.select({
    web: {
      boxShadow: `inset 0 2px 4px ${colors.shadow}`,
    },
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
}

// QR Code Image Wrapper
qrCodeImageWrapper: {
  backgroundColor: '#FFFFFF', // Always white for QR contrast
  padding: 16,
  borderRadius: 8,
  marginBottom: 16,
}

// QR Instructions
qrInstructions: {
  fontSize: 14,
  color: colors.text.secondary,
  textAlign: 'center',
  marginTop: 12,
  lineHeight: 20,
  fontStyle: 'italic',
}

// QR Action Buttons
qrActionContainer: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 20,
}

downloadQrButton: {
  ...secondaryButton, // From Session 1
  flexDirection: 'row',
  gap: 8,
}

// Download icon MUST be colors.primary
<DownloadIcon size={20} color={colors.primary} />
```

### 3. Sync Dialog (`src/components/Sync/SyncDialog.js`)

#### Current Issues to Fix:
1. Recovery phrase display lacks proper styling
2. Status indicators use wrong colors
3. Device list has no hover states
4. Copy button doesn't match design
5. Sync status animations missing
6. No empty state for devices

#### Recovery Phrase Display:
```javascript
// Recovery Phrase Container - Like a secret document
recoveryPhraseContainer: {
  backgroundColor: `${colors.secondary}15`, // Very light manila
  borderRadius: 8,
  padding: 16,
  marginVertical: 20,
  borderWidth: 1,
  borderColor: `${colors.primary}40`,
  position: 'relative',
}

recoveryPhraseLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: colors.primary,
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 8,
}

recoveryPhraseText: {
  fontFamily: Platform.select({
    web: '"Courier New", Courier, monospace',
    default: 'System',
  }),
  fontSize: 16,
  color: colors.text.primary,
  letterSpacing: 2,
  lineHeight: 24,
  textAlign: 'center',
  userSelect: Platform.select({
    web: 'all', // Allow selection on web
    default: 'none',
  }),
}

// Copy button positioned absolutely
recoveryPhraseCopyButton: {
  position: 'absolute',
  top: 12,
  right: 12,
  padding: 8,
  borderRadius: 6,
  backgroundColor: colors.background.paper,
  borderWidth: 1,
  borderColor: colors.border,
  ...Platform.select({
    web: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}10`,
      },
    },
    default: {}
  }),
}

// Sync Status Indicators
syncStatusContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
  borderRadius: 8,
  marginVertical: 16,
}

syncStatusSynced: {
  backgroundColor: '#4CAF5020', // Green tint
  borderWidth: 1,
  borderColor: '#4CAF50',
}

syncStatusSyncing: {
  backgroundColor: `${colors.primary}20`, // Manila tint
  borderWidth: 1,
  borderColor: colors.primary,
}

syncStatusError: {
  backgroundColor: '#F4433620', // Red tint
  borderWidth: 1,
  borderColor: '#F44336',
}

// Sync status icon animation (pulsing for syncing)
syncingIconAnimation: {
  ...Platform.select({
    web: {
      animation: 'pulse 1.5s ease-in-out infinite',
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 },
      },
    },
    default: {}
  }),
}

// Device List
deviceListContainer: {
  marginTop: 20,
  borderTopWidth: 1,
  borderTopColor: colors.divider,
  paddingTop: 20,
}

deviceItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 12,
  borderRadius: 6,
  marginVertical: 4,
  backgroundColor: colors.background.paper,
  borderWidth: 1,
  borderColor: colors.border,
  ...Platform.select({
    web: {
      transition: 'all 0.2s ease',
      ':hover': {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}05`,
      },
    },
    default: {}
  }),
}

deviceItemCurrent: {
  borderColor: colors.primary,
  backgroundColor: `${colors.primary}10`,
}

deviceName: {
  fontSize: 15,
  fontWeight: '500',
  color: colors.text.primary,
}

deviceLastSeen: {
  fontSize: 13,
  color: colors.text.secondary,
  marginTop: 2,
}

// Device icon MUST be colors.primary
<DeviceIcon size={20} color={colors.primary} />
```

### 4. Print Preview Modal (`src/components/Sharing/PrintPreview.js`)

#### Current Issues to Fix:
1. Print options not styled consistently
2. Preview container lacks border
3. Print button wrong style
4. Page size selector inconsistent
5. No loading state during generation
6. Missing page break indicators

#### Print Preview Specifications:
```javascript
// Print Preview Container
printPreviewContainer: {
  backgroundColor: '#FFFFFF', // Always white for print
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 20,
  marginVertical: 20,
  minHeight: 400,
  ...Platform.select({
    web: {
      boxShadow: `0 4px 12px ${colors.shadow}`,
      // Simulate paper
      backgroundImage: 'linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)',
    },
    default: {}
  }),
}

// Print Options Bar
printOptionsBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 12,
  backgroundColor: `${colors.secondary}10`,
  borderRadius: 6,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: `${colors.primary}20`,
}

// Page Size Selector
pageSizeSelector: {
  ...durationSelector, // Reuse from share dialog
  minWidth: 120,
}

// Print Button
printButton: {
  ...primaryButton,
  flexDirection: 'row',
  gap: 8,
}

printButtonIcon: {
  color: '#FFFFFF', // White on primary button
  size: 20,
}

// Page Break Indicator
pageBreakIndicator: {
  borderTopWidth: 2,
  borderTopColor: colors.primary,
  borderStyle: Platform.select({
    web: 'dashed',
    default: 'solid',
  }),
  marginVertical: 20,
  position: 'relative',
}

pageBreakLabel: {
  position: 'absolute',
  top: -10,
  left: '50%',
  transform: [{ translateX: '-50%' }],
  backgroundColor: colors.background.paper,
  paddingHorizontal: 12,
  fontSize: 11,
  color: colors.primary,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 1,
}
```

### 5. Toast Notifications (`src/components/Toast/ThemedToast.js`)

#### Current Issues to Fix:
1. Success/error colors don't match theme
2. Toast positioning inconsistent
3. Auto-dismiss timing wrong
4. No entrance/exit animations
5. Action buttons wrong style
6. Icons not using theme colors

#### Toast Specifications:
```javascript
// Toast Container
toastContainer: {
  position: Platform.select({
    web: 'fixed',
    default: 'absolute',
  }),
  bottom: Platform.select({
    web: 24,
    default: 100, // Account for mobile safe area
  }),
  left: Platform.select({
    web: '50%',
    default: 20,
  }),
  right: Platform.select({
    web: 'auto',
    default: 20,
  }),
  transform: Platform.select({
    web: [{ translateX: '-50%' }],
    default: [],
  }),
  backgroundColor: colors.background.paper,
  borderRadius: 8,
  padding: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  minWidth: 300,
  maxWidth: 500,
  borderWidth: 1,
  zIndex: 9999,
  ...Platform.select({
    web: {
      boxShadow: `0 6px 20px ${colors.shadow}`,
      animation: 'slideUp 0.3s ease-out',
      '@keyframes slideUp': {
        from: { 
          opacity: 0,
          transform: 'translateX(-50%) translateY(20px)',
        },
        to: { 
          opacity: 1,
          transform: 'translateX(-50%) translateY(0)',
        },
      },
    },
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  }),
}

// Toast Variants
toastSuccess: {
  borderColor: '#4CAF50',
  backgroundColor: '#4CAF5010',
}

toastError: {
  borderColor: '#F44336',
  backgroundColor: '#F4433610',
}

toastInfo: {
  borderColor: colors.primary,
  backgroundColor: `${colors.primary}10`,
}

// Toast Icon Colors (MUST match variant)
toastIconSuccess: '#4CAF50',
toastIconError: '#F44336',
toastIconInfo: colors.primary,

// Toast Text
toastMessage: {
  flex: 1,
  fontSize: 14,
  color: colors.text.primary,
  lineHeight: 20,
}

// Toast Action Button
toastActionButton: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 4,
  backgroundColor: colors.primary,
}

toastActionText: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

// Auto-dismiss timing
toastDismissTime: {
  success: 3000, // 3 seconds
  error: 5000,   // 5 seconds (needs more time to read)
  info: 4000,    // 4 seconds
}
```

## Shared Modal Components to Create

### `src/components/Modals/ModalContainer.js`
```javascript
import React from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const ModalContainer = ({ 
  visible, 
  onClose, 
  children, 
  maxWidth = 600,
  animationType = 'fade'
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors, maxWidth);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
            >
              <View style={styles.container}>
                {children}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (colors, maxWidth) => StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      },
      default: {}
    }),
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    maxWidth: maxWidth,
    width: Platform.select({
      web: '100%',
      default: '90%',
    }),
    maxHeight: Platform.select({
      web: '80vh',
      default: '80%',
    }),
    overflow: 'hidden',
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
  },
});
```

### `src/components/Modals/ModalHeader.js`
```javascript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { CloseIcon } from '../Common';
import { useTheme } from '../../context/ThemeContext';

export const ModalHeader = ({ 
  title, 
  subtitle, 
  onClose, 
  leftIcon,
  rightElement 
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        <View style={styles.titleTextContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement || (
        <TouchableOpacity 
          onPress={onClose}
          style={styles.closeButton}
        >
          <CloseIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark || colors.primary,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftIcon: {
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.select({
      web: '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
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
  },
});
```

## Testing Matrix

| Component | Light | Dark | Manylla | Mobile | Tablet | Desktop | Accessibility |
|-----------|-------|------|---------|---------|---------|----------|--------------|
| Share Dialog | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QR Code Modal | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Sync Dialog | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Print Preview | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Toast | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Performance Requirements

### Animation Performance
- All transitions MUST be 60fps
- Use `transform` and `opacity` only for animations
- No layout thrashing during modal open/close
- Lazy load QR code generation
- Debounce share link creation

### Code Splitting
```javascript
// Lazy load heavy components
const QRCodeGenerator = lazy(() => import('./QRCodeGenerator'));
const PrintPreview = lazy(() => import('./PrintPreview'));

// Show loading state while loading
<Suspense fallback={<LoadingSpinner />}>
  <QRCodeGenerator data={shareData} />
</Suspense>
```

### Memoization
```javascript
// Memoize expensive computations
const shareUrl = useMemo(() => 
  generateShareUrl(data, options), 
  [data, options]
);

// Memoize components that don't change often
const ShareButton = memo(({ option, onPress }) => (
  // Component implementation
));
```

## Accessibility Checklist

### ARIA Labels
- [ ] All modals have aria-label
- [ ] Close buttons have "Close dialog" label
- [ ] Icon buttons have descriptive labels
- [ ] Form inputs have associated labels
- [ ] Status messages announced to screen readers

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Escape key closes modal
- [ ] Enter key activates primary action
- [ ] Focus trapped within modal
- [ ] Focus returns to trigger element on close

### Visual Accessibility
- [ ] Contrast ratio ≥ 4.5:1 for normal text
- [ ] Contrast ratio ≥ 3:1 for large text
- [ ] Focus indicators visible
- [ ] No color-only information
- [ ] Animations respect prefers-reduced-motion

## Code Quality Standards

### Import Organization
```javascript
// 1. React imports
import React, { useState, useEffect, useMemo } from 'react';

// 2. React Native imports
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';

// 3. Context/Hook imports
import { useTheme } from '../../context/ThemeContext';

// 4. Component imports
import { ModalContainer, ModalHeader } from '../Modals';

// 5. Icon imports
import { ShareIcon, CopyIcon } from '../Common';

// 6. Utility imports
import { generateShareLink } from '../../utils/sharing';
```

### Error Handling
```javascript
// Always handle errors gracefully
try {
  const shareLink = await generateShareLink(data);
  setShareUrl(shareLink);
  showToast('Share link created!', 'success');
} catch (error) {
  console.error('Failed to generate share link:', error);
  showToast('Failed to create share link. Please try again.', 'error');
  setLoading(false);
}
```

### PropTypes Validation
```javascript
// Document all props
ShareDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  onShare: PropTypes.func,
  duration: PropTypes.oneOf(['1h', '24h', '7d', '30d']),
};

ShareDialog.defaultProps = {
  duration: '24h',
  onShare: () => {},
};
```

## Adversarial Review Criteria - Session 2

Your implementation will be strictly reviewed against:

1. **Pattern Consistency**: EXACT match with Session 1 patterns
2. **Component Reuse**: Proper use of shared modal components
3. **Theme Accuracy**: All colors from theme, no hardcoded values
4. **Icon Consistency**: ALL icons use colors.primary
5. **Animation Performance**: 60fps, no janky transitions
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Error Handling**: Graceful fallbacks for all operations
8. **Platform Parity**: Works identically on web/iOS/Android
9. **Code Organization**: Follows import and structure patterns
10. **Performance**: No unnecessary re-renders, proper memoization

## Final Deliverables

1. **Updated Components**:
   - [ ] ShareDialogOptimized.js with new styling
   - [ ] QRCodeModal.js with proper theme
   - [ ] SyncDialog.js with consistent design
   - [ ] PrintPreview.js with modal wrapper
   - [ ] ThemedToast.js with proper animations

2. **New Shared Components**:
   - [ ] ModalContainer.js
   - [ ] ModalHeader.js
   - [ ] ModalFooter.js
   - [ ] ModalButton.js

3. **Documentation**:
   - [ ] Modal pattern guide
   - [ ] Component usage examples
   - [ ] Theme integration guide
   - [ ] Migration checklist for future modals

4. **Testing Evidence**:
   - [ ] Screenshots of all modals in all themes
   - [ ] Performance metrics (lighthouse scores)
   - [ ] Accessibility audit results
   - [ ] Cross-platform testing matrix completed

## Post-Implementation Requirements

After completing Session 2:

1. **Create Style Guide**: Document all modal patterns with visual examples
2. **Update Storybook**: Add modal components to Storybook (if exists)
3. **Write Migration Guide**: For converting any remaining modals
4. **Set Up Linting**: ESLint rules for modal consistency
5. **Performance Baseline**: Document current performance metrics
6. **Accessibility Audit**: Full WCAG 2.1 AA compliance report

**Remember: This is the final standardization. Every modal added after this MUST follow these patterns exactly.**