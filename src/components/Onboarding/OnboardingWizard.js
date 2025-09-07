/**
 * Cross-Platform Onboarding Wizard
 * Works on iOS, Android, and Web
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Platform-specific icon handling
let Icon = null;
if (Platform.OS === 'web') {
  // For web, use Material Icons from @mui
  try {
    const MuiIcons = require('@mui/icons-material');
    Icon = ({ name, size, color }) => {
      const IconComponent = MuiIcons[name] || MuiIcons.HelpOutline;
      return <IconComponent style={{ fontSize: size, color }} />;
    };
  } catch (e) {
    // Fallback to text if MUI not available
    Icon = ({ name }) => <Text>{name}</Text>;
  }
} else {
  // For mobile, use react-native-vector-icons
  try {
    Icon = require('react-native-vector-icons/MaterialIcons').default;
  } catch (e) {
    // Fallback to text if vector icons not available
    Icon = ({ name }) => <Text>{name}</Text>;
  }
}

export const OnboardingWizard = ({ onComplete }) => {
  const [accessCode, setAccessCode] = useState('');
  const { colors } = useTheme();

  const handleStartFresh = () => {
    // For now, use default name - in production, add name input screen
    onComplete({
      mode: 'fresh',
      childName: 'My Child',
      dateOfBirth: new Date(),
    });
  };

  const handleDemoMode = () => {
    onComplete({
      mode: 'demo',
    });
  };

  const handleJoinWithCode = () => {
    if (accessCode) {
      onComplete({
        mode: 'join',
        accessCode,
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      padding: 20,
      alignItems: 'center',
      paddingTop: Platform.OS === 'web' ? 60 : 40,
    },
    logo: {
      width: 80,
      height: 80,
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
  });

  const ScrollComponent = Platform.OS === 'web' ? View : ScrollView;

  return (
    <ScrollComponent style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.logo}>
          {Icon && <Icon name="FolderSpecial" size={60} color={colors.primary} />}
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
          onPress={handleStartFresh}
          activeOpacity={0.8}
        >
          {Icon && <Icon name="Add" size={24} color="#FFFFFF" />}
          <Text style={styles.buttonText}>Start Fresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={handleDemoMode}
          activeOpacity={0.8}
        >
          {Icon && <Icon name="PlayCircleOutline" size={24} color={colors.primary} />}
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
            onPress={handleJoinWithCode}
            disabled={!accessCode}
            activeOpacity={0.8}
          >
            {Icon && <Icon name="Share" size={24} color="#FFFFFF" />}
            <Text style={styles.buttonText}>Join with Access Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollComponent>
  );
};