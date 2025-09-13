# Story S015*: Implement Support Us Page with Donation and Community Features

## Overview
Create a Support modal that encourages community support through donations (Buy Me a Coffee), reviews, and engagement. Adapt from StackMap's design with Manylla branding (#F4E4C1 manila envelope theme). Include team photo, impact section, ways to contribute, and contact info. Must handle platform-specific rendering and maintain the existing Buy Me a Coffee link.

## Status
- **Priority**: P2
- **Status**: READY
- **Created**: 2025-09-13
- **Assigned**: Unassigned
- **Type**: UI

## Background
Manylla needs a Support page to encourage community support through donations, reviews, and engagement. This will be adapted from StackMap's successful implementation but with Manylla-specific branding and messaging.

## Requirements

### Core Components
1. **SupportModal Component** (`src/components/Modals/SupportModal/SupportModal.js`)
   - Full-screen modal with slide animation
   - Custom header with Manylla manila envelope theme (#F4E4C1, #A08670)
   - Scrollable content area with multiple sections
   - Platform-specific handling (iOS SafeArea, Android FlatList, Web)

2. **Visual Structure**
   - **Header**: Manylla logo + tagline about supporting special needs families
   - **Team Photo**: Add Manylla team photo (450px max width, 300px height)
   - **Impact Section**: 3 key benefits (Privacy, Free Sync, Development)
   - **Buy Me a Coffee**: MUST keep existing link (https://www.buymeacoffee.com/stackmap)
   - **Ways to Contribute**: Review, Share, Feedback, Ideas grid
   - **Contact Section**: support@manylla.com

3. **Platform Adaptations**
   - **Android**: FlatList for performance, status bar management
   - **iOS**: SafeAreaView for notch, native ScrollView
   - **Web**: HTML img tags, visible Buy Me a Coffee button

4. **Integration Points**
   - Add "Support" option to existing menu/settings
   - URL parameter support: ?support=true
   - Modal state management in App.js

## UI/UX Specifications
- **Platforms**: web,ios,android
- **Uses Existing Components**: false
- **Responsive Design**: true
- **Manylla Theme**: true
- **Accessibility**: Standard WCAG 2.1 AA compliance
- **Modal Type**: full-screen
- **Early Initialization Required**: false

## Success Metrics
```bash
# Component files exist
test -f src/components/Modals/SupportModal/SupportModal.js
test -f src/components/Modals/SupportModal/styles.js
test -f src/components/BuyMeCoffeeButton/BuyMeCoffeeButton.js

# No TypeScript files
find src/components/Modals/SupportModal -name "*.ts" -o -name "*.tsx" | wc -l  # Must be 0

# Build passes
npm run build:web

# Modal opens from URL parameter
# Test manually: http://localhost:3000?support=true
```

## Implementation Guidelines

### Component Structure
```javascript
// SupportModal.js structure
<Modal visible={visible} animationType="slide" transparent>
  <SafeAreaView>
    <Header onClose={onClose} />
    <ScrollView or FlatList>
      <HeaderSection />
      <TeamPhotoSection />
      <ImpactSection />
      <BuyMeCoffeeSection />
      <ContributeSection />
      <ContactSection />
    </ScrollView or FlatList>
  </SafeAreaView>
</Modal>
```

### Styling Requirements
- Manila envelope theme colors: #F4E4C1 (background), #A08670 (primary)
- Consistent spacing using SPACING constants
- 15px border radius for cards
- Shadow/elevation for depth
- Minimum touch targets: 36px

### Key Implementation Notes
- NO TypeScript (JavaScript only per Manylla standards)
- NO Material-UI imports (use React Native Elements)
- Use Platform.select() for platform differences
- Reuse existing modal patterns from PrivacyModal
- Keep Buy Me a Coffee link unchanged

## Acceptance Criteria
- [ ] SupportModal component created with all sections
- [ ] Buy Me a Coffee button/link working (unchanged URL)
- [ ] Manila envelope theme applied (#F4E4C1, #A08670)
- [ ] Platform-specific rendering working (iOS, Android, Web)
- [ ] Modal opens from menu and URL parameter (?support=true)
- [ ] Team photo displayed (need to add image)
- [ ] Contact email set to support@manylla.com
- [ ] All success metrics pass
- [ ] No TypeScript files created
- [ ] Build passes without errors
- [ ] Tested on all platforms

## Dependencies
- Existing modal infrastructure (App.js modal state)
- Buy Me a Coffee account (keep existing link)
- Team photo asset (to be provided)
- Update to menu/settings for Support option

## Estimated Effort
**Total**: M

## Technical Details

### Files to Create
1. `src/components/Modals/SupportModal/SupportModal.js` - Main modal component
2. `src/components/Modals/SupportModal/styles.js` - Styles with Manylla theme
3. `src/components/BuyMeCoffeeButton/BuyMeCoffeeButton.js` - Donation button

### Files to Modify
1. `App.js` - Add SupportModal state and component
2. Menu/Settings components - Add Support option

### Content to Adapt
- Tagline: Focus on special needs families support
- Impact statements: Privacy, sync, development for special needs
- Email: support@manylla.com
- Keep Buy Me a Coffee link as-is

## Notes
*Story created via create-story-with-details.sh*
*Adapted from StackMap's successful Support page implementation*

---
*Story ID: S015**
*Created: 2025-09-13*
*Status: READY*
