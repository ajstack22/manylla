import { CategoryConfig } from "../types/ChildProfile";

// Simplified 6-category system for better user experience
export const unifiedCategories: CategoryConfig[] = [
  // Quick Info as a special category (pinned to top)
  {
    id: "quick-info",
    name: "quick-info",
    displayName: "Quick Info",
    color: "#E74C3C", // Red - urgent/important
    order: 1,
    isVisible: true,
    isCustom: false,
    isQuickInfo: true, // This flag keeps it pinned to top
  },

  // Core categories - simplified and meaningful
  {
    id: "daily-support",
    name: "daily-support",
    displayName: "Daily Support",
    color: "#3498DB", // Blue - supportive/calming
    order: 2,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: "medical",
    name: "medical",
    displayName: "Medical",
    color: "#E67E22", // Orange - medical/health
    order: 3,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: "development",
    name: "development",
    displayName: "Development",
    color: "#2ECC71", // Green - growth/progress
    order: 4,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: "health",
    name: "health",
    displayName: "Health",
    color: "#9B59B6", // Purple - wellness/health
    order: 5,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: "other",
    name: "other",
    displayName: "Other",
    color: "#95A5A6", // Gray - neutral/other
    order: 6,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
];

export function getCategoryByName(
  categories: CategoryConfig[],
  name: string,
): CategoryConfig | undefined {
  return categories.find((cat) => cat.name === name);
}

export function getVisibleCategories(
  categories: CategoryConfig[],
): CategoryConfig[] {
  return categories
    .filter((cat) => cat.isVisible)
    .sort((a, b) => a.order - b.order);
}

// Migrate from old quick info format to unified categories
export function migrateQuickInfoToCategories(
  quickInfoValue: string,
  categoryName: string,
): any {
  if (!quickInfoValue) return null;

  return {
    id: `migrated-${categoryName}-${Date.now()}`,
    title: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
    description: quickInfoValue,
    category: categoryName,
    date: new Date(),
    visibility: "private" as const,
  };
}
