import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  FormControl,
  Typography,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  FormHelperText,
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  Link as LinkIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

interface RichTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  autoFocus?: boolean;
}

export const RichTextInput: React.FC<RichTextInputProps> = ({
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    code: false,
  });

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
      setIsEmpty(!value || value === '<br>' || value === '');
    }
  }, [value]);

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const isEmpty = !html || html === '<br>' || html === '';
      setIsEmpty(isEmpty);
      onChange(isEmpty ? '' : html);
      updateActiveFormats();
    }
  };

  // Update active format states based on current selection
  const updateActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === 3 ? container.parentElement : container as HTMLElement;

    if (parentElement) {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        code: !!parentElement.closest('code'),
      });
    }
  };

  // Apply formatting
  const applyFormat = (command: string) => {
    if (command === 'code') {
      // Special handling for code formatting
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText) {
          const code = document.createElement('code');
          code.style.backgroundColor = theme.palette.action.hover;
          code.style.padding = '2px 4px';
          code.style.borderRadius = '3px';
          code.style.fontFamily = 'monospace';
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
    } else if (command === 'insertUnorderedList') {
      document.execCommand(command, false);
    } else {
      // Toggle bold/italic
      document.execCommand(command, false);
      setActiveFormats(prev => ({
        ...prev,
        [command]: !prev[command as keyof typeof prev],
      }));
    }
    
    editorRef.current?.focus();
    handleInput();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormat('italic');
          break;
      }
    }
    
    // Handle Enter key for single-line input
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Handle paste - clean up formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const minHeight = multiline ? (rows * 24) : 40;

  return (
    <FormControl fullWidth>
      <Typography
        variant="body2"
        color={isFocused ? 'primary' : 'text.secondary'}
        sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}
      >
        {label}
        {required && <span style={{ color: theme.palette.error.main }}> *</span>}
      </Typography>

      {/* Formatting Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          mb: 1,
          backgroundColor: theme.palette.action.hover,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          gap: 0.5,
        }}
      >
        <Tooltip title="Bold (Ctrl+B)">
          <IconButton
            size="small"
            onClick={() => applyFormat('bold')}
            sx={{
              minWidth: 36,
              minHeight: 36,
              backgroundColor: activeFormats.bold ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: activeFormats.bold 
                  ? theme.palette.action.selected 
                  : theme.palette.action.hover,
              },
            }}
          >
            <BoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic (Ctrl+I)">
          <IconButton
            size="small"
            onClick={() => applyFormat('italic')}
            sx={{
              minWidth: 36,
              minHeight: 36,
              backgroundColor: activeFormats.italic ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: activeFormats.italic 
                  ? theme.palette.action.selected 
                  : theme.palette.action.hover,
              },
            }}
          >
            <ItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Code">
          <IconButton
            size="small"
            onClick={() => applyFormat('code')}
            sx={{
              minWidth: 36,
              minHeight: 36,
              backgroundColor: activeFormats.code ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: activeFormats.code 
                  ? theme.palette.action.selected 
                  : theme.palette.action.hover,
              },
            }}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => applyFormat('insertUnorderedList')}
            sx={{
              minWidth: 36,
              minHeight: 36,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
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
          position: 'relative',
          border: `1px solid ${isFocused ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 1,
          backgroundColor: theme.palette.background.paper,
          transition: 'border-color 0.2s',
          '&:hover': {
            borderColor: isFocused ? theme.palette.primary.main : theme.palette.text.primary,
          },
        }}
      >
        {isEmpty && !isFocused && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              position: 'absolute',
              top: 12,
              left: 14,
              pointerEvents: 'none',
              fontSize: '16px',
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
            maxHeight: multiline ? '300px' : `${minHeight}px`,
            overflow: 'auto',
            p: 1.5,
            fontSize: '16px',
            lineHeight: 1.6,
            letterSpacing: '0.3px',
            outline: 'none',
            cursor: 'text',
            '& *': {
              fontSize: 'inherit',
              lineHeight: 'inherit',
            },
            '& b, & strong': {
              fontWeight: 600,
            },
            '& i, & em': {
              fontStyle: 'italic',
            },
            '& code': {
              backgroundColor: theme.palette.action.hover,
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              fontSize: '0.9em',
            },
            '& ul': {
              margin: '8px 0',
              paddingLeft: '24px',
            },
            '& li': {
              marginBottom: '4px',
            },
          }}
          {...(autoFocus && { autoFocus: true })}
        />
      </Box>

      {helperText && (
        <FormHelperText sx={{ mt: 1, fontSize: '13px' }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};