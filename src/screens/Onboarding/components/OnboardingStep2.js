import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import platform from '../../../utils/platform';
import { getTextStyle } from '../../../utils/platformStyles';
import { CloseIcon } from '../../../components/Common';
import PhotoUploadSection from './PhotoUploadSection';
import DateInput from './DateInput';

/**
 * Profile form step - Collect child's name, DOB, and photo
 */
const OnboardingStep2 = ({
  childName,
  dateOfBirth,
  photo,
  isProcessingPhoto,
  photoError,
  errorMessage,
  onChildNameChange,
  onDateChange,
  onPhotoPicker,
  onClearPhoto,
  onBack,
  onSubmit,
  colors,
}) => {
  const styles = StyleSheet.create({
    stepHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      marginBottom: 20,
    },
    backButton: {
      padding: 10,
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text.primary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    formSection: {
      width: '100%',
      maxWidth: 400,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 15,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.secondary,
      marginBottom: 10,
    },
    helpText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    errorText: {
      color: colors.error || '#f44336',
      fontSize: 14,
      marginTop: 5,
      marginBottom: 10,
      textAlign: 'center',
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 12,
      width: '100%',
      maxWidth: 400,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  const isValid = childName.trim().length > 0;

  return (
    <>
      <View style={styles.stepHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <CloseIcon size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Child Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>
        Let's set up a profile for your child
      </Text>

      <PhotoUploadSection
        photo={photo}
        isProcessing={isProcessingPhoto}
        error={photoError}
        onPhotoPicker={onPhotoPicker}
        onClearPhoto={onClearPhoto}
        colors={colors}
      />

      <View style={styles.formSection}>
        <Text style={styles.label}>Child's Name *</Text>
        <TextInput
          style={[
            styles.input,
            getTextStyle('input'),
            platform.isAndroid && { color: '#000000' },
          ]}
          placeholder="Enter name"
          placeholderTextColor={
            platform.isAndroid ? '#999' : colors.text.disabled
          }
          value={childName}
          onChangeText={onChildNameChange}
          autoFocus={platform.isWeb}
        />

        <Text style={styles.label}>Date of Birth</Text>
        <DateInput
          value={dateOfBirth}
          onChange={onDateChange}
          colors={colors}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <Text style={styles.helpText}>
            You can always add more details later
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, !isValid && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default OnboardingStep2;
