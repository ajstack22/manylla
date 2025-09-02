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
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Switch,
  Box,
  Typography,
  Stack,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { QuickInfoConfig } from '../../types/ChildProfile';
import { UnifiedAddDialog } from '../Dialogs/UnifiedAddDialog';
import { useMobileDialog } from '../../hooks/useMobileDialog';
import { MarkdownField } from '../Forms/MarkdownField';
import { MarkdownRenderer } from '../Forms/MarkdownRenderer';

interface QuickInfoManagerProps {
  open: boolean;
  onClose: () => void;
  quickInfoPanels: QuickInfoConfig[];
  onUpdate: (panels: QuickInfoConfig[]) => void;
}

export const QuickInfoManager: React.FC<QuickInfoManagerProps> = ({
  open,
  onClose,
  quickInfoPanels,
  onUpdate,
}) => {
  const [panels, setPanels] = useState<QuickInfoConfig[]>(quickInfoPanels);
  const [editingPanel, setEditingPanel] = useState<QuickInfoConfig | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { mobileDialogProps, isMobile } = useMobileDialog();

  const handleToggleVisibility = (panelId: string) => {
    const updated = panels.map(panel =>
      panel.id === panelId ? { ...panel, isVisible: !panel.isVisible } : panel
    );
    setPanels(updated);
  };

  const handleEditValue = (panelId: string, value: string) => {
    const updated = panels.map(panel =>
      panel.id === panelId ? { ...panel, value } : panel
    );
    setPanels(updated);
  };

  const handleDeletePanel = (panelId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (panel && !panel.isCustom) {
      // For default panels, just hide them
      handleToggleVisibility(panelId);
    } else {
      // For custom panels, remove them
      setPanels(panels.filter(p => p.id !== panelId));
    }
  };

  const handleAddPanel = (newPanel: Partial<QuickInfoConfig>) => {
    setPanels([...panels, newPanel as QuickInfoConfig]);
  };

  const handleSave = () => {
    onUpdate(panels);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} {...mobileDialogProps}>
        {isMobile ? (
          <AppBar position="sticky" color="default" elevation={0}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Manage Quick Info
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Manage Quick Info Panels</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Quick Info
              </Button>
            </Box>
          </DialogTitle>
        )}
      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Show or hide information panels. Edit values directly or add custom panels.
        </Typography>

        <List>
          {panels
            .sort((a, b) => a.order - b.order)
            .map(panel => (
              <React.Fragment key={panel.id}>
                <ListItem>
                  <IconButton size="small" edge="start" disabled>
                    <DragIcon />
                  </IconButton>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {panel.displayName}
                        </Typography>
                        {!panel.isVisible && (
                          <VisibilityOffIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      editingPanel?.id === panel.id ? (
                        <Box sx={{ mt: 1 }}>
                          <MarkdownField
                            label=""
                            value={panel.value}
                            onChange={(value) => handleEditValue(panel.id, value)}
                            placeholder="Enter value..."
                            height={100}
                          />
                          <Button 
                            size="small" 
                            onClick={() => setEditingPanel(null)}
                            sx={{ mt: 1 }}
                          >
                            Done
                          </Button>
                        </Box>
                      ) : (
                        <Box
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => setEditingPanel(panel)}
                        >
                          {panel.value ? (
                            <MarkdownRenderer content={panel.value} variant="body2" />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Click to add value...
                            </Typography>
                          )}
                        </Box>
                      )
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleVisibility(panel.id)}
                      title={panel.isVisible ? 'Hide' : 'Show'}
                    >
                      {panel.isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                    {panel.isCustom && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePanel(panel.id)}
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

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: Default panels can be hidden but not deleted. Custom panels can be deleted permanently.
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
        mode="quickInfo"
        onAdd={handleAddPanel}
        existingItems={panels}
      />
    </>
  );
};