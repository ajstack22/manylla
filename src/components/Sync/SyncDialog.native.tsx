import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  Clipboard,
  Share,
} from "react-native";
import { useSync } from "../../context/SyncContext";
import {
  generateInviteCode,
  validateInviteCode,
  generateInviteUrl,
  storeInviteCode,
  getInviteCode,
  formatInviteCodeForDisplay,
} from "../../utils/inviteCode";

interface SyncDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SyncDialog: React.FC<SyncDialogProps> = ({ open, onClose }) => {
  const {
    syncEnabled,
    syncStatus,
    enableSync,
    disableSync,
    syncNow,
    recoveryPhrase: existingPhrase,
    syncId,
  } = useSync();
  const [mode, setMode] = useState<
    "menu" | "enable" | "join" | "phrase" | "existing" | "invite"
  >("menu");
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
    } catch (err: any) {
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
    } catch (err: any) {
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

  const handleCopyInvite = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join my Manylla backup with this invite code: ${currentInviteCode}\n\nOr use this link: ${inviteUrl}`,
        title: "Manylla Backup Invite",
      });
    } catch (error) {
      console.error("Error sharing invite:", error);
    }
  };

  const handleSyncNow = async () => {
    try {
      setLoading(true);
      await syncNow();
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSync = () => {
    Alert.alert(
      "Disable Sync",
      "Are you sure you want to disable sync? Your data will remain on this device but will no longer sync with other devices.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => disableSync(),
        },
      ],
    );
  };

  const renderContent = () => {
    if (syncEnabled && mode === "menu") {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successAlert}>
            <Text style={styles.successAlertText}>
              ✓ Multi-device sync is enabled
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sync Status</Text>
            <Text style={styles.cardDescription}>
              Your data is synchronized across devices
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.chip,
                  syncStatus === "success" && styles.chipSuccess,
                ]}
              >
                <Text style={styles.chipText}>{syncStatus}</Text>
              </View>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleSyncNow}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#8B7355" />
                ) : (
                  <Text style={styles.smallButtonText}>Sync Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Security & Sharing</Text>
            <Text style={styles.cardDescription}>
              Your child's information is encrypted and backed up across your
              devices.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.outlineButton, styles.flexButton]}
                onPress={() => setMode("existing")}
              >
                <Text style={styles.outlineButtonText}>View Backup Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flexButton]}
                onPress={handleGenerateInvite}
              >
                <Text style={styles.primaryButtonText}>Create Invite</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDisableSync}
          >
            <Text style={styles.dangerButtonText}>Disable Sync</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    switch (mode) {
      case "menu":
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => setMode("enable")}
            >
              <Text style={styles.menuCardIcon}>☁️</Text>
              <View style={styles.menuCardContent}>
                <Text style={styles.menuCardTitle}>
                  Enable Backup on This Device
                </Text>
                <Text style={styles.menuCardDescription}>
                  Create a new backup for your devices
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => setMode("join")}
            >
              <Text style={styles.menuCardIcon}>🔄</Text>
              <View style={styles.menuCardContent}>
                <Text style={styles.menuCardTitle}>Restore from Backup</Text>
                <Text style={styles.menuCardDescription}>
                  Connect to your existing backup with a backup code
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.infoAlert}>
              <Text style={styles.infoAlertText}>
                All data is encrypted on your device. We never see your
                information.
              </Text>
            </View>
          </ScrollView>
        );

      case "enable":
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.cardIcon}>🔒</Text>
              <Text style={styles.cardTitle}>Create Secure Sync</Text>
              <Text style={styles.cardDescription}>
                This will create a secure sync group for your devices. You'll
                receive a recovery phrase to access your data from other
                devices.
              </Text>
            </View>

            <View style={[styles.card, styles.infoCard]}>
              <Text style={styles.cardIcon}>✓</Text>
              <Text style={styles.cardTitle}>What happens next</Text>
              <View style={styles.orderedList}>
                <Text style={styles.listItem}>
                  1. Generate a unique recovery phrase
                </Text>
                <Text style={styles.listItem}>
                  2. Encrypt your data locally
                </Text>
                <Text style={styles.listItem}>3. Create secure sync group</Text>
                <Text style={styles.listItem}>
                  4. Show recovery phrase (save it!)
                </Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => setMode("menu")}
                disabled={loading}
              >
                <Text style={styles.outlineButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flexButton]}
                onPress={handleEnableSync}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Create Secure Sync
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "join":
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.bodyText}>
              Enter an invite code or backup code from another device to restore
              your data.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Invite Code or Backup Code</Text>
              <TextInput
                style={styles.input}
                value={joinPhrase}
                onChangeText={setJoinPhrase}
                placeholder="XXXX-XXXX or 32-character code"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHelp}>
                Enter an 8-character invite code (XXXX-XXXX) or 32-character
                backup code
              </Text>
            </View>

            {error ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => setMode("menu")}
                disabled={loading}
              >
                <Text style={styles.outlineButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flexButton]}
                onPress={handleJoinSync}
                disabled={loading || !joinPhrase.trim()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Join Sync</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "phrase":
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successAlert}>
              <Text style={styles.successAlertText}>
                ✓ Sync enabled successfully!
              </Text>
            </View>

            <Text style={styles.bodyText}>
              Save this recovery phrase in a secure location. You'll need it to
              access your data from other devices.
            </Text>

            <View style={styles.phraseBox}>
              <Text style={styles.phraseText}>{generatedPhrase}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyPhrase}
              >
                <Text style={styles.copyButtonText}>
                  {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.warningAlert}>
              <Text style={styles.warningAlertTitle}>Important:</Text>
              <Text style={styles.warningAlertText}>
                This phrase is the only way to access your synced data. Store it
                securely and never share it with anyone.
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>
                I've Saved My Backup Code
              </Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "invite":
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successAlert}>
              <Text style={styles.successAlertText}>
                ✓ Invite code created successfully!
              </Text>
            </View>

            <Text style={styles.bodyText}>
              Share this invite code with another device. It expires in 24
              hours.
            </Text>

            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCodeText}>
                {formatInviteCodeForDisplay(currentInviteCode)}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopyInvite(currentInviteCode)}
              >
                <Text style={styles.copyButtonText}>
                  {copied ? "✓ Copied!" : "📋 Copy Code"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linkBox}>
              <Text style={styles.linkLabel}>Or share this link:</Text>
              <Text style={styles.linkText}>{inviteUrl}</Text>
              <View style={styles.linkButtons}>
                <TouchableOpacity
                  style={[styles.outlineButton, styles.flexButton]}
                  onPress={() => handleCopyInvite(inviteUrl)}
                >
                  <Text style={styles.outlineButtonText}>
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.flexButton]}
                  onPress={handleShareInvite}
                >
                  <Text style={styles.primaryButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoAlert}>
              <Text style={styles.infoAlertText}>
                The recipient can enter the invite code or click the link to
                restore the backup on their device.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setMode("menu")}
            >
              <Text style={styles.outlineButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "existing":
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.bodyText}>
              Your backup code for accessing data from other devices:
            </Text>

            <View style={styles.phraseBox}>
              {showPhrase ? (
                <>
                  <Text style={styles.phraseText}>
                    {existingPhrase || "No backup code available"}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyPhrase}
                  >
                    <Text style={styles.copyButtonText}>
                      {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.phraseText, styles.blurredText]}>
                    ********************************
                  </Text>
                  <TouchableOpacity
                    style={styles.revealButton}
                    onPress={() => setShowPhrase(true)}
                  >
                    <Text style={styles.revealButtonText}>Click to reveal</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.infoAlert}>
              <Text style={styles.infoAlertText}>
                Use this code to restore your backup on another device.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                setShowPhrase(false);
                setMode("menu");
              }}
            >
              <Text style={styles.outlineButtonText}>Back</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>☁️ Backup & Sync</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  bodyText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoCard: {
    backgroundColor: "rgba(33, 150, 243, 0.08)",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  menuCardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuCardContent: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuCardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chip: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipSuccess: {
    backgroundColor: "#4CAF50",
  },
  chipText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallButtonText: {
    fontSize: 14,
    color: "#8B7355",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#8B7355",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#8B7355",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#8B7355",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "#D32F2F",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "600",
  },
  successAlert: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successAlertText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },
  errorAlert: {
    backgroundColor: "rgba(211, 47, 47, 0.1)",
    borderWidth: 1,
    borderColor: "#D32F2F",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: "#C62828",
    fontSize: 14,
  },
  warningAlert: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FF9800",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningAlertTitle: {
    color: "#E65100",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  warningAlertText: {
    color: "#E65100",
    fontSize: 13,
    lineHeight: 18,
  },
  infoAlert: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoAlertText: {
    color: "#1565C0",
    fontSize: 13,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  inputHelp: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  orderedList: {
    marginTop: 8,
  },
  listItem: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 4,
  },
  phraseBox: {
    backgroundColor: "rgba(255, 167, 38, 0.15)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  phraseText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  blurredText: {
    color: "#999",
  },
  copyButton: {
    backgroundColor: "#8B7355",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  revealButton: {
    backgroundColor: "#8B7355",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  revealButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  inviteCodeBox: {
    backgroundColor: "rgba(33, 150, 243, 0.08)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  inviteCodeText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 2,
    marginBottom: 16,
  },
  linkBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  linkText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  linkButtons: {
    flexDirection: "row",
    gap: 12,
  },
});
