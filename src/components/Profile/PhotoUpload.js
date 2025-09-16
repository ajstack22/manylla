/**
 * PhotoUpload Component - Photo upload interface for profile editing
 * Supports cross-platform image selection, preview, and removal
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Icon from "../Common/IconProvider";
import ImagePicker from "../Common/ImagePicker";
import photoService from "../../services/photoService";
import platform from "../../utils/platform";

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
  size = 100,
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
      if (
        photoService &&
        typeof photoService.isPhotoEncrypted === "function" &&
        photoService.isPhotoEncrypted(currentPhoto)
      ) {
        const decryptedDataUrl = await photoService.decryptPhoto(currentPhoto);
        setPhotoPreview(decryptedDataUrl);
      } else {
        // Legacy format - display as-is (for backward compatibility only)
        setPhotoPreview(currentPhoto);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to load photo:", error);
      }
      setError("Failed to load photo");
      setPhotoPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPhoto]);

  // Load and decrypt current photo on mount/change
  useEffect(() => {
    // Add a small delay to ensure services are initialized
    const timer = setTimeout(() => {
      loadCurrentPhoto();
    }, 100);
    return () => clearTimeout(timer);
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
        maxHeight: 1600,
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
        setProcessingProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Process and encrypt photo
      const processResult = await photoService.processAndEncryptPhoto(
        result.dataUrl || result,
      );

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (!processResult.success) {
        throw new Error(processResult.error);
      }

      // Update preview immediately with unencrypted version
      setPhotoPreview(result.dataUrl);

      // Notify parent component with encrypted data
      if (onPhotoChange) {
        onPhotoChange(processResult.encrypted, processResult.metadata);
      }

      // Reset progress after a brief delay
      setTimeout(() => {
        setProcessingProgress(0);
      }, 500);
    } catch (error) {
      setError(ImagePicker.getErrorMessage(error, "upload photo"));
      if (process.env.NODE_ENV === "development") {
        console.error("Photo upload failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle photo removal
   */
  const handlePhotoRemove = () => {
    if (disabled) return;

    if (platform.isWeb) {
      // Use native browser confirm for web
      if (window.confirm("Are you sure you want to remove this photo?")) {
        setPhotoPreview(null);
        setError(null);
        if (onPhotoRemove) {
          onPhotoRemove();
        }
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        "Remove Photo",
        "Are you sure you want to remove this photo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              setPhotoPreview(null);
              setError(null);
              if (onPhotoRemove) {
                onPhotoRemove();
              }
            },
          },
        ],
      );
    }
  };

  const styles = getStyles(colors, size);

  // Ensure we always render something
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Photo</Text>
      <View style={styles.photoContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            {processingProgress > 0 && (
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${processingProgress}%` },
                  ]}
                />
              </View>
            )}
            <Text style={styles.loadingText}>
              {processingProgress > 0 ? "Processing..." : "Loading..."}
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
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.placeholder, disabled && styles.placeholderDisabled]}
            onPress={!disabled ? handlePhotoSelect : undefined}
            disabled={disabled}
          >
            <Icon
              name="CameraAlt"
              size={size / 3}
              color={disabled ? colors.text.disabled : colors.text.secondary}
            />
            <Text
              style={[
                styles.placeholderText,
                disabled && styles.placeholderTextDisabled,
              ]}
            >
              {platform.isMobile ? "Add Photo" : "Upload Photo"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Edit button - top right */}
        {photoPreview && !disabled && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handlePhotoSelect}
          >
            <Icon name="Edit" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        )}

        {/* Delete button - top left, only when photo exists */}
        {photoPreview && !disabled && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handlePhotoRemove}
          >
            <Icon name="Delete" size={18} color={colors.error || "#F44336"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="Warning" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Help text */}
      {!error && (
        <Text style={styles.helpText}>
          Supports JPG and PNG images. Photos are compressed and encrypted for
          privacy.
        </Text>
      )}
    </View>
  );
};

const getStyles = (colors, size) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginVertical: 16,
    },
    title: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
      marginBottom: 8,
      textAlign: "center",
    },
    photoContainer: {
      position: "relative",
      marginBottom: 12,
    },
    loadingContainer: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.background.manila,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    progressContainer: {
      position: "absolute",
      bottom: 10,
      left: 10,
      right: 10,
      height: 2,
      backgroundColor: colors.background.paper,
      borderRadius: 1,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 1,
    },
    loadingText: {
      fontSize: 10,
      color: colors.text.secondary,
      marginTop: 4,
    },
    photoPreview: {
      position: "relative",
    },
    photoImage: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: colors.border,
    },
    placeholder: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.background.manila,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    placeholderDisabled: {
      backgroundColor: "#F0F0F0",
      borderColor: colors.text.disabled,
    },
    placeholderText: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 4,
      textAlign: "center",
    },
    placeholderTextDisabled: {
      color: colors.text.disabled,
    },
    editButton: {
      position: "absolute",
      top: -8,
      right: -8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    deleteButton: {
      position: "absolute",
      top: -8,
      left: -8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.error + "15",
      borderRadius: 6,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      flex: 1,
      marginLeft: 6,
    },
    helpText: {
      fontSize: 11,
      color: colors.text.secondary,
      textAlign: "center",
      marginTop: 8,
      maxWidth: 250,
      lineHeight: 16,
    },
  });

export default PhotoUpload;
