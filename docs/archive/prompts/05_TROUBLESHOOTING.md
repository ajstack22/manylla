# TROUBLESHOOTING GUIDE
## Common Issues and Solutions for Manylla Development

### 🚨 QUICK FIXES FOR COMMON PROBLEMS

---

## 🔴 BUILD ERRORS

### Issue: "Cannot find module '@mui/icons-material'"
```bash
# Solution: Install Material-UI icons
npm install @mui/icons-material @mui/material @emotion/react @emotion/styled
```

### Issue: "Module not found: Can't resolve 'react-native-vector-icons'"
```bash
# Solution: Install and link vector icons
npm install react-native-vector-icons
cd ios && pod install
# For iOS, also ensure fonts are copied to project
```

### Issue: "JavaScript heap out of memory"
```bash
# Solution: Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web
# Or add to package.json scripts:
"build:web": "NODE_OPTIONS=--max-old-space-size=8192 react-scripts build"
```

### Issue: "Pod install failing"
```bash
# Solution: Clean and reinstall pods
cd ios
pod cache clean --all
rm -rf Pods Podfile.lock
pod install --repo-update
```

---

## 🟡 RUNTIME ERRORS

### Issue: "undefined is not an object (evaluating 'EntryForm')"
```javascript
// Problem: Component not properly exported
// Check: src/components/UnifiedApp.js exports
export { EntryForm, ProfileEditForm, CategoryManager };

// Check: Import statement in App.js
import { EntryForm } from './src/components/UnifiedApp';
```

### Issue: "ShareDialogOptimized not opening"
```javascript
// Debug steps:
console.log('Share state:', shareDialogOpen); // Check state
console.log('Button handler:', onShare); // Check prop passed

// Common fix: Ensure button calls the function
onPress={() => setShareDialogOpen(true)} // Correct
onPress={setShareDialogOpen(true)} // Wrong - executes immediately
```

### Issue: "Toast notifications not showing"
```javascript
// Problem: Stale closure in setTimeout
// Wrong:
setTimeout(() => setToast({ ...toast, open: false }), 3000);

// Correct:
setTimeout(() => setToast(prev => ({ ...prev, open: false })), 3000);
```

### Issue: "Theme colors not updating"
```javascript
// Check useTheme is called at component level:
const { colors, theme } = useTheme(); // Must be inside component

// Verify styles recreated on theme change:
const styles = createStyles(colors); // Should use current colors
```

---

## 🔵 PLATFORM-SPECIFIC ISSUES

### iOS: "RCTBridge required dispatch_sync to load"
```bash
# Solution: Clean build
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ..
npm run ios
```

### iOS: "No bundle URL present"
```bash
# Solution: Restart Metro bundler
npx react-native start --reset-cache
# In another terminal:
npm run ios
```

### Web: "Material-UI components not styled"
```javascript
// Ensure ThemeProvider wraps app:
import { ThemeProvider } from '@mui/material/styles';
// Check theme is passed to MUI components
```

### Web: "window is not defined"
```javascript
// Add Platform check:
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // Web-only code
}
```

---

## 🟢 COMPONENT INTEGRATION ISSUES

### Issue: "IconProvider icons not showing"
```javascript
// Check icon name matches export:
import { ShareIcon } from './src/components/Common'; // Correct
import { Share } from './src/components/Common'; // Wrong

// Verify IconProvider exports the icon:
export const ShareIcon = createIcon('share', 'Share');
```

### Issue: "Modal not following UnifiedModal pattern"
```javascript
// Wrong: Custom modal structure
<Modal visible={open}>
  <View>...</View>
</Modal>

// Correct: Use UnifiedModal
<UnifiedModal
  visible={open}
  onClose={handleClose}
  title="Title"
  icon={IconComponent}
>
  <ModalCard>...</ModalCard>
</UnifiedModal>
```

### Issue: "Hardcoded colors after theme change"
```javascript
// Search and replace ALL hex colors:
// Find: #8B7355, #F4E4C1, #FDFBF7, etc.
// Replace with: colors.primary, colors.background.manila, etc.

// Use VS Code regex search:
// Find: #[0-9A-Fa-f]{6}
// Review each match
```

---

## 🟣 STATE MANAGEMENT ISSUES

### Issue: "State not updating"
```javascript
// Check state update is called:
console.log('Before:', stateValue);
setStateValue(newValue);
// Note: State updates are async, won't show immediately

// For dependent updates, use useEffect:
useEffect(() => {
  console.log('Updated:', stateValue);
}, [stateValue]);
```

### Issue: "Props not passed to child component"
```javascript
// Debug: Log props in child
console.log('Props received:', props);

// Common mistake: Destructuring wrong
const { onShare } = props; // If passed as props.onShare
const { handleShare } = props; // Wrong if prop is named onShare
```

### Issue: "Infinite re-renders"
```javascript
// Wrong: Function called on every render
onPress={handleClick()} // Executes immediately

// Correct: Pass function reference
onPress={handleClick} // Or
onPress={() => handleClick()}

// Check useEffect dependencies:
useEffect(() => {
  // Effect
}, []); // Empty deps = run once
```

---

## 🔧 SYNC & SHARE ISSUES

### Issue: "Share link not generating"
```javascript
// Check API endpoint is correct:
console.log('API endpoint:', API_ENDPOINTS.SHARE_CREATE);

// Verify encryption:
console.log('Encrypted data:', encryptedData);

// Check network request:
// Open Network tab in DevTools
// Look for failed requests
```

### Issue: "Sync not working"
```javascript
// Debug sync context:
const { pushSync, pullSync, syncStatus } = useSync();
console.log('Sync status:', syncStatus);

// Check recovery phrase format:
// Should be 32 characters, hexadecimal
/^[a-f0-9]{32}$/.test(recoveryPhrase)
```

### Issue: "QR code not scannable"
```javascript
// Ensure data is string:
data={typeof shareData === 'string' ? shareData : JSON.stringify(shareData)}

// Limit data size (QR has limits):
const maxLength = 2000;
if (data.length > maxLength) {
  // Use URL instead of full data
}
```

---

## 🎨 STYLING ISSUES

### Issue: "Styles not applying"
```javascript
// Check style prop syntax:
style={styles.container} // Single style
style={[styles.container, styles.active]} // Multiple styles
style={{ backgroundColor: colors.primary }} // Inline style

// Platform-specific styles:
style={Platform.select({
  ios: styles.iosStyle,
  web: styles.webStyle,
})}
```

### Issue: "Modal not full screen on iOS"
```javascript
// Set presentationStyle:
<Modal
  presentationStyle="fullScreen" // iOS
  animationType="slide"
>
```

### Issue: "Print styles not working"
```css
/* Ensure @media print in CSS: */
@media print {
  .no-print { display: none !important; }
}

/* For React Native Web: */
const styles = StyleSheet.create({
  container: {
    '@media print': {
      display: 'none'
    }
  }
});
```

---

## 🔍 DEBUGGING TOOLS

### Console Debugging
```javascript
// Strategic logging points:
console.log('=== Component Mount ===');
console.log('Props:', props);
console.log('State:', state);
console.log('Theme:', theme);

// Group related logs:
console.group('Share Dialog Debug');
console.log('Open state:', shareDialogOpen);
console.log('Profile:', profile);
console.groupEnd();
```

### React DevTools
```bash
# Install for better debugging:
npm install --dev react-devtools

# Run standalone:
npx react-devtools
```

### Network Debugging
```javascript
// Log all API calls:
const makeRequest = async (url, options) => {
  console.log('Request:', url, options);
  const response = await fetch(url, options);
  console.log('Response:', response.status);
  return response;
};
```

---

## 📱 TESTING TOOLS

### iOS Simulator Tips
```bash
# Reset simulator:
Device > Erase All Content and Settings

# Debug menu:
Cmd + D (in simulator)

# Reload:
Cmd + R

# Record screen:
Cmd + R (start/stop recording)
```

### Chrome DevTools for Web
```
# Responsive testing:
F12 > Toggle device toolbar

# Network conditions:
Network tab > Throttling

# Console shortcuts:
$0 = Currently selected element
$_ = Last evaluated expression
```

---

## 🚀 PERFORMANCE FIXES

### Issue: "App running slowly"
```javascript
// Check for unnecessary re-renders:
console.log('Render:', Date.now());

// Memoize expensive operations:
const memoizedValue = useMemo(() => {
  return expensiveOperation(data);
}, [data]);

// Use React.memo for components:
const MyComponent = React.memo(({ props }) => {
  // Component
});
```

### Issue: "Large bundle size"
```bash
# Analyze bundle:
npm run build
npx source-map-explorer 'build/static/js/*.js'

# Check for unused imports:
npm install --dev eslint-plugin-unused-imports
```

---

## 🆘 EMERGENCY FIXES

### Complete Reset
```bash
# Nuclear option - full reset:
rm -rf node_modules package-lock.json
rm -rf ios/Pods ios/Podfile.lock
npm cache clean --force
npm install
cd ios && pod install
cd ..
npm run ios
```

### Revert Changes
```bash
# If something breaks badly:
git status  # Check changes
git stash  # Temporarily save changes
# Test if issue persists
git stash pop  # Restore changes if not the cause
```

### Clean Builds
```bash
# Web:
rm -rf build
npm run build:web

# iOS:
cd ios
xcodebuild clean
rm -rf build
cd ..
npm run ios
```

---

## 📞 GETTING HELP

### Before Asking for Help
1. ✅ Check this troubleshooting guide
2. ✅ Search error message in project
3. ✅ Check console for full error
4. ✅ Try clean build
5. ✅ Test on other platform
6. ✅ Check recent changes

### Information to Provide
```markdown
**Environment:**
- Platform: [iOS/Web]
- Node version: [run: node -v]
- npm version: [run: npm -v]
- OS: [macOS/Windows/Linux]

**Error:**
[Full error message]

**Steps Taken:**
1. [What you tried]
2. [Results]

**Code Context:**
[Relevant code snippet]
```

---

## 🎯 PREVENTION TIPS

### Best Practices
1. **Test after every change** - Don't batch changes
2. **Use version control** - Commit working states
3. **Follow patterns** - Use established architecture
4. **Check both platforms** - Test iOS and Web
5. **Read error messages** - They often tell you exactly what's wrong
6. **Use TypeScript** - Catch errors at compile time
7. **Keep dependencies updated** - But test after updates

### Common Mistakes to Avoid
- ❌ Importing Material-UI in React Native files
- ❌ Using .ios.js instead of .native.js
- ❌ Hardcoding colors instead of theme
- ❌ Forgetting Platform.OS checks
- ❌ Skipping pod install after package changes
- ❌ Not clearing cache when things act weird

---

**Remember:** Most issues are simple typos or missing imports. Check the basics first!