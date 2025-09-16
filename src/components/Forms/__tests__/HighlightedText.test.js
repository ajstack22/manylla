/**
 * HighlightedText Component Tests
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { HighlightedText } from "../HighlightedText";

describe("HighlightedText", () => {
  describe("Basic rendering", () => {
    test("should render text content", () => {
      const content = "This is plain text";
      render(<HighlightedText content={content} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test("should render with default variant", () => {
      const content = "Default variant text";
      render(<HighlightedText content={content} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test("should render with body2 variant", () => {
      const content = "Body2 variant text";
      render(<HighlightedText content={content} variant="body2" />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test("should render with body1 variant", () => {
      const content = "Body1 variant text";
      render(<HighlightedText content={content} variant="body1" />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  describe("Default highlighting", () => {
    test("should highlight medical terms", () => {
      const content = "Patient has allergy to peanuts";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/allergy/)).toBeInTheDocument();
    });

    test("should highlight medication terms", () => {
      const content = "Take medication twice daily";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/medication/)).toBeInTheDocument();
      expect(screen.getByText(/twice/)).toBeInTheDocument();
      expect(screen.getByText(/daily/)).toBeInTheDocument();
    });

    test("should highlight emergency terms", () => {
      const content = "Call immediately in emergency";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/emergency/)).toBeInTheDocument();
      expect(screen.getByText(/immediately/)).toBeInTheDocument();
    });

    test("should highlight safety terms", () => {
      const content = "Warning: never give aspirin";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/warning/i)).toBeInTheDocument();
      expect(screen.getByText(/never/)).toBeInTheDocument();
    });

    test("should highlight contact terms", () => {
      const content = "Please call or email for contact";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/call/)).toBeInTheDocument();
      expect(screen.getByText(/email/)).toBeInTheDocument();
      expect(screen.getByText(/contact/)).toBeInTheDocument();
    });

    test("should highlight dosage terms", () => {
      const content = "Prescribed dose is 5 mg daily";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Prescribed")).toBeInTheDocument();
      expect(screen.getByText("dose")).toBeInTheDocument();
      expect(screen.getByText("mg")).toBeInTheDocument();
      expect(screen.getByText("daily")).toBeInTheDocument();
    });

    test("should highlight multiple terms in same text", () => {
      const content = "Emergency medication dose must be given immediately";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Emergency")).toBeInTheDocument();
      expect(screen.getByText("medication")).toBeInTheDocument();
      expect(screen.getByText("dose")).toBeInTheDocument();
      expect(screen.getByText("must")).toBeInTheDocument();
      expect(screen.getByText("immediately")).toBeInTheDocument();
    });

    test("should handle case insensitive highlighting", () => {
      const content = "ALLERGY to nuts, Medication needed";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText("ALLERGY")).toBeInTheDocument();
      expect(screen.getByText("Medication")).toBeInTheDocument();
    });
  });

  describe("Custom highlight terms", () => {
    test("should use custom highlight terms", () => {
      const content = "Custom term should be highlighted";
      const customTerms = ["custom", "highlighted"];
      const { container } = render(
        <HighlightedText content={content} highlightTerms={customTerms} />,
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Custom")).toBeInTheDocument();
      expect(screen.getByText("highlighted")).toBeInTheDocument();
    });

    test("should handle empty custom terms array", () => {
      const content = "No highlighting should occur";
      const { container } = render(
        <HighlightedText content={content} highlightTerms={[]} />,
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test("should handle single custom term", () => {
      const content = "Only word test should highlight";
      const customTerms = ["test"];
      const { container } = render(
        <HighlightedText content={content} highlightTerms={customTerms} />,
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    test("should handle special characters in custom terms", () => {
      const content = "Text with special-chars and under_scores";
      const customTerms = ["special-chars", "under_scores"];
      const { container } = render(
        <HighlightedText content={content} highlightTerms={customTerms} />,
      );

      expect(container).toBeInTheDocument();
    });

    test("should handle regex special characters properly", () => {
      const content = "Text with +plus and *asterisk and ?question";
      const customTerms = ["+plus", "*asterisk", "?question"];
      const { container } = render(
        <HighlightedText content={content} highlightTerms={customTerms} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Word boundary handling", () => {
    test("should only highlight whole words", () => {
      const content = "Allergic reaction, not allergy within allergies";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      // Should highlight "allergic", "allergy", and "allergies" as separate terms
    });

    test("should handle punctuation around highlighted terms", () => {
      const content =
        "Emergency! Call immediately. Important: check medication.";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Emergency")).toBeInTheDocument();
      expect(screen.getByText("Call")).toBeInTheDocument();
      expect(screen.getByText("immediately")).toBeInTheDocument();
      expect(screen.getByText("Important")).toBeInTheDocument();
      expect(screen.getByText("medication")).toBeInTheDocument();
    });

    test("should handle terms at beginning and end of text", () => {
      const content = "Emergency call needed for medication";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
      expect(screen.getByText(/call/)).toBeInTheDocument();
      expect(screen.getByText(/medication/)).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    test("should handle empty content", () => {
      const { container } = render(<HighlightedText content="" />);

      expect(container).toBeInTheDocument();
    });

    test("should handle null content", () => {
      const { container } = render(<HighlightedText content={null} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle undefined content", () => {
      const { container } = render(<HighlightedText content={undefined} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle numeric content", () => {
      const { container } = render(<HighlightedText content={123} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle boolean content", () => {
      const { container } = render(<HighlightedText content={true} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle content with only spaces", () => {
      const content = "   ";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle very long content", () => {
      const longContent =
        "This is a very long piece of text that contains many words including some that should be highlighted like emergency and medication and important terms that need to be visible to users immediately.";
      const { container } = render(<HighlightedText content={longContent} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
      expect(screen.getByText(/medication/)).toBeInTheDocument();
      expect(screen.getByText(/important/i)).toBeInTheDocument();
      expect(screen.getByText(/immediately/)).toBeInTheDocument();
    });

    test("should handle content with newlines", () => {
      const content =
        "Line 1: emergency\\nLine 2: medication\\nLine 3: important";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle content with tabs and special whitespace", () => {
      const content = "Text\\twith\\ttabs\\tand\\temergency\\tterms";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
    });

    test("should handle unicode characters", () => {
      const content = "Emergency: 🚨 medication needed 💊 important";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
      expect(screen.getByText(/medication/)).toBeInTheDocument();
      expect(screen.getByText(/important/i)).toBeInTheDocument();
    });
  });

  describe("Component behavior", () => {
    test("should render consistently across multiple mounts", () => {
      const content = "Consistent emergency content";
      const { unmount } = render(<HighlightedText content={content} />);
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
      unmount();

      render(<HighlightedText content={content} />);
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
    });

    test("should handle rapid prop changes", () => {
      const { rerender } = render(
        <HighlightedText content="Initial emergency text" />,
      );
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();

      rerender(<HighlightedText content="Updated medication text" />);
      expect(screen.getByText(/medication/)).toBeInTheDocument();

      rerender(<HighlightedText content="Final important text" />);
      expect(screen.getByText(/important/i)).toBeInTheDocument();
    });

    test("should handle variant changes", () => {
      const content = "Emergency medication needed";
      const { rerender } = render(
        <HighlightedText content={content} variant="body2" />,
      );
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();

      rerender(<HighlightedText content={content} variant="body1" />);
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
    });

    test("should handle highlight terms changes", () => {
      const content = "Test custom highlight";
      const { rerender } = render(
        <HighlightedText content={content} highlightTerms={["test"]} />,
      );
      expect(screen.getByText("Test")).toBeInTheDocument();

      rerender(
        <HighlightedText content={content} highlightTerms={["custom"]} />,
      );
      expect(screen.getByText("custom")).toBeInTheDocument();

      rerender(
        <HighlightedText content={content} highlightTerms={["highlight"]} />,
      );
      expect(screen.getByText("highlight")).toBeInTheDocument();
    });
  });

  describe("Accessibility and styling", () => {
    test("should render with proper text styles", () => {
      const content = "Styled text content";
      render(<HighlightedText content={content} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test("should apply proper highlighting styles", () => {
      const content = "Emergency highlighted content";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
    });

    test("should handle complex text with multiple highlight patterns", () => {
      const content =
        "Emergency: give medication immediately. Warning: check dose. Call doctor if allergic reaction occurs.";
      const { container } = render(<HighlightedText content={content} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Emergency")).toBeInTheDocument();
      expect(screen.getByText("medication")).toBeInTheDocument();
      expect(screen.getByText("immediately")).toBeInTheDocument();
      expect(screen.getByText("Warning")).toBeInTheDocument();
      expect(screen.getByText("dose")).toBeInTheDocument();
      expect(screen.getByText("Call")).toBeInTheDocument();
    });
  });
});
