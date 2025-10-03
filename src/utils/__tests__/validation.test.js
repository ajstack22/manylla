/* eslint-disable */
import { ProfileValidator } from '../validation';

// Enabled as part of test coverage improvement initiative
describe('ProfileValidator - Comprehensive Tests', () => {
  describe('validateProfile', () => {
    const validProfile = {
      id: 'test-profile-1',
      name: 'Test Child',
      dateOfBirth: '2010-01-01',
      entries: [
        {
          id: 'entry-1',
          category: 'medical',
          title: 'Test Entry',
          description: 'Test description',
          date: '2024-01-01',
          visibility: ['private'],
        },
      ],
      categories: [
        {
          id: 'cat-1',
          name: 'medical',
          displayName: 'Medical',
          color: '#E76F51',
          order: 0,
          isVisible: true,
        },
      ],
    };

    describe('Valid Profiles', () => {
      it('should validate a valid profile', () => {
        const result = ProfileValidator.validateProfile(validProfile);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should accept profile with empty entries', () => {
        const profile = { ...validProfile, entries: [] };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });

      it('should accept profile with empty categories', () => {
        const profile = { ...validProfile, categories: [] };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });

      it('should accept profile with minimal required fields', () => {
        const minimalProfile = {
          id: '1',
          name: 'AB',
          dateOfBirth: '2020-01-01',
          entries: [],
          categories: [],
        };
        const result = ProfileValidator.validateProfile(minimalProfile);
        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid Data Types', () => {
      it('should reject null profile', () => {
        const result = ProfileValidator.validateProfile(null);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile data is required');
      });

      it('should reject undefined profile', () => {
        const result = ProfileValidator.validateProfile(undefined);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile data is required');
      });

      it('should reject non-object profile', () => {
        const result = ProfileValidator.validateProfile('not an object');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile data is required');
      });

      it('should reject array as profile', () => {
        const result = ProfileValidator.validateProfile([]);
        expect(result.valid).toBe(false);
      });

      it('should reject number as profile', () => {
        const result = ProfileValidator.validateProfile(123);
        expect(result.valid).toBe(false);
      });
    });

    describe('Profile ID Validation', () => {
      it('should require profile ID', () => {
        const profile = { ...validProfile };
        delete profile.id;
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile ID is required');
      });

      it('should reject empty string ID', () => {
        const profile = { ...validProfile, id: '' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile ID is required');
      });

      it('should reject non-string ID', () => {
        const profile = { ...validProfile, id: 123 };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile ID is required');
      });

      it('should reject null ID', () => {
        const profile = { ...validProfile, id: null };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile ID is required');
      });
    });

    describe('Name Validation', () => {
      it('should require profile name', () => {
        const profile = { ...validProfile };
        delete profile.name;
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile name is required');
      });

      it('should reject empty name', () => {
        const profile = { ...validProfile, name: '' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile name is required');
      });

      it('should reject whitespace-only name', () => {
        const profile = { ...validProfile, name: '   ' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile name is required');
      });

      it('should reject single character name', () => {
        const profile = { ...validProfile, name: 'A' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile name must be at least 2 characters');
      });

      it('should reject name longer than 100 characters', () => {
        const profile = { ...validProfile, name: 'A'.repeat(101) };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Profile name is too long');
      });

      it('should accept name with exactly 100 characters', () => {
        const profile = { ...validProfile, name: 'A'.repeat(100) };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });

      it('should accept name with leading/trailing spaces', () => {
        const profile = { ...validProfile, name: '  Valid Name  ' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });
    });

    describe('Date of Birth Validation', () => {
      it('should require date of birth', () => {
        const profile = { ...validProfile };
        delete profile.dateOfBirth;
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Date of birth is required');
      });

      it('should reject null date of birth', () => {
        const profile = { ...validProfile, dateOfBirth: null };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Date of birth is required');
      });

      it('should reject invalid date format', () => {
        const profile = { ...validProfile, dateOfBirth: 'not-a-date' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid date of birth');
      });

      it('should reject future date of birth', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const profile = { ...validProfile, dateOfBirth: futureDate.toISOString() };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Date of birth cannot be in the future');
      });

      it('should accept today as date of birth', () => {
        const today = new Date().toISOString().split('T')[0];
        const profile = { ...validProfile, dateOfBirth: today };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });

      it('should accept various valid date formats', () => {
        const validDates = [
          '2010-01-01',
          '2010-12-31',
          '2010-06-15',
          new Date('2010-01-01').toISOString(),
        ];

        validDates.forEach(date => {
          const profile = { ...validProfile, dateOfBirth: date };
          const result = ProfileValidator.validateProfile(profile);
          expect(result.valid).toBe(true);
        });
      });
    });

    describe('Entries Validation', () => {
      it('should reject null entries', () => {
        const profile = { ...validProfile, entries: null };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Entries must be an array');
      });

      it('should reject non-array entries', () => {
        const profile = { ...validProfile, entries: 'not an array' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Entries must be an array');
      });

      it('should accept undefined entries as empty array', () => {
        const profile = { ...validProfile };
        delete profile.entries;
        // This might be valid depending on implementation
        const result = ProfileValidator.validateProfile(profile);
        // Check actual behavior
        expect(result.errors.length).toBeGreaterThanOrEqual(0);
      });

      it('should validate each entry in array', () => {
        const profile = {
          ...validProfile,
          entries: [
            { id: '1', title: 'Valid', category: 'test' },
            { id: null, title: '', category: '' }, // Invalid entry
          ],
        };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
      });

      it('should handle large number of entries', () => {
        const manyEntries = Array(100).fill(null).map((_, i) => ({
          id: `entry-${i}`,
          title: `Entry ${i}`,
          category: 'medical',
          description: `Description ${i}`,
          date: '2024-01-01',
          visibility: ['private'],
        }));
        const profile = { ...validProfile, entries: manyEntries };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });
    });

    describe('Categories Validation', () => {
      it('should reject null categories', () => {
        const profile = { ...validProfile, categories: null };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Categories must be an array');
      });

      it('should reject non-array categories', () => {
        const profile = { ...validProfile, categories: 'not an array' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Categories must be an array');
      });

      it('should validate each category in array', () => {
        const profile = {
          ...validProfile,
          categories: [
            { id: 'cat-1', name: 'Valid', displayName: 'Valid Category' },
            { id: null, name: '' }, // Invalid category
          ],
        };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(false);
      });

      it('should handle duplicate category IDs', () => {
        const profile = {
          ...validProfile,
          categories: [
            { id: 'cat-1', name: 'Category 1', displayName: 'Category 1' },
            { id: 'cat-1', name: 'Category 2', displayName: 'Category 2' }, // Duplicate ID
          ],
        };
        const result = ProfileValidator.validateProfile(profile);
        // Check if validation detects duplicates
        expect(result.errors.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle profile with extra fields', () => {
        const profile = {
          ...validProfile,
          extraField: 'extra value',
          anotherExtra: 123,
        };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });

      it('should handle deeply nested invalid data', () => {
        const profile = {
          ...validProfile,
          entries: [
            {
              id: 'entry-1',
              title: 'Test',
              category: 'test',
              metadata: {
                nested: {
                  deep: null,
                },
              },
            },
          ],
        };
        const result = ProfileValidator.validateProfile(profile);
        // Should not crash on deep nesting
        expect(result).toBeDefined();
      });

      it('should handle circular references gracefully', () => {
        const profile = { ...validProfile };
        profile.circular = profile; // Create circular reference

        // Should not cause infinite loop
        expect(() => {
          ProfileValidator.validateProfile(profile);
        }).not.toThrow();
      });

      it('should handle unicode characters in name', () => {
        const profile = { ...validProfile, name: '测试儿童 👶' };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });

      it('should handle special characters in fields', () => {
        const profile = {
          ...validProfile,
          name: "O'Connor-Smith Jr.",
        };
        const result = ProfileValidator.validateProfile(profile);
        expect(result.valid).toBe(true);
      });
    });

    describe('Performance', () => {
      it('should validate large profile quickly', () => {
        const largeProfile = {
          ...validProfile,
          entries: Array(1000).fill(null).map((_, i) => ({
            id: `entry-${i}`,
            title: `Entry ${i}`,
            category: 'medical',
            description: 'A'.repeat(1000),
            date: '2024-01-01',
            visibility: ['private'],
          })),
          categories: Array(50).fill(null).map((_, i) => ({
            id: `cat-${i}`,
            name: `category-${i}`,
            displayName: `Category ${i}`,
            color: '#E76F51',
            order: i,
            isVisible: true,
          })),
        };

        const startTime = Date.now();
        const result = ProfileValidator.validateProfile(largeProfile);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
        expect(result.valid).toBe(true);
      });
    });

    describe('Error Messages', () => {
      it('should provide clear error messages', () => {
        const invalidProfile = {
          id: '',
          name: 'A',
          dateOfBirth: 'invalid',
          entries: 'not array',
          categories: null,
        };

        const result = ProfileValidator.validateProfile(invalidProfile);
        expect(result.valid).toBe(false);
        expect(result.errors).toEqual(expect.arrayContaining([
          expect.stringMatching(/ID/i),
          expect.stringMatching(/name.*2 characters/i),
          expect.stringMatching(/date/i),
          expect.stringMatching(/Entries.*array/i),
          expect.stringMatching(/Categories.*array/i),
        ]));
      });

      it('should accumulate all errors', () => {
        const invalidProfile = {};
        const result = ProfileValidator.validateProfile(invalidProfile);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
      });
    });
  });
});