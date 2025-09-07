import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Entry } from '../../types/ChildProfile';
import { HtmlRenderer } from '../Forms/HtmlRenderer';

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
      </Box>

      <Stack spacing={2}>
        {entries.length === 0 ? (
          <Card sx={{ backgroundColor: theme.palette.action.hover }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" align="center">
                No {title.toLowerCase()} added yet.
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
                  <Box sx={{ flexGrow: 1 }}>
                    <HtmlRenderer content={entry.title} variant="h6" />
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {onEditEntry && (
                      <IconButton 
                        onClick={() => onEditEntry(entry)}
                        sx={{
                          // Larger touch targets
                          minWidth: 40,
                          minHeight: 40,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDeleteEntry && (
                      <IconButton 
                        onClick={() => onDeleteEntry(entry.id)}
                        sx={{
                          minWidth: 40,
                          minHeight: 40,
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.contrastText',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <HtmlRenderer content={entry.description} variant="body2" />
                </Box>
                
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