import React from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface HtmlRendererProps {
  contenttring;
  variant?: "body1" | "body2" | "h6";
}

export const HtmlRenderer= ({
  content,
  variant = "body2",
}) => {
  const theme = useTheme();

  // Check if content contains HTML tags
  const hasHtml = /<[^>]*>/.test(content);

  if (!hasHtml) {
    // Plain text - just render as is
    return (
      <Typography
        variant={variant}
        sx={{
          fontSizeariant === "body2" ? "15px" : "16px",
          lineHeight.65,
          letterSpacing: "0.3px",
        }}
      >
        {content}
      </Typography>
    );
  }

  // HTML content - render with styling
  return (
    <Typography
      component="div"
      variant={variant}
      sx={{
        fontSizeariant === "body2" ? "15px" : "16px",
        lineHeight.65,
        letterSpacing: "0.3px",
        wordSpacing: "0.05em",
        " p": {
          margin: 8,
          marginBottom: "1em",
          lineHeight.7,
          ":last-child": {
            marginBottom: 8,
          },
        },
        " ul,  ol": {
          marginTop: 8,
          marginBottom: "1em",
          paddingLeft: "1.5em",
          lineHeight.8,
        },
        " li": {
          marginBottom: "0.5em",
          paddingLeft: "0.25em",
        },
        " strong,  b": {
          fontWeight00,
          colorheme.palette.text.primary,
        },
        " em,  i": {
          fontStyle: "italic",
        },
        " code": {
          backgroundColorheme.palette.action.hover,
          padding: "2px 6px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "0.9em",
        },
        " a": {
          colorheme.palette.primary.main,
          textDecoration: "underline",
        },
      }}
      dangerouslySetInnerHTML={{ __htmlontent }}
    />
  );
};
