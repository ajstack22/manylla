import React from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

const colors = {
  primary: "#8B7355",
  secondary: "#A0937D",
  background: "#FDFBF7",
  surface: "#F4E4C1",
  text: "#4A4A4A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  white: "#FFFFFF",
  action: {
    hover: "#F5F5F5",
  },
};

export const HtmlRenderer = ({ content, variant = "body2" }) => {
  // Check if content contains HTML tags
  const hasHtml = /<[^>]*>/.test(content);

  if (!hasHtml) {
    // Plain text - just render as is
    return (
      <Text
        style={{
          fontSize: variant === "body2" ? 15 : 16,
          lineHeight: 22,
          letterSpacing: 0.3,
          color: colors.text,
        }}
      >
        {content}
      </Text>
    );
  }

  // HTML content - use WebView for HTML rendering
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${variant === "body2" ? "15px" : "16px"};
            line-height: 1.65;
            letter-spacing: 0.3px;
            color: ${colors.text};
            margin: 0;
            padding: 8px;
          }
          p {
            margin: 0 0 1em 0;
            line-height: 1.7;
          }
          p:last-child { margin-bottom: 0; }
          ul, ol {
            margin: 0 0 1em 0;
            padding-left: 1.5em;
            line-height: 1.8;
          }
          li {
            margin-bottom: 0.5em;
            padding-left: 0.25em;
          }
          strong, b {
            font-weight: 600;
            color: ${colors.text};
          }
          em, i { font-style: italic; }
          code {
            background-color: ${colors.action.hover};
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
          }
          a {
            color: ${colors.primary};
            text-decoration: underline;
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;

  return (
    <WebView
      source={{ html: htmlContent }}
      style={{ height: 200 }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
};
