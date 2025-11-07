/**
 * EntryAttachments - Component for displaying and downloading file attachments
 * Shows attachment list and handles download/preview functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Share
} from 'react-native';
import FileAttachmentChip from '../Forms/FileAttachmentChip';
import fileAttachmentService from '../../services/fileAttachmentService';
import manyllaEncryptionService from '../../services/sync/manyllaEncryptionService';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';
import { isFeatureEnabled } from '../../config/featureFlags';
import platform from '../../utils/platform';

/**
 * EntryAttachments component
 * @param {Object} props - Component props
 * @param {Array} props.attachments - Array of attachment metadata
 * @param {boolean} props.editable - Whether attachments can be deleted
 * @param {Function} props.onDelete - Callback when attachment is deleted
 * @param {boolean} props.showExpanded - Whether to show expanded by default
 */
const EntryAttachments = ({
  attachments = [],
  editable = false,
  onDelete,
  showExpanded = false
}) => {
  const [expanded, setExpanded] = useState(showExpanded);
  const [downloading, setDownloading] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState({});
  const { theme } = useTheme();
  const { syncId } = useSync();

  // Check if feature is enabled
  if (!isFeatureEnabled('ENABLE_FILE_ATTACHMENTS') || !attachments || attachments.length === 0) {
    return null;
  }

  const handleView = async (attachment) => {
    if (!attachment || !attachment.id) {
      Alert.alert('Error', 'Invalid attachment');
      return;
    }

    if (!syncId) {
      Alert.alert('Sync Required', 'Please set up sync to download files');
      return;
    }

    setDownloading(attachment.id);
    setDownloadProgress({ [attachment.id]: 0 });

    try {
      // Download the file
      const fileBlob = await fileAttachmentService.downloadFile(
        attachment.id,
        syncId,
        (progress) => {
          setDownloadProgress({
            [attachment.id]: progress.percent || 0
          });
        }
      );

      // Decrypt metadata to get original filename
      let filename = 'download';
      let mimeType = 'application/octet-stream';

      if (attachment.encryptedMeta) {
        try {
          const decryptedMeta = await manyllaEncryptionService.decryptData(attachment.encryptedMeta);
          filename = decryptedMeta.originalFilename || filename;
          mimeType = decryptedMeta.mimeType || mimeType;
        } catch (error) {
          // Silent failure - use fallback filename
        }
      }

      // Open file based on platform
      await openFile(fileBlob, filename, mimeType);

    } catch (error) {
      Alert.alert(
        'Download Failed',
        error.message || 'Failed to download file',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setDownloading(null);
      setDownloadProgress({});
    }
  };

  const openFile = async (fileBlob, filename, mimeType) => {
    if (platform.isWeb) {
      // Web: Download or open in new tab
      const url = URL.createObjectURL(fileBlob);

      if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
        // Open in new tab for preview
        window.open(url, '_blank');
      } else {
        // Force download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);

    } else if (Platform.OS === 'ios') {
      // iOS: Use share sheet
      try {
        // Convert blob to base64 for sharing
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];

          await Share.share({
            title: filename,
            url: `data:${mimeType};base64,${base64}`
          });
        };
        reader.readAsDataURL(fileBlob);
      } catch (error) {
        Alert.alert('Error', 'Unable to open file');
      }

    } else if (Platform.OS === 'android') {
      // Android: Try to open with intent
      try {
        // For Android, we'd need react-native-file-viewer
        // or similar library to open files
        Alert.alert(
          'File Downloaded',
          `${filename} has been downloaded`,
          [{ text: 'OK', style: 'default' }]
        );
      } catch (error) {
        Alert.alert('Error', 'Unable to open file');
      }
    }
  };

  const handleDelete = (attachmentId) => {
    Alert.alert(
      'Delete Attachment?',
      'This will remove the file from this entry',
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

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleExpanded}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerText, { color: theme.colors.onBackground }]}>
            📎 {attachments.length} {attachments.length === 1 ? 'attachment' : 'attachments'}
          </Text>
          <Text style={[styles.expandIcon, { color: theme.colors.onSurfaceVariant }]}>
            {expanded ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachmentList}
          contentContainerStyle={styles.attachmentContent}
        >
          {attachments.map((attachment) => {
            const isDownloading = downloading === attachment.id;
            const progress = downloadProgress[attachment.id] || 0;

            return (
              <View key={attachment.id} style={styles.attachmentWrapper}>
                <FileAttachmentChip
                  attachment={attachment}
                  onPress={() => handleView(attachment)}
                  onDelete={editable ? () => handleDelete(attachment.id) : null}
                  loading={isDownloading}
                  deletable={editable}
                />
                {isDownloading && progress > 0 && (
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${progress}%`,
                          backgroundColor: theme.colors.primary
                        }
                      ]}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 15,
    fontWeight: '500'
  },
  expandIcon: {
    fontSize: 12
  },
  attachmentList: {
    marginTop: 8
  },
  attachmentContent: {
    paddingHorizontal: 4
  },
  attachmentWrapper: {
    marginRight: 8,
    position: 'relative'
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 2
  }
});

export default EntryAttachments;