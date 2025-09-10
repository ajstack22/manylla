import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getPlaceholder, getRandomExample } from "../../utils/placeholders";
import { useTheme } from "../../context/ThemeContext";

const visibilityOptions = [
  { value: "family", label: "Family" },
  { value: "medical", label: "Medical Team" },
  { value: "education", label: "Education Team" },
];

export const EntryForm = ({
  visible,
  onClose,
  onSave,
  category,
  entry,
  categories = [],
}) => {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [selectedVisibility, setSelectedVisibility] = useState(
    entry?.visibility || ["private"]
  );
  const [formData, setFormData] = useState({
    title: entry?.title || "",
    description: entry?.description || "",
  });

  // Reset form data when modal opens/closes or entry changes
  useEffect(() => {
    if (visible) {
      setSelectedCategory(entry?.category || category || "");
      setSelectedVisibility(entry?.visibility || ["private"]);
      setFormData({
        title: entry?.title || "",
        description: entry?.description || "",
      });
    } else {
      // Clear form data when modal closes
      setSelectedCategory("");
      setSelectedVisibility(["private"]);
      setFormData({
        title: "",
        description: "",
      });
    }
  }, [visible, entry, category]);

  const handleSubmit = () => {
    if (!selectedCategory.trim()) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    onSave({
      ...formData,
      category: selectedCategory,
      date: new Date(),
      visibility: selectedVisibility,
    });
    onClose();
  };

  const getCategoryTitle = () => {
    if (!selectedCategory && !category) return "Entry";
    const catName = selectedCategory || category;
    // Convert category name to title case
    return catName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleVisibility = (option) => {
    if (option === "private") {
      // When checking Private, uncheck all others
      setSelectedVisibility(["private"]);
    } else {
      // When checking a non-private option, remove 'private' and add this option
      if (selectedVisibility.includes(option)) {
        // Remove this option
        const newVis = selectedVisibility.filter((v) => v !== option);
        // If nothing is selected, default back to private
        setSelectedVisibility(newVis.length > 0 ? newVis : ["private"]);
      } else {
        // Add this option and remove private
        setSelectedVisibility(
          selectedVisibility.filter((v) => v !== "private").concat(option)
        );
      }
    }
  };

  const styles = getStyles(colors);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {entry ? "Edit" : "Add"} {getCategoryTitle()}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Category selector - only show if we have categories list and not editing */}
            {categories.length > 0 && !entry && (
              <View style={styles.formField}>
                <Text style={styles.modalLabel}>Category *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={setSelectedCategory}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a category" value="" />
                    {categories.map((cat) => (
                      <Picker.Item
                        key={cat.id}
                        label={cat.displayName}
                        value={cat.name}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Title */}
            <View style={styles.formField}>
              <Text style={styles.modalLabel}>Title *</Text>
              <TextInput
                style={styles.modalInput}
                value={formData.title}
                onChangeText={(value) =>
                  setFormData({ ...formData, title: value })
                }
                placeholder={getPlaceholder(category, "title")}
                placeholderTextColor={colors.text.disabled}
                autoFocus={!entry}
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View style={styles.formField}>
              <Text style={styles.modalLabel}>Description *</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={formData.description}
                onChangeText={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder={getPlaceholder(category, "description")}
                placeholderTextColor={colors.text.disabled}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.helperText}>
                Example: {getRandomExample(category) || "Add details here"}
              </Text>
            </View>

            {/* Visibility */}
            <View style={styles.formField}>
              <Text style={styles.modalLabel}>Who can see this?</Text>

              {/* Private option */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => toggleVisibility("private")}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedVisibility.includes("private") &&
                      styles.checkboxChecked,
                  ]}
                >
                  {selectedVisibility.includes("private") && (
                    <Icon name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Private (Only me)</Text>
              </TouchableOpacity>

              {/* Other visibility options */}
              {visibilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.checkboxRow}
                  onPress={() => toggleVisibility(option.value)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedVisibility.includes(option.value) &&
                        styles.checkboxChecked,
                    ]}
                  >
                    {selectedVisibility.includes(option.value) && (
                      <Icon name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>
                {entry ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getStyles = (colors) => StyleSheet.create({
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.select({
      web: 'rgba(0, 0, 0, 0.5)',
      ios: 'rgba(0, 0, 0, 0.4)',
      android: 'rgba(0, 0, 0, 0.5)',
    }),
    ...Platform.select({
      web: {
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      },
      default: {}
    }),
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    maxWidth: Platform.select({
      web: 600,
      default: '90%',
    }),
    width: Platform.select({
      web: 600,
      default: '90%',
    }),
    maxHeight: Platform.select({
      web: '80vh',
      default: '80%',
    }),
    marginHorizontal: Platform.select({
      web: 'auto',
      default: 20,
    }),
    ...Platform.select({
      web: {
        boxShadow: `0 10px 40px ${colors.primary}26`,
        border: `1px solid ${colors.border}`,
      },
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Platform.select({
      web: `${colors.primary}CC`,
      default: colors.primary,
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.select({
      web: '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    letterSpacing: 0.15,
  },
  modalCloseButton: {
    padding: 8,
    marginRight: -8,
    borderRadius: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      },
      default: {}
    }),
  },
  modalBody: {
    padding: 20,
    backgroundColor: colors.background.paper,
    maxHeight: Platform.select({
      web: 'calc(80vh - 140px)',
      default: '70%',
    }),
  },
  formField: {
    marginVertical: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.paper,
    ...Platform.select({
      web: {
        outline: 'none',
        transition: 'border-color 0.2s ease',
      },
      default: {}
    }),
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.background.paper,
  },
  picker: {
    height: 50,
    color: colors.text.primary,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.paper,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      default: {}
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      default: {}
    }),
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});