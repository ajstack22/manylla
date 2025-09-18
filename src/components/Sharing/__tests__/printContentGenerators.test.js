/* eslint-disable */
/**
 * Smoke tests for printContentGenerators
 * Tests basic functionality of print content generation utilities
 */
import {
  escapeHtml,
  generateTextContent,
  generateHtmlContent,
} from '../printContentGenerators';

describe('printContentGenerators', () => {
  const mockData = {
    childName: 'Alex Smith',
    recipientName: 'Dr. Johnson',
    note: 'Special considerations for school.',
    selectedCategories: ['communication', 'medical', 'quick-info'],
    actualEntries: {
      communication: [
        {
          title: 'Uses sign language',
          description: 'Knows basic ASL signs for daily needs',
          date: '2023-01-15',
        },
      ],
      medical: [
        {
          title: 'ADHD medication',
          description: 'Takes Ritalin 5mg twice daily',
          date: '2023-02-01',
        },
      ],
    },
    categoryGroups: {
      communication: {
        categories: ['communication', 'speech'],
      },
    },
    categoryTitles: {
      communication: 'Communication',
      medical: 'Medical Information',
      'quick-info': 'Quick Info',
    },
  };

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const unsafe = '<script>alert("test")</script>';
      const escaped = escapeHtml(unsafe);

      expect(escaped).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should escape ampersands and quotes', () => {
      const text = 'Ben & Jerry\'s "Ice Cream"';
      const escaped = escapeHtml(text);

      expect(escaped).toBe('Ben &amp; Jerry&#039;s &quot;Ice Cream&quot;');
    });

    it('should handle normal text without changes', () => {
      const text = 'Normal text without special characters';
      const escaped = escapeHtml(text);

      expect(escaped).toBe(text);
    });
  });

  describe('generateTextContent', () => {
    it('should generate basic text content with child name', () => {
      const content = generateTextContent({
        childName: 'Alex Smith',
        selectedCategories: [],
      });

      expect(content).toContain('Alex Smith - Information Summary');
      expect(content).toContain('Prepared on');
    });

    it('should include recipient name when provided', () => {
      const content = generateTextContent({
        childName: 'Alex Smith',
        recipientName: 'Dr. Johnson',
        selectedCategories: [],
      });

      expect(content).toContain('For: Dr. Johnson');
    });

    it('should include note when provided', () => {
      const content = generateTextContent({
        childName: 'Alex Smith',
        note: 'Special considerations',
        selectedCategories: [],
      });

      expect(content).toContain('Note: Special considerations');
    });

    it('should generate quick-info section', () => {
      const content = generateTextContent({
        childName: 'Alex Smith',
        selectedCategories: ['quick-info'],
      });

      expect(content).toContain('QUICK INFO');
      expect(content).toContain('Communication:');
      expect(content).toContain('Sensory:');
      expect(content).toContain('Medical:');
      expect(content).toContain('Emergency Contact:');
    });

    it('should generate entries for selected categories', () => {
      // Test with just direct categories for simpler logic
      const simpleData = {
        childName: 'Alex Smith',
        selectedCategories: ['communication'],
        actualEntries: {
          communication: [
            {
              title: 'Uses sign language',
              description: 'Knows basic ASL signs for daily needs',
              date: '2023-01-15',
            },
          ],
        },
        categoryGroups: {
          communication: {
            categories: ['communication'],
          },
        },
        categoryTitles: {
          communication: 'Communication',
        },
      };

      const content = generateTextContent(simpleData);

      expect(content).toContain('Uses sign language');
      expect(content).toContain('Date:');
    });
  });

  describe('generateHtmlContent', () => {
    it('should generate valid HTML structure', () => {
      const html = generateHtmlContent({
        childName: 'Alex Smith',
        selectedCategories: [],
        actualEntries: {},
        categoryTitles: {},
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('should include child name in title and header', () => {
      const html = generateHtmlContent({
        childName: 'Alex Smith',
        selectedCategories: [],
        actualEntries: {},
        categoryTitles: {},
      });

      expect(html).toContain('<title>Alex Smith - Information Summary</title>');
      expect(html).toContain('<h1>Alex Smith - Information Summary</h1>');
    });

    it('should include print button', () => {
      const html = generateHtmlContent({
        childName: 'Alex Smith',
        selectedCategories: [],
        actualEntries: {},
        categoryTitles: {},
      });

      expect(html).toContain('print-button');
      expect(html).toContain('window.print()');
    });

    it('should include note section when note is provided', () => {
      const html = generateHtmlContent({
        childName: 'Alex Smith',
        note: 'Special note',
        selectedCategories: [],
        actualEntries: {},
        categoryTitles: {},
      });

      expect(html).toContain('note-section');
      expect(html).toContain('Special note');
    });

    it('should generate quick-info section in HTML', () => {
      const html = generateHtmlContent({
        childName: 'Alex Smith',
        selectedCategories: ['quick-info'],
        actualEntries: {},
        categoryTitles: {},
      });

      expect(html).toContain('<h2>Quick Info</h2>');
      expect(html).toContain('Communication:');
      expect(html).toContain('Emergency Contact:');
    });

    it('should escape HTML in user content', () => {
      const html = generateHtmlContent({
        childName: 'Alex & <script>',
        note: 'Note with "quotes"',
        selectedCategories: ['communication'],
        actualEntries: {
          communication: [{
            title: 'Title with <tags>',
            description: 'Description with & symbols',
            date: '2023-01-01',
          }],
        },
        categoryTitles: { communication: 'Communication' },
      });

      expect(html).toContain('Alex &amp; &lt;script&gt;');
      expect(html).toContain('Note with &quot;quotes&quot;');
      expect(html).toContain('Title with &lt;tags&gt;');
      expect(html).toContain('Description with &amp; symbols');
    });

    it('should include CSS styles for print and screen', () => {
      const html = generateHtmlContent({
        childName: 'Alex Smith',
        selectedCategories: [],
        actualEntries: {},
        categoryTitles: {},
      });

      expect(html).toContain('@media print');
      expect(html).toContain('@media screen');
      expect(html).toContain('@page');
    });

    it('should include document footer with timestamp', () => {
      const html = generateHtmlContent({
        childName: 'Alex Smith',
        selectedCategories: [],
        actualEntries: {},
        categoryTitles: {},
      });

      expect(html).toContain('document-footer');
      expect(html).toContain('Generated by Manylla');
      expect(html).toContain('This information is confidential');
    });
  });
});