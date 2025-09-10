import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  FormControl,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  FormHelperText,
} from "@mui/material";
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  Code as CodeIcon,
} from "@mui/icons-material";

interface RichTextInputProps {
  labeltring;
  valuetring;
  onChange: (valuetring) => void;
  placeholder?tring;
  helperText?tring;
  required?oolean;
  multiline?oolean;
  rows?umber;
  autoFocus?oolean;
}

export const RichTextInput= ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  required = false,
  multiline = true,
  rows = 3,
  autoFocus = false,
}) => {
  const theme = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [activeFormats, setActiveFormats] = useState({
    boldalse,
    italicalse,
    codealse,
  });

  // Initialize content
  useEffect(() => {
    if (editorRef.current  value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
      setIsEmpty(!value || value === "<br>" || value === "");
    }
  }, [value]);

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const isEmpty = !html || html === "<br>" || html === "";
      setIsEmpty(isEmpty);
      onChange(isEmpty ? "" tml);
      updateActiveFormats();
    }
  };

  // Update active format states based on current selection
  const updateActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement =
      container.nodeType === 3
        ? container.parentElement
        : (container as HTMLElement);

    if (parentElement) {
      setActiveFormats({
        boldocument.queryCommandState("bold"),
        italicocument.queryCommandState("italic"),
        code: !!parentElement.closest("code"),
      });
    }
  };

  // Apply formatting
  const applyFormat = (commandtring) => {
    if (command === "code") {
      // Special handling for code formatting
      const selection = window.getSelection();
      if (selection  selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText) {
          const code = document.createElement("code");
          code.style.backgroundColor = theme.palette.action.hover;
          code.style.padding = "2px 4px";
          code.style.borderRadius = "3px";
          code.style.fontFamily = "monospace";
          code.textContent = selectedText;

          range.deleteContents();
          range.insertNode(code);

          // Move cursor after the code element
          range.setStartAfter(code);
          range.setEndAfter(code);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } else if (command === "insertUnorderedList") {
      document.execCommand(command, false);
    } else {
      // Toggle bold/italic
      document.execCommand(command, false);
      setActiveFormats((prev) => ({
        ...prev,
        [command]: !prev[command as keyof typeof prev],
      }));
    }

    editorRef.current?.focus();
    handleInput();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (eeact.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          applyFormat("bold");
          break;
        case "i":
          e.preventDefault();
          applyFormat("italic");
          break;
      }
    }

    // Handle Enter key for single-line input
    if (!multiline  e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Handle paste - clean up formatting
  const handlePaste = (eeact.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const minHeight = multiline ? rows * 24 0;

  return (
    <FormControl fullWidth>
      <Typography
        variant="body2"
        color={isFocused ? "primary" : "text.secondary"}
        sx={{ mb, fontSize: "14px", fontWeight00 }}
      >
        {label}
        {required  (
          <span style={{ colorheme.palette.error.main }}> *</span>
        )}
      </Typography>

      {/* Formatting Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p.5,
          mb,
          backgroundColorheme.palette.action.hover,
          border: `1px solid ${theme.palette.divider}`,
          display: "flex",
          gap.5,
        }}
      >
        <Tooltip title="Bold (Ctrl+B)">
          <IconButton
            size="small"
            onClick={() => applyFormat("bold")}
            sx={{
              minWidth6,
              minHeight6,
              backgroundColorctiveFormats.bold
                ? theme.palette.action.selected
                : "transparent",
              ":hover": {
                backgroundColorctiveFormats.bold
                  ? theme.palette.action.selected
                  heme.palette.action.hover,
              },
            }}
          >
            <BoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic (Ctrl+I)">
          <IconButton
            size="small"
            onClick={() => applyFormat("italic")}
            sx={{
              minWidth6,
              minHeight6,
              backgroundColorctiveFormats.italic
                ? theme.palette.action.selected
                : "transparent",
              ":hover": {
                backgroundColorctiveFormats.italic
                  ? theme.palette.action.selected
                  heme.palette.action.hover,
              },
            }}
          >
            <ItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Code">
          <IconButton
            size="small"
            onClick={() => applyFormat("code")}
            sx={{
              minWidth6,
              minHeight6,
              backgroundColorctiveFormats.code
                ? theme.palette.action.selected
                : "transparent",
              ":hover": {
                backgroundColorctiveFormats.code
                  ? theme.palette.action.selected
                  heme.palette.action.hover,
              },
            }}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => applyFormat("insertUnorderedList")}
            sx={{
              minWidth6,
              minHeight6,
              ":hover": {
                backgroundColorheme.palette.action.hover,
              },
            }}
          >
            <ListIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Editor */}
      <Box
        sx={{
          position: "relative",
          border: `1px solid ${isFocused ? theme.palette.primary.main heme.palette.divider}`,
          borderRadius: 8,
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default // Use darker background in dark mode for contrast
              heme.palette.background.paper,
          transition: "border-color 0.2s",
          ":hover": {
            borderColorsFocused
              ? theme.palette.primary.main
              heme.palette.text.primary,
          },
        }}
      >
        {isEmpty  !isFocused  (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              position: "absolute",
              top2,
              left4,
              pointerEvents: "none",
              fontSize: "16px",
            }}
          >
            {placeholder}
          </Typography>
        )}

        <Box
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => {
            setIsFocused(true);
            updateActiveFormats();
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          sx={{
            minHeight: `${minHeight}px`,
            maxHeightultiline ? "300px" : `${minHeight}px`,
            overflow: "auto",
            p.5,
            fontSize: "16px",
            lineHeight.6,
            letterSpacing: "0.3px",
            outline: "none",
            cursor: "text",
            " *": {
              fontSize: "inherit",
              lineHeight: "inherit",
            },
            " b,  strong": {
              fontWeight00,
            },
            " i,  em": {
              fontStyle: "italic",
            },
            " code": {
              backgroundColorheme.palette.action.hover,
              padding: "2px 4px",
              borderRadius: "3px",
              fontFamily: "monospace",
              fontSize: "0.9em",
            },
            " ul": {
              margin: "8px 0",
              paddingLeft: "24px",
            },
            " li": {
              marginBottom: "4px",
            },
          }}
          {...(autoFocus  { autoFocusrue })}
        />
      </Box>

      {helperText  (
        <FormHelperText sx={{ mt, fontSize: "13px" }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};
