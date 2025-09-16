/**
 * SecureRandomService Tests
 *
 * Tests cryptographically secure random generation across platforms
 */

import { SecureRandomService } from '../SecureRandomService';
import secureRandomService from '../SecureRandomService';

// Mock crypto for testing
const mockCrypto = {
  getRandomValues: jest.fn((array) => {
    // Fill with predictable but different values for testing
    for (let i = 0; i < array.length; i++) {
      array[i] = (i * 17 + 42) % 256; // Predictable pattern for testing
    }
    return array;
  })
};

describe('SecureRandomService', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup crypto mock
    global.crypto = mockCrypto;

    // Mock platform detection
    jest.doMock('../platform', () => ({
      isWeb: true,
      isMobile: false
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Availability', () => {
    it('should create a new instance', () => {
      const service = new SecureRandomService();
      expect(service).toBeInstanceOf(SecureRandomService);
    });

    it('should export a singleton instance', () => {
      expect(secureRandomService).toBeInstanceOf(SecureRandomService);
    });

    it('should detect crypto availability correctly', () => {
      const service = new SecureRandomService();
      expect(service.isAvailable).toBe(true);
    });

    it('should handle missing crypto gracefully', () => {
      const originalCrypto = global.crypto;
      delete global.crypto;

      const service = new SecureRandomService();
      expect(service.isAvailable).toBe(false);

      global.crypto = originalCrypto;
    });
  });

  describe('getRandomBytes', () => {
    it('should generate bytes of correct length', () => {
      const service = new SecureRandomService();
      const bytes = service.getRandomBytes(16);

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(16);
      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
    });

    it('should throw error when crypto not available', () => {
      const service = new SecureRandomService();
      service.isAvailable = false;

      expect(() => service.getRandomBytes(16)).toThrow('Secure random generation not available');
    });

    it('should generate different values for different calls', () => {
      const service = new SecureRandomService();

      // Mock to return different values each time
      let callCount = 0;
      mockCrypto.getRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = (i + callCount * 13) % 256;
        }
        callCount++;
        return array;
      });

      const bytes1 = service.getRandomBytes(8);
      const bytes2 = service.getRandomBytes(8);

      expect(bytes1).not.toEqual(bytes2);
    });
  });

  describe('getRandomInt', () => {
    it('should generate integers within range', () => {
      const service = new SecureRandomService();

      for (let i = 0; i < 100; i++) {
        const randomInt = service.getRandomInt(10);
        expect(randomInt).toBeGreaterThanOrEqual(0);
        expect(randomInt).toBeLessThan(10);
        expect(Number.isInteger(randomInt)).toBe(true);
      }
    });

    it('should handle edge cases', () => {
      const service = new SecureRandomService();

      const result = service.getRandomInt(1);
      expect(result).toBe(0);
    });

    it('should throw error for invalid max values', () => {
      const service = new SecureRandomService();

      expect(() => service.getRandomInt(0)).toThrow('Max must be a positive integer');
      expect(() => service.getRandomInt(-1)).toThrow('Max must be a positive integer');
      expect(() => service.getRandomInt(1.5)).toThrow('Max must be a positive integer');
    });

    it('should have good distribution', () => {
      const service = new SecureRandomService();
      const max = 5;
      const counts = new Array(max).fill(0);
      const iterations = 1000;

      // Mock to provide uniform distribution
      let mockByteIndex = 0;
      mockCrypto.getRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = mockByteIndex % 256;
          mockByteIndex++;
        }
        return array;
      });

      for (let i = 0; i < iterations; i++) {
        const result = service.getRandomInt(max);
        counts[result]++;
      }

      // Each bucket should have some values (not testing perfect distribution due to rejection sampling)
      counts.forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('getRandomFloat', () => {
    it('should generate floats between 0 and 1', () => {
      const service = new SecureRandomService();

      for (let i = 0; i < 100; i++) {
        const randomFloat = service.getRandomFloat();
        expect(randomFloat).toBeGreaterThanOrEqual(0);
        expect(randomFloat).toBeLessThan(1);
        expect(typeof randomFloat).toBe('number');
      }
    });

    it('should generate different values', () => {
      const service = new SecureRandomService();

      // Mock to return different bytes each time
      let seed = 0;
      mockCrypto.getRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = (seed + i * 17) % 256;
        }
        seed += 13;
        return array;
      });

      const values = Array.from({ length: 10 }, () => service.getRandomFloat());
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBeGreaterThan(1);
    });
  });

  describe('getRandomHex', () => {
    it('should generate hex strings of correct length', () => {
      const service = new SecureRandomService();

      const hex8 = service.getRandomHex(8);
      expect(hex8).toHaveLength(8);
      expect(/^[0-9a-f]+$/.test(hex8)).toBe(true);

      const hex32 = service.getRandomHex(32);
      expect(hex32).toHaveLength(32);
      expect(/^[0-9a-f]+$/.test(hex32)).toBe(true);
    });

    it('should throw error for odd lengths', () => {
      const service = new SecureRandomService();

      expect(() => service.getRandomHex(7)).toThrow('Hex string length must be even');
      expect(() => service.getRandomHex(15)).toThrow('Hex string length must be even');
    });

    it('should generate different hex strings', () => {
      const service = new SecureRandomService();

      const hex1 = service.getRandomHex(16);
      const hex2 = service.getRandomHex(16);

      expect(hex1).not.toEqual(hex2);
    });
  });

  describe('getRandomString', () => {
    it('should generate strings from charset', () => {
      const service = new SecureRandomService();
      const charset = 'ABC';

      const randomString = service.getRandomString(charset, 10);

      expect(randomString).toHaveLength(10);
      for (const char of randomString) {
        expect(charset).toContain(char);
      }
    });

    it('should throw error for empty charset', () => {
      const service = new SecureRandomService();

      expect(() => service.getRandomString('', 5)).toThrow('Charset cannot be empty');
      expect(() => service.getRandomString(null, 5)).toThrow('Charset cannot be empty');
    });

    it('should throw error for invalid length', () => {
      const service = new SecureRandomService();

      expect(() => service.getRandomString('ABC', 0)).toThrow('Length must be positive');
      expect(() => service.getRandomString('ABC', -1)).toThrow('Length must be positive');
    });
  });

  describe('getRandomAlphanumeric', () => {
    it('should generate alphanumeric strings with default options', () => {
      const service = new SecureRandomService();

      const result = service.getRandomAlphanumeric(10);

      expect(result).toHaveLength(10);
      expect(/^[A-Za-z0-9]+$/.test(result)).toBe(true);
    });

    it('should respect charset options', () => {
      const service = new SecureRandomService();

      const uppercaseOnly = service.getRandomAlphanumeric(10, {
        uppercase: true,
        lowercase: false,
        numbers: false
      });
      expect(/^[A-Z]+$/.test(uppercaseOnly)).toBe(true);

      const numbersOnly = service.getRandomAlphanumeric(10, {
        uppercase: false,
        lowercase: false,
        numbers: true
      });
      expect(/^[0-9]+$/.test(numbersOnly)).toBe(true);
    });

    it('should exclude specified characters', () => {
      const service = new SecureRandomService();

      const result = service.getRandomAlphanumeric(10, {
        exclude: 'A1'
      });

      expect(result).not.toContain('A');
      expect(result).not.toContain('1');
    });

    it('should throw error when charset becomes empty', () => {
      const service = new SecureRandomService();

      expect(() => service.getRandomAlphanumeric(5, {
        uppercase: false,
        lowercase: false,
        numbers: false
      })).toThrow('Charset is empty after applying options');
    });
  });

  describe('Device ID Generation', () => {
    it('should generate device IDs of correct format', () => {
      const service = new SecureRandomService();

      const deviceId = service.generateDeviceId();

      expect(deviceId).toHaveLength(16);
      expect(/^[0-9a-f]+$/.test(deviceId)).toBe(true);
    });

    it('should generate unique device IDs', () => {
      const service = new SecureRandomService();

      const id1 = service.generateDeviceId();
      const id2 = service.generateDeviceId();

      expect(id1).not.toEqual(id2);
    });

    it('should generate timestamp-based IDs', () => {
      const service = new SecureRandomService();

      const id = service.generateTimestampId();

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(10); // Should include timestamp + random part
    });
  });

  describe('Self Test', () => {
    it('should pass self test when working correctly', () => {
      const service = new SecureRandomService();

      const result = service.selfTest();

      expect(result).toBe(true);
    });

    it('should fail self test when crypto not available', () => {
      const service = new SecureRandomService();
      service.isAvailable = false;

      const result = service.selfTest();

      expect(result).toBe(false);
    });
  });

  describe('Integration with Invite Code Generation', () => {
    it('should work with invite code character set', () => {
      const service = new SecureRandomService();
      const INVITE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

      // Generate code similar to invite code generation
      let code = "";
      for (let i = 0; i < 8; i++) {
        if (i === 4) {
          code += "-";
        }
        const randomIndex = service.getRandomInt(INVITE_CHARS.length);
        code += INVITE_CHARS[randomIndex];
      }

      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
    });
  });

  describe('Cross-platform Compatibility', () => {
    it('should work on web platform', () => {
      jest.doMock('../platform', () => ({
        isWeb: true,
        isMobile: false
      }));

      const service = new SecureRandomService();
      expect(service.checkAvailability()).toBe(true);
    });

    it('should work on mobile platform', () => {
      jest.doMock('../platform', () => ({
        isWeb: false,
        isMobile: true
      }));

      // Mock global.crypto for mobile
      global.crypto = mockCrypto;

      const service = new SecureRandomService();
      expect(service.checkAvailability()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle crypto.getRandomValues errors gracefully', () => {
      const service = new SecureRandomService();

      mockCrypto.getRandomValues.mockImplementation(() => {
        throw new Error('Crypto failure');
      });

      expect(() => service.getRandomBytes(16)).toThrow('Crypto failure');
    });

    it('should validate input parameters', () => {
      const service = new SecureRandomService();

      // Test parameter validation across methods
      expect(() => service.getRandomBytes(-1)).toThrow();
      expect(() => service.getRandomInt(0)).toThrow();
      expect(() => service.getRandomHex(3)).toThrow();
      expect(() => service.getRandomString('', 5)).toThrow();
    });
  });

  describe('Security Properties', () => {
    it('should use crypto.getRandomValues for entropy', () => {
      // Reset mock implementation before this test
      mockCrypto.getRandomValues.mockReset();
      mockCrypto.getRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = (i * 17 + 42) % 256;
        }
        return array;
      });

      const service = new SecureRandomService();
      service.getRandomBytes(16);

      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });

    it('should use rejection sampling for uniform distribution', () => {
      const service = new SecureRandomService();

      // Mock to force rejection sampling
      let callCount = 0;
      mockCrypto.getRandomValues.mockImplementation((array) => {
        if (callCount === 0) {
          // First call: return max value to trigger rejection
          array[0] = 255;
          callCount++;
        } else {
          // Second call: return valid value
          array[0] = 0;
        }
        return array;
      });

      const result = service.getRandomInt(100);

      expect(mockCrypto.getRandomValues).toHaveBeenCalledTimes(2);
      expect(result).toBe(0);
    });
  });
});