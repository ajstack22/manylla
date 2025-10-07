import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import platform from '../../../utils/platform';
import { getTextStyle } from '../../../utils/platformStyles';

/**
 * Platform-specific date input component
 * Web: Native date picker
 * Mobile: Formatted text input (MM/DD/YYYY)
 */
const DateInput = ({ value, onChange, colors }) => {
  const styles = StyleSheet.create({
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
    dateHint: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: -5,
      marginBottom: 10,
      fontStyle: 'italic',
    },
  });

  if (platform.isWeb) {
    return (
      <input
        type="date"
        className="date-input"
        style={{
          padding: '12px 15px',
          fontSize: '16px',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.background.secondary,
          color: colors.text.primary,
          width: 'auto',
          alignSelf: 'stretch',
          marginBottom: 15,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
      />
    );
  }

  return (
    <View>
      <TextInput
        style={[
          styles.input,
          getTextStyle('input', undefined, colors.text.primary),
        ]}
        placeholder="MM/DD/YYYY"
        placeholderTextColor={colors.text.disabled}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        maxLength={10}
        autoComplete="off"
      />
      {value.length < 1 && (
        <Text style={styles.dateHint}>
          Type numbers and slashes will be added automatically
        </Text>
      )}
    </View>
  );
};

export default DateInput;
