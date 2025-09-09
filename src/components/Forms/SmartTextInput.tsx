import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Box,
  IconButton,
  Tooltip,
  FormControl,
  Typography,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface SmartTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  autoFocus?: boolean;
}

interface FormatButton {
  icon: React.ReactNode;
  tooltip: string;
  markdown: { prefix: string; suffix: string };
}

const formatButtons: FormatButton[] = [
  {
    icon: <BoldIcon />,
    tooltip: "Bold (Ctrl+B)",
    markdown: { prefix: "**", suffix: "**" },
  },
  {
    icon: <ItalicIcon />,
    tooltip: "Italic (Ctrl+I)",
    markdown: { prefix: "_", suffix: "_" },
  },
  {
    icon: <ListIcon />,
    tooltip: "Bullet List",
    markdown: { prefix: "- ", suffix: "" },
  },
  {
    icon: <LinkIcon />,
    tooltip: "Link",
    markdown: { prefix: "[", suffix: "](url)" },
  },
  {
    icon: <CodeIcon />,
    tooltip: "Code",
    markdown: { prefix: "`", suffix: "`" },
  },
];

export const SmartTextInput: React.FC<SmartTextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  required = false,
  multiline = true,
  rows = 3,
  maxRows = 10,
  autoFocus = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const textFieldRef = useRef<any>(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  // Parse markdown-like syntax and convert to formatted display
  const parseFormatting = (text: string): React.ReactNode => {
    if (!text) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combined regex for all formatting patterns
    const regex = /\*\*(.*?)\*\*|_(.*?)_|`(.*?)`|\[(.*?)\]\((.*?)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add formatted text
      if (match[1] !== undefined) {
        // Bold
        parts.push(<strong key={match.index}>{match[1]}</strong>);
      } else if (match[2] !== undefined) {
        // Italic
        parts.push(<em key={match.index}>{match[2]}</em>);
      } else if (match[3] !== undefined) {
        // Code
        parts.push(
          <Box
            component="span"
            key={match.index}
            sx={{
              fontFamily: "monospace",
              backgroundColor: theme.palette.action.hover,
              padding: "2px 4px",
              borderRadius: "3px",
              fontSize: "0.9em",
            }}
          >
            {match[3]}
          </Box>,
        );
      } else if (match[4] !== undefined && match[5] !== undefined) {
        // Link
        parts.push(
          <Box
            component="a"
            key={match.index}
            href={match[5]}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: theme.palette.primary.main,
              textDecoration: "underline",
            }}
          >
            {match[4]}
          </Box>,
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);

    // Check for auto-formatting triggers
    if (newValue.endsWith("  ")) {
      // Double space triggers new paragraph
      onChange(newValue.trim() + "\n\n");
      setInternalValue(newValue.trim() + "\n\n");
    } else {
      onChange(newValue);
    }

    // Show preview if there's formatting
    const hasFormatting = /\*\*.*?\*\*|_.*?_|`.*?`|\[.*?\]\(.*?\)/.test(
      newValue,
    );
    setShowPreview(hasFormatting);
  };

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value);
    const hasFormatting = /\*\*.*?\*\*|_.*?_|`.*?`|\[.*?\]\(.*?\)/.test(value);
    setShowPreview(hasFormatting);
  }, [value]);

  // Handle text selection for formatting
  const handleSelect = () => {
    if (textFieldRef.current) {
      const start = textFieldRef.current.selectionStart || 0;
      const end = textFieldRef.current.selectionEnd || 0;
      setSelectionStart(start);
      setSelectionEnd(end);

      // Show formatting toolbar if text is selected
      if (end > start) {
        setShowFormatting(true);
      }
    }
  };

  // Apply formatting to selected text
  const applyFormat = (format: FormatButton) => {
    if (!textFieldRef.current) return;

    const start = selectionStart;
    const end = selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      const before = value.substring(0, start);
      const formatted = `${format.markdown.prefix}${selectedText}${format.markdown.suffix}`;

      const newValue = before + formatted + value.substring(end);
      onChange(newValue);
      setInternalValue(newValue);

      // Reset selection
      setTimeout(() => {
        if (textFieldRef.current) {
          const newCursorPos = start + formatted.length;
          textFieldRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textFieldRef.current.focus();
        }
      }, 0);
    } else if (format.markdown.prefix === "- ") {
      // For list, add at start of current line
      const before = value.substring(0, start);
      const after = value.substring(start);
      const lastNewline = before.lastIndexOf("\n");
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

      const newValue =
        value.substring(0, lineStart) + "- " + value.substring(lineStart);

      onChange(newValue);
    }

    setShowFormatting(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !textFieldRef.current ||
        textFieldRef.current !== document.activeElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            applyFormat(formatButtons[0]); // Bold
            break;
          case "i":
            e.preventDefault();
            applyFormat(formatButtons[1]); // Italic
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectionStart, selectionEnd]);

  return (
    <FormControl fullWidth>
      {showPreview && multiline && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            Preview:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {parseFormatting(internalValue)}
          </Typography>
        </Box>
      )}
      <TextField
        inputRef={textFieldRef}
        label={label}
        value={internalValue}
        onChange={handleChange}
        onSelect={handleSelect}
        placeholder={placeholder}
        required={required}
        multiline={multiline}
        rows={rows}
        maxRows={maxRows}
        autoFocus={autoFocus}
        fullWidth
        variant="outlined"
        helperText={helperText}
        InputProps={{
          sx: {
            fontSize: "16px",
            lineHeight: 1.6,
            "& textarea": {
              lineHeight: 1.6,
              letterSpacing: "0.3px",
            },
          },
        }}
        InputLabelProps={{
          sx: {
            fontSize: "16px",
          },
        }}
        sx={{
          "& .MuiInputBase-root": {
            minHeight: multiline ? 100 : 44,
          },
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
      />

      {/* Floating Format Toolbar */}
      {showFormatting && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: isMobile ? "auto" : -48,
            bottom: isMobile ? 60 : "auto",
            left: 0,
            right: 0,
            mx: 2,
            p: 1,
            zIndex: 1000,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={0.5}>
              {formatButtons.map((button, index) => (
                <Tooltip key={index} title={button.tooltip}>
                  <IconButton
                    size="small"
                    onClick={() => applyFormat(button)}
                    sx={{
                      minWidth: 40,
                      minHeight: 40,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {button.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
            <IconButton
              size="small"
              onClick={() => setShowFormatting(false)}
              sx={{ minWidth: 40, minHeight: 40 }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}

      {/* Tips */}
      {value.length === 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Tip: Use **text** for bold, _text_ for italic, - for lists
        </Typography>
      )}
    </FormControl>
  );
};
