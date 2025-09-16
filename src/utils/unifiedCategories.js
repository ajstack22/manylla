// Simplified 6-category system for better user experience
export const unifiedCategories = [
  // Quick Info as a special category (pinned to top)
  {
    id: "quick-info",
    name: "quick-info",
    displayName: "Quick Info",
    color: "#E74C3C", // Red - urgent/important
    order: 0,
    isCustom: false,
    isQuickInfo: true, // This flag keeps it pinned to top
    isVisible: true,
  },

  // Core categories - simplified and meaningful
  {
    id: "daily-support",
    name: "daily-support",
    displayName: "Daily Support",
    color: "#3498DB", // Blue - calm, routine
    order: 1,
    isCustom: false,
    isQuickInfo: false,
    isVisible: true,
  },
  {
    id: "health-therapy",
    name: "health-therapy",
    displayName: "Health & Therapy",
    color: "#27AE60", // Green - health, growth
    order: 2,
    isCustom: false,
    isQuickInfo: false,
    isVisible: true,
  },
  {
    id: "education-goals",
    name: "education-goals",
    displayName: "Education & Goals",
    color: "#F39C12", // Orange - learning, achievement
    order: 3,
    isCustom: false,
    isQuickInfo: false,
    isVisible: true,
  },
  {
    id: "behavior-social",
    name: "behavior-social",
    displayName: "Behavior & Social",
    color: "#9B59B6", // Purple - emotional, social
    order: 4,
    isCustom: false,
    isQuickInfo: false,
    isVisible: true,
  },
  {
    id: "family-resources",
    name: "family-resources",
    displayName: "Family & Resources",
    color: "#16A085", // Teal - support, community
    order: 5,
    isCustom: false,
    isQuickInfo: false,
    isVisible: true,
  },
];

// Helper to ensure quick-info is always included
export const ensureQuickInfoCategory = (categories) => {
  const hasQuickInfo = categories.some((cat) => cat.id === "quick-info");
  if (!hasQuickInfo) {
    return [unifiedCategories[0], ...categories];
  }
  return categories;
};

// Get default categories for new profiles
export const getDefaultCategories = () => {
  return [...unifiedCategories];
};

// Merge custom categories with defaults
export const mergeWithDefaults = (customCategories = []) => {
  const defaultMap = new Map(unifiedCategories.map((cat) => [cat.id, cat]));
  const merged = [];

  // Add all categories (custom overrides default)
  customCategories.forEach((cat) => {
    if (defaultMap.has(cat.id)) {
      // Override default with custom settings
      merged.push({ ...defaultMap.get(cat.id), ...cat });
      defaultMap.delete(cat.id);
    } else {
      // Add custom category
      merged.push(cat);
    }
  });

  // Add remaining defaults
  defaultMap.forEach((cat) => merged.push(cat));

  // Sort by order
  return merged.sort((a, b) => (a.order || 999) - (b.order || 999));
};
