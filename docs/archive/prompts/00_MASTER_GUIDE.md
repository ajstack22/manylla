# MANYLLA FEATURE PARITY MASTER GUIDE
## Complete iOS/Web Implementation Roadmap

### 🎯 MISSION
Complete feature parity between iOS and Web platforms while maintaining:
- Single App.js architecture (StackMap pattern)
- Unified component system
- Consistent Material Design icons
- Manila envelope theming
- Zero-knowledge encryption

---

## 🏗️ CRITICAL ARCHITECTURE STANDARDS

### 1. CODE CENTRALIZATION
```
✅ ALWAYS:
- Single App.js file for ALL logic
- Components from UnifiedApp.js
- Platform.OS checks for conditionals
- index.tsx exports for platform resolution

❌ NEVER:
- Split App.js into multiple files
- Create App.native.js or App.web.js
- Duplicate component logic
- Use platform-specific file extensions in App.js
```

### 2. ICON SYSTEM (IconProvider Pattern)
```javascript
// ✅ CORRECT - Use IconProvider
import { ShareIcon, SyncIcon } from './src/components/Common';

// ❌ WRONG - Direct Material-UI imports
import ShareIcon from '@mui/icons-material/Share';
```

**Available Icons from IconProvider:**
- MenuIcon, CloseIcon, PersonIcon
- AddIcon, EditIcon, DeleteIcon
- ShareIcon, SyncIcon, SettingsIcon
- CloudIcon, LabelIcon, LogoutIcon
- DarkModeIcon, LightModeIcon, PaletteIcon

### 3. MODAL DESIGN (UnifiedModal Pattern)
```javascript
// ✅ CORRECT Modal Structure
<UnifiedModal
  visible={dialogOpen}
  onClose={() => setDialogOpen(false)}
  title="Dialog Title"
  icon={IconComponent}
>
  <ModalCard>
    <ModalSection>
      {/* Content */}
    </ModalSection>
  </ModalCard>
</UnifiedModal>
```

**Modal Standards:**
- Manila brown header (#8B7355)
- X close button (top right)
- NO Cancel buttons
- Card-based content sections
- Full-screen on mobile

### 4. THEME SYSTEM
```javascript
// ✅ CORRECT - Dynamic theme colors
const { colors, theme, toggleTheme } = useTheme();
const styles = createStyles(colors);

// ❌ WRONG - Hardcoded colors
const styles = StyleSheet.create({
  header: { backgroundColor: '#8B7355' }
});
```

**Color Palette:**
- Primary: #8B7355 (Manila brown)
- Secondary: #6B5D54
- Background: #FDFBF7 (Warm paper)
- Manila: #F4E4C1

### 5. COMPONENT FILE STRUCTURE
```
component/
├── ComponentName.tsx          # Web version (Material-UI)
├── ComponentName.native.tsx   # Mobile version (React Native)
└── index.tsx                  # Platform resolver
```

---

## 📊 CURRENT STATE ANALYSIS

### ✅ WORKING FEATURES (70% Complete)
1. **Core CRUD Operations**
   - Profile management
   - Entry add/edit/delete
   - Category management
   - Photo attachments

2. **Data Persistence**
   - AsyncStorage integration
   - StorageService working
   - Profile saving/loading

3. **Basic UI**
   - Tab navigation
   - Modal dialogs
   - Form inputs
   - Date pickers

### ❌ MISSING INTEGRATIONS (30% Remaining)

#### HIGH PRIORITY (Phase 1)
| Feature | Status | Issue |
|---------|--------|-------|
| Share Dialog | Imported ✅ | Buttons don't trigger (line 496, 509) |
| Sync Dialog | Imported ✅ | Missing profile prop (line 570) |
| Theme Colors | Partial ⚠️ | Still using hardcoded colors |

#### MEDIUM PRIORITY (Phase 2)
| Feature | Status | Issue |
|---------|--------|-------|
| QuickInfo Manager | Imported ✅ | No button to open (needs UI) |
| Toast Notifications | Helper exists ✅ | Not showing (line 607) |
| Loading Overlay | Used for initial ✅ | Not for operations |

#### LOWER PRIORITY (Phase 3)
| Feature | Status | Issue |
|---------|--------|-------|
| Print Preview | Imported ✅ | No trigger button |
| QR Code Modal | Imported ✅ | Not integrated with Share |
| Markdown | Components exist ❌ | Not imported/used |

---

## 🚀 IMPLEMENTATION PHASES

### PHASE 1: CRITICAL FEATURES (2-3 hours)
**File:** `01_PHASE1_CRITICAL.md`
- Fix Share Dialog triggers
- Fix Sync Dialog integration
- Complete Theme color replacement
- **Success:** Share links work, sync codes generate, colors dynamic

### PHASE 2: ENHANCED UX (2-3 hours)
**File:** `02_PHASE2_ENHANCED_UX.md`
- Add QuickInfo button to header
- Fix Toast notification display
- Implement operation loading states
- **Success:** User feedback for all actions

### PHASE 3: POLISH FEATURES (2-3 hours)
**File:** `03_PHASE3_POLISH.md`
- Add Print button and preview
- Integrate QR codes with sharing
- Add Markdown to descriptions
- **Success:** All advanced features accessible

---

## 📍 KEY INTEGRATION POINTS IN APP.JS

### Line References (Current State)
```javascript
Line 42-43:   Share/Sync imports ✅
Line 254:     useTheme hook ✅
Line 265-266: Dialog state variables ✅
Line 326-328: showToast helper ✅
Line 494-496: Header buttons (NEEDS FIX)
Line 557-572: Dialog components (NEEDS FIX)
Line 597-613: QR/Toast components (NEEDS FIX)
```

### Missing Connections
1. **Share button** (line 496) → setShareDialogOpen(true)
2. **Sync button** (line 494) → setSyncDialogOpen(true)
3. **QuickInfo button** → Need to add to Header
4. **Print button** → Need to add to Header
5. **Toast display** → Fix conditional rendering

---

## 🧪 TESTING COMMANDS

### Web Development
```bash
npm run web
# Open http://localhost:3000
# Test with Chrome DevTools mobile view
```

### iOS Development
```bash
npm run ios
# Or open in Xcode:
open ios/ManyllaMobile.xcworkspace
```

### Build Commands
```bash
# Web production build
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web

# Deploy to qual
./scripts/deploy-qual.sh
```

---

## ⚠️ COMMON PITFALLS TO AVOID

### DON'T:
1. **Import Material-UI in App.js** - Use IconProvider
2. **Create new color objects** - Use useTheme()
3. **Add Cancel buttons to modals** - Use X close only
4. **Split App.js logic** - Keep everything centralized
5. **Use .ios.js extensions** - Use .native.js
6. **Hardcode URLs** - Use API_ENDPOINTS
7. **Skip Platform.OS checks** - Always check when needed

### DO:
1. **Test both platforms** after each change
2. **Use existing components** from UnifiedApp.js
3. **Follow UnifiedModal pattern** for all dialogs
4. **Maintain manila theme** colors
5. **Keep state in App.js** for main logic
6. **Use showToast()** for user feedback
7. **Check line numbers** before editing

---

## 📋 QUICK REFERENCE

### Import Locations
- **Icons:** `./src/components/Common`
- **Unified Components:** `./src/components/UnifiedApp`
- **Contexts:** `./src/context`
- **Services:** `./src/services/storage/storageService`
- **Utils:** `./src/utils/unifiedCategories`

### State Variables (Already Defined)
```javascript
const [shareDialogOpen, setShareDialogOpen] = useState(false);  // Line 265
const [syncDialogOpen, setSyncDialogOpen] = useState(false);    // Line 266
const [quickInfoOpen, setQuickInfoOpen] = useState(false);      // Line 269
const [printPreviewOpen, setPrintPreviewOpen] = useState(false); // Line 270
const [qrCodeOpen, setQRCodeOpen] = useState(false);            // Line 271
const [toast, setToast] = useState({...});                      // Line 272
```

### Helper Functions (Already Defined)
```javascript
showToast(message, severity = 'success')  // Line 326
handleUpdateProfile(updates)              // Line 398
handleSaveEntry(entryData)               // Line 430
handleDeleteEntry(entryId)               // Line 457
```

---

## 🎯 SUCCESS CRITERIA

The implementation is complete when:
1. ✅ All dialogs open/close properly
2. ✅ Share generates encrypted links
3. ✅ Sync shows recovery phrases
4. ✅ Theme switching works (light/dark/manila)
5. ✅ QuickInfo panels accessible
6. ✅ Toast notifications appear
7. ✅ Print preview works
8. ✅ QR codes generate
9. ✅ Markdown renders in descriptions
10. ✅ No console errors
11. ✅ Both platforms have identical features
12. ✅ Performance is smooth

---

## 📚 PHASE DOCUMENTS

1. **[01_PHASE1_CRITICAL.md](./01_PHASE1_CRITICAL.md)** - Start here!
2. **[02_PHASE2_ENHANCED_UX.md](./02_PHASE2_ENHANCED_UX.md)** - User experience
3. **[03_PHASE3_POLISH.md](./03_PHASE3_POLISH.md)** - Advanced features
4. **[04_TESTING_CHECKLIST.md](./04_TESTING_CHECKLIST.md)** - Validation
5. **[05_TROUBLESHOOTING.md](./05_TROUBLESHOOTING.md)** - Problem solving

---

**REMEMBER:** We're 70% done! Focus on wiring existing components, not creating new ones.