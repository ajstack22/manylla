import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Entry } from '../../types/ChildProfile';
import { getPlaceholder, getRandomExample } from '../../utils/placeholders';

interface EntryFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Omit<Entry, 'id'>) => void;
  category: string;
  entry?: Entry;
  categories?: Array<{ id: string; name: string; displayName: string; color: string }>;
}

const visibilityOptions = [
  { value: 'family', label: 'Family' },
  { value: 'medical', label: 'Medical Team' },
  { value: 'education', label: 'Education Team' },
];

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
};

export const EntryForm: React.FC<EntryFormProps> = ({
  visible,
  onClose,
  onSave,
  category,
  entry,
  categories = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>(
    entry?.visibility || ['private']
  );
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    description: entry?.description || '',
  });

  // Reset form data when modal opens/closes or entry changes
  useEffect(() => {
    if (visible) {
      setSelectedCategory(entry?.category || category || '');
      setSelectedVisibility(entry?.visibility || ['private']);
      setFormData({
        title: entry?.title || '',
        description: entry?.description || '',
      });
    } else {
      // Clear form data when modal closes
      setSelectedCategory('');
      setSelectedVisibility(['private']);
      setFormData({
        title: '',
        description: '',
      });
    }
  }, [visible, entry, category]);

  const handleSubmit = () => {
    if (!selectedCategory.trim()) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
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
    if (!selectedCategory && !category) return 'Entry';
    const catName = selectedCategory || category;
    // Convert category name to title case
    return catName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleVisibility = (option: string) => {
    if (option === 'private') {
      // When checking Private, uncheck all others
      setSelectedVisibility(['private']);
    } else {
      // When checking a non-private option, remove 'private' and add this option
      if (selectedVisibility.includes(option)) {
        // Remove this option
        const newVis = selectedVisibility.filter(v => v !== option);
        // If nothing is selected, default back to private
        setSelectedVisibility(newVis.length > 0 ? newVis : ['private']);
      } else {
        // Add this option and remove private
        setSelectedVisibility(
          selectedVisibility.filter(v => v !== 'private').concat(option)
        );
      }
    }
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="add-circle" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>
            {entry ? 'Edit' : 'Add'} {getCategoryTitle()}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Category selector - only show if we have categories list and not editing */}
          {categories.length > 0 && !entry && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a category" value="" />
                  {categories.map(cat => (
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
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => setFormData({ ...formData, title: value })}
              placeholder={getPlaceholder(category, 'title')}
              placeholderTextColor={colors.textSecondary}
              autoFocus={!entry}
              returnKeyType="next"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => setFormData({ ...formData, description: value })}
              placeholder={getPlaceholder(category, 'description')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Example: {getRandomExample(category) || 'Add details here'}
            </Text>
          </View>

          {/* Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Who can see this?</Text>
            
            {/* Private option */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => toggleVisibility('private')}
            >
              <View style={[
                styles.checkbox,
                selectedVisibility.includes('private') && styles.checkboxChecked
              ]}>
                {selectedVisibility.includes('private') && (
                  <Icon name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Private (Only me)</Text>
            </TouchableOpacity>

            {/* Other visibility options */}
            {visibilityOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.checkboxRow}
                onPress={() => toggleVisibility(option.value)}
              >
                <View style={[
                  styles.checkbox,
                  selectedVisibility.includes(option.value) && styles.checkboxChecked
                ]}>
                  {selectedVisibility.includes(option.value) && (
                    <Icon name="check" size={16} color={colors.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.saveButtonText}>
              {entry ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  button: {
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
});