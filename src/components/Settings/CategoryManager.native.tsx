import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CategoryConfig } from '../../types/ChildProfile';

interface CategoryManagerProps {
  visible: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  onUpdate: (categories: CategoryConfig[]) => void;
}

const colors = {
  primary: '#8B7355',
  secondary: '#A0937D',
  background: '#FDFBF7',
  surface: '#F4E4C1',
  text: '#4A4A4A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  white: '#FFFFFF',
  error: '#D32F2F',
  success: '#2E7D32',
  hover: '#F5F5F5',
};

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  visible,
  onClose,
  categories,
  onUpdate,
}) => {
  const [categoryList, setCategoryList] = useState<CategoryConfig[]>(categories);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleToggleVisibility = (categoryId: string) => {
    const updated = categoryList.map(category =>
      category.id === categoryId ? { ...category, isVisible: !category.isVisible } : category
    );
    setCategoryList(updated);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categoryList.find(c => c.id === categoryId);
    
    if (!category) return;

    if (category.isCustom) {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${category.displayName}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setCategoryList(categoryList.filter(c => c.id !== categoryId));
            }
          }
        ]
      );
    } else {
      // For default categories, just hide them
      handleToggleVisibility(categoryId);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const newCategory: CategoryConfig = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      displayName: newCategoryName,
      color: colors.primary,
      isVisible: true,
      isCustom: true,
      order: categoryList.length,
    };

    setCategoryList([...categoryList, newCategory]);
    setNewCategoryName('');
    setShowAddDialog(false);
  };

  const handleSave = () => {
    onUpdate(categoryList);
    onClose();
  };

  const renderCategoryItem = ({ item: category }: { item: CategoryConfig }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.colorChip, { backgroundColor: category.color }]}>
          <Text style={styles.chipText}>{category.displayName}</Text>
        </View>
        
        <View style={styles.categoryMeta}>
          {!category.isVisible && (
            <Icon name="visibility-off" size={16} color={colors.textSecondary} />
          )}
          {category.isCustom && (
            <Text style={styles.customLabel}>Custom</Text>
          )}
        </View>
      </View>

      <View style={styles.categoryActions}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Visible</Text>
          <Switch
            value={category.isVisible}
            onValueChange={() => handleToggleVisibility(category.id)}
            trackColor={{ false: colors.border, true: colors.secondary }}
            thumbColor={category.isVisible ? colors.primary : colors.textSecondary}
          />
        </View>

        {category.isCustom && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(category.id)}
          >
            <Icon name="delete" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const AddCategoryDialog = () => (
    <View style={styles.addDialog}>
      <View style={styles.addDialogContent}>
        <Text style={styles.addDialogTitle}>Add Custom Category</Text>
        
        <TextInput
          style={styles.addInput}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="Category name"
          placeholderTextColor={colors.textSecondary}
          autoFocus
        />

        <View style={styles.addDialogActions}>
          <TouchableOpacity
            style={[styles.addButton, styles.cancelButton]}
            onPress={() => {
              setShowAddDialog(false);
              setNewCategoryName('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, styles.saveButton]}
            onPress={handleAddCategory}
          >
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Categories</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addIconButton}
              onPress={() => setShowAddDialog(true)}
            >
              <Icon name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.description}>
            Show or hide categories, or add custom categories for organizing entries.
          </Text>

          <FlatList
            data={categoryList.sort((a, b) => a.order - b.order)}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            style={styles.categoriesList}
            showsVerticalScrollIndicator={false}
          />

          <Text style={styles.note}>
            Note: Default categories can be hidden but not deleted. Custom categories can be deleted permanently.
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

        {/* Add Category Dialog */}
        {showAddDialog && <AddCategoryDialog />}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  colorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexShrink: 1,
  },
  chipText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  // Add Dialog Styles
  addDialog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addDialogContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 280,
  },
  addDialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
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
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

