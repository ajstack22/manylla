export interface Entry {
  id: string;
  category: string; // Now flexible for custom categories
  title: string;
  description: string;
  date: Date;
  attachments?: string[];
  visibility?: string[]; // Array of visibility options: ['family', 'medical', 'education'] or ['all'] or ['private']
}

export interface CategoryConfig {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  color: string;
  order: number;
  isVisible: boolean;
  isCustom: boolean;
  isQuickInfo?: boolean; // Categories that were formerly Quick Info panels
}

export interface QuickInfoConfig {
  id: string;
  name: string;
  displayName: string;
  value: string; // Will be migrated to entries
  order: number;
  isVisible: boolean;
  isCustom: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  dateOfBirth: Date;
  preferredName?: string;
  pronouns?: string;
  photo?: string;
  entries: Entry[];
  categories: CategoryConfig[];
  quickInfoPanels: QuickInfoConfig[];
  createdAt: Date;
  updatedAt: Date;
  themeMode?: 'light' | 'dark' | 'manylla';
}

export interface ShareableProfile {
  childId: string;
  sharedEntries: string[];
  expiresAt?: Date;
  accessCode: string;
  sharedWith: string;
  sharedBy: string;
  createdAt: Date;
}