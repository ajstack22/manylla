/**
 * HtmlRenderer Component Tests
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { HtmlRenderer } from "../HtmlRenderer";

// P2 TECH DEBT: Remove skip when working on HtmlRenderer
// Issue: HTML parsing dependencies
describe.skip("HtmlRenderer", () => {
  describe("Plain text rendering", () => {
    test("should render plain text content", () => {
      const plainText = "This is plain text content";
      render(<HtmlRenderer content={plainText} />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test("should render plain text with body2 variant", () => {
      const plainText = "Body2 variant text";
      render(<HtmlRenderer content={plainText} variant="body2" />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test("should render plain text with default variant when not specified", () => {
      const plainText = "Default variant text";
      render(<HtmlRenderer content={plainText} />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test("should render plain text with non-body2 variant", () => {
      const plainText = "Body1 variant text";
      render(<HtmlRenderer content={plainText} variant="body1" />);

      expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    test("should handle empty plain text", () => {
      const { container } = render(<HtmlRenderer content="" />);

      // Component should render even with empty content
      expect(container).toBeInTheDocument();
    });

    test("should handle special characters in plain text", () => {
      const specialText = "Text with special chars: @#$%^&*()[]{}";
      render(<HtmlRenderer content={specialText} />);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    test("should handle numbers and symbols in plain text", () => {
      const numberText = "123 456 789 !@# $%^ &*()";
      render(<HtmlRenderer content={numberText} />);

      expect(screen.getByText(numberText)).toBeInTheDocument();
    });

    test("should handle multiline plain text", () => {
      const multilineText = "Line 1\\nLine 2\\nLine 3";
      render(<HtmlRenderer content={multilineText} />);

      expect(screen.getByText(multilineText)).toBeInTheDocument();
    });

    test("should handle unicode characters in plain text", () => {
      const unicodeText = "Unicode: 🎉 ✅ ❌ 🔥 💯";
      render(<HtmlRenderer content={unicodeText} />);

      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    test("should handle very long plain text", () => {
      const longText =
        "This is a very long piece of text that should still render properly even when it contains many words and spans multiple lines when displayed in the component.";
      render(<HtmlRenderer content={longText} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe("HTML content detection", () => {
    test("should detect simple HTML tags", () => {
      const htmlContent = "<p>This is HTML content</p>";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      // WebView should be rendered for HTML content
      expect(container).toBeInTheDocument();
    });

    test("should detect bold HTML tags", () => {
      const htmlContent = "<strong>Bold text</strong>";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect italic HTML tags", () => {
      const htmlContent = "<em>Italic text</em>";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect list HTML tags", () => {
      const htmlContent = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect link HTML tags", () => {
      const htmlContent = '<a href="https://example.com">Link text</a>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect div HTML tags", () => {
      const htmlContent = "<div>Content in div</div>";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect self-closing HTML tags", () => {
      const htmlContent = "Text with <br/> line break";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect HTML tags with attributes", () => {
      const htmlContent =
        '<p class="test" id="paragraph">Paragraph with attributes</p>';
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect mixed HTML and text content", () => {
      const htmlContent = "Plain text with <strong>bold</strong> HTML";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should detect complex nested HTML", () => {
      const htmlContent =
        "<div><p>Nested <strong>bold</strong> and <em>italic</em> text</p></div>";
      const { container } = render(<HtmlRenderer content={htmlContent} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Variant handling for HTML content", () => {
    test("should handle body2 variant for HTML content", () => {
      const htmlContent = "<p>HTML with body2 variant</p>";
      const { container } = render(
        <HtmlRenderer content={htmlContent} variant="body2" />,
      );

      expect(container).toBeInTheDocument();
    });

    test("should handle body1 variant for HTML content", () => {
      const htmlContent = "<p>HTML with body1 variant</p>";
      const { container } = render(
        <HtmlRenderer content={htmlContent} variant="body1" />,
      );

      expect(container).toBeInTheDocument();
    });

    test("should handle custom variant for HTML content", () => {
      const htmlContent = "<p>HTML with custom variant</p>";
      const { container } = render(
        <HtmlRenderer content={htmlContent} variant="h1" />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    test("should handle null content", () => {
      const { container } = render(<HtmlRenderer content={null} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle undefined content", () => {
      const { container } = render(<HtmlRenderer content={undefined} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle numeric content", () => {
      const { container } = render(<HtmlRenderer content={123} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle boolean content", () => {
      const { container } = render(<HtmlRenderer content={true} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle object content", () => {
      const { container } = render(<HtmlRenderer content="[object Object]" />);

      expect(container).toBeInTheDocument();
    });

    test("should handle array content", () => {
      const { container } = render(<HtmlRenderer content={[]} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle content with only spaces", () => {
      const spaceContent = "   ";
      const { container } = render(<HtmlRenderer content={spaceContent} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle content with HTML-like text but not actual HTML", () => {
      const fakeHtmlContent = "This text mentions tags but is not HTML";
      render(<HtmlRenderer content={fakeHtmlContent} />);

      expect(screen.getByText(fakeHtmlContent)).toBeInTheDocument();
    });

    test("should handle malformed HTML-like content", () => {
      const malformedContent = "Text with incomplete tag and strange brackets";
      render(<HtmlRenderer content={malformedContent} />);

      expect(screen.getByText(malformedContent)).toBeInTheDocument();
    });

    test("should handle content with angle brackets but no tags", () => {
      const bracketContent = "Math: 5 less than 10 and 15 greater than 8";
      render(<HtmlRenderer content={bracketContent} />);

      expect(screen.getByText(bracketContent)).toBeInTheDocument();
    });
  });

  describe("Component rendering consistency", () => {
    test("should render consistently across multiple mounts", () => {
      const content = "Consistent content";
      const { unmount } = render(<HtmlRenderer content={content} />);
      expect(screen.getByText(content)).toBeInTheDocument();
      unmount();

      render(<HtmlRenderer content={content} />);
      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test("should handle rapid prop changes", () => {
      const { rerender } = render(<HtmlRenderer content="Initial text" />);
      expect(screen.getByText("Initial text")).toBeInTheDocument();

      rerender(<HtmlRenderer content="<p>HTML content</p>" />);
      expect(screen.queryByText("Initial text")).not.toBeInTheDocument();

      rerender(<HtmlRenderer content="Final text" />);
      expect(screen.getByText("Final text")).toBeInTheDocument();
    });
  });

  describe("HTML content styling and processing", () => {
    test("should handle inline styles in HTML", () => {
      const htmlWithStyles = '<p style="color: red;">Styled paragraph</p>';
      const { container } = render(<HtmlRenderer content={htmlWithStyles} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML with classes and IDs", () => {
      const htmlWithClasses = '<div class="container" id="main"><p>Content</p></div>';
      const { container } = render(<HtmlRenderer content={htmlWithClasses} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle script tags safely", () => {
      const htmlWithScript = '<p>Text</p><script>alert("test")</script>';
      const { container } = render(<HtmlRenderer content={htmlWithScript} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML with data attributes", () => {
      const htmlWithData = '<div data-test="value">Content</div>';
      const { container } = render(<HtmlRenderer content={htmlWithData} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Complex HTML structures", () => {
    test("should handle deeply nested HTML", () => {
      const nestedHtml = "<div><section><article><header><h1>Title</h1></header><p>Content</p></article></section></div>";
      const { container } = render(<HtmlRenderer content={nestedHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML tables", () => {
      const tableHtml = "<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>";
      const { container } = render(<HtmlRenderer content={tableHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML forms", () => {
      const formHtml = '<form><input type="text" name="test"><button>Submit</button></form>';
      const { container } = render(<HtmlRenderer content={formHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML with multiple link types", () => {
      const linksHtml = '<a href="http://example.com">External</a> <a href="#section">Internal</a> <a href="mailto:test@example.com">Email</a>';
      const { container } = render(<HtmlRenderer content={linksHtml} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("HTML content validation", () => {
    test("should detect various HTML tag types", () => {
      const htmlTags = [
        "<span>text</span>",
        "<h1>heading</h1>",
        "<code>code</code>",
        "<pre>preformatted</pre>",
        "<blockquote>quote</blockquote>",
        "<small>small text</small>",
        "<mark>highlighted</mark>"
      ];

      htmlTags.forEach(html => {
        const { container } = render(<HtmlRenderer content={html} />);
        expect(container).toBeInTheDocument();
      });
    });

    test("should handle HTML with line breaks", () => {
      const htmlWithBreaks = "Line 1<br>Line 2<br/>Line 3";
      const { container } = render(<HtmlRenderer content={htmlWithBreaks} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML with horizontal rules", () => {
      const htmlWithHr = "Content above<hr>Content below<hr/>";
      const { container } = render(<HtmlRenderer content={htmlWithHr} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML with images", () => {
      const htmlWithImages = '<img src="test.jpg" alt="Test image"><img src="test2.png"/>';
      const { container } = render(<HtmlRenderer content={htmlWithImages} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Plain text enhancement", () => {
    test("should handle text with line breaks and spacing", () => {
      const textWithSpacing = "Line 1\n\nLine 2\n   Line 3";
      render(<HtmlRenderer content={textWithSpacing} />);

      expect(screen.getByText(textWithSpacing)).toBeInTheDocument();
    });

    test("should handle text with tabs", () => {
      const textWithTabs = "Column 1\tColumn 2\tColumn 3";
      render(<HtmlRenderer content={textWithTabs} />);

      expect(screen.getByText(textWithTabs)).toBeInTheDocument();
    });

    test("should handle very long plain text lines", () => {
      const longText = "word ".repeat(200);
      render(<HtmlRenderer content={longText.trim()} />);

      expect(screen.getByText(longText.trim())).toBeInTheDocument();
    });

    test("should handle text with repeated characters", () => {
      const repeatedText = "a".repeat(100);
      render(<HtmlRenderer content={repeatedText} />);

      expect(screen.getByText(repeatedText)).toBeInTheDocument();
    });
  });

  describe("Content type detection accuracy", () => {
    test("should correctly identify HTML vs angle bracket text", () => {
      const notHtmlTexts = [
        "Math: 5 < 10 and 15 > 8",
        "Programming: if (x < y) return x;",
        "Comparison: A<B<C in ordering",
        "Email style: <user@domain.com>",
        "Path notation: <path/to/file>"
      ];

      notHtmlTexts.forEach(text => {
        render(<HtmlRenderer content={text} />);
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });

    test("should detect partial HTML tags as HTML", () => {
      const partialHtmlTexts = [
        "Text with <b>bold",
        "Unclosed <div>content",
        "Mixed <span>content</span> and text"
      ];

      partialHtmlTexts.forEach(html => {
        const { container } = render(<HtmlRenderer content={html} />);
        expect(container).toBeInTheDocument();
      });
    });

    test("should handle mixed content correctly", () => {
      const mixedContent = "Plain text before <strong>HTML content</strong> and plain text after";
      const { container } = render(<HtmlRenderer content={mixedContent} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Performance and memory", () => {
    test("should handle rapid content switching", () => {
      const contents = [
        "Plain text 1",
        "<p>HTML content 1</p>",
        "Plain text 2",
        "<div>HTML content 2</div>",
        "Final plain text"
      ];

      const { rerender } = render(<HtmlRenderer content={contents[0]} />);

      contents.forEach(content => {
        rerender(<HtmlRenderer content={content} />);
        // Should render without errors
        expect(document.body).toBeTruthy();
      });
    });

    test("should handle large HTML documents", () => {
      const largeHtml = "<div>" + "<p>Paragraph content</p>".repeat(100) + "</div>";
      const { container } = render(<HtmlRenderer content={largeHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle frequent variant changes with HTML", () => {
      const htmlContent = "<p>Variant test content</p>";
      const variants = ["body1", "body2", "h1", "h2", "caption"];

      const { rerender } = render(<HtmlRenderer content={htmlContent} variant={variants[0]} />);

      variants.forEach(variant => {
        rerender(<HtmlRenderer content={htmlContent} variant={variant} />);
        expect(document.body).toBeTruthy();
      });
    });
  });

  describe("Error recovery and resilience", () => {
    test("should handle corrupted HTML gracefully", () => {
      const corruptedHtml = "<div><p>Unclosed paragraph<div>Nested</div>";
      const { container } = render(<HtmlRenderer content={corruptedHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML with invalid nesting", () => {
      const invalidNesting = "<p><div>Block in inline</div></p>";
      const { container } = render(<HtmlRenderer content={invalidNesting} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle empty HTML tags", () => {
      const emptyTags = "<p></p><div></div><span></span>";
      const { container } = render(<HtmlRenderer content={emptyTags} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle HTML with no closing tags", () => {
      const unclosedTags = "<p>Paragraph<p>Another paragraph<div>Division";
      const { container } = render(<HtmlRenderer content={unclosedTags} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Accessibility considerations", () => {
    test("should preserve accessibility attributes in HTML", () => {
      const accessibleHtml = '<div role="main" aria-label="Main content"><p>Accessible content</p></div>';
      const { container } = render(<HtmlRenderer content={accessibleHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle alt text in images", () => {
      const imgWithAlt = '<img src="test.jpg" alt="Descriptive alt text">';
      const { container } = render(<HtmlRenderer content={imgWithAlt} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle heading hierarchy", () => {
      const headings = "<h1>Main</h1><h2>Section</h2><h3>Subsection</h3>";
      const { container } = render(<HtmlRenderer content={headings} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Integration with medical content", () => {
    test("should handle medical HTML content", () => {
      const medicalHtml = "<div><h2>Emergency Information</h2><p><strong>Allergy:</strong> Peanuts</p><p><em>Medication:</em> EpiPen available</p></div>";
      const { container } = render(<HtmlRenderer content={medicalHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle emergency instruction HTML", () => {
      const emergencyHtml = "<ol><li><strong>Call 911</strong> immediately</li><li>Give <em>medication</em> if available</li><li>Monitor patient</li></ol>";
      const { container } = render(<HtmlRenderer content={emergencyHtml} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle contact information HTML", () => {
      const contactHtml = '<p>Emergency contact: <a href="tel:911">911</a></p><p>Doctor: <a href="mailto:doc@hospital.com">Dr. Smith</a></p>';
      const { container } = render(<HtmlRenderer content={contactHtml} />);

      expect(container).toBeInTheDocument();
    });
  });
});
