import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { version } from '../../../../package.json';
import platform from '../../../utils/platform';
import { getTextStyle } from '../../../utils/platformStyles';
import { AddIcon, ShareIcon } from '../../../components/Common';
import ManyllaLogo from '../../../components/Common/ManyllaLogo';

/**
 * Welcome screen - First step of onboarding
 * Shows app info, demo mode, start fresh, and join with code options
 */
const OnboardingStep1 = ({
  accessCode,
  onAccessCodeChange,
  onStartFresh,
  onDemoMode,
  onJoinWithCode,
  onShowPrivacy,
  colors,
}) => {
  const styles = StyleSheet.create({
    logo: {
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    infoBox: {
      backgroundColor: colors.background.secondary,
      padding: 15,
      borderRadius: 10,
      marginBottom: 30,
      width: '100%',
      maxWidth: 400,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 10,
    },
    infoText: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
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
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    buttonTextOutline: {
      color: colors.primary,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      width: '100%',
      maxWidth: 400,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: colors.text.secondary,
      fontSize: 14,
    },
    inputContainer: {
      width: '100%',
      maxWidth: 400,
      marginBottom: 20,
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
    footer: {
      marginTop: 30,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    footerLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });

  return (
    <>
      <View style={styles.logo}>
        <ManyllaLogo size={60} />
      </View>

      <Text style={styles.title}>Welcome to manylla</Text>
      <Text style={styles.subtitle}>
        Your secure companion for managing your child's special needs journey
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: colors.text.disabled,
          marginTop: -5,
          marginBottom: 15,
        }}
      >
        v{version}
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>manylla helps you:</Text>
        <Text style={styles.infoText}>
          • Track developmental milestones • Organize IEP goals and medical
          records • Share information securely • Sync across all your devices
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onStartFresh}
        activeOpacity={0.8}
      >
        <AddIcon size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Start Fresh</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonOutline]}
        onPress={onDemoMode}
        activeOpacity={0.8}
      >
        <ManyllaLogo size={24} />
        <Text style={[styles.buttonText, styles.buttonTextOutline]}>
          Try Demo Mode
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            getTextStyle('input'),
            platform.isAndroid && { color: '#000000' },
          ]}
          placeholder="Enter access code"
          placeholderTextColor={
            platform.isAndroid ? '#999' : colors.text.disabled
          }
          value={accessCode}
          onChangeText={onAccessCodeChange}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.button, !accessCode && { opacity: 0.5 }]}
          onPress={() => accessCode && onJoinWithCode(accessCode)}
          disabled={!accessCode}
          activeOpacity={0.8}
        >
          <ShareIcon size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Join with Access Code</Text>
        </TouchableOpacity>
      </View>

      {onShowPrivacy && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Manylla, you agree to our{' '}
            <Text style={styles.footerLink} onPress={onShowPrivacy}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      )}
    </>
  );
};

export default OnboardingStep1;
