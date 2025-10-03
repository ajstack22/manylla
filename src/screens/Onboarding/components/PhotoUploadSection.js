import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import platform from '../../../utils/platform';
import { PersonIcon } from '../../../components/Common';

/**
 * Photo upload section with preview, upload button, and error display
 */
const PhotoUploadSection = ({
  photo,
  isProcessing,
  error,
  onPhotoPicker,
  onClearPhoto,
  colors
}) => {
  const styles = StyleSheet.create({
    photoSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    photoButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      marginBottom: 10,
    },
    photoButtonSelected: {
      borderColor: colors.primary,
      borderStyle: 'solid',
      backgroundColor: colors.background.paper,
    },
    photoImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    photoLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    loadingText: {
      color: colors.text.secondary,
      fontSize: 14,
      fontStyle: 'italic',
    },
    clearPhotoButton: {
      marginTop: 5,
    },
    clearPhotoText: {
      color: colors.primary,
      fontSize: 14,
    },
    dateHint: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: -5,
      marginBottom: 10,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.photoSection}>
      <TouchableOpacity
        style={[styles.photoButton, photo && styles.photoButtonSelected]}
        onPress={onPhotoPicker}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Text style={styles.loadingText}>Processing...</Text>
        ) : photo ? (
          <Image
            source={{
              uri: platform.isIOS && photo.startsWith('/')
                ? `https://manylla.com/qual${photo}`
                : photo,
            }}
            style={styles.photoImage}
          />
        ) : (
          <PersonIcon size={40} color={colors.text.secondary} />
        )}
      </TouchableOpacity>
      <Text style={styles.photoLabel}>
        {isProcessing
          ? 'Processing photo...'
          : photo
            ? 'Photo selected'
            : 'Tap to add photo'}
      </Text>
      {photo && !isProcessing && (
        <TouchableOpacity onPress={onClearPhoto} style={styles.clearPhotoButton}>
          <Text style={styles.clearPhotoText}>Clear photo</Text>
        </TouchableOpacity>
      )}
      {!platform.isWeb && (
        <Text style={styles.dateHint}>
          Photo selection coming soon for mobile
        </Text>
      )}
    </View>
  );
};

export default PhotoUploadSection;
