import platform from "../utils/platform";

/**
 * Unified App Components for Manylla
 * Cross-platform components following StackMap patterns
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { getTextStyle } from "../utils/platformStyles";
import { ThemedModal } from "./Common";
import PhotoUpload from "./Profile/PhotoUpload";
// DatePicker handled through platform-specific implementations
// On web, DateTimePicker remains null and component uses HTML date input instead
// On React Native, it would be imported at the top level in a separate RN-specific file
// This avoids webpack trying to resolve React Native modules
let DateTimePicker = null;

// Color constants (manila envelope theme)
export const colors = {
  primary: "#A08670",
  secondary: "#6B5D54",
  background: {
    default: "#FDFBF7",
    paper: "#FFFFFF",
    manila: "#F4E4C1",
  },
  text: {
    primary: "#333333",
    secondary: "#666666",
    disabled: "#999999",
  },
  border: "#E0E0E0",
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
};

// Entry Form Component
export const EntryForm = ({
  visible,
  onClose,
  onSave,
  category,
  entry,
  categories = [],
  themeColors,
}) => {
  // Use theme colors if provided, otherwise fall back to default
  const activeColors = themeColors || colors;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Create dynamic styles based on active colors
  const dynamicStyles = createDynamicStyles(activeColors);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || "");
      setDescription(entry.description || "");
      setSelectedCategory(entry.category || category || "");
      setDate(entry.date ? new Date(entry.date) : new Date());
    } else {
      // Reset for new entry
      setTitle("");
      setDescription("");
      setSelectedCategory(category || "");
      setDate(new Date());
    }
  }, [entry, category, visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      date,
    });

    // Reset form
    setTitle("");
    setDescription("");
    onClose();
  };

  const renderContent = () => (
    <KeyboardAvoidingView
      behavior={platform.isIOS ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={dynamicStyles.formContainer}
        contentContainerStyle={dynamicStyles.formContentContainer}
      >
        {/* Category Selector */}
        <View style={dynamicStyles.inputGroup}>
          <Text style={dynamicStyles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  dynamicStyles.categoryChip,
                  selectedCategory === cat.name &&
                    dynamicStyles.categoryChipActive,
                  {
                    backgroundColor:
                      selectedCategory === cat.name
                        ? cat.color
                        : activeColors.background.manila,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text
                  style={[
                    dynamicStyles.categoryChipText,
                    selectedCategory === cat.name &&
                      dynamicStyles.categoryChipTextActive,
                  ]}
                >
                  {cat.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title Input */}
        <View style={dynamicStyles.inputGroup}>
          <Text style={dynamicStyles.label}>Title *</Text>
          <TextInput
            style={[
              dynamicStyles.input,
              getTextStyle("input"),
              platform.isAndroid && { color: "#000000" },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title..."
            placeholderTextColor={
              platform.isAndroid ? "#999" : activeColors.text.disabled
            }
          />
        </View>

        {/* Description Input */}
        <View style={dynamicStyles.inputGroup}>
          <Text style={dynamicStyles.label}>Description</Text>
          <TextInput
            style={[
              dynamicStyles.input,
              dynamicStyles.textArea,
              getTextStyle("input"),
              platform.isAndroid && { color: "#000000" },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={
              platform.isAndroid ? "#999" : activeColors.text.disabled
            }
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Date Picker */}
        <View style={dynamicStyles.inputGroup}>
          <Text style={dynamicStyles.label}>Date</Text>
          <TouchableOpacity
            style={dynamicStyles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={dynamicStyles.dateText}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && !platform.isWeb && DateTimePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={dynamicStyles.formActions}>
          <TouchableOpacity
            style={[dynamicStyles.button, dynamicStyles.buttonCancel]}
            onPress={onClose}
          >
            <Text style={dynamicStyles.buttonCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
            onPress={handleSubmit}
          >
            <Text style={dynamicStyles.buttonPrimaryText}>
              {entry ? "Update" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title={entry ? "Edit Entry" : "Add Entry"}
      headerStyle="primary"
      presentationStyle="formSheet"
    >
      {renderContent()}
    </ThemedModal>
  );
};

// Profile Edit Form Component
export const ProfileEditForm = ({
  visible,
  onClose,
  onSave,
  profile,
  themeColors,
}) => {
  // Use theme colors if provided, otherwise fall back to default
  const activeColors = themeColors || colors;
  const [name, setName] = useState(profile?.name || "");
  const [preferredName, setPreferredName] = useState(
    profile?.preferredName || "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photo, setPhoto] = useState(profile?.photo || "");

  // Update form state when profile prop changes or modal opens
  useEffect(() => {
    if (visible && profile) {
      setName(profile.name || "");
      setPreferredName(profile.preferredName || "");
      setDateOfBirth(
        profile.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(),
      );
      setPhoto(profile.photo || "");
    }
  }, [visible, profile]);

  // Create dynamic styles based on active colors
  const dynamicStyles = createDynamicStyles(activeColors);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    onSave({
      name: name.trim(),
      preferredName: preferredName.trim() || name.trim(),
      dateOfBirth,
      photo,
    });
    onClose();
  };

  const renderContent = () => (
    <ScrollView
      style={dynamicStyles.formContainer}
      contentContainerStyle={dynamicStyles.formContentContainer}
    >
      {/* Photo Upload Section */}
      <View style={dynamicStyles.inputGroup}>
        <PhotoUpload
          currentPhoto={photo}
          onPhotoChange={(encryptedPhoto) => setPhoto(encryptedPhoto)}
          onPhotoRemove={() => setPhoto("")}
          size={100}
        />
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Name *</Text>
        <TextInput
          style={[
            dynamicStyles.input,
            getTextStyle("input"),
            platform.isAndroid && { color: "#000000" },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={
            platform.isAndroid ? "#999" : activeColors.text.disabled
          }
        />
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Preferred Name</Text>
        <TextInput
          style={[
            dynamicStyles.input,
            getTextStyle("input"),
            platform.isAndroid && { color: "#000000" },
          ]}
          value={preferredName}
          onChangeText={setPreferredName}
          placeholder="What they like to be called"
          placeholderTextColor={
            platform.isAndroid ? "#999" : activeColors.text.disabled
          }
        />
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={dynamicStyles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={dynamicStyles.dateText}>
            {dateOfBirth.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && !platform.isWeb && DateTimePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDateOfBirth(selectedDate);
              }
            }}
          />
        )}
      </View>

      <View style={dynamicStyles.formActions}>
        <TouchableOpacity
          style={[dynamicStyles.button, dynamicStyles.buttonCancel]}
          onPress={onClose}
        >
          <Text style={dynamicStyles.buttonCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
          onPress={handleSubmit}
        >
          <Text style={dynamicStyles.buttonPrimaryText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      headerStyle="primary"
      presentationStyle="formSheet"
    >
      {renderContent()}
    </ThemedModal>
  );
};

// Function to create dynamic styles based on theme colors
const createDynamicStyles = (activeColors) =>
  StyleSheet.create({
    modalSafeArea: {
      flex: 1,
      backgroundColor: activeColors.background.paper,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: activeColors.border,
      backgroundColor: activeColors.background.paper,
    },
    modalHeaderTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: activeColors.text.primary,
    },
    modalHeaderCloseButton: {
      padding: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: platform.isWeb ? 20 : 0,
    },
    modalCloseText: {
      fontSize: 24,
      color: activeColors.text.secondary,
    },
    formContainer: {
      flex: 1,
    },
    formContentContainer: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: activeColors.text.secondary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: activeColors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: activeColors.text.primary,
      backgroundColor: activeColors.background.default,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: "top",
    },
    categoryScroll: {
      flexDirection: "row",
      marginTop: 8,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: activeColors.border,
    },
    categoryChipActive: {
      borderColor: "transparent",
    },
    categoryChipText: {
      fontSize: 14,
      color: activeColors.text.secondary,
    },
    categoryChipTextActive: {
      color: "white",
      fontWeight: "600",
    },
    dateButton: {
      borderWidth: 1,
      borderColor: activeColors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: activeColors.background.default,
    },
    dateText: {
      fontSize: 16,
      color: activeColors.text.primary,
    },
    formActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 24,
      gap: 12,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 100,
      alignItems: "center",
    },
    buttonPrimary: {
      backgroundColor: activeColors.primary,
    },
    buttonPrimaryText: {
      color: "white",
      fontWeight: "600",
      fontSize: 16,
    },
    buttonCancel: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: activeColors.border,
    },
    buttonCancelText: {
      color: activeColors.text.secondary,
      fontSize: 16,
    },
    categoryList: {
      maxHeight: 400,
    },
    categoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: activeColors.border,
    },
    categoryItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    categoryColorDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    categoryItemName: {
      fontSize: 16,
      color: activeColors.text.primary,
    },
    categoryItemActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    categoryMoveButtons: {
      flexDirection: "row",
      gap: 40,
    },
    moveButton: {
      width: 28,
      height: 28,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: activeColors.background.manila,
      borderRadius: 4,
    },
    moveButtonDisabled: {
      opacity: 0.3,
    },
    moveButtonText: {
      fontSize: 16,
      color: activeColors.text.primary,
      fontWeight: "bold",
    },
  });

// Create default styles with default colors (for backward compatibility)
const styles = createDynamicStyles(colors);

const UnifiedAppComponents = {
  EntryForm,
  ProfileEditForm,
  colors,
  styles,
};

export default UnifiedAppComponents;
