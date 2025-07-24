import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Entry } from '../../types/ChildProfile';

interface CategorySectionProps {
  title: string;
  entries: Entry[];
  color: string;
  icon?: React.ReactNode;
  onAddEntry?: () => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  entries,
  color,
  icon,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        pb: 1,
        borderBottom: `2px solid ${color}`,
      }}>
        {icon && (
          <Box sx={{ mr: 1, color, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        {onAddEntry && (
          <IconButton onClick={onAddEntry} sx={{ color }}>
            <AddIcon />
          </IconButton>
        )}
      </Box>

      <Stack spacing={2}>
        {entries.length === 0 ? (
          <Card sx={{ backgroundColor: theme.palette.action.hover }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" align="center">
                No {title.toLowerCase()} added yet. Click the + button to add one.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} sx={{ 
              borderLeft: `4px solid ${color}`,
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {entry.title}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {onEditEntry && (
                      <IconButton size="small" onClick={() => onEditEntry(entry)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDeleteEntry && (
                      <IconButton size="small" onClick={() => onDeleteEntry(entry.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {entry.description}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {new Date(entry.date).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
};