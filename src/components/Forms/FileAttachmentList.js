/**
 * FileAttachmentList - Displays and manages a list of file attachments
 * Shows chips for each attachment with add/delete capabilities
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import FileAttachmentButton from './FileAttachmentButton';
import FileAttachmentChip from './FileAttachmentChip';
import { useTheme } from '../../context/ThemeContext';

/**
 * FileAttachmentList component
 * @param {Object} props - Component props
 * @param {Array} props.attachments - Array of attachment objects
 * @param {Function} props.onAdd - Callback when file is added
 * @param {Function} props.onDelete - Callback when file is deleted
 * @param {number} props.maxFiles - Maximum number of files allowed
 * @param {boolean} props.editable - Whether list is editable (can add/delete)
 * @param {boolean} props.showHeader - Whether to show header with count
 * @param {Object} props.style - Additional styles
 */
const FileAttachmentList = ({
  attachments = [],
  onAdd,
  onDelete,
  maxFiles = 10,
  editable = true,
  showHeader = true,
  style
}) => {
  const { theme } = useTheme();

  const canAddMore = editable && attachments.length < maxFiles;

  const handleDeleteAttachment = (attachmentId) => {
    Alert.alert(
      'Delete File?',
      'This will remove the file from this entry.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(attachmentId);
            }
          }
        }
      ]
    );
  };

  const handleFileSelected = (metadata) => {
    if (onAdd) {
      // Decrypt the metadata for display
      const displayMetadata = {
        ...metadata,
        // The encrypted meta will be decrypted when needed for display
        // For now, we'll use a placeholder until proper decryption
        originalFilename: metadata.originalFilename || 'File',
        mimeType: metadata.mimeType || 'application/octet-stream'
      };
      onAdd(displayMetadata);
    }
  };

  if (attachments.length === 0 && !editable) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.colors.onBackground }]}>
            Attachments
          </Text>
          <Text style={[styles.countText, { color: theme.colors.onSurfaceVariant }]}>
            {attachments.length}/{maxFiles}
          </Text>
        </View>
      )}

      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipContainer}
          contentContainerStyle={styles.chipContent}
        >
          {attachments.map((attachment) => (
            <FileAttachmentChip
              key={attachment.id}
              attachment={attachment}
              onDelete={editable ? handleDeleteAttachment : null}
              deletable={editable}
            />
          ))}
        </ScrollView>
      )}

      {canAddMore && (
        <FileAttachmentButton
          onFileSelected={handleFileSelected}
          style={styles.addButton}
        />
      )}

      {editable && !canAddMore && attachments.length >= maxFiles && (
        <Text style={[styles.limitText, { color: theme.colors.onSurfaceVariant }]}>
          Maximum {maxFiles} files per entry
        </Text>
      )}

      {attachments.length === 0 && editable && (
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          No files attached. Tap "Add File" to attach documents or images.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600'
  },
  countText: {
    fontSize: 14
  },
  chipContainer: {
    marginVertical: 8
  },
  chipContent: {
    paddingHorizontal: 4
  },
  addButton: {
    marginTop: 8
  },
  limitText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16
  }
});

export default FileAttachmentList;