# React Native Migration Prompt Pack for Manylla App

## 🎯 Mission
Complete the React Native migration of the Manylla app, achieving 95% code sharing between iOS, Android, and web platforms following StackMap's successful cross-platform architecture pattern.

## 📱 Project Overview

### What is Manylla?
Manylla is a zero-knowledge encrypted profile management app for special needs information. Parents/caregivers can:
- Create detailed profiles with medical, behavioral, sensory, and other critical information
- Share profiles temporarily with caregivers, teachers, or medical professionals
- Sync data across devices using recovery phrases
- All data is encrypted client-side - the server never sees plaintext

### Current State
- **Web app**: Fully functional at https://manylla.com/qual/
- **iOS app**: Partially migrated, basic UI working, needs component migration
- **Android app**: Not yet tested but should work with React Native components

### Architecture Pattern (Following StackMap)
```
src/components/
  ComponentName/
    ComponentName.tsx         # Web version (Material-UI)
    ComponentName.native.tsx  # Native version (React Native)
    index.tsx                # Platform selector using Platform.OS
```

## 🏗️ Technical Stack

### Core Technologies
- **React Native 0.81** with TypeScript
- **React 19** for web
- **Material-UI v7** for web components
- **React Native Elements** or custom styling for native
- **TweetNaCl.js** for encryption (cross-platform)
- **AsyncStorage** for native storage
- **React Context API** for state management

### Key Files Structure
```
/Users/adamstack/manylla/
├── App.js                    # Main app with Platform.OS routing
├── index.js                  # React Native entry point
├── src/
│   ├── components/           # UI components (need .native versions)
│   ├── context/             # Shared contexts (cross-platform)
│   ├── services/            # Business logic (mostly cross-platform)
│   │   ├── storage/         # Storage abstraction
│   │   └── sync/            # Sync and encryption services
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
└── ios/                     # iOS specific files

/Users/adamstack/Desktop/manylla-app/  # Reference web app
```

## 🔄 Migration Status

### ✅ Completed Components
1. **App.js** - Main cross-platform app structure
2. **OnboardingWizard.native.tsx** - User onboarding flow
3. **ProfileOverview.native.js** - Profile display with categories
4. **ThemeContext** - Cross-platform theme management
5. **SyncContext** - Cross-platform sync state management
6. **Storage services** - AsyncStorage integration
7. **Encryption services** - Zero-knowledge encryption

### 🚧 Components Needing Migration

#### Priority 1: Core CRUD Operations
These enable basic app functionality:

1. **UnifiedAddDialog.native.tsx**
   - Reference: `/src/components/Dialogs/UnifiedAddDialog.tsx`
   - Purpose: Add/edit entries in categories
   - Key features: Category selection, title/description fields, visibility settings
   - Native considerations: Use Modal from react-native, native form inputs

2. **CategorySection.native.tsx**
   - Reference: `/src/components/Profile/CategorySection.tsx`
   - Purpose: Display entries within a category
   - Key features: Collapsible sections, entry cards, edit/delete actions
   - Native considerations: Use TouchableOpacity for interactions, Animated API for collapse

3. **EntryForm.native.tsx**
   - Reference: `/src/components/Forms/EntryForm.tsx`
   - Purpose: Form for creating/editing entries
   - Key features: Text inputs, category picker, date picker
   - Native considerations: Use TextInput, Picker components

4. **Header.native.tsx**
   - Reference: `/src/components/Layout/Header.tsx`
   - Purpose: App header with menu and actions
   - Key features: Title, hamburger menu, sync status indicator
   - Native considerations: SafeAreaView for notch handling

#### Priority 2: Profile Management
5. **ProfileEditDialog.native.tsx**
   - Reference: `/src/components/Profile/ProfileEditDialog.tsx`
   - Purpose: Edit profile name, photo, pronouns, etc.
   - Key features: Image picker, text inputs, date picker
   - Native considerations: Use react-native-image-picker

6. **UnifiedCategoryManager.native.tsx**
   - Reference: `/src/components/Settings/UnifiedCategoryManager.tsx`
   - Purpose: Enable/disable categories, reorder
   - Key features: Draggable list, toggle switches
   - Native considerations: Use react-native-draggable-flatlist

#### Priority 3: Sync & Share
7. **SyncDialog.native.tsx**
   - Reference: `/src/components/Sync/SyncDialog.tsx`
   - Purpose: Enable multi-device sync with recovery phrase
   - Key features: Generate/enter recovery phrase, sync status
   - Native considerations: Secure text input for recovery phrase

8. **ShareDialogOptimized.native.tsx**
   - Reference: `/src/components/Sharing/ShareDialogOptimized.tsx`
   - Purpose: Share profile temporarily
   - Key features: Generate share link, set expiration
   - Native considerations: Use Share API for native sharing

#### Priority 4: Rich Text & Polish
9. **SmartTextInput.native.tsx**
   - Reference: `/src/components/Forms/SmartTextInput.tsx`
   - Purpose: Text input with AI suggestions
   - Key features: Auto-complete, suggestions
   - Native considerations: Custom keyboard toolbar

10. **MarkdownField.native.tsx**
    - Reference: `/src/components/Forms/MarkdownField.tsx`
    - Purpose: Rich text editing with markdown
    - Native considerations: Consider react-native-markdown-editor

## 🎨 Design Guidelines

### Manylla Theme Colors
```javascript
const manyllaColors = {
  primary: '#8B7355',        // Brown (manila envelope)
  background: '#F4E4C1',     // Light manila
  surface: '#FFFFFF',        
  text: '#333333',
  error: '#D32F2F',
  avatarDefaultBg: '#8B7355'
};
```

### Native Styling Patterns
```javascript
// Always use StyleSheet.create for performance
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Shadow for iOS
  shadowIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Shadow for Android  
  shadowAndroid: {
    elevation: 4,
  }
});

// Platform-specific shadows
...Platform.select({
  ios: styles.shadowIOS,
  android: styles.shadowAndroid,
})
```

## 🔐 Critical Security Considerations

### Encryption Implementation
- All profile data MUST be encrypted before storage/transmission
- Use `manyllaEncryptionService.js` for all encryption operations
- Recovery phrases are 32-character hex strings
- 100,000 iterations for key derivation (matching StackMap)

### Data Flow
1. User creates/edits data → 
2. Data encrypted client-side → 
3. Encrypted blob stored in AsyncStorage → 
4. If sync enabled, encrypted blob sent to server → 
5. Server stores encrypted blob (never sees plaintext)

## 📝 Component Migration Checklist

For each component migration:

- [ ] Create `.native.tsx` or `.native.js` file
- [ ] Copy web component structure and logic
- [ ] Replace Material-UI imports with React Native components:
  - `Box` → `View`
  - `Typography` → `Text`
  - `Paper` → `View` with shadow styles
  - `Button` → `TouchableOpacity` with `Text`
  - `TextField` → `TextInput`
  - `Dialog` → `Modal`
  - `IconButton` → `TouchableOpacity` with icon/emoji
- [ ] Convert CSS-in-JS to `StyleSheet.create()`
- [ ] Update the index.tsx to use Platform.OS selector
- [ ] Test on iOS simulator
- [ ] Handle platform-specific features (e.g., keyboard, safe areas)
- [ ] Ensure proper TypeScript types

## 🧪 Testing Requirements

### Test Scenarios
1. **Onboarding Flow**
   - Start fresh → Enter child name → Complete onboarding
   - Demo mode → Load sample data → View profile

2. **Profile Management**
   - Add entry to category → View in profile
   - Edit entry → Verify changes saved
   - Delete entry → Confirm removal
   - Change profile photo → Display updated

3. **Data Persistence**
   - Add data → Close app → Reopen → Verify data exists
   - Clear storage → Verify onboarding reappears

4. **Sync Flow**
   - Enable sync → Get recovery phrase
   - Second device → Enter recovery phrase → Verify data syncs

## 🚀 Development Workflow

### Setup Commands
```bash
# Navigate to project
cd /Users/adamstack/manylla

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start --reset-cache

# Run iOS app
npx react-native run-ios

# For specific simulator
npx react-native run-ios --simulator="iPhone 16 Pro"
```

### File Locations
- **Main app code**: `/Users/adamstack/manylla/src/`
- **Reference web app**: `/Users/adamstack/Desktop/manylla-app/src/`
- **Test changes**: Use iOS Simulator (Cmd+R to reload)

### Common Issues & Solutions

1. **Module Resolution Issues**
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Clean build: `cd ios && xcodebuild clean && cd ..`

2. **Native Module Errors**
   - Reinstall pods: `cd ios && pod install && cd ..`
   - Rebuild app: `npx react-native run-ios`

3. **TypeScript Errors**
   - Check imports match platform (.native.tsx vs .tsx)
   - Ensure types are from '@types/react-native'

## 📊 Success Metrics

The migration is complete when:
1. ✅ All web app features work on iOS
2. ✅ 95% code shared between platforms
3. ✅ Profile CRUD operations fully functional
4. ✅ Sync works across web and mobile
5. ✅ Share functionality operational
6. ✅ Data persists correctly
7. ✅ No TypeScript errors
8. ✅ App runs smoothly at 60fps

## 🔗 Key Resources

### Project Files
- **CLAUDE.md**: Project-specific instructions
- **CROSS_PLATFORM_MIGRATION_REPORT.md**: Previous migration attempts
- **App.js**: Main cross-platform entry point

### External Resources
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Platform-Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [React Navigation](https://reactnavigation.org/) (when needed)

## 💡 Important Notes

1. **Platform.OS Pattern**: Always use the StackMap pattern for platform-specific code:
   ```javascript
   const Component = Platform.OS === 'web' 
     ? require('./Component.tsx').default
     : require('./Component.native.tsx').default;
   ```

2. **Async Operations**: All storage operations are async, always use await:
   ```javascript
   await AsyncStorage.setItem('key', JSON.stringify(data));
   ```

3. **Navigation**: Currently using conditional rendering. May need React Navigation for complex flows.

4. **Images**: Use `Image` from 'react-native' with `source={{ uri: imageUrl }}`

5. **Icons**: Currently using emojis. Can upgrade to react-native-vector-icons if needed.

6. **Safe Areas**: Always wrap screens in SafeAreaView for notch handling.

## 🎯 Next Steps

1. Start with Priority 1 components (Core CRUD)
2. Test each component thoroughly before moving on
3. Ensure data flow works end-to-end
4. Add navigation if needed for multi-screen flows
5. Polish with animations and native feel

## 🤝 Questions or Blockers?

If stuck on any component:
1. Check the web version for functionality reference
2. Look for similar patterns in completed native components
3. Consult Platform.OS documentation for platform-specific needs
4. Test incrementally - get basic version working first, then enhance

Remember: The goal is functional parity with the web app, not pixel-perfect matching. Native apps should feel native while maintaining the core Manylla functionality and branding.

## 🏁 Definition of Done

A component is complete when:
- [ ] Native version exists and renders without errors
- [ ] All web functionality is replicated (or appropriately adapted)
- [ ] Data operations work (create, read, update, delete)
- [ ] Component integrates with existing app flow
- [ ] TypeScript has no errors
- [ ] Tested on iOS simulator
- [ ] Code follows established patterns

Good luck! You're building something meaningful that helps families manage critical information for their special needs children. The zero-knowledge encryption ensures their privacy while the cross-platform approach ensures accessibility.