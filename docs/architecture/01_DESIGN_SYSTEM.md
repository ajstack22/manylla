# Manylla Design System

## Design Philosophy
- **Manila Envelope Aesthetic**: Warm, paper-like interface inspired by physical file folders
- **Accessibility First**: High contrast, clear typography, touch-friendly targets
- **Progressive Disclosure**: Complex features revealed as needed
- **Consistent Patterns**: Reusable components and interactions

## Color Palette
```typescript
// Primary Colors
primary: {
  main: '#8B7355',      // Manila brown
  light: '#A08670',     // Lighter manila
  dark: '#6B5A45',      // Darker manila
}

// Background Colors
background: {
  default: '#FAF9F6',   // Off-white paper
  paper: '#FFFFFF',     // Pure white
  manila: '#F4E4C1',    // Manila envelope color
}

// Semantic Colors
success: '#4CAF50'     // Green for success states
info: '#2196F3'        // Blue for information
warning: '#FF9800'     // Orange for warnings
error: '#F44336'       // Red for errors

// String Tie Design Colors
stringTie: {
  border: '#CC0000',   // Red string tie border
  gap: '#FFFFFF',      // White gap (varies by theme)
}
```

## Typography
```typescript
// Font Family
fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'

// Font Sizes
h3: '48px' (Page titles)
h4: '34px' (Section headers)
h5: '24px' (Subsection headers)
h6: '20px' (Card titles)
subtitle1: '16px' (Emphasized body)
body1: '16px' (Regular body)
body2: '14px' (Secondary text)
caption: '12px' (Helper text)

// Font Weights
fontWeightLight: 300
fontWeightRegular: 400
fontWeightMedium: 500
fontWeightBold: 700
```

## Component Patterns

### Modal Pattern
```typescript
// All modals follow this structure:
1. Centered large icon (64px)
2. Bold title (h4, fontWeight: 700)
3. Descriptive subtitle (body1, color: text.secondary)
4. Content area with Paper panels
5. Consistent DialogActions padding (px: 2, py: 2)

// Example:
<Box sx={{ textAlign: 'center', mb: 4 }}>
  <IconComponent sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
  <Typography variant="h4" gutterBottom fontWeight="bold">
    Modal Title
  </Typography>
  <Typography variant="body1" color="text.secondary">
    Descriptive subtitle explaining the purpose
  </Typography>
</Box>
```

### Panel Pattern
```typescript
// Interactive panels with hover states:
<Paper
  elevation={0}
  sx={{
    p: 3,
    border: '2px solid',
    borderColor: selected ? 'primary.main' : 'divider',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: 'action.hover',
    }
  }}
>
```

### Form Section Pattern
```typescript
// Form sections wrapped in Papers:
<Paper 
  elevation={0}
  sx={{ 
    p: 2, 
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
  }}
>
  {/* Form fields */}
</Paper>
```

### Button Patterns
```typescript
// Primary Action Button
<Button 
  variant="contained"
  sx={{ 
    minHeight: 44,      // Touch-friendly
    minWidth: 100,
    fontSize: '16px'
  }}
>

// Secondary Action Button
<Button 
  variant="outlined"
  sx={{ 
    minHeight: 44,
    minWidth: 80,
    fontSize: '16px'
  }}
>
```

## Avatar Design (String Tie Implementation)

### Visual Specifications
The avatar design features a distinctive string tie-inspired offset ring effect:

```javascript
// Avatar with String Tie Border
avatarStyle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#A08670',  // Manylla brown
  boxShadow: '0 0 0 3px [theme.background], 0 0 0 5px #CC0000'
}
```

### Implementation Pattern
- **Base Circle**: Theme-aware brown background
- **Offset Ring**: Creates visual depth with two concentric rings
  - Inner ring (3px): Matches theme background for gap effect
  - Outer ring (5px): Red border (#CC0000) consistent across themes
- **Content**: Manila-colored text (#F4E4C1) for initials

### Animation Behavior
- Avatars transition with parent container opacity
- Ring effect maintains visibility during scroll animations
- Smooth 0.3s ease-in-out transitions

## Spacing System
```typescript
// Base unit: 8px
spacing: {
  0: '0px',
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
}

// Common patterns:
- Card padding: p={3} (24px)
- Panel padding: p={2} (16px)
- Section margin: mb={4} (32px)
- Inline gap: gap={2} (16px)
- Button padding: py={1.5} (12px)
```

## Responsive Breakpoints
```typescript
breakpoints: {
  xs: 0,     // Mobile
  sm: 600,   // Tablet portrait
  md: 960,   // Tablet landscape
  lg: 1280,  // Desktop
  xl: 1920   // Large desktop
}

// Mobile-first approach:
sx={{
  px: { xs: 1, sm: 2, md: 3 },  // Responsive padding
  fontSize: { xs: '14px', sm: '16px' }
}}
```

## Layout Patterns

### Desktop Layout (>1024px)
```typescript
// Main container:
maxWidth: 1400px
centered: true
paddingHorizontal: dynamic (16-48px based on viewport)

// Top section (side-by-side):
profileCard: 33.333% width (1/3)
quickInfo: flex: 1 (remaining 2/3)
gap: 12px

// Category grid:
columns: 2 (50% each minus gap)
gap: 12px
marginBottom: 12px
```

### Tablet Layout (768-1024px)
```typescript
// Stack layout:
profileCard: 100% width
quickInfo: 100% width (below profile)

// Category grid:
columns: 2 (50% each minus gap)
```

### Mobile Layout (<768px)
```typescript
// Stack layout:
profileCard: 100% width
quickInfo: 100% width (below profile)

// Category grid:
columns: 1 (100% width)
```

## Icon System
```typescript
// Standard icon sizes:
small: 20px
medium: 24px (default)
large: 32px
xlarge: 64px (modal headers)

// Contextual icons:
AddCircle: Adding entries
Label: Categories
Cloud: Sync (not CloudSync)
Share: Sharing
Person: Profile
Security: Privacy
Check: Success states
```

## Floating Action Button (FAB)
```typescript
// Material Design FAB implementation:
size: 56px x 56px
borderRadius: 28px (fully circular)
position: fixed (web) / absolute (mobile)
bottom: 24px
right: 24px
zIndex: 1000

// Elevation (Material Design spec):
default: elevation 12 (mobile) / 3-layer shadow (web)
pressed: elevation 6 (mobile) / scaled 0.95 (web)

// Shadow layers (web):
layer1: '0 3px 5px -1px rgba(0,0,0,0.2)'
layer2: '0 6px 10px 0 rgba(0,0,0,0.14)'
layer3: '0 1px 18px 0 rgba(0,0,0,0.12)'

// Interaction:
activeOpacity: 0.8
cursor: 'pointer' (web only)
```

## Wizard/Stepper Pattern
```typescript
// Multi-step forms follow this pattern:
1. Progress indicator at top
2. Step counter (Step X of Y)
3. Back button (except first step)
4. Content area with fade transitions
5. Navigation buttons at bottom
6. Panel-based selections with hover states

// Step transitions:
<Fade in timeout={300}>
  {/* Step content */}
</Fade>
```

## Animation & Transitions
```typescript
// Standard transitions:
transition: 'all 0.2s ease'     // Hover states
transition: 'width 0.3s ease'    // Progress bars
Fade timeout={300}               // Page transitions

// Hover effects:
'&:hover': {
  borderColor: 'primary.main',
  backgroundColor: 'action.hover',
}
```

## Accessibility Guidelines
1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Color Contrast**: WCAG AA compliant (4.5:1 for normal text)
3. **Focus States**: Visible keyboard focus indicators
4. **Screen Readers**: Semantic HTML and ARIA labels
5. **Responsive Text**: Scalable font sizes for readability
6. **Error States**: Clear visual and textual error messages

## Mobile Considerations
- **Sticky Headers**: AppBar position="sticky" for modal headers
- **Keyboard Handling**: useMobileKeyboard hook for input positioning
- **Full-Screen Dialogs**: fullScreen prop on mobile devices
- **Touch Gestures**: Swipeable panels where appropriate
- **Safe Areas**: Respect device safe areas and notches