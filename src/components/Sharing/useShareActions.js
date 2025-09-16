import { useState } from "react";
import { Alert, Clipboard, Share } from "react-native";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { API_ENDPOINTS } from "../../config/api";

export const useShareActions = () => {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGenerateLink = async ({
    profile,
    selectedCategories,
    includePhoto,
    expirationDays,
    selectedPreset,
  }) => {
    setLoading(true);
    try {
      // Generate invite code in XXXX-XXXX format (matching StackMap)
      const { generateInviteCode } = require("../../utils/inviteCode");
      const token = generateInviteCode();

      // Generate 32-byte encryption key
      const shareKey = nacl.randomBytes(32);

      // Prepare share data
      const sharedProfile = {
        ...profile,
        entries: profile.entries.filter((entry) =>
          selectedCategories.includes(entry.category),
        ),
        photo: includePhoto ? profile.photo : "",
        quickInfoPanels: [],
      };

      const shareData = {
        profile: sharedProfile,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + expirationDays * 24 * 60 * 60 * 1000,
        ).toISOString(),
        version: 2, // Version 2 indicates encrypted share
      };

      // Encrypt the share data
      const nonce = nacl.randomBytes(24);
      const messageBytes = util.decodeUTF8(JSON.stringify(shareData));
      const encrypted = nacl.secretbox(messageBytes, nonce, shareKey);

      // Combine nonce + ciphertext
      const encryptedBlob = util.encodeBase64(
        new Uint8Array([...nonce, ...encrypted]),
      );

      // Store encrypted share in database via API
      const response = await fetch(API_ENDPOINTS.share.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_code: token,
          encrypted_data: encryptedBlob,
          recipient_type: selectedPreset,
          expiry_hours: expirationDays * 24,
        }),
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to create share link. Please try again.");
        return null;
      }

      await response.json();

      // Generate link with key in fragment
      const getShareDomain = () => {
        // In React Native, we'll use a configured domain
        return "https://manylla.com/qual";
      };

      const shareDomain = getShareDomain();
      const keyBase64 = util.encodeBase64(shareKey);
      // Use path format for shares
      const link = `${shareDomain}/share/${token}#${keyBase64}`;
      setGeneratedLink(link);
      return link;
    } catch (error) {
      Alert.alert("Error", "Failed to create share link. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareLink = async (profile, expirationDays) => {
    try {
      const subject = `${profile.preferredName || profile.name}'s Information`;
      const expiration =
        expirationDays <= 30
          ? `${expirationDays} ${expirationDays <= 1 ? "day" : "days"}`
          : expirationDays >= 90
            ? "3 months"
            : "6 months";
      const message = `Here's a secure encrypted link to view ${profile.preferredName || profile.name}'s information:

${generatedLink}

This link will expire in ${expiration}.

Note: This link contains encrypted data. Please use the complete link exactly as provided.`;

      await Share.share({
        message,
        title: subject,
      });
    } catch (error) {
      // Silent failure for Share.share() - this is expected on some platforms/devices
      // User can still copy the link manually if sharing doesn't work
      // Security: Only logging error.message to avoid exposing sensitive share data
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Native share failed, user can copy link manually:",
          error.message,
        );
      }
    }
  };

  const resetShareState = () => {
    setGeneratedLink("");
    setCopiedLink(false);
    setLoading(false);
  };

  return {
    loading,
    generatedLink,
    copiedLink,
    handleGenerateLink,
    handleCopyLink,
    handleShareLink,
    resetShareState,
  };
};
