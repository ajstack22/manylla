import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@context/ThemeContext';

interface OnboardingWizardProps {
  onStartFresh: () => void;
  onJoinWithCode: (code: string) => void;
  onDemoMode: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onStartFresh,
  onJoinWithCode,
  onDemoMode,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      padding: 20,
      alignItems: 'center',
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 20,
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
    },
    infoBox: {
      backgroundColor: colors.background.secondary,
      padding: 15,
      borderRadius: 10,
      marginBottom: 30,
      width: '100%',
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
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Logo placeholder - you can replace with actual logo */}
        <View style={styles.logo}>
          <Icon name="folder-special" size={60} color={colors.primary} />
        </View>

        <Text style={styles.title}>Welcome to manylla</Text>
        <Text style={styles.subtitle}>
          Your secure companion for managing your child's special needs journey
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>manylla helps you:</Text>
          <Text style={styles.infoText}>
            • Track developmental milestones{'\n'}
            • Organize IEP goals and medical records{'\n'}
            • Share information securely{'\n'}
            • Sync across all your devices
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={onStartFresh}
          activeOpacity={0.8}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Start Fresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={onDemoMode}
          activeOpacity={0.8}
        >
          <Icon name="play-circle-outline" size={24} color={colors.primary} />
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
            style={styles.input}
            placeholder="Enter access code"
            placeholderTextColor={colors.text.disabled}
            value={accessCode}
            onChangeText={setAccessCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, !accessCode && { opacity: 0.5 }]}
            onPress={() => accessCode && onJoinWithCode(accessCode)}
            disabled={!accessCode}
            activeOpacity={0.8}
          >
            <Icon name="share" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Join with Access Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default OnboardingWizard;