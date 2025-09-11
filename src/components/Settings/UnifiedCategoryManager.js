import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";

export const UnifiedCategoryManager = ({
  open,
  onClose,
  categories,
  onUpdate,
}) => {
  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleToggleVisibility = (id) => {
    setLocalCategories((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isVisible: !item.isVisible } : item,
      ),
    );
  };

  const handleDragEnd = ({ data }) => {
    const updatedCategories = data.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setLocalCategories(updatedCategories);
  };

  const handleSave = () => {
    onUpdate(localCategories);
    onClose();
  };

  const renderItem = ({ item, drag, isActive }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.categoryItem, isActive && styles.categoryItemActive]}
        >
          <View style={styles.categoryContent}>
            {/* Drag Handle */}
            <Text style={styles.dragHandle}>☰</Text>

            {/* Color Indicator */}
            <View
              style={[styles.colorIndicator, { backgroundColor: item.color }]}
            />

            {/* Category Info */}
            <View style={styles.categoryInfo}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{item.displayName}</Text>
                {item.isQuickInfo && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>Priority</Text>
                  </View>
                )}
                {item.isCustom && (
                  <View style={[styles.chip, styles.chipOutline]}>
                    <Text style={[styles.chipText, styles.chipTextOutline]}>
                      Custom
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.categoryStatus}>
                {item.isVisible ? "Visible in profile" : "Hidden from profile"}
              </Text>
            </View>

            {/* Visibility Toggle */}
            <Switch
              value={item.isVisible}
              onValueChange={() => handleToggleVisibility(item.id)}
              trackColor={{ false: "#E0E0E0", true: "#A08670" }}
              thumbColor={item.isVisible ? "#FFFFFF" : "#FAFAFA"}
            />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏷️ Manage Categories</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Long press and drag to reorder categories. Toggle switches to
            show/hide in profile.
          </Text>
        </View>

        {/* Category List */}
        <View style={styles.listContainer}>
          <DraggableFlatList
            data={localCategories}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  instructions: {
    backgroundColor: "#F4E4C1",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  categoryItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryItemActive: {
    borderColor: "#A08670",
    backgroundColor: "#FAFAFA",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dragHandle: {
    fontSize: 20,
    color: "#999",
    marginRight: 12,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  categoryStatus: {
    fontSize: 13,
    color: "#666",
  },
  chip: {
    backgroundColor: "#A08670",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
  },
  chipOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#A08670",
  },
  chipText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  chipTextOutline: {
    color: "#A08670",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#A08670",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default UnifiedCategoryManager;
