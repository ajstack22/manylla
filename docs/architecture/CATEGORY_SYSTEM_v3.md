# Manylla Category System v3
*Last Updated: September 9, 2025*

## Overview
Version 3 of the Manylla category system represents a major simplification from 13 categories to 6 core categories, improving user experience and reducing cognitive load.

## Category Structure

### Core Categories (6)

1. **Quick Info** 
   - ID: `quick-info`
   - Color: `#E74C3C` (Red)
   - Purpose: Critical information needed immediately
   - Special: `isQuickInfo: true` flag
   - Display: Always shown in dedicated section at bottom of grid

2. **Daily Support**
   - ID: `daily-support`
   - Color: `#3498DB` (Blue)
   - Purpose: Communication aids, routines, sensory needs, dietary information
   - Consolidates: Communication, Sensory, Dietary, Routines

3. **Medical**
   - ID: `medical`
   - Color: `#E67E22` (Orange)
   - Purpose: Health records, medications, allergies, medical team info
   - Consolidates: Medical, Allergies

4. **Development**
   - ID: `development`
   - Color: `#2ECC71` (Green)
   - Purpose: Education plans, goals, achievements, milestones
   - Consolidates: Goals, Achievements, Education

5. **Health**
   - ID: `health`
   - Color: `#9B59B6` (Purple)
   - Purpose: Wellness tracking, physical activity, sleep patterns
   - Consolidates: Wellness, Activities

6. **Other**
   - ID: `other`
   - Color: `#95A5A6` (Gray)
   - Purpose: Catch-all for miscellaneous items
   - Consolidates: Tips & Tricks, Behaviors, Miscellaneous

## Technical Implementation

### Category Configuration
Located in: `src/utils/unifiedCategories.ts`

```typescript
export interface CategoryConfig {
  id: string;
  name: string;
  displayName: string;
  color: string;
  order: number;
  isVisible: boolean;
  isCustom: boolean;
  isQuickInfo: boolean;
}

export const unifiedCategories: CategoryConfig[] = [
  {
    id: "quick-info",
    name: "quick-info",
    displayName: "Quick Info",
    color: "#E74C3C",
    order: 1,
    isVisible: true,
    isCustom: false,
    isQuickInfo: true
  },
  // ... other categories
];
```

### Quick Info Refactoring
Version 3 converted Quick Info from a separate data structure (`quickInfoPanels`) to regular categories with an `isQuickInfo` flag:

**Before (v2):**
```typescript
interface ChildProfile {
  quickInfoPanels: QuickInfoPanel[];
  categories: CategoryConfig[];
  // ...
}
```

**After (v3):**
```typescript
interface ChildProfile {
  categories: CategoryConfig[]; // Includes Quick Info categories
  // ...
}
```

### Display Logic
Quick Info categories are filtered and displayed separately:

```typescript
const quickInfoCategories = profile.categories.filter(c => c.isQuickInfo);
const regularCategories = profile.categories.filter(c => !c.isQuickInfo);
```

## Migration from v2 to v3

### Category Mapping
Old categories are mapped to new categories as follows:

| Old Category | New Category |
|-------------|--------------|
| communication | daily-support |
| sensory | daily-support |
| dietary | daily-support |
| routines | daily-support |
| medical | medical |
| allergies | medical |
| goals | development |
| achievements | development |
| education | development |
| wellness | health |
| activities | health |
| tips-tricks | other |
| behaviors | other |

### Data Migration
When loading old profiles, entries are automatically remapped to new categories:

```typescript
const categoryMapping = {
  'communication': 'daily-support',
  'sensory': 'daily-support',
  'dietary': 'daily-support',
  // ... etc
};

// Remap entry categories
entries.forEach(entry => {
  if (categoryMapping[entry.category]) {
    entry.category = categoryMapping[entry.category];
  }
});
```

## UI/UX Improvements

### Simplified Add/Edit Forms
- Category picker now shows only 6 options
- Clear, descriptive names for each category
- Color-coded for visual distinction
- Reduced decision fatigue for users

### Grid Layout
- Desktop: 3 columns
- Tablet: 2 columns  
- Mobile: 1 column
- Quick Info: Always full-width row at bottom

### Visual Design
- Subtle 4px colored border strip instead of full colored headers
- Consistent card styling across all categories
- Clear visual hierarchy

## Benefits of v3 System

1. **Reduced Cognitive Load**: 54% fewer categories to choose from
2. **Clearer Organization**: Categories have more intuitive purposes
3. **Better Mobile Experience**: Simplified interface works better on small screens
4. **Faster Onboarding**: New users understand system more quickly
5. **Maintained Flexibility**: "Other" category allows for edge cases

## Backward Compatibility

While the system supports loading old category names, all new entries use the v3 categories. There is no UI option to create custom categories or revert to the old system.

## Future Considerations

1. **Custom Categories**: May add ability for users to create custom subcategories within the 6 main categories
2. **Category Templates**: Pre-filled templates for common use cases
3. **Smart Categorization**: AI-assisted category suggestions based on content
4. **Category Analytics**: Track which categories are most used to further optimize

## Related Documentation

- [UNIFIED_APP_ARCHITECTURE.md](./UNIFIED_APP_ARCHITECTURE.md) - Overall app architecture
- [03_COMPONENT_ARCHITECTURE.md](./03_COMPONENT_ARCHITECTURE.md) - Component structure
- [DEPLOYMENT_PROCESS_v3.md](../deployment/DEPLOYMENT_PROCESS_v3.md) - Deployment with v3 changes