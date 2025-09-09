import React from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Box, InputLabel, FormControl, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface MarkdownFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  height?: number;
}

export const MarkdownField: React.FC<MarkdownFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  helperText,
  height = 200,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <FormControl fullWidth>
      <InputLabel
        shrink
        sx={{
          position: "relative",
          transform: "none",
          fontSize: "0.875rem",
          mb: 1,
          color: theme.palette.text.secondary,
        }}
      >
        {label} {required && "*"}
      </InputLabel>
      <Box
        sx={{
          "& .w-md-editor": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
          "& .w-md-editor-toolbar": {
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          "& .w-md-editor-content": {
            backgroundColor: theme.palette.background.paper,
          },
          "& .w-md-editor-preview": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
          "& .wmde-markdown": {
            backgroundColor: "transparent !important",
            color: `${theme.palette.text.primary} !important`,
          },
          "& .w-md-editor-text-pre, & .w-md-editor-text-input, & .w-md-editor-text":
            {
              color: `${theme.palette.text.primary} !important`,
              fontSize: "14px !important",
            },
          "& .w-md-editor.w-md-editor-focus": {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
          },
        }}
      >
        <MDEditor
          value={value || ""}
          onChange={(val) => onChange(val || "")}
          preview="edit"
          height={height}
          data-color-mode={isDarkMode ? "dark" : "light"}
          textareaProps={{
            placeholder: placeholder || `Enter ${label.toLowerCase()}...`,
          }}
          hideToolbar={false}
          visibleDragbar={false}
          commands={[
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.hr,
            commands.title,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            commands.link,
            commands.quote,
            commands.code,
            commands.divider,
            commands.help,
          ]}
        />
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 1,
            display: "block",
            fontStyle: "italic",
          }}
        >
          Example: {helperText}
        </Typography>
      )}
    </FormControl>
  );
};
