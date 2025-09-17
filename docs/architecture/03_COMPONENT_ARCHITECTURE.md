# Component Architecture

## Overview
Manylla uses a unified React/React Native component architecture following the StackMap pattern, with a single App.js file containing all application logic.

## Core Components

### Header Component
The unified header component that handles navigation, profile display, and branding.

#### Location
`src/components/Layout/Header.js`

#### Key Features
- **String Tie Avatar Design**: Distinctive red border with white gap offset ring
- **Profile/Logo Transition**: Smooth animation between Manylla branding and profile avatar
- **Theme Support**: Adapts to light, dark, and manylla themes
- **Responsive Menu**: Hamburger menu on mobile, inline buttons on desktop

#### String Tie Implementation
```javascript
// Avatar styles with offset ring effect
logoAvatarPlaceholder: {
  backgroundColor: colors.primary || "#A08670",
  boxShadow: "0 0 0 3px " + colors.background.paper + ", 0 0 0 5px #CC0000"
}
```

#### Animation Behavior
- Logo and profile avatars include string tie border in transitions
- 0.3s ease-in-out opacity transitions during scroll
- Sequenced animation prevents overlap between logo and profile

### ProfileOverview Component
The main profile display component that handles both desktop and mobile layouts.

#### Props
```typescript
interface ProfileOverviewProps {
  profile: ChildProfile;
  onAddEntry: (category: string) => void;
  onEditEntry: (entry: Entry) => void;
  onDeleteEntry: (entryId: string) => void;
  onUpdateProfile: (updates: Partial<ChildProfile>) => void;
  onShare?: () => void;
  onEditProfile?: () => void;
  onManageCategories?: () => void;
  styles: StyleSheet;
  colors: ColorTheme;
}
```

#### Layout Behavior
- **Desktop (>1024px)**: Side-by-side layout with profile card (1/3) and Quick Info (2/3)
- **Tablet (768-1024px)**: Stacked layout with 2-column category grid
- **Mobile (<768px)**: Stacked layout with single-column category grid

#### Key Features
- Responsive layout using Dimensions API
- Age calculation from date of birth
- Dynamic category filtering based on visibility
- Quick Info as a special category (always first)
- Entry management (add/edit/delete)

### Quick Info Panel
Special category panel that displays at the top of the profile.

#### Characteristics
- Always displayed first (even when empty)
- Desktop: Appears beside profile card
- Mobile/Tablet: Appears below profile card
- Uses same entry structure as regular categories
- Color: #E74C3C (red)

#### Implementation
```javascript
// Quick Info is treated as a regular category with special positioning
const quickInfoCategory = {
  id: 'quick-info',
  name: 'quick-info',
  displayName: 'Quick Info',
  color: '#E74C3C',
  order: 1,
  isVisible: true,
  isQuickInfo: true, // Special flag for positioning
}
```

### Floating Action Button (FAB)
Material Design FAB for adding new entries.

#### Positioning
- Fixed positioning on web (stays in viewport)
- Absolute positioning on mobile
- Bottom: 24px, Right: 24px
- Z-index: 1000 (above all content)

#### Styling
```javascript
fab: {
  position: Platform.OS === 'web' ? 'fixed' : 'absolute',
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.primary,
  // Material Design elevation
  elevation: 12, // Mobile
  boxShadow: '0 3px 5px -1px rgba(0,0,0,0.2), ...', // Web
}
```

## State Management

### Profile State
- Stored in React state
- Persisted to AsyncStorage
- Synced to cloud when configured

### Entry Management
```javascript
// Add entry
handleAddEntry(category) -> Opens EntryForm modal

// Edit entry
handleEditEntry(entry) -> Opens EntryForm with existing data

// Delete entry
handleDeleteEntry(entryId) -> Confirms and removes entry
```

## Responsive Design

### Breakpoint Detection
```javascript
const screenWidth = Dimensions.get('window').width;
const isDesktop = screenWidth > 1024;
const isTablet = screenWidth > 768 && screenWidth <= 1024;
const isMobile = screenWidth <= 768;
```

### Container Constraints
```javascript
contentContainer: {
  maxWidth: 1400, // Maximum width for large screens
  width: '100%',
  alignSelf: 'center',
  paddingHorizontal: dynamic, // 16-48px based on viewport
}
```

### Grid Layout
```javascript
// Desktop: 2 columns
width: 'calc(50% - 12px)'

// Tablet: 2 columns  
width: 'calc(50% - 12px)'

// Mobile: 1 column
width: '100%'
```

## Category System

### Category Structure
```typescript
interface CategoryConfig {
  id: string;
  name: string;
  displayName: string;
  color: string;
  order: number;
  isVisible: boolean;
  isCustom: boolean;
  isQuickInfo?: boolean;
}
```

### Default Categories
1. Quick Info (always first)
2. Medical
3. Education
4. Behaviors
5. Communication
6. Daily Routine
7. Goals
8. Successes
9. Tips & Tricks

### Category Rendering
- Only visible categories are displayed
- Categories without entries are still shown (empty state)
- Categories sorted by order property
- Quick Info pinned to top via special handling

## Entry System

### Entry Structure
```typescript
interface Entry {
  id: string;
  title: string;
  description?: string;
  category: string;
  date: Date;
  visibility: 'private' | 'shared';
}
```

### Entry Display
- Title (required, bold)
- Description (optional, supports Markdown)
- Truncated to 2 lines in list view
- Full content in edit modal

## Modal System

### Entry Form Modal
- Unified modal for add/edit operations
- Full-screen on mobile
- Centered dialog on desktop
- Markdown support for descriptions

### Delete Confirmation
- Platform-specific confirmation
  - Web: window.confirm()
  - Mobile: Alert.alert()

## Performance Optimizations

### Lazy Loading
- Categories render on-demand
- Entries filtered by category

### Memoization
- Category filtering cached
- Age calculation cached per render

### Scroll Performance
- ScrollView for content
- FAB positioned outside scroll container
- Content container max-width prevents excessive reflows

## Accessibility

### Touch Targets
- Minimum 44x44px for all interactive elements
- FAB: 56x56px (exceeds minimum)
- Add buttons: 28x28px with padding

### Screen Readers
- Semantic text hierarchy
- Descriptive button labels
- ARIA-compatible on web

### Keyboard Navigation
- Tab order follows visual hierarchy
- Enter/Space activate buttons
- Escape closes modals

## Testing Considerations

### Component Testing
- ProfileOverview renders with/without data
- Category visibility toggles
- Entry CRUD operations
- Responsive layout changes

### Integration Testing
- Data persistence across sessions
- Sync operations
- Modal interactions
- FAB positioning

### E2E Testing
- Complete user flows
- Cross-platform behavior
- Responsive breakpoints
- Data integrity