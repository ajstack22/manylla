/**
 * FileAttachmentChip - Displays a single file attachment as a chip
 * Shows file icon, name, size, and delete button
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Get appropriate icon for file type
 * @param {string} mimeType - MIME type of file
 * @returns {string} Emoji icon
 */
const getFileIcon = (mimeType) => {
  if (!mimeType) return '📎';

  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.startsWith('text/')) return '📃';

  return '📎';
};

/**
 * Format file size to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};

/**
 * Truncate filename if too long
 * @param {string} filename - Original filename
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated filename
 */
const truncateFilename = (filename, maxLength = 25) => {
  if (!filename || filename.length <= maxLength) return filename;

  const extension = filename.split('.').pop();
  const name = filename.substring(0, filename.lastIndexOf('.'));

  if (extension && extension.length < 10) {
    const truncatedName = name.substring(0, maxLength - extension.length - 4);
    return `${truncatedName}...${extension}`;
  }

  return filename.substring(0, maxLength - 3) + '...';
};

/**
 * FileAttachmentChip component
 * @param {Object} props - Component props
 * @param {Object} props.attachment - Attachment metadata object
 * @param {Function} props.onDelete - Callback when delete is pressed
 * @param {Function} props.onPress - Callback when chip is pressed (for viewing)
 * @param {boolean} props.loading - Whether the file is being processed
 * @param {boolean} props.deletable - Whether delete button should be shown
 * @param {Object} props.style - Additional styles
 */
const FileAttachmentChip = ({
  attachment,
  onDelete,
  onPress,
  loading = false,
  deletable = true,
  style
}) => {
  const { colors } = useTheme();

  // Extract file info from attachment
  const fileName = attachment?.originalFilename || attachment?.filename || 'Unknown file';
  const fileSize = attachment?.size || 0;
  const mimeType = attachment?.mimeType || attachment?.type || '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || !onPress}
      style={[
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: loading ? 0.6 : 1
        },
        style
      ]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { color: colors.text.primary }]}>
          {getFileIcon(mimeType)}
        </Text>

        <View style={styles.textContainer}>
          <Text
            style={[styles.fileName, { color: colors.text.primary }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {truncateFilename(fileName)}
          </Text>
          <Text style={[styles.fileSize, { color: colors.text.secondary }]}>
            {formatFileSize(fileSize)}
          </Text>
        </View>

        {deletable && onDelete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete(attachment.id);
            }}
            style={styles.deleteButton}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text style={[styles.deleteIcon, { color: colors.error }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2
      },
      android: {
        elevation: 1
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }
    })
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    fontSize: 20,
    marginRight: 8
  },
  textContainer: {
    flex: 1,
    marginRight: 8
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2
  },
  fileSize: {
    fontSize: 12
  },
  deleteButton: {
    padding: 4,
    marginLeft: 4
  },
  deleteIcon: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default FileAttachmentChip;