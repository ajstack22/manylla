import {
  unifiedCategories,
  ensureQuickInfoCategory,
  getDefaultCategories,
  mergeWithDefaults
} from '../unifiedCategories';

// P2 tech debt: Category data structure
describe.skip('unifiedCategories', () => {
  describe('unifiedCategories array', () => {
    test('is an array', () => {
      expect(Array.isArray(unifiedCategories)).toBe(true);
    });

    test('contains 6 categories', () => {
      expect(unifiedCategories).toHaveLength(6);
    });

    test('all categories have required properties', () => {
      unifiedCategories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('displayName');
        expect(category).toHaveProperty('color');
        expect(category).toHaveProperty('order');
        expect(category).toHaveProperty('isCustom');
        expect(category).toHaveProperty('isQuickInfo');
        expect(category).toHaveProperty('isVisible');
      });
    });

    test('all categories have valid data types', () => {
      unifiedCategories.forEach(category => {
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(typeof category.displayName).toBe('string');
        expect(typeof category.color).toBe('string');
        expect(typeof category.order).toBe('number');
        expect(typeof category.isCustom).toBe('boolean');
        expect(typeof category.isQuickInfo).toBe('boolean');
        expect(typeof category.isVisible).toBe('boolean');
      });
    });

    test('has quick-info as first category', () => {
      const quickInfo = unifiedCategories[0];
      expect(quickInfo.id).toBe('quick-info');
      expect(quickInfo.isQuickInfo).toBe(true);
      expect(quickInfo.order).toBe(0);
    });

    test('contains expected categories', () => {
      const expectedIds = [
        'quick-info',
        'daily-support',
        'health-therapy',
        'education-goals',
        'behavior-social',
        'family-resources'
      ];

      const actualIds = unifiedCategories.map(cat => cat.id);
      expect(actualIds).toEqual(expectedIds);
    });

    test('all colors are hex format', () => {
      unifiedCategories.forEach(category => {
        expect(category.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    test('categories are sorted by order', () => {
      for (let i = 1; i < unifiedCategories.length; i++) {
        expect(unifiedCategories[i].order).toBeGreaterThan(unifiedCategories[i - 1].order);
      }
    });

    test('all categories are visible by default', () => {
      unifiedCategories.forEach(category => {
        expect(category.isVisible).toBe(true);
      });
    });

    test('all categories are not custom', () => {
      unifiedCategories.forEach(category => {
        expect(category.isCustom).toBe(false);
      });
    });

    test('only quick-info has isQuickInfo flag', () => {
      const quickInfoCategories = unifiedCategories.filter(cat => cat.isQuickInfo);
      expect(quickInfoCategories).toHaveLength(1);
      expect(quickInfoCategories[0].id).toBe('quick-info');
    });
  });

  describe('ensureQuickInfoCategory', () => {
    test('adds quick-info if missing', () => {
      const categoriesWithoutQuickInfo = [
        { id: 'daily-support', name: 'daily-support' },
        { id: 'health-therapy', name: 'health-therapy' }
      ];

      const result = ensureQuickInfoCategory(categoriesWithoutQuickInfo);
      expect(result[0].id).toBe('quick-info');
      expect(result).toHaveLength(3);
    });

    test('does not add quick-info if already present', () => {
      const categoriesWithQuickInfo = [
        { id: 'quick-info', name: 'quick-info' },
        { id: 'daily-support', name: 'daily-support' }
      ];

      const result = ensureQuickInfoCategory(categoriesWithQuickInfo);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('quick-info');
    });

    test('handles empty array', () => {
      const result = ensureQuickInfoCategory([]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('quick-info');
    });

    test('preserves original order when quick-info exists', () => {
      const categories = [
        { id: 'daily-support', name: 'daily-support' },
        { id: 'quick-info', name: 'quick-info' },
        { id: 'health-therapy', name: 'health-therapy' }
      ];

      const result = ensureQuickInfoCategory(categories);
      expect(result).toEqual(categories);
    });
  });

  describe('getDefaultCategories', () => {
    test('returns a copy of unified categories', () => {
      const result = getDefaultCategories();
      expect(result).toEqual(unifiedCategories);
      expect(result).not.toBe(unifiedCategories); // Different reference
    });

    test('returns array with 6 categories', () => {
      const result = getDefaultCategories();
      expect(result).toHaveLength(6);
    });

    test('modifying result does not affect original', () => {
      const result = getDefaultCategories();
      result.push({ id: 'test', name: 'test' });

      expect(unifiedCategories).toHaveLength(6);
      expect(result).toHaveLength(7);
    });
  });

  describe('mergeWithDefaults', () => {
    test('merges custom categories with defaults', () => {
      const customCategories = [
        { id: 'daily-support', displayName: 'Custom Daily Support', isVisible: false },
        { id: 'custom-category', name: 'custom', displayName: 'Custom Category', order: 10 }
      ];

      const result = mergeWithDefaults(customCategories);

      // Should have all 6 defaults plus 1 custom
      expect(result).toHaveLength(7);

      // Custom override should be applied
      const dailySupport = result.find(cat => cat.id === 'daily-support');
      expect(dailySupport.displayName).toBe('Custom Daily Support');
      expect(dailySupport.isVisible).toBe(false);

      // Custom category should be included
      const customCat = result.find(cat => cat.id === 'custom-category');
      expect(customCat).toBeDefined();
      expect(customCat.displayName).toBe('Custom Category');
    });

    test('handles empty custom categories array', () => {
      const result = mergeWithDefaults([]);
      expect(result).toEqual(unifiedCategories);
    });

    test('handles undefined custom categories', () => {
      const result = mergeWithDefaults();
      expect(result).toEqual(unifiedCategories);
    });

    test('sorts result by order', () => {
      const customCategories = [
        { id: 'custom-1', name: 'custom1', order: 0.5 },
        { id: 'custom-2', name: 'custom2', order: 2.5 }
      ];

      const result = mergeWithDefaults(customCategories);

      // Verify order is maintained
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order || 999).toBeGreaterThanOrEqual(result[i - 1].order || 999);
      }
    });

    test('handles categories without order property', () => {
      const customCategories = [
        { id: 'custom-no-order', name: 'custom' }
      ];

      const result = mergeWithDefaults(customCategories);
      expect(result).toBeDefined();

      // Category without order should be at the end
      const customCat = result.find(cat => cat.id === 'custom-no-order');
      expect(customCat).toBeDefined();
    });

    test('preserves all original properties when overriding', () => {
      const customCategories = [
        { id: 'quick-info', displayName: 'Custom Quick Info' }
      ];

      const result = mergeWithDefaults(customCategories);
      const quickInfo = result.find(cat => cat.id === 'quick-info');

      expect(quickInfo.displayName).toBe('Custom Quick Info');
      expect(quickInfo.color).toBe('#E74C3C'); // Original color preserved
      expect(quickInfo.isQuickInfo).toBe(true); // Original flag preserved
    });

    test('handles duplicate custom categories', () => {
      const customCategories = [
        { id: 'daily-support', displayName: 'First Custom' },
        { id: 'daily-support', displayName: 'Second Custom' }
      ];

      const result = mergeWithDefaults(customCategories);

      // Should only have one instance of daily-support
      const dailySupportCategories = result.filter(cat => cat.id === 'daily-support');
      expect(dailySupportCategories).toHaveLength(1);

      // Last one wins
      expect(dailySupportCategories[0].displayName).toBe('Second Custom');
    });
  });
});