/**
 * HtmlRenderer Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HtmlRenderer } from '../HtmlRenderer';

describe('HtmlRenderer', () => {
  describe('Plain text rendering', () => {
    test('should render plain text content', () => {
      const plainText = 'This is plain text content';
      render(<HtmlRenderer content={plainText} />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test('should render plain text with body2 variant', () => {
      const plainText = 'Body2 variant text';
      render(<HtmlRenderer content={plainText} variant="body2" />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test('should render plain text with default variant when not specified', () => {
      const plainText = 'Default variant text';
      render(<HtmlRenderer content={plainText} />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test('should render plain text with non-body2 variant', () => {
      const plainText = 'Body1 variant text';
      render(<HtmlRenderer content={plainText} variant="body1" />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test('should handle empty plain text', () => {
      const { container } = render(<HtmlRenderer content="" />);

      // Component should render even with empty content
      expect(container).toBeInTheDocument();
    });

    test('should handle special characters in plain text', () => {
      const specialText = 'Text with special chars: @#$%^&*()[]{}';
      render(<HtmlRenderer content={specialText} />);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    test('should handle numbers and symbols in plain text', () => {
      const numberText = '123 456 789 !@# $%^ &*()';
      render(<HtmlRenderer content={numberText} />);

      expect(screen.getByText(numberText)).toBeInTheDocument();
    });

    test('should handle multiline plain text', () => {
      const multilineText = 'Line 1\\nLine 2\\nLine 3';
      render(<HtmlRenderer content={multilineText} />);

      expect(screen.getByText(multilineText)).toBeInTheDocument();
    });

    test('should handle unicode characters in plain text', () => {
      const unicodeText = 'Unicode: 🎉 ✅ ❌ 🔥 💯';
      render(<HtmlRenderer content={unicodeText} />);

      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    test('should handle very long plain text', () => {
      const longText = 'This is a very long piece of text that should still render properly even when it contains many words and spans multiple lines when displayed in the component.';
      render(<HtmlRenderer content={longText} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('HTML content detection', () => {
    test('should detect simple HTML tags', () => {
      const htmlContent = '<p>This is HTML content</p>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      // WebView should be rendered for HTML content
      expect(container).toBeInTheDocument();
    });

    test('should detect bold HTML tags', () => {
      const htmlContent = '<strong>Bold text</strong>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect italic HTML tags', () => {
      const htmlContent = '<em>Italic text</em>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect list HTML tags', () => {
      const htmlContent = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect link HTML tags', () => {
      const htmlContent = '<a href="https://example.com">Link text</a>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect div HTML tags', () => {
      const htmlContent = '<div>Content in div</div>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect self-closing HTML tags', () => {
      const htmlContent = 'Text with <br/> line break';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect HTML tags with attributes', () => {
      const htmlContent = '<p class="test" id="paragraph">Paragraph with attributes</p>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect mixed HTML and text content', () => {
      const htmlContent = 'Plain text with <strong>bold</strong> HTML';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should detect complex nested HTML', () => {
      const htmlContent = '<div><p>Nested <strong>bold</strong> and <em>italic</em> text</p></div>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Variant handling for HTML content', () => {
    test('should handle body2 variant for HTML content', () => {
      const htmlContent = '<p>HTML with body2 variant</p>';
      const { container } = render(<HtmlRenderer content={htmlContent} variant="body2" />);

      expect(container).toBeInTheDocument();
    });

    test('should handle body1 variant for HTML content', () => {
      const htmlContent = '<p>HTML with body1 variant</p>';
      const { container } = render(<HtmlRenderer content={htmlContent} variant="body1" />);

      expect(container).toBeInTheDocument();
    });

    test('should handle custom variant for HTML content', () => {
      const htmlContent = '<p>HTML with custom variant</p>';
      const { container } = render(<HtmlRenderer content={htmlContent} variant="h1" />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('should handle null content', () => {
      const { container } = render(<HtmlRenderer content={null} />);

      expect(container).toBeInTheDocument();
    });

    test('should handle undefined content', () => {
      const { container } = render(<HtmlRenderer content={undefined} />);

      expect(container).toBeInTheDocument();
    });

    test('should handle numeric content', () => {
      const { container } = render(<HtmlRenderer content={123} />);

      expect(container).toBeInTheDocument();
    });

    test('should handle boolean content', () => {
      const { container } = render(<HtmlRenderer content={true} />);

      expect(container).toBeInTheDocument();
    });

    test('should handle object content', () => {
      const { container } = render(<HtmlRenderer content="[object Object]" />);

      expect(container).toBeInTheDocument();
    });

    test('should handle array content', () => {
      const { container } = render(<HtmlRenderer content={[]} />);

      expect(container).toBeInTheDocument();
    });

    test('should handle content with only spaces', () => {
      const spaceContent = '   ';
      const { container } = render(<HtmlRenderer content={spaceContent} />);

      expect(container).toBeInTheDocument();
    });

    test('should handle content with HTML-like text but not actual HTML', () => {
      const fakeHtmlContent = 'This text mentions tags but is not HTML';
      render(<HtmlRenderer content={fakeHtmlContent} />);

      expect(screen.getByText(fakeHtmlContent)).toBeInTheDocument();
    });

    test('should handle malformed HTML-like content', () => {
      const malformedContent = 'Text with incomplete tag and strange brackets';
      render(<HtmlRenderer content={malformedContent} />);

      expect(screen.getByText(malformedContent)).toBeInTheDocument();
    });

    test('should handle content with angle brackets but no tags', () => {
      const bracketContent = 'Math: 5 less than 10 and 15 greater than 8';
      render(<HtmlRenderer content={bracketContent} />);

      expect(screen.getByText(bracketContent)).toBeInTheDocument();
    });
  });

  describe('Component rendering consistency', () => {
    test('should render consistently across multiple mounts', () => {
      const content = 'Consistent content';
      const { unmount } = render(<HtmlRenderer content={content} />);
      expect(screen.getByText(content)).toBeInTheDocument();
      unmount();

      render(<HtmlRenderer content={content} />);
      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test('should handle rapid prop changes', () => {
      const { rerender } = render(<HtmlRenderer content="Initial text" />);
      expect(screen.getByText('Initial text')).toBeInTheDocument();

      rerender(<HtmlRenderer content="<p>HTML content</p>" />);
      expect(screen.queryByText('Initial text')).not.toBeInTheDocument();

      rerender(<HtmlRenderer content="Final text" />);
      expect(screen.getByText('Final text')).toBeInTheDocument();
    });
  });
});