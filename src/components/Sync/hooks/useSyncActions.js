import { useState } from "react";
import { Clipboard } from "react-native";
import { useSync } from "../../../context/SyncContext";
import {
  generateInviteCode,
  validateInviteCode,
  generateInviteUrl,
  storeInviteCode,
  getInviteCode,
} from "../../../utils/inviteCode";

/**
 * Custom hook for managing sync-related actions
 * Provides common functionality shared across sync dialog components
 */
export const useSyncActions = () => {
  const {
    syncEnabled,
    syncStatus,
    enableSync,
    disableSync,
    syncNow,
    recoveryPhrase: existingPhrase,
    syncId,
  } = useSync();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEnableSync = async () => {
    try {
      setLoading(true);
      setError("");
      const { recoveryPhrase } = await enableSync(true);
      return { success: true, recoveryPhrase };
    } catch (err) {
      const errorMessage = err.message || "Failed to enable backup";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSync = async (joinPhrase) => {
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
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Failed to join backup";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = () => {
    if (!existingPhrase || !syncId) {
      const errorMessage = "Sync must be enabled to generate invite codes";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      const inviteCode = generateInviteCode();
      const url = generateInviteUrl(inviteCode, existingPhrase);

      // Store invite code mapping locally
      storeInviteCode(inviteCode, syncId, existingPhrase);

      return {
        success: true,
        inviteCode,
        inviteUrl: url,
      };
    } catch (err) {
      const errorMessage = err.message || "Failed to generate invite code";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleCopyPhrase = (phrase) => {
    const phraseToUse = phrase || existingPhrase || "";
    Clipboard.setString(phraseToUse);
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
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Failed to sync";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    // State
    syncEnabled,
    syncStatus,
    existingPhrase,
    syncId,
    loading,
    error,
    copied,

    // Actions
    handleEnableSync,
    handleJoinSync,
    handleGenerateInvite,
    handleCopyPhrase,
    handleCopyInvite,
    handleSyncNow,
    disableSync,
    clearError,
  };
};
