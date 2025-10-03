import { createInitialProfile, createDemoProfile } from '../profileCreation';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock StorageService
jest.mock('../../../../services/storage/storageService', () => ({
  StorageService: {
    saveProfile: jest.fn(),
  },
}));

describe('profileCreation', () => {
  describe('createInitialProfile', () => {
    it('creates profile with basic data', () => {
      const formData = {
        childName: 'John Doe',
        dateOfBirth: '2020-01-15',
        photo: 'data:image/png;base64,abc',
      };

      const profile = createInitialProfile(formData);

      expect(profile.name).toBe('John Doe');
      expect(profile.photo).toBe('data:image/png;base64,abc');
      expect(profile.id).toBeDefined();
      expect(profile.categories).toBeDefined();
      expect(profile.entries).toEqual([]);
    });

    it('handles missing photo', () => {
      const formData = {
        childName: 'John Doe',
        dateOfBirth: '2020-01-15',
        photo: null,
      };

      const profile = createInitialProfile(formData);

      expect(profile.photo).toBeNull();
    });

    it('trims child name', () => {
      const formData = {
        childName: '  John Doe  ',
        dateOfBirth: '',
        photo: null,
      };

      const profile = createInitialProfile(formData);

      expect(profile.name).toBe('John Doe');
    });
  });

  describe('createDemoProfile', () => {
    it('creates demo profile with sample data', () => {
      const profile = createDemoProfile();

      expect(profile.name).toBe('Ellie Thompson');
      expect(profile.id).toContain('demo-');
      expect(profile.entries.length).toBeGreaterThan(0);
      expect(profile.categories).toBeDefined();
    });

    it('demo profile has entries in all categories', () => {
      const profile = createDemoProfile();

      const categories = [
        'quick-info',
        'daily-support',
        'health-therapy',
        'education-goals',
        'behavior-social',
        'family-resources',
      ];

      categories.forEach((categoryId) => {
        const hasEntry = profile.entries.some(
          (entry) => entry.category === categoryId
        );
        expect(hasEntry).toBe(true);
      });
    });
  });
});
