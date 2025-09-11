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
  Modal,
  Platform,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Switch,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native";
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
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibility, setVisibility] = useState(["private"]);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || "");
      setDescription(entry.description || "");
      setSelectedCategory(entry.category || category || "");
      setDate(entry.date ? new Date(entry.date) : new Date());
      setVisibility(entry.visibility || ["private"]);
    } else {
      // Reset for new entry
      setTitle("");
      setDescription("");
      setSelectedCategory(category || "");
      setDate(new Date());
      setVisibility(["private"]);
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
      visibility,
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
        style={styles.formContainer}
        contentContainerStyle={styles.formContentContainer}
      >
        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.name && styles.categoryChipActive,
                  {
                    backgroundColor:
                      selectedCategory === cat.name
                        ? cat.color
                        : colors.background.manila,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.name &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {cat.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title..."
            placeholderTextColor={colors.text.disabled}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={colors.text.disabled}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
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

        {/* Visibility Options */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Share With</Text>
          <View style={styles.visibilityOptions}>
            {["family", "medical", "education"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.visibilityChip,
                  visibility.includes(option) && styles.visibilityChipActive,
                ]}
                onPress={() => {
                  if (visibility.includes(option)) {
                    setVisibility(visibility.filter((v) => v !== option));
                  } else {
                    setVisibility([...visibility, option]);
                  }
                }}
              >
                <Text
                  style={[
                    styles.visibilityChipText,
                    visibility.includes(option) &&
                      styles.visibilityChipTextActive,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.formActions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={onClose}
          >
            <Text style={styles.buttonCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonPrimaryText}>
              {entry ? "Update" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>
            {entry ? "Edit Entry" : "Add Entry"}
          </Text>
          <TouchableOpacity
            style={styles.modalHeaderCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

// Profile Edit Form Component
export const ProfileEditForm = ({ visible, onClose, onSave, profile }) => {
  const [name, setName] = useState(profile?.name || "");
  const [preferredName, setPreferredName] = useState(
    profile?.preferredName || "",
  );
  const [pronouns, setPronouns] = useState(profile?.pronouns || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      style={styles.formContainer}
      contentContainerStyle={styles.formContentContainer}
    >
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={colors.text.disabled}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Name</Text>
        <TextInput
          style={styles.input}
          value={preferredName}
          onChangeText={setPreferredName}
          placeholder="What they like to be called"
          placeholderTextColor={colors.text.disabled}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pronouns</Text>
        <TextInput
          style={styles.input}
          value={pronouns}
          onChangeText={setPronouns}
          placeholder="e.g., she/her, he/him, they/them"
          placeholderTextColor={colors.text.disabled}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
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

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonCancel]}
          onPress={onClose}
        >
          <Text style={styles.buttonCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonPrimaryText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.modalHeaderCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

// Category Manager Component
export const CategoryManager = ({ visible, onClose, categories, onSave }) => {
  const [localCategories, setLocalCategories] = useState(categories || []);

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
    <View style={[styles.formContainer, { padding: 20 }]}>
      <ScrollView style={styles.categoryList}>
        {localCategories.map((category, index) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryItemLeft}>
              <View
                style={[
                  styles.categoryColorDot,
                  { backgroundColor: category.color },
                ]}
              />
              <Text style={styles.categoryItemName}>
                {category.displayName}
              </Text>
            </View>

            <View style={styles.categoryItemActions}>
              <Switch
                value={category.isVisible}
                onValueChange={() => toggleCategory(category.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background.paper}
              />

              <View style={styles.categoryMoveButtons}>
                <TouchableOpacity
                  onPress={() => moveCategory(category.id, "up")}
                  disabled={index === 0}
                  style={[
                    styles.moveButton,
                    index === 0 && styles.moveButtonDisabled,
                  ]}
                >
                  <Text style={styles.moveButtonText}>↑</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => moveCategory(category.id, "down")}
                  disabled={index === localCategories.length - 1}
                  style={[
                    styles.moveButton,
                    index === localCategories.length - 1 &&
                      styles.moveButtonDisabled,
                  ]}
                >
                  <Text style={styles.moveButtonText}>↓</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonCancel]}
          onPress={onClose}
        >
          <Text style={styles.buttonCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleSave}
        >
          <Text style={styles.buttonPrimaryText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Manage Categories</Text>
          <TouchableOpacity
            style={styles.modalHeaderCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background.paper,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
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
    color: colors.text.secondary,
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
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.default,
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
    borderColor: colors.border,
  },
  categoryChipActive: {
    borderColor: "transparent",
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background.default,
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  visibilityOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  visibilityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.default,
    marginRight: 8,
    marginBottom: 8,
  },
  visibilityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  visibilityChipText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  visibilityChipTextActive: {
    color: "white",
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
    backgroundColor: colors.primary,
  },
  buttonPrimaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonCancelText: {
    color: colors.text.secondary,
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
    borderBottomColor: colors.border,
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
    color: colors.text.primary,
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
    backgroundColor: colors.background.manila,
    borderRadius: 4,
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  moveButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "bold",
  },
});

export default {
  EntryForm,
  ProfileEditForm,
  CategoryManager,
  colors,
  styles,
};
