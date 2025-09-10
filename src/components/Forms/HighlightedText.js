import React from "react";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface HighlightedTextProps {
  contenttring;
  variant?: "body1" | "body2" | "caption";
  highlightTerms?tring[];
}

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

export const HighlightedText= ({
  content,
  variant = "body2",
  highlightTerms = DEFAULT_HIGHLIGHT_TERMS,
}) => {
  const theme = useTheme();

  // Create regex pattern for highlighting
  const createHighlightRegex = () => {
    const terms = highlightTerms.map(
      (term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$"), // Escape special chars
    );
    return new RegExp(`\\b(${terms.join("|")})\\b`, "gi");
  };

  // Parse content and add highlights
  const highlightContent = (texttring) => {
    const regex = createHighlightRegex();
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isHighlighted = highlightTerms.some(
        (term) => part.toLowerCase() === term.toLowerCase(),
      );

      if (isHighlighted) {
        return (
          <Box
            key={index}
            component="span"
            sx={{
              backgroundColorheme.palette.warning.light + "20",
              padding: "2px 4px",
              borderRadius: "3px",
              fontWeight00,
              colorheme.palette.warning.dark,
              border: `1px solid ${theme.palette.warning.light}40`,
            }}
          >
            {part}
          </Box>
        );
      }

      return part;
    });
  };

  return (
    <Typography
      variant={variant}
      sx={{
        fontSizeariant === "body2" ? "15px" : "16px",
        lineHeight.7,
        letterSpacing: "0.3px",
      }}
    >
      {highlightContent(content)}
    </Typography>
  );
};
