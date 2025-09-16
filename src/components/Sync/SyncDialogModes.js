import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  SyncIcon,
  CloudIcon,
  CheckCircleIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
} from "../Common";
import { useSyncActions } from "./hooks/useSyncActions";
import { useSyncStyles } from "./hooks/useSyncStyles";

/**
 * SyncDialogModes - Main menu component for sync dialog
 * Displays different options based on whether sync is enabled or not
 */
export const SyncDialogModes = ({ onModeChange }) => {
  const { styles, colors } = useSyncStyles();
  const {
    syncEnabled,
    syncStatus,
    loading,
    handleSyncNow,
    disableSync,
  } = useSyncActions();

  const handleSyncNowPress = async () => {
    await handleSyncNow();
  };

  if (syncEnabled) {
    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Alert */}
        <View style={styles.successAlert}>
          <CloudIcon size={24} color="#67B26F" />
          <Text style={styles.successText}>Multi-device sync is enabled</Text>
        </View>

        {/* Sync Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SyncIcon size={32} color={colors.primary || "#A08670"} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Sync Status</Text>
              <Text style={styles.cardDescription}>
                Your data is synchronized across devices
              </Text>
              <View style={statusRowStyles.statusRow}>
                <View
                  style={[
                    statusRowStyles.statusBadge,
                    syncStatus === "success" && statusRowStyles.statusBadgeSuccess,
                  ]}
                >
                  <Text
                    style={[
                      statusRowStyles.statusBadgeText,
                      syncStatus === "success" && statusRowStyles.statusBadgeTextSuccess,
                    ]}
                  >
                    {syncStatus}
                  </Text>
                </View>
                <TouchableOpacity
                  style={statusRowStyles.syncNowButton}
                  onPress={handleSyncNowPress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <SyncIcon
                        size={20}
                        color={colors.background?.paper || "#FFFFFF"}
                      />
                      <Text style={statusRowStyles.syncNowText}>Sync Now</Text>
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
            <CheckCircleIcon size={32} color={colors.primary || "#A08670"} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Security & Sharing</Text>
              <Text style={styles.cardDescription}>
                Your child's information is encrypted and backed up across
                your devices.
              </Text>
              <View style={buttonRowStyles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.outlineButton, buttonRowStyles.actionButton]}
                  onPress={() => onModeChange("existing")}
                >
                  <Text style={styles.outlineButtonText}>
                    View Backup Code
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, buttonRowStyles.actionButton]}
                  onPress={() => onModeChange("invite")}
                >
                  <Text style={styles.primaryButtonText}>
                    Create Invite Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Disable Sync Button */}
        <TouchableOpacity
          style={disableButtonStyles.disableButton}
          onPress={() => disableSync()}
        >
          <Text style={disableButtonStyles.disableButtonText}>Disable Sync</Text>
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
        style={menuOptionStyles.menuOption}
        onPress={() => onModeChange("enable")}
      >
        <CloudUploadIcon size={32} color={colors.primary || "#A08670"} />
        <View style={menuOptionStyles.menuOptionContent}>
          <Text style={menuOptionStyles.menuOptionTitle}>Enable Cloud Backup</Text>
          <Text style={menuOptionStyles.menuOptionDescription}>
            Create a new backup for your devices
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={menuOptionStyles.menuOption}
        onPress={() => onModeChange("join")}
      >
        <CloudDownloadIcon size={32} color={colors.primary || "#A08670"} />
        <View style={menuOptionStyles.menuOptionContent}>
          <Text style={menuOptionStyles.menuOptionTitle}>Restore from Cloud</Text>
          <Text style={menuOptionStyles.menuOptionDescription}>
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

// Additional styles specific to this component
const statusRowStyles = {
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
    backgroundColor: "#E0E0E0", // Default border color
  },
  statusBadgeSuccess: {
    backgroundColor: "#67B26F",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666", // Default secondary text
  },
  statusBadgeTextSuccess: {
    color: "#FFFFFF",
  },
  syncNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#A08670", // Default primary color
    backgroundColor: "#A08670",
    gap: 6,
  },
  syncNowText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
};

const buttonRowStyles = {
  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
};

const disableButtonStyles = {
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
};

const menuOptionStyles = {
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Default paper background
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0", // Default border
    gap: 16,
  },
  menuOptionContent: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000", // Default primary text
    marginBottom: 4,
  },
  menuOptionDescription: {
    fontSize: 14,
    color: "#666", // Default secondary text
  },
};