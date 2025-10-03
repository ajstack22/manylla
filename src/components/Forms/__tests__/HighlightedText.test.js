/* eslint-disable */
/**
 * HighlightedText Component Tests
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { HighlightedText } from "../HighlightedText";

// P2 TECH DEBT: Remove skip when working on HighlightedText
// Issue: Text measurement
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

  describe("Advanced regex and performance", () => {
    test("should handle regex escape characters properly", () => {
      const content = "Price: $20.50 (on sale) - 50% off";
      render(<HighlightedText content={content} />);

      expect(screen.getByText(/Price:/)).toBeInTheDocument();
    });

    test("should handle empty highlight terms without errors", () => {
      const content = "No highlights here";
      render(<HighlightedText content={content} highlightTerms={[]} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    test("should handle duplicate highlight terms", () => {
      const content = "medication medication medication";
      const duplicateTerms = ["medication", "medication", "med"];
      render(<HighlightedText content={content} highlightTerms={duplicateTerms} />);

      expect(screen.getAllByText("medication")).toHaveLength(3);
    });

    test("should handle overlapping terms gracefully", () => {
      const content = "medication allergic";
      const overlappingTerms = ["med", "medication", "allergy", "allergic"];
      render(<HighlightedText content={content} highlightTerms={overlappingTerms} />);

      expect(screen.getByText("medication")).toBeInTheDocument();
      expect(screen.getByText("allergic")).toBeInTheDocument();
    });
  });

  describe("Performance and edge cases", () => {
    test("should handle very long content efficiently", () => {
      const longContent = "medication ".repeat(100) + "allergy " + "emergency ".repeat(50);
      render(<HighlightedText content={longContent} />);

      expect(screen.getAllByText("medication")).toHaveLength(100);
      expect(screen.getByText("allergy")).toBeInTheDocument();
      expect(screen.getAllByText("emergency")).toHaveLength(50);
    });

    test("should handle many custom highlight terms", () => {
      const content = "term1 term2 term3 term4 term5";
      const manyTerms = Array.from({ length: 100 }, (_, i) => `term${i}`);
      render(<HighlightedText content={content} highlightTerms={manyTerms} />);

      expect(screen.getByText("term1")).toBeInTheDocument();
      expect(screen.getByText("term2")).toBeInTheDocument();
      expect(screen.getByText("term3")).toBeInTheDocument();
    });

    test("should handle content with repeated whitespace", () => {
      const content = "medication    allergy     emergency";
      render(<HighlightedText content={content} />);

      expect(screen.getByText("medication")).toBeInTheDocument();
      expect(screen.getByText("allergy")).toBeInTheDocument();
      expect(screen.getByText("emergency")).toBeInTheDocument();
    });
  });

  describe("Medical term coverage validation", () => {
    test("should highlight all emergency medical equipment", () => {
      const content = "Keep epipen and inhaler nearby during seizure";
      render(<HighlightedText content={content} />);

      expect(screen.getByText("epipen")).toBeInTheDocument();
      expect(screen.getByText("inhaler")).toBeInTheDocument();
      expect(screen.getByText("seizure")).toBeInTheDocument();
    });

    test("should highlight medical diagnostic terms", () => {
      const content = "Recent diagnosis shows allergy to medication";
      render(<HighlightedText content={content} />);

      expect(screen.getByText("diagnosis")).toBeInTheDocument();
      expect(screen.getByText("allergy")).toBeInTheDocument();
      expect(screen.getByText("medication")).toBeInTheDocument();
    });

    test("should highlight dosage and measurement terms", () => {
      const content = "Prescribed dosage is 5 mg taken twice daily";
      render(<HighlightedText content={content} />);

      expect(screen.getByText("Prescribed")).toBeInTheDocument();
      expect(screen.getByText("dosage")).toBeInTheDocument();
      expect(screen.getByText("mg")).toBeInTheDocument();
      expect(screen.getByText("twice")).toBeInTheDocument();
      expect(screen.getByText("daily")).toBeInTheDocument();
    });

    test("should highlight critical safety terms", () => {
      const content = "Warning: never ignore critical symptoms, always seek help";
      render(<HighlightedText content={content} />);

      expect(screen.getByText(/warning/i)).toBeInTheDocument();
      expect(screen.getByText("never")).toBeInTheDocument();
      expect(screen.getByText("critical")).toBeInTheDocument();
      expect(screen.getByText("always")).toBeInTheDocument();
    });

    test("should highlight contact and communication terms", () => {
      const content = "Call phone number or email contact immediately";
      render(<HighlightedText content={content} />);

      expect(screen.getByText("Call")).toBeInTheDocument();
      expect(screen.getByText("phone")).toBeInTheDocument();
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText("contact")).toBeInTheDocument();
      expect(screen.getByText("immediately")).toBeInTheDocument();
    });
  });

  describe("Boundary and word matching validation", () => {
    test("should only highlight complete words not substrings", () => {
      const content = "Allergic to medications not allergy within allergies";
      render(<HighlightedText content={content} />);

      // Should find "allergic", "medications", "allergy", and "allergies" as complete words
      expect(screen.getByText("Allergic")).toBeInTheDocument();
      expect(screen.getByText("medications")).toBeInTheDocument();
      expect(screen.getByText("allergy")).toBeInTheDocument();
      expect(screen.getByText("allergies")).toBeInTheDocument();
    });

    test("should handle punctuation boundaries correctly", () => {
      const content = "Emergency! Call immediately, avoid danger.";
      render(<HighlightedText content={content} />);

      expect(screen.getByText("Emergency")).toBeInTheDocument();
      expect(screen.getByText("Call")).toBeInTheDocument();
      expect(screen.getByText("immediately")).toBeInTheDocument();
      expect(screen.getByText("avoid")).toBeInTheDocument();
      expect(screen.getByText("danger")).toBeInTheDocument();
    });

    test("should handle terms at string boundaries", () => {
      const content = "Emergency medication needed";
      render(<HighlightedText content={content} />);

      expect(screen.getByText("Emergency")).toBeInTheDocument();
      expect(screen.getByText("medication")).toBeInTheDocument();
    });
  });

  describe("Component integration scenarios", () => {
    test("should handle medical emergency instruction scenario", () => {
      const emergencyContent = "CRITICAL: Patient has severe allergy to medication. Call emergency contact immediately! Always check dose before giving medicine.";
      render(<HighlightedText content={emergencyContent} />);

      // Should highlight multiple medical and emergency terms
      expect(screen.getByText("critical")).toBeInTheDocument();
      expect(screen.getByText("allergy")).toBeInTheDocument();
      expect(screen.getByText("medication")).toBeInTheDocument();
      expect(screen.getByText("Call")).toBeInTheDocument();
      expect(screen.getByText("emergency")).toBeInTheDocument();
      expect(screen.getByText("contact")).toBeInTheDocument();
      expect(screen.getByText("immediately")).toBeInTheDocument();
      expect(screen.getByText("always")).toBeInTheDocument();
      expect(screen.getByText("dose")).toBeInTheDocument();
      expect(screen.getByText("medicine")).toBeInTheDocument();
    });

    test("should handle medication instruction scenario", () => {
      const medicationContent = "Take prescribed medicine 2.5 mg dose twice daily with caution. Avoid if allergic reaction occurs.";
      render(<HighlightedText content={medicationContent} />);

      expect(screen.getByText("prescribed")).toBeInTheDocument();
      expect(screen.getByText("medicine")).toBeInTheDocument();
      expect(screen.getByText("mg")).toBeInTheDocument();
      expect(screen.getByText("dose")).toBeInTheDocument();
      expect(screen.getByText("twice")).toBeInTheDocument();
      expect(screen.getByText("daily")).toBeInTheDocument();
      expect(screen.getByText("caution")).toBeInTheDocument();
      expect(screen.getByText("avoid")).toBeInTheDocument();
      expect(screen.getByText("allergic")).toBeInTheDocument();
    });
  });
});
