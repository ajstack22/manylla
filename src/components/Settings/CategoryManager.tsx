import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { CategoryConfig } from "../../types/ChildProfile";
import { UnifiedAddDialog } from "../Dialogs/UnifiedAddDialog";
import { useMobileDialog } from "../../hooks/useMobileDialog";

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  onUpdate: (categories: CategoryConfig[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  open,
  onClose,
  categories,
  onUpdate,
}) => {
  const [categoryList, setCategoryList] =
    useState<CategoryConfig[]>(categories);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { mobileDialogProps, isMobile } = useMobileDialog();

  const handleToggleVisibility = (categoryId: string) => {
    const updated = categoryList.map((category) =>
      category.id === categoryId
        ? { ...category, isVisible: !category.isVisible }
        : category,
    );
    setCategoryList(updated);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categoryList.find((c) => c.id === categoryId);
    if (category && !category.isCustom) {
      // For default categories, just hide them
      handleToggleVisibility(categoryId);
    } else {
      // For custom categories, remove them
      setCategoryList(categoryList.filter((c) => c.id !== categoryId));
    }
  };

  const handleAddCategory = (newCategory: Partial<CategoryConfig>) => {
    setCategoryList([...categoryList, newCategory as CategoryConfig]);
  };

  const handleSave = () => {
    onUpdate(categoryList);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} {...mobileDialogProps}>
        {isMobile ? (
          <AppBar position="sticky" color="default" elevation={0}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Manage Categories
              </Typography>
              <IconButton
                size="small"
                onClick={() => setAddDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                <AddIcon />
              </IconButton>
              <IconButton edge="end" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        ) : (
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">Manage Categories</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Category
              </Button>
            </Box>
          </DialogTitle>
        )}
        <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Show or hide categories, or add custom categories for organizing
            entries.
          </Typography>

          <List>
            {categoryList
              .sort((a, b) => a.order - b.order)
              .map((category) => (
                <React.Fragment key={category.id}>
                  <ListItem>
                    <IconButton size="small" edge="start" disabled>
                      <DragIcon />
                    </IconButton>

                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={category.displayName}
                            size="small"
                            sx={{
                              backgroundColor: category.color,
                              color: "white",
                              fontWeight: "medium",
                            }}
                          />
                          {!category.isVisible && (
                            <VisibilityOffIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                          )}
                          {category.isCustom && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              (Custom)
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleVisibility(category.id)}
                        title={category.isVisible ? "Hide" : "Show"}
                      >
                        {category.isVisible ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </IconButton>
                      {category.isCustom && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCategory(category.id)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
          </List>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            Note: Default categories can be hidden but not deleted. Custom
            categories can be deleted permanently.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <UnifiedAddDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        mode="category"
        onAdd={handleAddCategory}
        existingItems={categoryList}
      />
    </>
  );
};
