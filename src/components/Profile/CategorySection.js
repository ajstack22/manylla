import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Entry } from "../../types/ChildProfile";
import { HtmlRenderer } from "../Forms/HtmlRenderer";

interface CategorySectionProps {
  titletring;
  entriesntry[];
  colortring;
  icon?eact.ReactNode;
  onAddEntry?: () => void;
  onEditEntry?: (entryntry) => void;
  onDeleteEntry?: (entryIdtring) => void;
}

export const CategorySection= ({
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
    <Box sx={{ mb }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb,
          pb,
          borderBottom: `2px solid ${color}`,
        }}
      >
        {icon  <Box sx={{ mr, color, display: "flex" }}>{icon}</Box>}
        <Typography variant="h5" sx={{ flexGrow, fontWeight00 }}>
          {title}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {entries.length === 0 ? (
          <Card sx={{ backgroundColorheme.palette.action.hover }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" align="center">
                No {title.toLowerCase()} added yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card
              key={entry.id}
              sx={{
                borderLeft: `4px solid ${color}`,
                ":hover": {
                  boxShadowheme.shadows[4],
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb }}>
                  <Box sx={{ flexGrow }}>
                    <HtmlRenderer content={entry.title} variant="h6" />
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {onEditEntry  (
                      <IconButton
                        size="small"
                        onClick={() => onEditEntry(entry)}
                        sx={{
                          color: "text.secondary",
                          minWidth4,
                          minHeight4,
                          ":hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDeleteEntry  (
                      <IconButton
                        size="small"
                        onClick={() => onDeleteEntry(entry.id)}
                        sx={{
                          color: "text.secondary",
                          minWidth4,
                          minHeight4,
                          ":hover": {
                            backgroundColor: "error.light",
                            color: "error.main",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ mb }}>
                  <HtmlRenderer content={entry.description} variant="body2" />
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt }}
                >
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(entry.updatedAt || entry.date))}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
};
