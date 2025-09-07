import { CategoryConfig } from '../types/ChildProfile';

// Simplified categories with Quick Info as a single category
export const unifiedCategories: CategoryConfig[] = [
  // Quick Info as a single category (pinned to top)
  {
    id: 'quick-info',
    name: 'quick-info',
    displayName: 'Quick Info',
    color: '#E74C3C',
    order: 1,
    isVisible: true,
    isCustom: false,
    isQuickInfo: true,  // This flag will keep it pinned to top
  },
  
  // Core categories - consolidated and simplified
  {
    id: 'medical',
    name: 'medical',
    displayName: 'Medical',
    color: '#E67E22',
    order: 2,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'education',
    name: 'education',
    displayName: 'Education',
    color: '#3498DB',
    order: 3,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'behaviors',
    name: 'behaviors',
    displayName: 'Behaviors',
    color: '#9B59B6',
    order: 4,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'communication',
    name: 'communication',
    displayName: 'Communication',
    color: '#16A085',
    order: 5,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'daily-routine',
    name: 'daily-routine',
    displayName: 'Daily Routine',
    color: '#34495E',
    order: 6,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'goals',
    name: 'goals',
    displayName: 'Goals',
    color: '#2ECC71',
    order: 7,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'successes',
    name: 'successes',
    displayName: 'Successes',
    color: '#F39C12',
    order: 8,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'tips-tricks',
    name: 'tips-tricks',
    displayName: 'Tips & Tricks',
    color: '#27AE60',
    order: 9,
    isVisible: true,
    isCustom: false,
    isQuickInfo: false,
  },
  
  // Additional categories (hidden by default)
  {
    id: 'sensory',
    name: 'sensory',
    displayName: 'Sensory',
    color: '#8E44AD',
    order: 10,
    isVisible: false,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'dietary',
    name: 'dietary',
    displayName: 'Dietary',
    color: '#C0392B',
    order: 11,
    isVisible: false,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'strengths',
    name: 'strengths',
    displayName: 'Strengths',
    color: '#2980B9',
    order: 12,
    isVisible: false,
    isCustom: false,
    isQuickInfo: false,
  },
  {
    id: 'challenges',
    name: 'challenges',
    displayName: 'Challenges',
    color: '#D35400',
    order: 13,
    isVisible: false,
    isCustom: false,
    isQuickInfo: false,
  },
];

export function getCategoryByName(categories: CategoryConfig[], name: string): CategoryConfig | undefined {
  return categories.find(cat => cat.name === name);
}

export function getVisibleCategories(categories: CategoryConfig[]): CategoryConfig[] {
  return categories
    .filter(cat => cat.isVisible)
    .sort((a, b) => a.order - b.order);
}

// Migrate from old quick info format to unified categories
export function migrateQuickInfoToCategories(quickInfoValue: string, categoryName: string): any {
  if (!quickInfoValue) return null;
  
  return {
    id: `migrated-${categoryName}-${Date.now()}`,
    title: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
    description: quickInfoValue,
    category: categoryName,
    date: new Date(),
    visibility: 'private' as const,
  };
}