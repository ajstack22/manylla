import React from "react";
import { Text, View } from "react-native";

const colors = {
  primary: "#8B7355",
  secondary: "#A0937D",
  background: "#FDFBF7",
  surface: "#F4E4C1",
  text: "#4A4A4A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  white: "#FFFFFF",
  warning: {
    light: "#FFE0B2",
    dark: "#E65100",
  },
};

// Common medical and important terms to auto-highlight
const DEFAULT_HIGHLIGHT_TERMS = [
  // Medical
  "allergy",
  "allergies",
  "allergic",
  "medication",
  "medications",
  "medicine",
  "epipen",
  "inhaler",
  "seizure",
  "emergency",
  "diagnosis",
  "prescribed",
  "mg",
  "ml",
  "dose",
  "dosage",
  "daily",
  "twice",
  // Contact
  "phone",
  "call",
  "contact",
  "email",
  // Time-sensitive
  "immediately",
  "urgent",
  "asap",
  "critical",
  "important",
  // Safety
  "warning",
  "caution",
  "danger",
  "avoid",
  "never",
  "always",
  "must",
];

export const HighlightedText = ({
  content,
  variant = "body2",
  highlightTerms = DEFAULT_HIGHLIGHT_TERMS,
}) => {
  // Create regex pattern for highlighting
  const createHighlightRegex = () => {
    const terms = highlightTerms.map(
      (term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$"), // Escape special chars
    );
    return new RegExp(`\\b(${terms.join("|")})\\b`, "gi");
  };

  // Parse content and add highlights
  const highlightContent = (text) => {
    const regex = createHighlightRegex();
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isHighlighted = highlightTerms.some(
        (term) => part.toLowerCase() === term.toLowerCase(),
      );

      if (isHighlighted) {
        return (
          <Text
            key={index}
            style={{
              backgroundColor: colors.warning.light + "20",
              padding: 4,
              borderRadius: 3,
              fontWeight: "600",
              color: colors.warning.dark,
              borderWidth: 1,
              borderColor: colors.warning.light + "40",
            }}
          >
            {part}
          </Text>
        );
      }

      return part;
    });
  };

  return (
    <Text
      style={{
        fontSize: variant === "body2" ? 15 : 16,
        lineHeight: 22,
        letterSpacing: 0.3,
        color: colors.text,
      }}
    >
      {highlightContent(content)}
    </Text>
  );
};
