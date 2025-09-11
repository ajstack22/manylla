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
  Platform,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Switch,
  FlatList,
  Dimensions,
} from "react-native";
import { ThemedModal } from "./Common";
// DatePicker handled through platform-specific implementations
let DateTimePicker = null;
if (Platform.OS !== "web") {
  try {
    // Use eval to prevent webpack from analyzing this require
    DateTimePicker = eval("require")(
      "@react-native-community/datetimepicker",
    ).default;
  } catch (e) {
    // Fallback - DatePicker not available
  }
}

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  selectedCategory === cat.name && dynamicStyles.categoryChipActive,
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
            style={dynamicStyles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title..."
            placeholderTextColor={activeColors.text.disabled}
          />
        </View>

        {/* Description Input */}
        <View style={dynamicStyles.inputGroup}>
          <Text style={dynamicStyles.label}>Description</Text>
          <TextInput
            style={[dynamicStyles.input, dynamicStyles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={activeColors.text.disabled}
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
            <Text style={dynamicStyles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && Platform.OS !== "web" && DateTimePicker && (
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
export const ProfileEditForm = ({ visible, onClose, onSave, profile, themeColors }) => {
  // Use theme colors if provided, otherwise fall back to default
  const activeColors = themeColors || colors;
  const [name, setName] = useState(profile?.name || "");
  const [preferredName, setPreferredName] = useState(
    profile?.preferredName || "",
  );
  const [pronouns, setPronouns] = useState(profile?.pronouns || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
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
      pronouns: pronouns.trim(),
      dateOfBirth,
    });
    onClose();
  };

  const renderContent = () => (
    <ScrollView
      style={dynamicStyles.formContainer}
      contentContainerStyle={dynamicStyles.formContentContainer}
    >
      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Name *</Text>
        <TextInput
          style={dynamicStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={activeColors.text.disabled}
        />
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Preferred Name</Text>
        <TextInput
          style={dynamicStyles.input}
          value={preferredName}
          onChangeText={setPreferredName}
          placeholder="What they like to be called"
          placeholderTextColor={activeColors.text.disabled}
        />
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Pronouns</Text>
        <TextInput
          style={dynamicStyles.input}
          value={pronouns}
          onChangeText={setPronouns}
          placeholder="e.g., she/her, he/him, they/them"
          placeholderTextColor={activeColors.text.disabled}
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
        {showDatePicker && Platform.OS !== "web" && DateTimePicker && (
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

// Category Manager Component
export const CategoryManager = ({ visible, onClose, categories, onSave, themeColors }) => {
  const [localCategories, setLocalCategories] = useState(categories || []);
  
  // Use theme colors if provided, otherwise fall back to default
  const activeColors = themeColors || colors;
  
  // Create dynamic styles based on active colors
  const dynamicStyles = createDynamicStyles(activeColors);

  const toggleCategory = (categoryId) => {
    setLocalCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isVisible: !cat.isVisible } : cat,
      ),
    );
  };

  const moveCategory = (categoryId, direction) => {
    const index = localCategories.findIndex((cat) => cat.id === categoryId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === localCategories.length - 1)
    ) {
      return;
    }

    const newCategories = [...localCategories];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newCategories[index], newCategories[newIndex]] = [
      newCategories[newIndex],
      newCategories[index],
    ];

    // Update order values
    newCategories.forEach((cat, i) => {
      cat.order = i;
    });

    setLocalCategories(newCategories);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localCategories);
    }
    onClose();
  };

  const renderContent = () => (
    <View style={[dynamicStyles.formContainer, { padding: 20 }]}>
      <ScrollView style={dynamicStyles.categoryList}>
        {localCategories.map((category, index) => (
          <View key={category.id} style={dynamicStyles.categoryItem}>
            <View style={dynamicStyles.categoryItemLeft}>
              <View
                style={[
                  dynamicStyles.categoryColorDot,
                  { backgroundColor: category.color },
                ]}
              />
              <Text style={dynamicStyles.categoryItemName}>
                {category.displayName}
              </Text>
            </View>

            <View style={dynamicStyles.categoryItemActions}>
              <Switch
                value={category.isVisible}
                onValueChange={() => toggleCategory(category.id)}
                trackColor={{ false: activeColors.border, true: activeColors.primary }}
                thumbColor={activeColors.background.paper}
              />

              <View style={dynamicStyles.categoryMoveButtons}>
                <TouchableOpacity
                  onPress={() => moveCategory(category.id, "up")}
                  disabled={index === 0}
                  style={[
                    dynamicStyles.moveButton,
                    index === 0 && dynamicStyles.moveButtonDisabled,
                  ]}
                >
                  <Text style={dynamicStyles.moveButtonText}>↑</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => moveCategory(category.id, "down")}
                  disabled={index === localCategories.length - 1}
                  style={[
                    dynamicStyles.moveButton,
                    index === localCategories.length - 1 &&
                      dynamicStyles.moveButtonDisabled,
                  ]}
                >
                  <Text style={dynamicStyles.moveButtonText}>↓</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={dynamicStyles.formActions}>
        <TouchableOpacity
          style={[dynamicStyles.button, dynamicStyles.buttonCancel]}
          onPress={onClose}
        >
          <Text style={dynamicStyles.buttonCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
          onPress={handleSave}
        >
          <Text style={dynamicStyles.buttonPrimaryText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="Manage Categories"
      headerStyle="primary"
      presentationStyle="formSheet"
    >
      {renderContent()}
    </ThemedModal>
  );
};

// Function to create dynamic styles based on theme colors
const createDynamicStyles = (activeColors) => StyleSheet.create({
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
    paddingHorizontal: Platform.OS === "web" ? 20 : 0,
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

export default {
  EntryForm,
  ProfileEditForm,
  CategoryManager,
  colors,
  styles,
};
