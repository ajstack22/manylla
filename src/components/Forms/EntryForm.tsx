import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import { Entry } from "../../types/ChildProfile";
import { useMobileDialog } from "../../hooks/useMobileDialog";
import { useMobileKeyboard } from "../../hooks/useMobileKeyboard";
import { RichTextInput } from "./RichTextInput";
import { getPlaceholder, getRandomExample } from "../../utils/placeholders";

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: Omit<Entry, "id">) => void;
  category: string;
  entry?: Entry;
  categories?: Array<{
    id: string;
    name: string;
    displayName: string;
    color: string;
  }>;
}

const visibilityOptions = [
  { value: "family", label: "Family" },
  { value: "medical", label: "Medical Team" },
  { value: "education", label: "Education Team" },
];

export const EntryForm: React.FC<EntryFormProps> = ({
  open,
  onClose,
  onSave,
  category,
  entry,
  categories = [],
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const { keyboardPadding, isKeyboardVisible } = useMobileKeyboard();
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>(
    entry?.visibility || ["private"],
  );
  const [formData, setFormData] = useState({
    title: entry?.title || "",
    description: entry?.description || "",
  });

  // Reset form data when modal opens/closes or entry changes
  useEffect(() => {
    if (open) {
      setSelectedCategory(entry?.category || category || "");
      setSelectedVisibility(entry?.visibility || ["private"]);
      setFormData({
        title: entry?.title || "",
        description: entry?.description || "",
      });
    } else {
      // Clear form data when modal closes
      setSelectedCategory("");
      setSelectedVisibility(["private"]);
      setFormData({
        title: "",
        description: "",
      });
    }
  }, [open, entry, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      // Could show an error message here
      return;
    }
    onSave({
      ...formData,
      category: selectedCategory,
      date: new Date(),
      visibility: ["private"], // Always private - sharing is handled separately
    });
    onClose();
  };

  const getCategoryTitle = () => {
    if (!selectedCategory && !category) return "Entry";
    const catName = selectedCategory || category;
    // Convert category name to title case
    return catName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog open={open} onClose={onClose} {...mobileDialogProps}>
      {isMobile ? (
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{
            // Keep header visible above keyboard
            zIndex: isKeyboardVisible ? 1100 : "auto",
          }}
        >
          <Toolbar>
            <AddCircleIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {entry ? "Edit" : "Add"} {getCategoryTitle()}
            </Typography>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AddCircleIcon sx={{ mr: 1 }} />
            {entry ? "Edit" : "Add"} {getCategoryTitle()}
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            pt: isMobile ? 2 : 3,
            pb: isMobile && isKeyboardVisible ? `${keyboardPadding + 80}px` : 3,
          }}
        >
          {!isMobile && (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <AddCircleIcon
                sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {entry ? "Edit" : "Add"} {getCategoryTitle()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {entry
                  ? "Update the details for this entry"
                  : "Create a new entry to track important information"}
              </Typography>
            </Box>
          )}
          <Stack spacing={2}>
            {/* Category selector - only show if we have categories list and not editing */}
            {categories.length > 0 && !entry && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <FormControl fullWidth required size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.name}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              backgroundColor: cat.color,
                            }}
                          />
                          {cat.displayName}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            )}

            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Stack spacing={2}>
                <RichTextInput
                  label="Title"
                  value={formData.title}
                  onChange={(value) =>
                    setFormData({ ...formData, title: value })
                  }
                  required
                  placeholder={getPlaceholder(category, "title")}
                  multiline={false}
                  autoFocus={!entry}
                />

                <RichTextInput
                  label="Description"
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({ ...formData, description: value })
                  }
                  required
                  placeholder={getPlaceholder(category, "description")}
                  helperText={`Example: ${getRandomExample(category) || "Add details here"}`}
                  rows={4}
                />
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 2 }}>
          <Button
            onClick={onClose}
            sx={{
              minHeight: 44,
              minWidth: 80,
              fontSize: "16px",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              minHeight: 44,
              minWidth: 100,
              fontSize: "16px",
            }}
          >
            {entry ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
