import React, { useState } from "react";
import { ThemedModal } from "../Common";
import { SyncDialogModes } from "./SyncDialogModes";
import { SyncDialogCreate } from "./SyncDialogCreate";
import { SyncDialogRestore } from "./SyncDialogRestore";
import { SyncDialogManage } from "./SyncDialogManage";

/**
 * SyncDialogCore - Main orchestrator component for sync dialog
 * Routes between different modes and manages overall dialog state
 * This is the refactored version of the original large SyncDialog.js
 */
export const SyncDialogCore = ({ open, onClose }) => {
  const [mode, setMode] = useState("menu");

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleClose = () => {
    setMode("menu"); // Reset to menu when closing
    onClose();
  };

  const renderContent = () => {
    switch (mode) {
      case "menu":
        return <SyncDialogModes onModeChange={handleModeChange} />;

      case "enable":
        return (
          <SyncDialogCreate
            onModeChange={handleModeChange}
            onClose={handleClose}
          />
        );

      case "join":
        return (
          <SyncDialogRestore
            onModeChange={handleModeChange}
            onClose={handleClose}
          />
        );

      case "existing":
      case "invite":
        return (
          <SyncDialogManage
            mode={mode}
            onModeChange={handleModeChange}
          />
        );

      default:
        return <SyncDialogModes onModeChange={handleModeChange} />;
    }
  };

  return (
    <ThemedModal
      visible={open}
      onClose={handleClose}
      title="Backup & Sync"
      headerStyle="primary"
      presentationStyle="pageSheet"
    >
      {renderContent()}
    </ThemedModal>
  );
};

// Export as SyncDialog for backward compatibility
export { SyncDialogCore as SyncDialog };