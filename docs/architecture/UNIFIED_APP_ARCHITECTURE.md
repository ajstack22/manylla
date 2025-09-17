# Unified App Architecture - Technical Implementation

## Overview

This document provides the technical deep-dive into Manylla's unified single-file architecture, detailing how a single App.js file serves both web and mobile platforms while achieving 95% code sharing.

## Architecture Philosophy

### Single Source of Truth
The entire application logic resides in `/App.js`, eliminating the complexity of maintaining separate codebases while providing platform-specific optimizations where needed.

```
App.js (1,111 lines)
├── Platform Detection & Imports (87 lines)
├── ProfileOverview Component (173 lines) 
├── AppContent Main Logic (523 lines)
├── Dynamic Styling System (275 lines)
└── App Wrapper (17 lines)
```

## Platform Detection System

### Runtime Platform Switching
```javascript
// Conditional imports based on platform
let GestureHandlerRootView = View;
let SafeAreaProvider = ({ children }) => children;

if (Platform.OS !== 'web') {
  try {
    const GestureHandler = require('react-native-gesture-handler');
    GestureHandlerRootView = GestureHandler.GestureHandlerRootView || View;
  } catch (e) {
    console.log('Gesture handler not available');
  }
  
  try {
    const SafeArea = require('react-native-safe-area-context');
    SafeAreaProvider = SafeArea.SafeAreaProvider || (({ children }) => children);
  } catch (e) {
    console.log('Safe area not available');
  }
}
```

### Benefits of This Approach
1. **Graceful Degradation**: Fallback to basic View if native modules unavailable
2. **Bundle Optimization**: Web bundles don't include unused native dependencies  
3. **Development Flexibility**: Same codebase works in different environments

## Component Organization within App.js

### Functional Component Structure
Rather than separate files, components are defined as functions within the same file:

```javascript
// ProfileOverview - Major UI component (Lines 112-284)
const ProfileOverview = ({ 
  profile, 
  onAddEntry, 
  onEditEntry, 
  // ... other props
}) => {
  // Component logic here
  return (
    <ScrollView style={styles.profileContainer}>
      {/* Profile UI */}
    </ScrollView>
  );
};

// AppContent - Main application logic (Lines 287-810) 
function AppContent() {
  const { pushSync, syncStatus } = useSync();
  const { colors, theme, toggleTheme } = useTheme();
  
  // All application state and handlers
  return <View>{/* Main app UI */}</View>;
}
```

### Component Hierarchy
```
App (Root Wrapper)
├── GestureHandlerRootView (Mobile) / View (Web)
├── SafeAreaProvider (Mobile) / PassThrough (Web)
└── Context Providers
    ├── ThemeProvider
    └── SyncProvider
        └── AppContent
            ├── Header
            ├── ProfileOverview
            └── Modal Components
                ├── EntryForm
                ├── ProfileEditForm  
                ├── CategoryManager
                ├── ShareDialog
                ├── SyncDialog
                ├── QuickInfoManager
                ├── PrintPreview
                └── QRCodeModal
```

## State Management Architecture

### Context-Based State
The application uses React Context API for cross-cutting concerns:

```javascript
// Theme state management
const { colors, theme, toggleTheme } = useTheme();

// Sync state management  
const { pushSync, syncStatus } = useSync();

// Local component state
const [profile, setProfile] = useState(null);
const [isLoading, setIsLoading] = useState(true);
// ... other state variables
```

### State Flow Pattern
1. **User Action** → Handler Function → State Update
2. **State Update** → Re-render → UI Update
3. **Profile Changes** → Storage Save → Sync Push (if available)

Example flow:
```javascript
const handleSaveEntry = async (entry) => {
  await withLoading('Saving entry...', async () => {
    // 1. Create new entry object
    const newEntry = { ...entry, id: Date.now().toString() };
    
    // 2. Update profile state
    const updatedProfile = {
      ...profile,
      entries: [...profile.entries, newEntry],
      updatedAt: new Date()
    };
    
    // 3. Save to storage
    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
    
    // 4. Close form and show success
    setEntryFormOpen(false);
    showToast('Entry added successfully');
  });
};
```

## Dynamic Styling System

### Theme-Aware Style Creation
```javascript
// Style function that accepts theme colors
const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  profileCard: {
    backgroundColor: colors.background.paper,
    // Platform-specific shadows
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  // ... more styles
});

// Usage in component
const AppContent = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);  // Dynamic style creation
  
  return <View style={styles.container}>{/* ... */}</View>;
};
```

### Responsive Layout System
```javascript
// Dynamic grid calculation
const categorySection = {
  // Base styles
  backgroundColor: colors.background.paper,
  borderRadius: 8,
  marginBottom: 12,
  
  // Responsive width calculation
  ...(() => {
    const screenWidth = Dimensions.get('window').width;
    
    if (screenWidth > 1024) {
      // 3 columns on large screens
      return {
        width: Platform.OS === 'web' ? 'calc(33.333% - 12px)' : '31.333%',
        marginHorizontal: Platform.OS === 'web' ? 6 : '1%',
      };
    }
    if (screenWidth > 768) {
      // 2 columns on tablets  
      return {
        width: Platform.OS === 'web' ? 'calc(50% - 12px)' : '48%',
        marginHorizontal: Platform.OS === 'web' ? 6 : '1%',
      };
    }
    // 1 column on phones
    return {
      width: '100%',
      marginHorizontal: 0,
    };
  })(),
};
```

## Platform-Specific Adaptations

### Modal and Alert Systems
```javascript
// Cross-platform delete confirmation
const handleDeleteEntry = (entryId) => {
  if (Platform.OS === 'web') {
    // Web uses browser confirm dialog
    if (window.confirm('Delete this entry?')) {
      onDeleteEntry(entryId);
    }
  } else {
    // Mobile uses React Native Alert
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteEntry(entryId) }
      ]
    );
  }
};
```

### Web-Specific Optimizations
```javascript
// Web-only share URL handling
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const pathname = window.location.pathname;
  const shareMatch = pathname.match(/\/share\/([a-zA-Z0-9-]+)/);
  
  if (shareMatch && window.__initialHash) {
    window.shareDataImmediate = {
      shareId: shareMatch[1],
      encryptionKey: window.__initialHash.substring(1)
    };
  }
}

// Web document title updates
useEffect(() => {
  if (Platform.OS === 'web' && profile) {
    document.title = `manylla - ${profile.preferredName || profile.name}`;
  }
}, [profile]);
```

## Component Integration Strategy

### Unified Component Imports
```javascript
// Import unified components that handle platform differences internally
import { EntryForm, ProfileEditForm, CategoryManager } from './src/components/UnifiedApp';
import { QuickInfoManager } from './src/components/Settings';
import { ThemedToast } from './src/components/Toast';
import { LoadingOverlay } from './src/components/Loading';
import { PrintPreview, QRCodeModal, ShareDialogOptimized } from './src/components/Sharing';
import { SyncDialog } from './src/components/Sync';
import { Header } from './src/components/Layout';
```

### Component Safety Checks
```javascript
// Debug checks for component availability
if (typeof EntryForm === 'undefined') console.error('EntryForm is undefined');
if (typeof ProfileEditForm === 'undefined') console.error('ProfileEditForm is undefined');
if (typeof CategoryManager === 'undefined') console.error('CategoryManager is undefined');
```

## Data Flow Architecture

### Profile Data Lifecycle
```
User Action
    ↓
Handler Function (e.g., handleSaveEntry)
    ↓
State Update (setProfile)
    ↓
Storage Service (saveProfile)
    ↓
Sync Service (pushSync) - if available
    ↓
UI Re-render (automatic via state change)
```

### Storage Abstraction
```javascript
// Unified storage interface handles platform differences
import { StorageService } from './src/services/storage/storageService';

// Usage is identical across platforms
const profile = await StorageService.getProfile();
await StorageService.saveProfile(updatedProfile);
```

## Performance Considerations

### Bundle Size Optimization
- **Conditional Imports**: Mobile-only packages not included in web bundle
- **Tree Shaking**: Unused code eliminated in production builds
- **Lazy Loading**: Platform-specific modules loaded only when needed

### Runtime Performance
- **Memoized Styles**: Theme-based styles recreated only on theme change
- **Selective Re-renders**: State changes trigger minimal component updates
- **Efficient Lists**: Entry and category rendering optimized for large datasets

### Memory Management  
- **Component Cleanup**: Modals properly unmount when closed
- **Event Listeners**: Proper cleanup in useEffect hooks
- **Storage**: Efficient serialization/deserialization of profile data

## Development Workflow Integration

### Hot Reload Support
The single-file architecture works seamlessly with:
- **React Native Metro**: Hot reload for mobile development
- **Webpack Dev Server**: Hot module replacement for web development
- **Consistent State**: Same state management across platforms

### Debugging Strategy
```javascript
// Centralized logging with platform identification
console.log(`[${Platform.OS}] Profile loaded:`, profile);

// Platform-specific debugging
if (__DEV__) {
  console.log('Development mode - additional logging enabled');
}
```

## Error Handling Architecture

### Graceful Degradation
```javascript
// Safe platform module loading
try {
  const GestureHandler = require('react-native-gesture-handler');
  GestureHandlerRootView = GestureHandler.GestureHandlerRootView || View;
} catch (e) {
  console.log('Gesture handler not available');  // Fallback to View
}
```

### User-Friendly Error States
```javascript
const withLoading = async (message, operation) => {
  setOperationLoading(true);
  setLoadingMessage(message);
  try {
    const result = await operation();
    setOperationLoading(false);
    return result;
  } catch (error) {
    setOperationLoading(false);
    showToast('Operation failed', 'error');  // User feedback
    throw error;
  }
};
```

## Future Architecture Considerations

### Scalability Planning
- **Component Extraction**: Large components can be moved to separate files while maintaining single entry point
- **Module Federation**: Potential for micro-frontend architecture if needed
- **Code Splitting**: Route-based splitting for larger applications

### Platform Expansion
- **Desktop Support**: Electron wrapper potential
- **Watch/TV Platforms**: Extensible platform detection system
- **Progressive Web App**: Enhanced web capabilities

This unified architecture provides a robust, maintainable foundation that balances simplicity with flexibility, enabling rapid cross-platform development while maintaining platform-specific optimizations where needed.