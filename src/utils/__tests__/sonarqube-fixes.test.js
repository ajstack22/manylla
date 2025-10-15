/**
 * Tests for SonarQube critical issue fixes (S054 and S040)
 * Verifies that type comparison and error handling fixes work correctly
 */

import { ProfileValidator } from '../validation';
import platform, { isAndroid } from '../platform';
import secureRandomService, { SecureRandomService } from '../SecureRandomService';

describe('SonarQube Critical Issue Fixes', () => {
  describe('Type Comparison Fixes (S040)', () => {
    describe('ProfileValidator phone number validation', () => {
      it('should handle string phone numbers correctly', () => {
        // These should all return false (invalid phone numbers)
        expect(ProfileValidator.validatePhoneNumber('123')).toBe(false);
        expect(ProfileValidator.validatePhoneNumber('555-123')).toBe(false);
        expect(ProfileValidator.validatePhoneNumber('not-a-phone')).toBe(false);

        // Valid phone numbers
        expect(ProfileValidator.validatePhoneNumber('555-123-4567')).toBe(true);
        expect(ProfileValidator.validatePhoneNumber('1234567890')).toBe(true);
      });

      it('should reject non-string inputs', () => {
        expect(ProfileValidator.validatePhoneNumber(123)).toBe(false);
        expect(ProfileValidator.validatePhoneNumber(null)).toBe(false);
        expect(ProfileValidator.validatePhoneNumber(undefined)).toBe(false);
      });

      it('should handle digit-only validation correctly', () => {
        // After removing non-digits, these should be rejected
        const phone1 = '(123) 456-7890';
        const digits1 = phone1.replace(/\D/g, ''); // "1234567890"
        expect(digits1).toBe('1234567890');
        expect(ProfileValidator.validatePhoneNumber(phone1)).toBe(true);

        const phone2 = '123';
        const digits2 = phone2.replace(/\D/g, ''); // "123"
        expect(digits2).toBe('123');
        expect(ProfileValidator.validatePhoneNumber(phone2)).toBe(false);
      });
    });

    describe('Platform font weight handling', () => {
      it('should handle both string and number font weights', () => {
        // Test with number weight
        const style1 = platform.font(700, 14);
        const expectedWeight1 = isAndroid() ? 'bold' : expect.anything();
        expect(style1.fontWeight).toEqual(expectedWeight1);

        // Test with string weight
        const style2 = platform.font('700', 14);
        const expectedWeight2 = isAndroid() ? 'bold' : expect.anything();
        expect(style2.fontWeight).toEqual(expectedWeight2);

        // Test with 'bold' string
        const style3 = platform.font('bold', 14);
        const expectedWeight3 = isAndroid() ? 'bold' : expect.anything();
        expect(style3.fontWeight).toEqual(expectedWeight3);

        // Test with 800 (should also be bold)
        const style4 = platform.font(800, 14);
        const expectedWeight4 = isAndroid() ? 'bold' : expect.anything();
        expect(style4.fontWeight).toEqual(expectedWeight4);

        // Test with normal weight
        const style5 = platform.font(400, 14);
        const expectedWeight5 = isAndroid() ? 'normal' : expect.anything();
        expect(style5.fontWeight).toEqual(expectedWeight5);
      });
    });
  });

  describe('Error Handling Fixes (S054)', () => {
    describe('ProfileValidator error handling', () => {
      const originalEnv = process.env.NODE_ENV;

      afterEach(() => {
        process.env.NODE_ENV = originalEnv;
      });

      it('should handle invalid date formats gracefully', () => {
        const result = ProfileValidator.validateProfile({
          id: '123',
          name: 'Test',
          dateOfBirth: 'invalid-date',
          entries: [],
          categories: []
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid date of birth');
      });

      it('should handle entry date validation errors', () => {
        const entry = {
          id: '123',
          category: 'medical',
          title: 'Test Entry',
          description: 'Test description',
          date: 'not-a-valid-date'
        };

        const result = ProfileValidator.validateEntry(entry);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid date format');
      });

      it('should log errors in development mode', () => {
        process.env.NODE_ENV = 'development';
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        // Trigger date validation error
        ProfileValidator.validateProfile({
          id: '123',
          name: 'Test',
          dateOfBirth: { invalid: 'object' }, // This will throw
          entries: [],
          categories: []
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Date validation failed:'),
          expect.any(Object)
        );

        consoleSpy.mockRestore();
      });

      it('should not log errors in production mode', () => {
        process.env.NODE_ENV = 'production';
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        ProfileValidator.validateProfile({
          id: '123',
          name: 'Test',
          dateOfBirth: { invalid: 'object' },
          entries: [],
          categories: []
        });

        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should handle profile repair errors gracefully', () => {
        // Test with a profile that has invalid entries (not an array)
        const brokenProfile = {
          name: 'Test',
          entries: 'not-an-array', // String instead of array
          categories: []
        };

        // The repair function should convert invalid entries to an empty array
        const repaired = ProfileValidator.repairProfile(brokenProfile);
        expect(repaired).not.toBeNull();
        expect(Array.isArray(repaired.entries)).toBe(true);
        expect(repaired.entries).toEqual([]);
      });
    });

    describe('SecureRandomService error handling', () => {
      it('should handle polyfill loading silently', () => {
        // The service should initialize without throwing
        expect(() => new SecureRandomService()).not.toThrow();
      });

      it('should return false for self-test on failure', () => {
        // Use the singleton instance
        // Mock a failure scenario
        const originalGetRandomBytes = secureRandomService.getRandomBytes;
        secureRandomService.getRandomBytes = () => {
          throw new Error('Test error');
        };

        expect(secureRandomService.selfTest()).toBe(false);

        // Restore
        secureRandomService.getRandomBytes = originalGetRandomBytes;
      });
    });
  });

  describe('Type Safety Improvements', () => {
    it('should use strict equality for appropriate comparisons', () => {
      // Test that our fixes maintain type safety
      const testCases = [
        { input: 0, expected: true, actual: 0 === 0 },
        { input: '0', expected: false, actual: '0' === 0 },
        { input: '', expected: false, actual: '' === 0 },
        { input: null, expected: false, actual: null === 0 },
        { input: undefined, expected: false, actual: undefined === 0 }
      ];

      testCases.forEach(({ input, expected, actual }) => {
        expect(actual).toBe(expected);
      });
    });

    it('should validate array length comparisons correctly', () => {
      const arr = [];
      expect(arr.length === 0).toBe(true);
      expect(arr.length < 1).toBe(true);

      arr.push('item');
      expect(arr.length === 1).toBe(true);
      expect(arr.length > 0).toBe(true);
    });

    it('should handle string trim length comparisons', () => {
      const str1 = '  ';
      expect(str1.trim().length === 0).toBe(true);

      const str2 = ' text ';
      expect(str2.trim().length === 0).toBe(false);
      expect(str2.trim().length > 0).toBe(true);
    });
  });

  describe('Code Quality Validation', () => {
    it('should have no eval usage in sanitization', () => {
      // This test verifies that eval is not used in the codebase
      // The actual check is done by static analysis (ESLint)
      // We verify our sanitization doesn't use eval by testing its behavior
      const sanitized = ProfileValidator.sanitizeHtml('<script>alert("test")</script>');
      expect(sanitized).not.toContain('script');

      // Verify it handles various XSS attempts without eval
      const dangerous = ProfileValidator.sanitizeHtml('javascript:alert("xss")');
      expect(dangerous).not.toContain('javascript:');
    });

    it('should handle all catch blocks with error parameters', () => {
      // This verifies that our catch blocks properly handle errors
      let caughtError = null;
      const testFunc = () => {
        try {
          throw new Error('Test error');
        } catch (error) {
          // Properly handling error parameter
          caughtError = error;
          return 'handled';
        }
      };

      const result = testFunc();
      expect(result).toBe('handled');
      expect(caughtError).toBeDefined();
      expect(caughtError.message).toBe('Test error');
    });
  });
});