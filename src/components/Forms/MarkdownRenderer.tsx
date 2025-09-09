import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface MarkdownRendererProps {
  content: string;
  variant?: "body1" | "body2" | "h6";
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
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
        fontSize: variant === "body2" ? "15px" : "16px",
        lineHeight: 1.65,
        letterSpacing: "0.3px",
        wordSpacing: "0.05em",
        "& p": {
          margin: 0,
          marginBottom: "1em",
          lineHeight: 1.7,
          "&:last-child": {
            marginBottom: 0,
          },
        },
        "& ul, & ol": {
          marginTop: 0,
          marginBottom: "1em",
          paddingLeft: "1.5em",
          lineHeight: 1.8,
        },
        "& li": {
          marginBottom: "0.5em",
          paddingLeft: "0.25em",
        },
        "& strong": {
          fontWeight: 600,
          color: theme.palette.text.primary,
        },
        "& em": {
          fontStyle: "italic",
        },
        "& code": {
          backgroundColor: theme.palette.action.hover,
          padding: "2px 4px",
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.9em",
        },
        "& pre": {
          backgroundColor: theme.palette.action.hover,
          padding: 2,
          borderRadius: 1,
          overflow: "auto",
          "& code": {
            backgroundColor: "transparent",
            padding: 0,
          },
        },
        "& blockquote": {
          borderLeft: `3px solid ${theme.palette.primary.main}`,
          paddingLeft: 2,
          marginLeft: 0,
          marginRight: 0,
          color: theme.palette.text.secondary,
        },
        "& hr": {
          border: "none",
          borderTop: `1px solid ${theme.palette.divider}`,
          margin: "16px 0",
        },
        "& a": {
          color: theme.palette.primary.main,
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          marginTop: 2,
          marginBottom: 1,
          fontWeight: 600,
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ""}</ReactMarkdown>
    </Typography>
  );
};
