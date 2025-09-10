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
import { useTheme } from "../../context/ThemeContext";

export const CategoryManager = ({ visible, onClose, categories, onUpdate }) => {
  const { colors } = useTheme();
  const [categoryList, setCategoryList] = useState(categories);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleToggleVisibility = (categoryId) => {
    const updated = categoryList.map((category) =>
      category.id === categoryId
        ? { ...category, isVisible: !category.isVisible }
        : category,
    );
    setCategoryList(updated);
  };

  const handleDeleteCategory = (categoryId) => {
    const category = categoryList.find((c) => c.id === categoryId);

    if (!category) return;

    if (category.isCustom) {
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${category.displayName}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setCategoryList(categoryList.filter((c) => c.id !== categoryId));
            },
          },
        ],
      );
    } else {
      // For default categories, just hide them
      handleToggleVisibility(categoryId);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const newCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
      displayName: newCategoryName,
      color: colors.primary,
      isVisible: true,
      isCustom: true,
      order: categoryList.length,
    };

    setCategoryList([...categoryList, newCategory]);
    setNewCategoryName("");
    setShowAddDialog(false);
  };

  const handleSave = () => {
    onUpdate(categoryList);
    onClose();
  };

  const renderCategoryItem = ({ item: category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{category.displayName}</Text>

        <View style={styles.categoryMeta}>
          {!category.isVisible && (
            <Icon
              name="visibility-off"
              size={16}
              color={colors.text.secondary}
            />
          )}
          {category.isCustom && <Text style={styles.customBadge}>Custom</Text>}
        </View>
      </View>

      <View style={styles.categoryActions}>
        <View style={styles.visibilityToggle}>
          <Text style={styles.toggleLabel}>Visible</Text>
          <Switch
            value={category.isVisible}
            onValueChange={() => handleToggleVisibility(category.id)}
            trackColor={{ false: colors.border, true: `${colors.primary}66` }}
            thumbColor={
              category.isVisible ? colors.primary : colors.text.secondary
            }
          />
        </View>

        {category.isCustom && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(category.id)}
          >
            <Icon name="delete" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const styles = getStyles(colors);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Categories</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Add Category Section */}
            <View style={styles.addSection}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddDialog(!showAddDialog)}
              >
                <Icon name="add-circle" size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Custom Category</Text>
              </TouchableOpacity>

              {showAddDialog && (
                <View style={styles.addInputContainer}>
                  <TextInput
                    style={styles.modalInput}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Enter category name"
                    placeholderTextColor={colors.text.disabled}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.confirmAddButton}
                    onPress={handleAddCategory}
                  >
                    <Icon name="check" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Categories List */}
            <FlatList
              data={categoryList}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon
                    name="category"
                    size={48}
                    color={colors.text.disabled}
                  />
                  <Text style={styles.emptyText}>No categories available</Text>
                </View>
              }
            />
          </View>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: Platform.select({
        web: "rgba(0, 0, 0, 0.5)",
        ios: "rgba(0, 0, 0, 0.4)",
        android: "rgba(0, 0, 0, 0.5)",
      }),
      ...Platform.select({
        web: {
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        },
        default: {},
      }),
      zIndex: 999,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      maxWidth: Platform.select({
        web: 600,
        default: "90%",
      }),
      width: Platform.select({
        web: 600,
        default: "90%",
      }),
      maxHeight: Platform.select({
        web: "80vh",
        default: "80%",
      }),
      marginHorizontal: Platform.select({
        web: "auto",
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
      overflow: "hidden",
    },
    modalHeader: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: Platform.select({
        web: `${colors.primary}CC`,
        default: colors.primary,
      }),
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FFFFFF",
      fontFamily: Platform.select({
        web: '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        default: "System",
      }),
      letterSpacing: 0.15,
    },
    modalCloseButton: {
      padding: 8,
      marginRight: -8,
      borderRadius: 20,
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        },
        default: {},
      }),
    },
    modalBody: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background.paper,
    },
    addSection: {
      marginBottom: 20,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
      gap: 8,
    },
    addButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "500",
    },
    addInputContainer: {
      flexDirection: "row",
      marginTop: 12,
      gap: 8,
    },
    modalInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
      ...Platform.select({
        web: {
          outline: "none",
          transition: "border-color 0.2s ease",
        },
        default: {},
      }),
    },
    confirmAddButton: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingHorizontal: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    categoryItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: colors.background.paper,
      ...Platform.select({
        web: {
          transition: "background-color 0.2s ease",
          ":hover": {
            backgroundColor: `${colors.primary}08`,
          },
        },
        default: {},
      }),
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 4,
    },
    categoryMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    customBadge: {
      fontSize: 12,
      color: colors.text.secondary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: colors.background.manila,
      borderRadius: 4,
    },
    categoryActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    visibilityToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    toggleLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 6,
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          ":hover": {
            backgroundColor: `${colors.primary}15`,
          },
        },
        default: {},
      }),
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.text.secondary,
    },
    modalFooter: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
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
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
        default: {},
      }),
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      minWidth: 100,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
        default: {},
      }),
    },
    secondaryButtonText: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
  });
