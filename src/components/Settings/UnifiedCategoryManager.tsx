import React, { useState } from 'react';
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
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoryConfig } from '../../types/ChildProfile';
import { useMobileDialog } from '../../hooks/useMobileDialog';

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
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        backgroundColor: isDragging ? 'action.hover' : 'background.paper',
        borderRadius: 1,
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {!isMobile && (
        <ListItemIcon
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', minWidth: 40 }}
        >
          <DragIcon />
        </ListItemIcon>
      )}
      
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: category.color,
          mr: 2,
          flexShrink: 0,
        }}
      />
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {category.displayName}
            {category.isQuickInfo && (
              <Chip label="Priority" size="small" color="primary" />
            )}
            {category.isCustom && (
              <Chip label="Custom" size="small" variant="outlined" />
            )}
          </Box>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {category.isVisible ? 'Visible' : 'Hidden'}
          </Typography>
        }
      />
      
      <ListItemSecondaryAction>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export const UnifiedCategoryManager: React.FC<UnifiedCategoryManagerProps> = ({
  open,
  onClose,
  categories,
  onUpdate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    })
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
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      )
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Manage Categories
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      
      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isMobile 
            ? 'Use arrows to reorder categories. Toggle visibility with the eye icon.'
            : 'Drag to reorder categories. Toggle visibility with the eye icon.'}
        </Typography>
        
        {isMobile ? (
          // Mobile: Use arrow buttons
          <List sx={{ pt: 0 }}>
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
          </List>
        ) : (
          // Desktop: Use drag and drop
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localCategories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <List sx={{ pt: 0 }}>
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
              </List>
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