import React from "react";
import { Text, View, ScrollView } from "react-native";

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
  divider: "#E0E0E0",
};

export const MarkdownRenderer = ({ content, variant = "body2" }) => {
  // Simple markdown parsing for React Native
  const parseMarkdown = (text) => {
    if (!text) return [];

    const elements = [];
    const lines = text.split("\n");
    let key = 0;

    lines.forEach((line, index) => {
      if (line.trim() === "") {
        elements.push(<View key={key++} style={{ height: 8 }} />);
        return;
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <Text
            key={key++}
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: colors.text,
              marginVertical: 8,
            }}
          >
            {line.substring(2)}
          </Text>,
        );
        return;
      }

      if (line.startsWith("## ")) {
        elements.push(
          <Text
            key={key++}
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginVertical: 6,
            }}
          >
            {line.substring(3)}
          </Text>,
        );
        return;
      }

      // Lists
      if (line.startsWith("- ") || line.match(/^\d+\. /)) {
        const listText = line.replace(/^- |^\d+\. /, "");
        elements.push(
          <Text
            key={key++}
            style={{
              fontSize: variant === "body2" ? 15 : 16,
              lineHeight: 22,
              color: colors.text,
              marginLeft: 16,
              marginBottom: 4,
            }}
          >
            • {listText}
          </Text>,
        );
        return;
      }

      // Regular paragraphs with inline formatting
      const formattedText = renderInlineFormatting(line, key++);
      elements.push(formattedText);
    });

    return elements;
  };

  const renderInlineFormatting = (text, key) => {
    const parts = [];
    let remainingText = text;
    let partKey = 0;

    // Split by markdown patterns
    const patterns = [
      { regex: /\*\*(.*?)\*\*/g, style: { fontWeight: "600" } },
      { regex: /_(.*?)_/g, style: { fontStyle: "italic" } },
      {
        regex: /`(.*?)`/g,
        style: {
          backgroundColor: colors.action.hover,
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 3,
          fontFamily: "monospace",
          fontSize: 14,
        },
      },
    ];

    // Simple approach: just handle bold for now
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <Text
            key={`${key}-${partKey++}`}
            style={{
              fontSize: variant === "body2" ? 15 : 16,
              lineHeight: 22,
              color: colors.text,
            }}
          >
            {text.substring(lastIndex, match.index)}
          </Text>,
        );
      }

      // Add bold text
      parts.push(
        <Text
          key={`${key}-${partKey++}`}
          style={{
            fontSize: variant === "body2" ? 15 : 16,
            lineHeight: 22,
            color: colors.text,
            fontWeight: "600",
          }}
        >
          {match[1]}
        </Text>,
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text
          key={`${key}-${partKey++}`}
          style={{
            fontSize: variant === "body2" ? 15 : 16,
            lineHeight: 22,
            color: colors.text,
          }}
        >
          {text.substring(lastIndex)}
        </Text>,
      );
    }

    if (parts.length === 0) {
      return (
        <Text
          key={key}
          style={{
            fontSize: variant === "body2" ? 15 : 16,
            lineHeight: 22,
            color: colors.text,
            marginBottom: 8,
          }}
        >
          {text}
        </Text>
      );
    }

    return (
      <Text key={key} style={{ marginBottom: 8 }}>
        {parts}
      </Text>
    );
  };

  return (
    <ScrollView>
      <View
        style={{
          padding: 8,
        }}
      >
        {parseMarkdown(content)}
      </View>
    </ScrollView>
  );
};
