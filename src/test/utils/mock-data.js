/**
 * Mock data utilities for consistent testing
 * Provides standardized test data for all components
 */

// Mock child profile data
export const mockChildProfile = {
  id: "profile-123",
  name: "Test Child",
  dateOfBirth: "2015-06-15",
  photo: null,
  categories: [
    {
      id: "cat-1",
      name: "Medical",
      color: "#E76F51",
      entries: [
        {
          id: "entry-1",
          title: "Allergy Information",
          content:
            "Allergic to peanuts and shellfish. Carries EpiPen at all times.",
          date: "2024-01-15",
          isImportant: true,
        },
        {
          id: "entry-2",
          title: "Regular Medications",
          content:
            "Daily inhaler for asthma - Albuterol 2 puffs morning and evening.",
          date: "2024-01-10",
          isImportant: true,
        },
      ],
    },
    {
      id: "cat-2",
      name: "School",
      color: "#2A9D8F",
      entries: [
        {
          id: "entry-3",
          title: "Teacher Contact",
          content:
            "Mrs. Johnson - Room 24 - johnson@school.edu - (555) 123-4567",
          date: "2024-01-01",
        },
        {
          id: "entry-4",
          title: "Accommodation Plan",
          content:
            "Extended time for tests, preferential seating near teacher.",
          date: "2024-01-01",
        },
      ],
    },
  ],
  quickInfo: [
    {
      id: "quick-1",
      title: "Emergency Contact",
      content:
        "Mom: Sarah Smith (555) 123-4567\nDad: John Smith (555) 987-6543",
    },
    {
      id: "quick-2",
      title: "Medical Alert",
      content: "SEVERE PEANUT ALLERGY - EpiPen in backpack",
    },
  ],
  lastModified: Date.now() - 86400000, // 24 hours ago
};

// Mock multiple profiles for testing lists
export const mockProfiles = [
  mockChildProfile,
  {
    id: "profile-456",
    name: "Another Child",
    dateOfBirth: "2012-03-22",
    photo: null,
    categories: [
      {
        id: "cat-3",
        name: "Behavioral",
        color: "#F4A261",
        entries: [
          {
            id: "entry-5",
            title: "Behavioral Plan",
            content:
              "Uses positive reinforcement system. Needs frequent breaks.",
            date: "2024-01-20",
          },
        ],
      },
    ],
    quickInfo: [
      {
        id: "quick-3",
        title: "Parent Contact",
        content: "Lisa Brown (555) 555-5555",
      },
    ],
    lastModified: Date.now() - 172800000, // 48 hours ago
  },
];

// Mock category data
export const mockCategories = [
  { id: "cat-1", name: "Medical", color: "#E76F51" },
  { id: "cat-2", name: "School", color: "#2A9D8F" },
  { id: "cat-3", name: "Behavioral", color: "#F4A261" },
  { id: "cat-4", name: "Activities", color: "#E9C46A" },
  { id: "cat-5", name: "Development", color: "#264653" },
];

// Mock entry data
export const mockEntry = {
  id: "entry-test",
  title: "Test Entry",
  content: "This is a test entry with some content to validate functionality.",
  date: "2024-01-15",
  isImportant: false,
  categoryId: "cat-1",
};

// Mock quick info data
export const mockQuickInfo = {
  id: "quick-test",
  title: "Test Quick Info",
  content: "Quick information for testing purposes.",
};

// Mock sync data
export const mockSyncData = {
  profiles: mockProfiles,
  lastSync: Date.now(),
  version: "2.0.0",
};

// Mock encrypted sync data
export const mockEncryptedSyncData = {
  data: "base64_encoded_encrypted_data_here",
  timestamp: Date.now(),
  sync_id: "test_sync_id_123",
  version: "2.0.0",
};

// Mock share data
export const mockShareData = {
  share_id: "share_abc123",
  data: "encrypted_share_data",
  expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  created_at: Date.now(),
};

// Mock photo data
export const mockPhotoData = {
  id: "photo-123",
  uri: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", // Minimal JPEG
  name: "test-photo.jpg",
  size: 1024,
  type: "image/jpeg",
  lastModified: Date.now(),
};

// Mock form validation errors
export const mockValidationErrors = {
  name: "Name is required",
  content: "Content cannot be empty",
  title: "Title must be at least 3 characters",
  dateOfBirth: "Invalid date format",
};

// Mock API responses
export const mockApiResponses = {
  syncHealth: {
    status: "healthy",
    timestamp: Date.now(),
  },
  syncPushSuccess: {
    success: true,
    timestamp: Date.now(),
  },
  syncPushError: {
    success: false,
    error: "Server error",
  },
  syncPullSuccess: {
    success: true,
    data: "encrypted_data_here",
    timestamp: Date.now(),
  },
  syncPullNoData: {
    success: false,
    error: "No data found",
  },
  shareCreateSuccess: {
    success: true,
    share_id: "abc123def456",
    url: "https://manylla.com/qual/share/abc123def456#encryption_key",
    expires_at: Date.now() + 24 * 60 * 60 * 1000,
  },
  shareAccessSuccess: {
    success: true,
    data: "encrypted_shared_data",
    expires_at: Date.now() + 12 * 60 * 60 * 1000,
  },
  shareAccessNotFound: {
    success: false,
    error: "Share not found or expired",
  },
};

// Mock user interactions
export const mockUserActions = {
  createProfile: {
    name: "New Child",
    dateOfBirth: "2016-08-10",
  },
  createCategory: {
    name: "New Category",
    color: "#8B5A2B",
  },
  createEntry: {
    title: "New Entry",
    content: "This is new entry content.",
    date: "2024-02-01",
    isImportant: false,
  },
  editEntry: {
    title: "Updated Entry Title",
    content: "Updated entry content with more details.",
    isImportant: true,
  },
};

// Mock theme data
export const mockThemeData = {
  light: {
    mode: "light",
    colors: {
      primary: "#F4E4C1",
      background: "#FFFFFF",
      text: "#000000",
    },
  },
  dark: {
    mode: "dark",
    colors: {
      primary: "#F4E4C1",
      background: "#121212",
      text: "#FFFFFF",
    },
  },
};

// Export helper functions
export const createMockProfile = (overrides = {}) => ({
  ...mockChildProfile,
  ...overrides,
  id: overrides.id || `profile-${Date.now()}`,
});

export const createMockEntry = (overrides = {}) => ({
  ...mockEntry,
  ...overrides,
  id: overrides.id || `entry-${Date.now()}`,
});

export const createMockCategory = (overrides = {}) => ({
  ...mockCategories[0],
  ...overrides,
  id: overrides.id || `cat-${Date.now()}`,
});

export const createMockQuickInfo = (overrides = {}) => ({
  ...mockQuickInfo,
  ...overrides,
  id: overrides.id || `quick-${Date.now()}`,
});
