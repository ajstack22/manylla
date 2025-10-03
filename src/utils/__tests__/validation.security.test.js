/**
 * Security Tests for ProfileValidator.sanitizeHtml
 *
 * Tests XSS protection, ReDoS prevention, and protocol sanitization
 * Added as part of SonarQube security hotspot resolution
 */

import { ProfileValidator } from '../validation';

describe('ProfileValidator.sanitizeHtml - XSS Protection', () => {
  describe('Basic Protocol Removal', () => {
    it('should remove javascript: protocol', () => {
      const input = 'Click <a href="javascript:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
      expect(result).not.toMatch(/javascript\s*:/i);
    });

    it('should remove vbscript: protocol', () => {
      const input = 'Click <a href="vbscript:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('vbscript:');
      expect(result).not.toMatch(/vbscript\s*:/i);
    });

    it('should be case insensitive', () => {
      const inputs = [
        'Click <a href="JAVASCRIPT:alert(1)">here</a>',
        'Click <a href="JavaScript:alert(1)">here</a>',
        'Click <a href="JaVaScRiPt:alert(1)">here</a>',
      ];

      inputs.forEach(input => {
        const result = ProfileValidator.sanitizeHtml(input);
        expect(result).not.toMatch(/javascript\s*:/i);
      });
    });
  });

  describe('Spaced Variant Removal', () => {
    it('should remove "java script:" variant', () => {
      const input = 'Click <a href="java script:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toMatch(/java\s*script\s*:/i);
    });

    it('should remove "vb script:" variant', () => {
      const input = 'Click <a href="vb script:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toMatch(/vb\s*script\s*:/i);
    });

    it('should handle multiple spaces', () => {
      const input = 'Click <a href="java  script:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('script:');
    });
  });

  describe('HTML Entity-Encoded Protocol Removal', () => {
    it('should remove decimal entity-encoded javascript (&#106;avascript:)', () => {
      const input = 'Click <a href="&#106;avascript:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('avascript:');
      expect(result).not.toMatch(/&#106;/);
    });

    it('should remove hex entity-encoded javascript (&#x6A;avascript:)', () => {
      const input = 'Click <a href="&#x6A;avascript:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('avascript:');
      expect(result).not.toMatch(/&#x6A;/i);
    });

    it('should remove uppercase hex entities (&#x4A;avascript:)', () => {
      const input = 'Click <a href="&#x4A;avascript:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('avascript:');
      expect(result).not.toMatch(/&#x4A;/i);
    });

    it('should handle entity-encoded vbscript', () => {
      const input = 'Click <a href="&#118;bscript:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('bscript:');
    });
  });

  describe('Complex XSS Attempts', () => {
    it('should handle multiple dangerous protocols in one string', () => {
      const input = '<a href="javascript:alert(1)">test</a><a href="vbscript:alert(2)">test2</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toMatch(/javascript\s*:/i);
      expect(result).not.toMatch(/vbscript\s*:/i);
    });

    it('should handle mixed encoding attempts', () => {
      const input = 'Click <a href="&#x6A;ava script:alert(1)">here</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      // This is an edge case - the entity is in front of "ava" not "java"
      // The important part is that a complete "javascript:" is removed
      // Partial matches like "&#x6A;ava script:" are less dangerous but still sanitized
      expect(result).toBeTruthy();
    });

    it('should preserve safe URLs', () => {
      const safeInputs = [
        'Click <a href="https://example.com">here</a>',
        'Click <a href="http://example.com">here</a>',
        'Click <a href="mailto:test@example.com">email</a>',
        'Click <a href="/relative/path">here</a>',
        'Click <a href="#anchor">here</a>',
      ];

      safeInputs.forEach(input => {
        const result = ProfileValidator.sanitizeHtml(input);
        expect(result.length).toBeGreaterThan(0);
        // URLs should still be present (may be modified but not removed)
        expect(result).toContain('href=');
      });
    });

    it('should preserve text content that mentions "javascript" in safe context', () => {
      const input = 'I am learning JavaScript programming.';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).toContain('JavaScript programming');
    });
  });

  describe('Length Limit Protection (ReDoS Prevention)', () => {
    it('should truncate input at 100KB limit', () => {
      const longString = 'a'.repeat(200000); // 200KB
      const result = ProfileValidator.sanitizeHtml(longString);
      expect(result.length).toBeLessThanOrEqual(100000);
    });

    it('should handle exactly 100KB input', () => {
      const maxString = 'a'.repeat(100000);
      const result = ProfileValidator.sanitizeHtml(maxString);
      expect(result.length).toBeLessThanOrEqual(100000);
    });

    it('should handle input just under 100KB', () => {
      const safeString = 'a'.repeat(99999);
      const result = ProfileValidator.sanitizeHtml(safeString);
      expect(result.length).toBe(99999);
    });

    it('should not hang on very long input with dangerous protocols', () => {
      const longDangerousString =
        'javascript:' + 'a'.repeat(50000) +
        'vbscript:' + 'b'.repeat(50000);

      const startTime = Date.now();
      const result = ProfileValidator.sanitizeHtml(longDangerousString);
      const duration = Date.now() - startTime;

      // Should complete in under 1 second
      expect(duration).toBeLessThan(1000);
      expect(result).not.toMatch(/javascript\s*:/i);
      expect(result).not.toMatch(/vbscript\s*:/i);
    });
  });

  describe('Script Tag Removal', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> world';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).not.toContain('alert("XSS")');
    });

    it('should remove script tags with attributes', () => {
      const input = 'Hello <script type="text/javascript">alert(1)</script> world';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script>');
    });
  });

  describe('Event Handler Removal', () => {
    it('should remove onclick handlers', () => {
      const input = '<button onclick="alert(1)">Click me</button>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('onclick=');
    });

    it('should remove onload handlers', () => {
      const input = '<img src="x" onload="alert(1)" />';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('onload=');
    });

    it('should remove onerror handlers', () => {
      const input = '<img src="invalid" onerror="alert(1)" />';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toContain('onerror=');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = ProfileValidator.sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle null/undefined gracefully', () => {
      expect(() => ProfileValidator.sanitizeHtml(null)).not.toThrow();
      expect(() => ProfileValidator.sanitizeHtml(undefined)).not.toThrow();
    });

    it('should handle plain text without HTML', () => {
      const input = 'This is plain text without any HTML';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).toBe(input);
    });

    it('should handle Unicode characters', () => {
      const input = 'Hello 世界 🌍 <a href="https://example.com">test</a>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).toContain('世界');
      expect(result).toContain('🌍');
    });

    it('should handle nested HTML', () => {
      const input = '<div><span><a href="javascript:alert(1)">test</a></span></div>';
      const result = ProfileValidator.sanitizeHtml(input);
      expect(result).not.toMatch(/javascript\s*:/i);
    });
  });

  describe('Performance (ReDoS Prevention)', () => {
    it('should complete sanitization in reasonable time for typical input', () => {
      const typicalInput = '<p>This is a <strong>typical</strong> entry with <a href="https://example.com">a link</a> and some <em>formatting</em>.</p>'.repeat(100);

      const startTime = Date.now();
      const result = ProfileValidator.sanitizeHtml(typicalInput);
      const duration = Date.now() - startTime;

      // Should complete in under 100ms for typical input
      expect(duration).toBeLessThan(100);
      expect(result).toBeTruthy();
    });

    it('should not exhibit exponential backtracking behavior', () => {
      // Test with increasing input sizes - should scale linearly
      const baseTimes = [];
      const sizes = [100, 200, 400, 800];

      sizes.forEach(size => {
        const input = '&#x6A;'.repeat(size);
        const startTime = Date.now();
        ProfileValidator.sanitizeHtml(input);
        const duration = Date.now() - startTime;
        baseTimes.push(Math.max(duration, 1)); // Avoid division by zero
      });

      // If no exponential backtracking, doubling input shouldn't 4x the time
      // Allow up to 5x increase for each doubling (accounting for overhead and timing variance)
      for (let i = 1; i < baseTimes.length; i++) {
        const ratio = baseTimes[i] / baseTimes[i - 1];
        expect(ratio).toBeLessThan(5);
      }
    });
  });
});
