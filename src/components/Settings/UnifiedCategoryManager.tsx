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
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Paper,
  Stack,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Label as LabelIcon,
} from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CategoryConfig } from "../../types/ChildProfile";
import { useMobileDialog } from "../../hooks/useMobileDialog";

interface UnifiedCategoryManagerProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  onUpdate: (categories: CategoryConfig[]) => void;
}

interface SortableItemProps {
  category: CategoryConfig;
  onToggleVisibility: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  category,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isMobile,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        border: "2px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        backgroundColor: isDragging ? "action.hover" : "background.paper",
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {!isMobile && (
          <Box
            {...attributes}
            {...listeners}
            sx={{ cursor: "grab", color: "text.secondary" }}
          >
            <DragIcon />
          </Box>
        )}

        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: category.color,
            flexShrink: 0,
          }}
        />

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {category.displayName}
            </Typography>
            {category.isQuickInfo && (
              <Chip label="Priority" size="small" color="primary" />
            )}
            {category.isCustom && (
              <Chip label="Custom" size="small" variant="outlined" />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {category.isVisible ? "Visible in profile" : "Hidden from profile"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {isMobile && (
            <>
              <IconButton
                size="small"
                onClick={onMoveUp}
                disabled={isFirst}
                sx={{ minWidth: 36, minHeight: 36 }}
              >
                <ArrowUpIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={onMoveDown}
                disabled={isLast}
                sx={{ minWidth: 36, minHeight: 36 }}
              >
                <ArrowDownIcon fontSize="small" />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={() => onToggleVisibility(category.id)}
            sx={{ minWidth: 36, minHeight: 36 }}
          >
            {category.isVisible ? (
              <VisibilityIcon fontSize="small" />
            ) : (
              <VisibilityOffIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export const UnifiedCategoryManager: React.FC<UnifiedCategoryManagerProps> = ({
  open,
  onClose,
  categories,
  onUpdate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mobileDialogProps } = useMobileDialog();
  const [localCategories, setLocalCategories] = useState(categories);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order values
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    setLocalCategories((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isVisible: !item.isVisible } : item,
      ),
    );
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newCategories = [...localCategories];
      const temp = newCategories[index];
      newCategories[index] = newCategories[index - 1];
      newCategories[index - 1] = temp;

      // Update order values
      const updatedCategories = newCategories.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
      setLocalCategories(updatedCategories);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < localCategories.length - 1) {
      const newCategories = [...localCategories];
      const temp = newCategories[index];
      newCategories[index] = newCategories[index + 1];
      newCategories[index + 1] = temp;

      // Update order values
      const updatedCategories = newCategories.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
      setLocalCategories(updatedCategories);
    }
  };

  const handleSave = () => {
    onUpdate(localCategories);
    onClose();
  };

  const handleCancel = () => {
    setLocalCategories(categories);
    onClose();
  };

  React.useEffect(() => {
    if (open) {
      setLocalCategories([...categories].sort((a, b) => a.order - b.order));
    }
  }, [open, categories]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      {...mobileDialogProps}
    >
      {isMobile ? (
        <AppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            <LabelIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Manage Categories
            </Typography>
            <IconButton edge="end" onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LabelIcon sx={{ mr: 1 }} />
            Manage Categories
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}

      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        {!isMobile && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <LabelIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Manage Categories
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Organize and customize the categories for tracking your child's
              information
            </Typography>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isMobile
            ? "Use arrows to reorder categories. Toggle visibility with the eye icon."
            : "Drag to reorder categories. Toggle visibility with the eye icon."}
        </Typography>

        {isMobile ? (
          // Mobile: Use arrow buttons
          <Stack spacing={0}>
            {localCategories.map((category, index) => (
              <SortableItem
                key={category.id}
                category={category}
                onToggleVisibility={handleToggleVisibility}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === localCategories.length - 1}
                isMobile={true}
              />
            ))}
          </Stack>
        ) : (
          // Desktop: Use drag and drop
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack spacing={0}>
                {localCategories.map((category, index) => (
                  <SortableItem
                    key={category.id}
                    category={category}
                    onToggleVisibility={handleToggleVisibility}
                    isFirst={index === 0}
                    isLast={index === localCategories.length - 1}
                    isMobile={false}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 2 }}>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
