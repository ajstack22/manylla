/**
 * FileAttachmentButton - Button component for selecting and uploading files
 * Shows progress during upload and handles platform-specific file selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import fileAttachmentService from '../../services/fileAttachmentService';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';

/**
 * FileAttachmentButton component
 * @param {Object} props - Component props
 * @param {Function} props.onFileSelected - Callback when file is successfully uploaded
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - External loading state
 * @param {Object} props.style - Additional styles
 */
const FileAttachmentButton = ({
  onFileSelected,
  disabled = false,
  loading = false,
  style
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const { theme } = useTheme();
  const { syncId } = useSync();

  const handlePress = async () => {
    if (disabled || loading || isUploading) return;

    try {
      // Check if sync is set up
      if (!syncId) {
        Alert.alert(
          'Sync Required',
          'Please set up sync in Settings before attaching files.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Select file using platform-specific picker
      setUploadMessage('Selecting file...');
      const file = await fileAttachmentService.selectFile();

      if (!file) {
        setUploadMessage('');
        return;
      }

      // Start upload
      setIsUploading(true);
      setUploadProgress(0);
      setUploadMessage(`Uploading ${file.name}...`);

      // Upload with progress tracking
      const metadata = await fileAttachmentService.uploadFile(
        file,
        syncId,
        (progress) => {
          setUploadProgress(progress.percent || 0);

          if (progress.step === 'resuming') {
            setUploadMessage(`Resuming upload: ${progress.message}`);
          } else if (progress.step === 'encrypting') {
            setUploadMessage(`Encrypting: ${progress.percent}%`);
          } else if (progress.step === 'uploading') {
            setUploadMessage(`Uploading: ${progress.percent}%`);
          }
        }
      );

      // Success
      setUploadMessage('Upload complete!');
      setTimeout(() => {
        setUploadMessage('');
        setUploadProgress(0);
      }, 2000);

      // Notify parent component
      if (onFileSelected) {
        onFileSelected(metadata);
      }
    } catch (error) {
      // Handle errors
      let errorMessage = 'Upload failed';

      if (error.message.includes('cancelled')) {
        errorMessage = 'File selection cancelled';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Storage quota exceeded';
      } else if (error.message.includes('size')) {
        errorMessage = 'File too large (max 50MB)';
      } else if (error.message.includes('type')) {
        errorMessage = 'File type not supported';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Storage permission required';
      } else {
        errorMessage = error.message || 'Upload failed';
      }

      if (!error.message.includes('cancelled')) {
        Alert.alert('Upload Failed', errorMessage, [{ text: 'OK', style: 'default' }]);
      }

      setUploadMessage('');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const buttonDisabled = disabled || loading || isUploading;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={buttonDisabled}
        style={[
          styles.button,
          {
            backgroundColor: buttonDisabled
              ? theme.colors.disabled
              : theme.colors.primary,
            opacity: buttonDisabled ? 0.6 : 1
          }
        ]}
        activeOpacity={0.7}
      >
        {isUploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator
              size="small"
              color={theme.colors.onPrimary}
              style={styles.spinner}
            />
            <View style={styles.progressContainer}>
              <Text style={[styles.uploadingText, { color: theme.colors.onPrimary }]}>
                {uploadMessage}
              </Text>
              {uploadProgress > 0 && (
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${uploadProgress}%`,
                        backgroundColor: theme.colors.onPrimary
                      }
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={[styles.icon, { color: theme.colors.onPrimary }]}>📎</Text>
            <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
              Add File
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {uploadMessage && !isUploading && (
        <Text style={[styles.statusText, { color: theme.colors.success }]}>
          {uploadMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    })
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 18,
    marginRight: 8
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  spinner: {
    marginRight: 12
  },
  progressContainer: {
    flex: 1
  },
  uploadingText: {
    fontSize: 14,
    marginBottom: 4
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 2
  },
  statusText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center'
  }
});

export default FileAttachmentButton;