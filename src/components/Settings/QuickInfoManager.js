import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getNumColumns, getCardWidth } from "../../utils/platformStyles";

const colors = {
  primary: "#A08670",
  secondary: "#A0937D",
  background: "#FDFBF7",
  surface: "#F4E4C1",
  text: "#4A4A4A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  white: "#FFFFFF",
  error: "#D32F2F",
  success: "#2E7D32",
  hover: "#F5F5F5",
};

export const QuickInfoManager = ({
  visible,
  onClose,
  quickInfoPanels,
  onUpdate,
}) => {
  const numColumns = getNumColumns();
  const [panels, setPanels] = useState(quickInfoPanels);
  const [editingPanel, setEditingPanel] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPanelName, setNewPanelName] = useState("");
  const [editValue, setEditValue] = useState("");

  const handleToggleVisibility = (panelId) => {
    const updated = panels.map((panel) =>
      panel.id === panelId ? { ...panel, isVisible: !panel.isVisible } : panel,
    );
    setPanels(updated);
  };

  const handleEditValue = (panelId, value) => {
    const updated = panels.map((panel) =>
      panel.id === panelId ? { ...panel, value } : panel,
    );
    setPanels(updated);
    setEditingPanel(null);
    setEditValue("");
  };

  const handleDeletePanel = (panelId) => {
    const panel = panels.find((p) => p.id === panelId);

    if (!panel) return;

    if (panel.isCustom) {
      Alert.alert(
        "Delete Quick Info Panel",
        `Are you sure you want to delete "${panel.displayName}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setPanels(panels.filter((p) => p.id !== panelId));
            },
          },
        ],
      );
    } else {
      // For default panels, just hide them
      handleToggleVisibility(panelId);
    }
  };

  const handleAddPanel = () => {
    if (!newPanelName.trim()) {
      Alert.alert("Error", "Please enter a panel name");
      return;
    }

    const newPanel = {
      id: `custom-${Date.now()}`,
      name: newPanelName.toLowerCase().replace(/\s+/g, "-"),
      displayName: newPanelName,
      value: "",
      isVisible: true,
      isCustom: true,
      order: panels.length,
    };

    setPanels([...panels, newPanel]);
    setNewPanelName("");
    setShowAddDialog(false);
  };

  const handleSave = () => {
    onUpdate(panels);
    onClose();
  };

  const startEditing = (panel) => {
    setEditingPanel(panel);
    setEditValue(panel.value);
  };

  const cancelEditing = () => {
    setEditingPanel(null);
    setEditValue("");
  };

  const saveEditing = () => {
    if (editingPanel) {
      handleEditValue(editingPanel.id, editValue);
    }
  };

  const renderPanelItem = ({ item: panel }) => (
    <View style={styles.panelItem}>
      <View style={styles.panelHeader}>
        <View style={styles.panelInfo}>
          <Text style={styles.panelTitle}>{panel.displayName}</Text>
          <View style={styles.panelMeta}>
            {!panel.isVisible && (
              <Icon
                name="visibility-off"
                size={16}
                color={colors.textSecondary}
              />
            )}
            {panel.isCustom && <Text style={styles.customLabel}>Custom</Text>}
          </View>
        </View>

        <View style={styles.panelActions}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Visible</Text>
            <Switch
              value={panel.isVisible}
              onValueChange={() => handleToggleVisibility(panel.id)}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={
                panel.isVisible ? colors.primary : colors.textSecondary
              }
            />
          </View>

          {panel.isCustom && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePanel(panel.id)}
            >
              <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.valueContainer}
        onPress={() => startEditing(panel)}
      >
        {panel.value ? (
          <Text style={styles.valueText}>{panel.value}</Text>
        ) : (
          <Text style={styles.placeholderText}>Tap to add value...</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const AddPanelDialog = () => (
    <Modal
      visible={showAddDialog}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAddDialog(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.addDialogContent}>
          <Text style={styles.addDialogTitle}>Add Quick Info Panel</Text>

          <TextInput
            style={styles.addInput}
            value={newPanelName}
            onChangeText={setNewPanelName}
            placeholder="Panel name"
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />

          <View style={styles.addDialogActions}>
            <TouchableOpacity
              style={[styles.addButton, styles.cancelButton]}
              onPress={() => {
                setShowAddDialog(false);
                setNewPanelName("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, styles.saveButton]}
              onPress={handleAddPanel}
            >
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const EditValueDialog = () => (
    <Modal
      visible={!!editingPanel}
      transparent
      animationType="fade"
      onRequestClose={cancelEditing}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={platform.isIOS ? "padding" : "height"}
      >
        <View style={styles.editDialogContent}>
          <Text style={styles.editDialogTitle}>
            Edit {editingPanel?.displayName}
          </Text>

          <TextInput
            style={styles.editInput}
            value={editValue}
            onChangeText={setEditValue}
            placeholder="Enter value..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.editDialogActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={cancelEditing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={saveEditing}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={platform.isIOS ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Quick Info</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addIconButton}
              onPress={() => setShowAddDialog(true)}
            >
              <Icon name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.description}>
            Show or hide information panels. Edit values directly or add custom
            panels.
          </Text>

          <FlatList
            data={panels.sort((a, b) => a.order - b.order)}
            renderItem={renderPanelItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            key={numColumns}
            style={styles.panelsList}
            showsVerticalScrollIndicator={false}
          />

          <Text style={styles.note}>
            Note: Default panels can be hidden but not deleted. Custom panels
            can be deleted permanently.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* Modals */}
        <AddPanelDialog />
        <EditValueDialog />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "60%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addIconButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  panelsList: {
    flex: 1,
  },
  panelItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  panelInfo: {
    flex: 1,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  panelMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  panelActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  valueContainer: {
    backgroundColor: colors.hover,
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    justifyContent: "center",
  },
  valueText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Add Dialog Styles
  addDialogContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 280,
  },
  addDialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  addInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  addDialogActions: {
    flexDirection: "row",
    gap: 12,
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  // Edit Dialog Styles
  editDialogContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 320,
    maxWidth: "90%",
  },
  editDialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  editDialogActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

import platform from "@platform";
