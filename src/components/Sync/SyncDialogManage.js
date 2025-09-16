import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { CheckCircleIcon, ContentCopyIcon, DoneIcon } from "../Common";
import { formatInviteCodeForDisplay } from "../../utils/inviteCode";
import { useSyncActions } from "./hooks/useSyncActions";
import { useSyncStyles } from "./hooks/useSyncStyles";

/**
 * SyncDialogManage - Component for managing existing sync
 * Handles viewing backup codes and creating invite codes
 */
export const SyncDialogManage = ({ mode, onModeChange }) => {
  const { styles, colors } = useSyncStyles();
  const {
    existingPhrase,
    error,
    copied,
    handleGenerateInvite,
    handleCopyPhrase,
    handleCopyInvite,
  } = useSyncActions();

  const [showPhrase, setShowPhrase] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  const handleGenerateInvitePress = () => {
    const result = handleGenerateInvite();
    if (result.success) {
      setCurrentInviteCode(result.inviteCode);
      setInviteUrl(result.inviteUrl);
      onModeChange("invite");
    }
  };

  const handleCopyPhrasePress = () => {
    handleCopyPhrase(existingPhrase);
  };

  if (mode === "invite") {
    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successAlert}>
          <CheckCircleIcon size={24} color="#67B26F" />
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
            {copied ? (
              <DoneIcon
                size={20}
                color={colors.background?.paper || "#FFFFFF"}
              />
            ) : (
              <ContentCopyIcon
                size={20}
                color={colors.background?.paper || "#FFFFFF"}
              />
            )}
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
          onPress={() => onModeChange("menu")}
        >
          <Text style={styles.outlineButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Show existing backup code
  return (
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
              onPress={handleCopyPhrasePress}
            >
              {copied ? (
                <DoneIcon
                  size={20}
                  color={colors.background?.paper || "#FFFFFF"}
                />
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

      {error ? (
        <View style={styles.errorAlert}>
          <Text style={styles.errorAlertText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            setShowPhrase(false);
            onModeChange("menu");
          }}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleGenerateInvitePress}
        >
          <Text style={styles.primaryButtonText}>Create Invite Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
