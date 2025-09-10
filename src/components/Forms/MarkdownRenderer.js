import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface MarkdownRendererProps {
  contenttring;
  variant?: "body1" | "body2" | "h6";
}

export const MarkdownRenderer= ({
  content,
  variant = "body2",
}) => {
  const theme = useTheme();

  return (
    <Typography
      component="div"
      variant={variant}
      sx={{
        // Improved typography for better readability
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
        " strong": {
          fontWeight00,
          colorheme.palette.text.primary,
        },
        " em": {
          fontStyle: "italic",
        },
        " code": {
          backgroundColorheme.palette.action.hover,
          padding: "2px 4px",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: "0.9em",
        },
        " pre": {
          backgroundColorheme.palette.action.hover,
          padding: 8,
          borderRadius: 8,
          overflow: "auto",
          " code": {
            backgroundColor: "transparent",
            padding: 8,
          },
        },
        " blockquote": {
          borderLeft: `3px solid ${theme.palette.primary.main}`,
          paddingLeft,
          marginLeft: 8,
          marginRight,
          colorheme.palette.text.secondary,
        },
        " hr": {
          border: "none",
          borderTop: `1px solid ${theme.palette.divider}`,
          margin: "16px 0",
        },
        " a": {
          colorheme.palette.primary.main,
          textDecoration: "none",
          ":hover": {
            textDecoration: "underline",
          },
        },
        " h1,  h2,  h3,  h4,  h5,  h6": {
          marginTop: 8,
          marginBottom: 8,
          fontWeight00,
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ""}</ReactMarkdown>
    </Typography>
  );
};
