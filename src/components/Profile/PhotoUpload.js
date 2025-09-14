/**
 * PhotoUpload Component - Photo upload interface for profile editing
 * Supports cross-platform image selection, preview, and removal
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import ImagePicker from '../Common/ImagePicker';
import photoService from '../../services/photoService';
import platform from '../../utils/platform';

/**
 * PhotoUpload Component
 * @param {Object} props
 * @param {string} props.currentPhoto - Current encrypted photo data
 * @param {Function} props.onPhotoChange - Callback for photo change
 * @param {Function} props.onPhotoRemove - Callback for photo removal
 * @param {boolean} props.disabled - Whether the component is disabled
 * @param {number} props.size - Size of the photo display (default 100)
 */
export const PhotoUpload = ({
  currentPhoto,
  onPhotoChange,
  onPhotoRemove,
  disabled = false,
  size = 100
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  /**
   * Load and decrypt current photo for display
   */
  const loadCurrentPhoto = useCallback(async () => {
    if (!currentPhoto) {
      setPhotoPreview(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if photo is encrypted or legacy format
      if (photoService.isPhotoEncrypted(currentPhoto)) {
        const decryptedDataUrl = await photoService.decryptPhoto(currentPhoto);
        setPhotoPreview(decryptedDataUrl);
      } else {
        // Legacy format - display as-is
        setPhotoPreview(currentPhoto);
      }
    } catch (error) {
      console.warn('Failed to load photo:', error);
      setError('Failed to load photo');
      setPhotoPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPhoto]);

  // Load and decrypt current photo on mount/change
  useEffect(() => {
    loadCurrentPhoto();
  }, [loadCurrentPhoto]);

  /**
   * Handle photo selection from picker
   */
  const handlePhotoSelect = async () => {
    if (disabled) return;

    try {
      setError(null);
      setIsLoading(true);

      // Show image picker
      const result = await ImagePicker.showImagePicker({
        quality: 0.9,
        maxWidth: 1600,
        maxHeight: 1600
      });

      if (result.cancelled) {
        setIsLoading(false);
        return;
      }

      // Validate result
      const validation = ImagePicker.validateResult(result);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Show processing progress
      setProcessingProgress(0);
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Process and encrypt photo
      const processResult = await photoService.processAndEncryptPhoto(result.dataUrl || result);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (!processResult.success) {
        throw new Error(processResult.error);
      }

      // Update preview immediately with unencrypted version
      setPhotoPreview(result.dataUrl);

      // Notify parent component
      if (onPhotoChange) {
        onPhotoChange(processResult.encrypted, processResult.metadata);
      }

      // Reset progress after a brief delay
      setTimeout(() => {
        setProcessingProgress(0);
      }, 500);

    } catch (error) {
      setError(ImagePicker.getErrorMessage(error, 'upload photo'));
      console.error('Photo upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle photo removal
   */
  const handlePhotoRemove = () => {
    if (disabled) return;

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotoPreview(null);
            setError(null);
            if (onPhotoRemove) {
              onPhotoRemove();
            }
          }
        }
      ]
    );
  };

  /**
   * Get appropriate icon for current state
   */
  const getIcon = () => {
    if (platform.isMobile && ImagePicker.isCameraAvailable()) {
      return 'photo-camera';
    }
    return 'photo';
  };

  const styles = getStyles(colors, size);

  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
            {processingProgress > 0 && (
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${processingProgress}%` }
                  ]}
                />
              </View>
            )}
            <Text style={styles.loadingText}>
              {processingProgress > 0 ? 'Processing...' : 'Loading...'}
            </Text>
          </View>
        ) : photoPreview ? (
          <TouchableOpacity
            style={styles.photoPreview}
            onPress={!disabled ? handlePhotoSelect : undefined}
            disabled={disabled}
          >
            <Image
              source={{ uri: photoPreview }}
              style={styles.photoImage}
              resizeMode="cover"
            />
            {!disabled && (
              <View style={styles.photoOverlay}>
                <Icon name="edit" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.placeholder,
              disabled && styles.placeholderDisabled
            ]}
            onPress={!disabled ? handlePhotoSelect : undefined}
            disabled={disabled}
          >
            <Icon
              name={getIcon()}
              size={size / 3}
              color={disabled ? colors.text.disabled : colors.text.secondary}
            />
            <Text style={[
              styles.placeholderText,
              disabled && styles.placeholderTextDisabled
            ]}>
              {platform.isMobile ? 'Add Photo' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Remove button */}
        {photoPreview && !disabled && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handlePhotoRemove}
          >
            <Icon name="close" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            disabled && styles.actionButtonDisabled
          ]}
          onPress={!disabled ? handlePhotoSelect : undefined}
          disabled={disabled}
        >
          <Icon
            name={getIcon()}
            size={18}
            color={disabled ? colors.text.disabled : colors.primary}
          />
          <Text style={[
            styles.actionButtonText,
            disabled && styles.actionButtonTextDisabled
          ]}>
            {photoPreview ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        {photoPreview && !disabled && (
          <TouchableOpacity
            style={styles.removeActionButton}
            onPress={handlePhotoRemove}
          >
            <Icon name="delete" size={18} color={colors.error} />
            <Text style={styles.removeActionButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Help text */}
      {!error && (
        <Text style={styles.helpText}>
          Supports JPG and PNG images up to 2MB. Photos are encrypted for privacy.
        </Text>
      )}
    </View>
  );
};

const getStyles = (colors, size) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      marginVertical: 16
    },
    photoContainer: {
      position: 'relative',
      marginBottom: 12
    },
    loadingContainer: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.background.manila,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed'
    },
    progressContainer: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      height: 2,
      backgroundColor: colors.background.paper,
      borderRadius: 1,
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 1
    },
    loadingText: {
      fontSize: 10,
      color: colors.text.secondary,
      marginTop: 4
    },
    photoPreview: {
      position: 'relative'
    },
    photoImage: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: colors.border
    },
    photoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0
    },
    placeholder: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.background.manila,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed'
    },
    placeholderDisabled: {
      backgroundColor: colors.background.disabled,
      borderColor: colors.text.disabled
    },
    placeholderText: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 4,
      textAlign: 'center'
    },
    placeholderTextDisabled: {
      color: colors.text.disabled
    },
    removeButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
      gap: 6
    },
    actionButtonDisabled: {
      borderColor: colors.text.disabled,
      backgroundColor: colors.background.disabled
    },
    actionButtonText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500'
    },
    actionButtonTextDisabled: {
      color: colors.text.disabled
    },
    removeActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.error,
      backgroundColor: `${colors.error}10`,
      gap: 6
    },
    removeActionButtonText: {
      fontSize: 14,
      color: colors.error,
      fontWeight: '500'
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: `${colors.error}15`,
      borderRadius: 6,
      gap: 6
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      flex: 1
    },
    helpText: {
      fontSize: 11,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: 8,
      maxWidth: 250,
      lineHeight: 16
    },

    // Platform-specific hover effects
    ...(platform.isWeb && {
      'photoPreview:hover photoOverlay': {
        opacity: 1
      },
      'actionButton:hover': {
        backgroundColor: `${colors.primary}20`
      },
      'removeActionButton:hover': {
        backgroundColor: `${colors.error}20`
      }
    })
  });

export default PhotoUpload;