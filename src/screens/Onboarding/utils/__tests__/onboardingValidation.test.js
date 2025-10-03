import {
  validateName,
  validateDateOfBirth,
  validatePhoto,
  validateStep,
} from '../onboardingValidation';

describe('onboardingValidation', () => {
  describe('validateName', () => {
    it('returns error for empty name', () => {
      expect(validateName('')).toBe("Please enter the child's name");
      expect(validateName(null)).toBe("Please enter the child's name");
      expect(validateName(undefined)).toBe("Please enter the child's name");
    });

    it('returns error for whitespace-only name', () => {
      expect(validateName('   ')).toBe("Please enter the child's name");
      expect(validateName('\t\n')).toBe("Please enter the child's name");
    });

    it('returns null for valid name', () => {
      expect(validateName('John')).toBeNull();
      expect(validateName('John Doe')).toBeNull();
      expect(validateName('  John  ')).toBeNull();
    });
  });

  describe('validateDateOfBirth', () => {
    it('returns null for any date (optional field)', () => {
      expect(validateDateOfBirth('')).toBeNull();
      expect(validateDateOfBirth('01/01/2020')).toBeNull();
      expect(validateDateOfBirth(null)).toBeNull();
    });
  });

  describe('validatePhoto', () => {
    it('returns null for any photo (optional field)', () => {
      expect(validatePhoto(null)).toBeNull();
      expect(validatePhoto('data:image/png;base64,abc')).toBeNull();
    });
  });

  describe('validateStep', () => {
    it('validates step 1 with name validation', () => {
      expect(validateStep(1, { childName: '' })).toBe(
        "Please enter the child's name"
      );
      expect(validateStep(1, { childName: 'John' })).toBeNull();
    });

    it('returns null for other steps', () => {
      expect(validateStep(0, {})).toBeNull();
      expect(validateStep(2, {})).toBeNull();
      expect(validateStep(3, {})).toBeNull();
    });
  });
});
