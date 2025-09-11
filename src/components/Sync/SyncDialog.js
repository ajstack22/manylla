import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Clipboard,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemedModal } from "../Common";
import { useSync } from "../../context/SyncContext";
import {
  generateInviteCode,
  validateInviteCode,
  normalizeInviteCode,
  generateInviteUrl,
  storeInviteCode,
  getInviteCode,
  formatInviteCodeForDisplay,
} from "../../utils/inviteCode";

export const SyncDialog = ({ open, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const {
    syncEnabled,
    syncStatus,
    enableSync,
    disableSync,
    syncNow,
    recoveryPhrase: existingPhrase,
    syncId,
  } = useSync();

  const [mode, setMode] = useState("menu");
  const [generatedPhrase, setGeneratedPhrase] = useState("");
  const [joinPhrase, setJoinPhrase] = useState("");
  const [currentInviteCode, setCurrentInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);

  const handleEnableSync = async () => {
    try {
      setLoading(true);
      setError("");
      const { recoveryPhrase } = await enableSync(true);
      setGeneratedPhrase(recoveryPhrase);
      setMode("phrase");
    } catch (err) {
      setError(err.message || "Failed to enable backup");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSync = async () => {
    try {
      setLoading(true);
      setError("");

      let recoveryPhraseToUse = joinPhrase.trim();

      // Check if it's an invite code (XXXX-XXXX format)
      if (validateInviteCode(recoveryPhraseToUse)) {
        // Try to get recovery phrase from invite code
        const inviteData = getInviteCode(recoveryPhraseToUse);
        if (!inviteData) {
          throw new Error("Invalid or expired invite code");
        }
        recoveryPhraseToUse = inviteData.recoveryPhrase;
      } else {
        // Validate 32-char hex format
        const cleanPhrase = recoveryPhraseToUse.toLowerCase();
        if (!cleanPhrase.match(/^[a-f0-9]{32}$/)) {
          throw new Error(
            "Invalid format. Enter an 8-character invite code (XXXX-XXXX) or 32-character backup code.",
          );
        }
        recoveryPhraseToUse = cleanPhrase;
      }

      await enableSync(false, recoveryPhraseToUse);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to join backup");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = () => {
    if (!existingPhrase || !syncId) {
      setError("Sync must be enabled to generate invite codes");
      return;
    }

    const inviteCode = generateInviteCode();
    const url = generateInviteUrl(inviteCode, existingPhrase);

    // Store invite code mapping locally
    storeInviteCode(inviteCode, syncId, existingPhrase);

    setCurrentInviteCode(inviteCode);
    setInviteUrl(url);
    setMode("invite");
  };

  const handleCopyPhrase = () => {
    const phrase = generatedPhrase || existingPhrase || "";
    Clipboard.setString(phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyInvite = (text) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncNow = async () => {
    try {
      setLoading(true);
      await syncNow();
    } finally {
      setLoading(false);
    }
  };

  const renderMenu = () => {
    if (syncEnabled) {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Alert */}
          <View style={styles.successAlert}>
            <Text style={styles.successIcon}>☁️</Text>
            <Text style={styles.successText}>Multi-device sync is enabled</Text>
          </View>

          {/* Sync Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.syncIcon}>🔄</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Sync Status</Text>
                <Text style={styles.cardDescription}>
                  Your data is synchronized across devices
                </Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      syncStatus === "success" && styles.statusBadgeSuccess,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        syncStatus === "success" &&
                          styles.statusBadgeTextSuccess,
                      ]}
                    >
                      {syncStatus}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.syncNowButton}
                    onPress={handleSyncNow}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Text style={styles.syncNowIcon}>🔄</Text>
                        <Text style={styles.syncNowText}>Sync Now</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Security Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.securityIcon}>🔒</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Security & Sharing</Text>
                <Text style={styles.cardDescription}>
                  Your child's information is encrypted and backed up across
                  your devices.
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.outlineButton]}
                    onPress={() => setMode("existing")}
                  >
                    <Text style={styles.outlineButtonText}>
                      View Backup Code
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryActionButton]}
                    onPress={handleGenerateInvite}
                  >
                    <Text style={styles.primaryActionButtonText}>
                      Create Invite Code
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Disable Sync Button */}
          <TouchableOpacity
            style={styles.disableButton}
            onPress={() => disableSync()}
          >
            <Text style={styles.disableButtonText}>Disable Sync</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // Not synced menu
    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.menuOption}
          onPress={() => setMode("enable")}
        >
          <Text style={styles.menuOptionIcon}>☁️</Text>
          <View style={styles.menuOptionContent}>
            <Text style={styles.menuOptionTitle}>
              Enable Backup on This Device
            </Text>
            <Text style={styles.menuOptionDescription}>
              Create a new backup for your devices
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuOption}
          onPress={() => setMode("join")}
        >
          <Text style={styles.menuOptionIcon}>🔄</Text>
          <View style={styles.menuOptionContent}>
            <Text style={styles.menuOptionTitle}>Restore from Backup</Text>
            <Text style={styles.menuOptionDescription}>
              Connect to your existing backup with a backup code
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoAlert}>
          <Text style={styles.infoAlertText}>
            All data is encrypted on your device. We never see your information.
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderEnableStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.securityIcon}>🔒</Text>
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
          <Text style={styles.checkIcon}>✓</Text>
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
          onPress={() => setMode("menu")}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleEnableSync}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background.paper} />
          ) : (
            <Text style={styles.primaryButtonText}>Create Secure Sync</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderJoinStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Text style={styles.instructions}>
        Enter an invite code or backup code from another device to restore your
        data.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Invite Code or Backup Code</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          value={joinPhrase}
          onChangeText={setJoinPhrase}
          placeholder="XXXX-XXXX or 32-character code"
          placeholderTextColor={colors.text.secondary}
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
          onPress={() => setMode("menu")}
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
          onPress={handleJoinSync}
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

  const renderPhraseStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.successAlert}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successText}>Sync enabled successfully!</Text>
      </View>

      <Text style={styles.instructions}>
        Save this recovery phrase in a secure location. You'll need it to access
        your data from other devices.
      </Text>

      <View style={styles.phraseContainer}>
        <Text style={styles.phraseText}>{generatedPhrase}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyPhrase}>
          <Text style={styles.copyButtonIcon}>{copied ? "✓" : "📋"}</Text>
          <Text style={styles.copyButtonText}>
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningAlert}>
        <Text style={styles.warningAlertTitle}>⚠️ Important</Text>
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

  const renderInviteStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.successAlert}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successText}>
          Invite code created successfully!
        </Text>
      </View>

      <Text style={styles.instructions}>
        Share this invite code with another device. It expires in 24 hours.
      </Text>

      <View style={styles.inviteCodeContainer}>
        <Text style={styles.inviteCode}>
          {formatInviteCodeForDisplay(currentInviteCode)}
        </Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => handleCopyInvite(currentInviteCode)}
        >
          <Text style={styles.copyButtonIcon}>{copied ? "✓" : "📋"}</Text>
          <Text style={styles.copyButtonText}>
            {copied ? "Copied!" : "Copy Invite Code"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linkContainer}>
        <Text style={styles.linkLabel}>Or share this link:</Text>
        <Text style={styles.linkText}>{inviteUrl}</Text>
        <TouchableOpacity
          style={styles.copyLinkButton}
          onPress={() => handleCopyInvite(inviteUrl)}
        >
          <Text style={styles.copyLinkButtonText}>
            {copied ? "Copied!" : "Copy Link"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoAlert}>
        <Text style={styles.infoAlertText}>
          The recipient can enter the invite code or click the link to restore
          the backup on their device.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.outlineButton, styles.fullWidthButton]}
        onPress={() => setMode("menu")}
      >
        <Text style={styles.outlineButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderExistingStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Text style={styles.instructions}>
        Your backup code for accessing data from other devices:
      </Text>

      <View style={styles.phraseContainer}>
        {showPhrase ? (
          <>
            <Text style={styles.phraseText}>
              {existingPhrase || "No backup code available"}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyPhrase}
            >
              <Text style={styles.copyButtonIcon}>{copied ? "✓" : "📋"}</Text>
              <Text style={styles.copyButtonText}>
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.blurredContainer}>
            <Text style={styles.blurredText}>
              ••••••••••••••••••••••••••••••••
            </Text>
            <TouchableOpacity
              style={styles.revealButton}
              onPress={() => setShowPhrase(true)}
            >
              <Text style={styles.revealButtonText}>Click to reveal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoAlert}>
        <Text style={styles.infoAlertText}>
          Use this code to restore your backup on another device.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.outlineButton, styles.fullWidthButton]}
        onPress={() => {
          setShowPhrase(false);
          setMode("menu");
        }}
      >
        <Text style={styles.outlineButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    switch (mode) {
      case "menu":
        return renderMenu();
      case "enable":
        return renderEnableStep();
      case "join":
        return renderJoinStep();
      case "phrase":
        return renderPhraseStep();
      case "invite":
        return renderInviteStep();
      case "existing":
        return renderExistingStep();
      default:
        return renderMenu();
    }
  };

  return (
    <ThemedModal
      visible={open}
      onClose={onClose}
      title="Backup & Sync"
      headerStyle="primary"
      presentationStyle="pageSheet"
    >
      {renderContent()}
    </ThemedModal>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.background.paper,
      flex: 1,
      textAlign: "center",
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.background.paper,
    },
    headerSpacer: {
      width: 36,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    successAlert: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: "#67B26F",
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    successIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    successText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#67B26F",
      flex: 1,
    },
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.text.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    infoCard: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    cardContent: {
      flex: 1,
      marginLeft: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    syncIcon: {
      fontSize: 24,
      color: colors.primary,
    },
    securityIcon: {
      fontSize: 24,
      color: colors.primary,
    },
    checkIcon: {
      fontSize: 24,
      color: colors.primary,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      gap: 12,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    statusBadgeSuccess: {
      backgroundColor: "#67B26F",
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    statusBadgeTextSuccess: {
      color: colors.background.paper,
    },
    syncNowButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    syncNowIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    syncNowText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
    },
    buttonRow: {
      flexDirection: "row",
      marginTop: 12,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.background.paper,
    },
    outlineButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    primaryActionButton: {
      backgroundColor: colors.primary,
    },
    primaryActionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.background.paper,
    },
    disableButton: {
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E76F51",
      alignItems: "center",
    },
    disableButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#E76F51",
    },
    menuOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.border,
    },
    menuOptionIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    menuOptionContent: {
      flex: 1,
    },
    menuOptionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    menuOptionDescription: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    infoAlert: {
      backgroundColor: colors.background.manila,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    infoAlertText: {
      fontSize: 12,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    errorAlert: {
      backgroundColor: "#ffebee",
      borderWidth: 1,
      borderColor: "#E76F51",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorAlertText: {
      fontSize: 14,
      color: "#E76F51",
    },
    warningAlert: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      marginVertical: 16,
    },
    warningAlertTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    warningAlertText: {
      fontSize: 12,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    stepsList: {
      marginTop: 8,
    },
    stepItem: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 24,
    },
    instructions: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
    },
    codeInput: {
      fontFamily: Platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
    },
    helperText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
    },
    phraseContainer: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      marginVertical: 16,
    },
    phraseText: {
      fontFamily: Platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 16,
      color: colors.text.primary,
      letterSpacing: 2,
      textAlign: "center",
      marginBottom: 16,
    },
    inviteCodeContainer: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      padding: 20,
      marginVertical: 16,
      alignItems: "center",
    },
    inviteCode: {
      fontFamily: Platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 32,
      fontWeight: "bold",
      color: colors.primary,
      letterSpacing: 2,
      marginBottom: 16,
    },
    linkContainer: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    linkLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    linkText: {
      fontFamily: Platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 12,
    },
    copyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    copyButtonIcon: {
      fontSize: 16,
      color: colors.background.paper,
      marginRight: 8,
    },
    copyButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.background.paper,
    },
    copyLinkButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: "center",
    },
    copyLinkButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    blurredContainer: {
      alignItems: "center",
    },
    blurredText: {
      fontFamily: Platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 16,
      color: colors.text.secondary,
      letterSpacing: 2,
      marginBottom: 16,
    },
    revealButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    revealButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.background.paper,
    },
    actions: {
      flexDirection: "row",
      marginTop: 24,
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background.paper,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    fullWidthButton: {
      marginTop: 8,
    },
  });
