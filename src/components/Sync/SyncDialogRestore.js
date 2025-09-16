import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getTextStyle } from "../../utils/platformStyles";
import { useSyncActions } from "./hooks/useSyncActions";
import { useSyncStyles } from "./hooks/useSyncStyles";
import platform from "../../utils/platform";

/**
 * SyncDialogRestore - Component for joining existing sync/backup
 * Handles entering invite codes or backup codes to restore data
 */
export const SyncDialogRestore = ({ onModeChange, onClose }) => {
  const { styles, colors } = useSyncStyles();
  const {
    loading,
    error,
    handleJoinSync,
    clearError,
  } = useSyncActions();

  const [joinPhrase, setJoinPhrase] = useState("");

  const handleJoinSyncPress = async () => {
    if (!joinPhrase.trim()) {
      return;
    }

    clearError();
    const result = await handleJoinSync(joinPhrase);
    if (result.success) {
      onClose();
    }
  };

  const handleJoinPhraseChange = (text) => {
    setJoinPhrase(text);
    if (error) {
      clearError();
    }
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Text style={styles.instructions}>
        Enter an invite code or backup code from another device to restore your
        data.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Invite Code or Backup Code</Text>
        <TextInput
          style={[
            styles.input,
            styles.codeInput,
            getTextStyle("input"), // Force black text on Android
            platform.isAndroid && { color: "#000000" }, // Extra insurance
          ]}
          value={joinPhrase}
          onChangeText={handleJoinPhraseChange}
          placeholder="XXXX-XXXX or 32-character code"
          placeholderTextColor={
            platform.isAndroid ? "#999" : colors.text.secondary
          }
          autoCapitalize="characters"
        />
        <Text style={styles.helperText}>
          Enter an 8-character invite code (XXXX-XXXX) or 32-character backup
          code
        </Text>
      </View>

      {error ? (
        <View style={styles.errorAlert}>
          <Text style={styles.errorAlertText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => onModeChange("menu")}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            !joinPhrase.trim() && styles.buttonDisabled,
          ]}
          onPress={handleJoinSyncPress}
          disabled={loading || !joinPhrase.trim()}
        >
          {loading ? (
            <ActivityIndicator color={colors.background.paper} />
          ) : (
            <Text style={styles.primaryButtonText}>Join Sync</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};