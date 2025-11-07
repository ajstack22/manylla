import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../context/ThemeContext";
import { MarkdownField } from "../Forms/MarkdownField";
import FileAttachmentList from "../Forms/FileAttachmentList";
import { getScrollViewProps } from "../../utils/platformStyles";
import platform from "../../utils/platform";
import { isFeatureEnabled } from "../../config/featureFlags";

export const EntryDialog = ({
  open,
  onClose,
  onSave,
  entry = null,
  category = "",
  categories = [],
}) => {
  const { colors } = useTheme();
  const isWeb = platform.isWeb;
  const isEditMode = entry !== null;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [attachments, setAttachments] = useState([]);

  // Initialize form when dialog opens or entry changes
  useEffect(() => {
    if (open) {
      if (isEditMode && entry) {
        setTitle(entry.title || "");
        setDescription(entry.description || "");
        setSelectedCategory(entry.category || category);
        setAttachments(entry.attachments || []);
      } else {
        setTitle("");
        setDescription("");
        setSelectedCategory(category || "");
        setAttachments([]);
      }
    }
  }, [open, entry, category, isEditMode]);

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setSelectedCategory("");
    setAttachments([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim() || !selectedCategory) {
      return;
    }

    const entryData = {
      id: isEditMode ? entry.id : `entry-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      date: isEditMode && entry.date ? entry.date : new Date(),
      attachments: attachments,
    };

    onSave(entryData);
    handleClose();
  };

  const handleAddAttachment = (attachment) => {
    setAttachments([...attachments, attachment]);
  };

  const handleDeleteAttachment = (attachmentId) => {
    setAttachments(attachments.filter((att) => att.id !== attachmentId));
  };

  const isValid = title.trim() && selectedCategory;

  const fileAttachmentsEnabled = isFeatureEnabled("ENABLE_FILE_ATTACHMENTS");

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 8,
    },
    required: {
      color: "#E74C3C",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.surface,
    },
    picker: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: "transparent",
    },
    cancelButtonText: {
      color: colors.text.primary,
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    saveButtonDisabled: {
      backgroundColor: colors.text.disabled,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "500",
    },
  });

  return (
    <Modal
      visible={open}
      onRequestClose={handleClose}
      animationType="slide"
      presentationStyle={isWeb ? "pageSheet" : "fullScreen"}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Entry" : "Add Entry"}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} {...getScrollViewProps()}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            {isWeb ? (
              <View style={styles.picker}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <Picker.Item label="Select category..." value="" />
                  {categories.map((cat) => (
                    <Picker.Item
                      key={cat.id}
                      label={cat.displayName}
                      value={cat.id}
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <View style={styles.picker}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <Picker.Item label="Select category..." value="" />
                  {categories.map((cat) => (
                    <Picker.Item
                      key={cat.id}
                      label={cat.displayName}
                      value={cat.id}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <MarkdownField
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Enter description (optional)"
              height={150}
            />
          </View>

          {fileAttachmentsEnabled && (
            <View style={styles.inputContainer}>
              <FileAttachmentList
                attachments={attachments}
                onAdd={handleAddAttachment}
                onDelete={handleDeleteAttachment}
                maxFiles={10}
                editable={true}
                showHeader={true}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              !isValid && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Text style={styles.saveButtonText}>
              {isEditMode ? "Save Changes" : "Add Entry"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
