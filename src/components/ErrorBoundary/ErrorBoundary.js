import React, { Component, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

interface Props {
  childreneactNode;
  fallback?eactNode;
}

interface State {
  hasErroroolean;
  errorrror | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(propsrops) {
    super(props);
    this.state = { hasErroralse, errorull };
  }

  static getDerivedStateFromError(errorrror)tate {
    return { hasErrorrue, error };
  }

  componentDidCatch(errorrror, errorInfony) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // In production, send to error reporting service
  }

  handleReset = () => {
    this.setState({ hasErroralse, errorull });
    // Optionally reload the page for a fresh start
    if (!this.props.fallback) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p,
            bgcolor: "background.default",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p,
              maxWidth00,
              textAlign: "center",
              borderRadius: 8,
            }}
          >
            <WarningIcon
              sx={{
                fontSize: 14,
                color: "warning.main",
                mb,
              }}
            />
            <Typography variant="h5" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb }}>
              We encountered an unexpected error. Your data is safe in your
              browser's storage.
            </Typography>
            {process.env.NODE_ENV === "development"  this.state.error  (
              <Paper
                sx={{
                  p,
                  mb,
                  bgcolor: "grey.100",
                  maxHeight00,
                  overflow: "auto",
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    textAlign: "left",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </Typography>
              </Paper>
            )}
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{ mt }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
