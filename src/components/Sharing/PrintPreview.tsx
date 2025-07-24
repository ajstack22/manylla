import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Entry } from '../../types/ChildProfile';

interface PrintPreviewProps {
  open: boolean;
  onClose: () => void;
  childName: string;
  selectedCategories: string[];
  entries: {
    goals: Entry[];
    successes: Entry[];
    strengths: Entry[];
    challenges: Entry[];
  };
  includeQuickInfo: boolean;
  recipientName?: string;
  note?: string;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  open,
  onClose,
  childName,
  selectedCategories,
  entries,
  includeQuickInfo,
  recipientName,
  note,
}) => {
  const categoryTitles: Record<string, string> = {
    goals: 'Current Goals',
    successes: 'Recent Successes',
    strengths: 'Strengths',
    challenges: 'Challenges',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PrintIcon sx={{ mr: 1 }} />
          Print Preview
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Print Preview Container */}
        <Paper 
          sx={{ 
            p: 4, 
            backgroundColor: 'white',
            color: 'black',
            '@media print': {
              boxShadow: 'none',
            }
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {childName} - Information Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prepared on {new Date().toLocaleDateString()}
              {recipientName && ` for ${recipientName}`}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Note */}
          {note && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                {note}
              </Typography>
            </Box>
          )}

          {/* Quick Info */}
          {includeQuickInfo && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Reference
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" paragraph>
                  <strong>Communication:</strong> Uses 2-3 word phrases. Understands more than she can express.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Sensory:</strong> Sensitive to loud noises and bright lights. Loves soft textures.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Medical:</strong> No allergies. Takes melatonin for sleep (prescribed).
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Dietary:</strong> Gluten-free diet. Prefers crunchy foods. No nuts.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Emergency Contact:</strong> Mom: 555-0123, Dad: 555-0124
                </Typography>
              </Box>
            </Box>
          )}

          {/* Selected Categories */}
          {selectedCategories.map(category => {
            const categoryEntries = entries[category as keyof typeof entries];
            if (!categoryEntries || categoryEntries.length === 0) return null;

            return (
              <Box key={category} sx={{ mb: 4, breakInside: 'avoid' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {categoryTitles[category]}
                </Typography>
                <Stack spacing={2} sx={{ pl: 2 }}>
                  {categoryEntries.map((entry, index) => (
                    <Box key={index}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        • {entry.title}
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 2, mb: 1 }}>
                        {entry.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}

          {/* Footer */}
          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #ccc' }}>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
              This information is confidential. Generated by Manyla on {new Date().toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {/* Download PDF logic */}}
        >
          Download PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};