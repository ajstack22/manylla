import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  CheckCircleIcon,
  PlaylistAddCheckIcon,
  CloudDoneIcon,
  ContentCopyIcon,
  DoneIcon,
} from "../Common";
import { useSyncActions } from "./hooks/useSyncActions";
import { useSyncStyles } from "./hooks/useSyncStyles";

/**
 * SyncDialogCreate - Component for creating new sync/backup
 * Handles the flow: enable step -> phrase display
 */
export const SyncDialogCreate = ({ onModeChange, onClose }) => {
  const { styles, colors } = useSyncStyles();
  const {
    loading,
    error,
    copied,
    handleEnableSync,
    handleCopyPhrase,
    clearError,
  } = useSyncActions();

  const [currentStep, setCurrentStep] = useState("enable"); // "enable" or "phrase"
  const [generatedPhrase, setGeneratedPhrase] = useState("");

  const handleEnableSyncPress = async () => {
    clearError();
    const result = await handleEnableSync();
    if (result.success) {
      setGeneratedPhrase(result.recoveryPhrase);
      setCurrentStep("phrase");
    }
  };

  const handleCopyPhrasePress = () => {
    handleCopyPhrase(generatedPhrase);
  };

  if (currentStep === "phrase") {
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.successAlert}>
          <CheckCircleIcon size={24} color="#67B26F" />
          <Text style={styles.successText}>Sync enabled successfully!</Text>
        </View>

        <Text style={styles.instructions}>
          Save this recovery phrase in a secure location. You'll need it to access
          your data from other devices.
        </Text>

        <View style={styles.phraseContainer}>
          <Text style={styles.phraseText}>{generatedPhrase}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyPhrasePress}>
            {copied ? (
              <DoneIcon size={20} color={colors.background?.paper || "#FFFFFF"} />
            ) : (
              <ContentCopyIcon
                size={20}
                color={colors.background?.paper || "#FFFFFF"}
              />
            )}
            <Text style={styles.copyButtonText}>
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningAlert}>
          <Text style={styles.warningAlertTitle}>Important</Text>
          <Text style={styles.warningAlertText}>
            This phrase is the only way to access your synced data. Store it
            securely and never share it with anyone.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, styles.fullWidthButton]}
          onPress={onClose}
        >
          <Text style={styles.primaryButtonText}>I've Saved My Backup Code</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Enable step
  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CheckCircleIcon size={32} color={colors.primary || "#A08670"} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Create Secure Sync</Text>
            <Text style={styles.cardDescription}>
              This will create a secure sync group for your devices. You'll
              receive a recovery phrase to access your data from other devices.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.infoCard]}>
        <View style={styles.cardHeader}>
          <PlaylistAddCheckIcon size={32} color={colors.primary || "#A08670"} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>What happens next</Text>
            <View style={styles.stepsList}>
              <Text style={styles.stepItem}>
                1. Generate a unique recovery phrase
              </Text>
              <Text style={styles.stepItem}>2. Encrypt your data locally</Text>
              <Text style={styles.stepItem}>3. Create secure sync group</Text>
              <Text style={styles.stepItem}>
                4. Show recovery phrase (save it!)
              </Text>
            </View>
          </View>
        </View>
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
          style={[styles.button, styles.primaryButton, styles.buttonWithIcon]}
          onPress={handleEnableSyncPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background.paper} />
          ) : (
            <>
              <CloudDoneIcon
                size={20}
                color={colors.background?.paper || "#FFFFFF"}
              />
              <Text style={styles.primaryButtonText}>Create Secure Sync</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};