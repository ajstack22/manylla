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

      // Check for demo photo marker
      if (currentPhoto === '__DEMO_ELLIE__') {
        setPhotoPreview(require('../../../public/assets/ellie.png'));
        setIsLoading(false);
        return;
      }

      // Check if photo is encrypted
      if (
        photoService &&
        typeof photoService.isPhotoEncrypted === "function" &&
        photoService.isPhotoEncrypted(currentPhoto)
      ) {
        const decryptedDataUrl = await photoService.decryptPhoto(currentPhoto);
        setPhotoPreview(decryptedDataUrl);
      } else {
        // Direct image reference (require() result) or URI - display as-is
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
   * Helper: Show processing progress indicator
   */
  const startProgressIndicator = () => {
    setProcessingProgress(0);
    return setInterval(() => {
      setProcessingProgress((prev) => Math.min(prev + 10, 90));
    }, 100);
  };

  /**
   * Helper: Complete processing and update preview
   */
  const completePhotoProcessing = (result, processResult) => {
    setProcessingProgress(100);
    setPhotoPreview(result.dataUrl);

    if (onPhotoChange) {
      onPhotoChange(processResult.encrypted, processResult.metadata);
    }

    setTimeout(() => {
      setProcessingProgress(0);
    }, 500);
  };

  /**
   * Handle photo selection from picker
   */
  const handlePhotoSelect = async () => {
    if (disabled) return;

    try {
      setError(null);
      setIsLoading(true);

      const result = await ImagePicker.showImagePicker({
        quality: 0.9,
        maxWidth: 1600,
        maxHeight: 1600,
      });

      if (result.cancelled) {
        setIsLoading(false);
        return;
      }

      const validation = ImagePicker.validateResult(result);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const progressInterval = startProgressIndicator();

      const processResult = await photoService.processAndEncryptPhoto(
        result.dataUrl || result,
      );

      clearInterval(progressInterval);

      if (!processResult.success) {
        throw new Error(processResult.error);
      }

      completePhotoProcessing(result, processResult);
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
   * Helper: Execute photo removal
   */
  const executePhotoRemoval = () => {
    setPhotoPreview(null);
    setError(null);
    if (onPhotoRemove) {
      onPhotoRemove();
    }
  };

  /**
   * Handle photo removal
   */
  const handlePhotoRemove = () => {
    if (disabled) return;

    if (platform.isWeb) {
      if (window.confirm("Are you sure you want to remove this photo?")) {
        executePhotoRemoval();
      }
    } else {
      Alert.alert(
        "Remove Photo",
        "Are you sure you want to remove this photo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: executePhotoRemoval,
          },
        ],
      );
    }
  };

  const styles = getStyles(colors, size);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Photo</Text>
      <View style={styles.photoContainer}>
        <PhotoDisplayArea
          isLoading={isLoading}
          photoPreview={photoPreview}
          processingProgress={processingProgress}
          disabled={disabled}
          size={size}
          colors={colors}
          styles={styles}
          onPhotoSelect={handlePhotoSelect}
        />

        <PhotoActionButtons
          photoPreview={photoPreview}
          disabled={disabled}
          colors={colors}
          styles={styles}
          onPhotoSelect={handlePhotoSelect}
          onPhotoRemove={handlePhotoRemove}
        />
      </View>

      <PhotoFeedback error={error} colors={colors} styles={styles} />
    </View>
  );
};

/**
 * Helper: Photo display area (loading/preview/placeholder)
 */
const PhotoDisplayArea = ({
  isLoading,
  photoPreview,
  processingProgress,
  disabled,
  size,
  colors,
  styles,
  onPhotoSelect,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        {processingProgress > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${processingProgress}%` }]}
            />
          </View>
        )}
        <Text style={styles.loadingText}>
          {processingProgress > 0 ? "Processing..." : "Loading..."}
        </Text>
      </View>
    );
  }

  if (photoPreview) {
    return (
      <TouchableOpacity
        style={styles.photoPreview}
        onPress={!disabled ? onPhotoSelect : undefined}
        disabled={disabled}
      >
        <Image
          source={
            typeof photoPreview === "number"
              ? photoPreview
              : { uri: photoPreview }
          }
          style={styles.photoImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.placeholder, disabled && styles.placeholderDisabled]}
      onPress={!disabled ? onPhotoSelect : undefined}
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
  );
};

/**
 * Helper: Photo action buttons (edit/delete)
 */
const PhotoActionButtons = ({
  photoPreview,
  disabled,
  colors,
  styles,
  onPhotoSelect,
  onPhotoRemove,
}) => {
  if (!photoPreview || disabled) {
    return null;
  }

  return (
    <>
      <TouchableOpacity style={styles.editButton} onPress={onPhotoSelect}>
        <Icon name="Edit" size={18} color={colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={onPhotoRemove}>
        <Icon name="Delete" size={18} color={colors.error || "#F44336"} />
      </TouchableOpacity>
    </>
  );
};

/**
 * Helper: Photo feedback (error/help text)
 */
const PhotoFeedback = ({ error, colors, styles }) => {
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="Warning" size={16} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <Text style={styles.helpText}>
      Supports JPG and PNG images. Photos are compressed and encrypted for
      privacy.
    </Text>
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
