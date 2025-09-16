import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { getTextStyle } from "../../utils/platformStyles";
import platform from "../../utils/platform";
import { useTheme } from "../../context/ThemeContext";
import { ContentCopyIcon, DoneIcon, LockIcon, UploadIcon } from "../Common";
import { useShareStyles } from "./useShareStyles";

export const ShareDialogComplete = ({
  profile,
  expirationDays,
  generatedLink,
  copiedLink,
  onCopyLink,
  onShareLink,
  onCreateAnother,
  onDone,
}) => {
  const { colors } = useTheme();
  const styles = useShareStyles(colors);

  const getExpirationText = () => {
    return expirationDays <= 30
      ? `${expirationDays} ${expirationDays <= 1 ? "day" : "days"}`
      : expirationDays >= 90
        ? "3 months"
        : "6 months";
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.successAlert}>
        <Text style={styles.successAlertText}>
          ✓ Share link created successfully!
        </Text>
        <Text style={styles.successAlertSubtext}>
          This link will expire in {getExpirationText()}.
        </Text>
      </View>

      {/* Share Link */}
      <View style={styles.linkCard}>
        <Text style={styles.linkCardTitle}>Share Link</Text>
        <View style={styles.linkInputContainer}>
          <TextInput
            style={[
              styles.linkInput,
              getTextStyle("input"),
              platform.isAndroid && { color: "#000000" },
            ]}
            value={generatedLink}
            editable={false}
            multiline
          />
          <TouchableOpacity style={styles.copyButton} onPress={onCopyLink}>
            {copiedLink ? (
              <DoneIcon size={20} color={colors.text?.primary || "#333"} />
            ) : (
              <ContentCopyIcon
                size={20}
                color={colors.text?.primary || "#333"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Info */}
      <View style={styles.securityCard}>
        <View style={styles.securityCardHeader}>
          <LockIcon size={20} color={colors.text?.primary || "#333"} />
          <Text style={styles.securityCardTitle}>Secure Share</Text>
        </View>
        <Text style={styles.securityCardText}>
          This link contains an encrypted version of the selected information.
          The encryption key is included in the link and never sent to any
          server. Only someone with this exact link can view the shared
          information.
        </Text>
      </View>

      {/* Share Options */}
      <View style={styles.shareOptions}>
        <Text style={styles.shareOptionsTitle}>Share via</Text>
        <TouchableOpacity style={styles.shareButton} onPress={onShareLink}>
          <View style={styles.shareButtonContent}>
            <UploadIcon size={20} color={colors.text?.primary || "#333"} />
            <Text style={styles.shareButtonText}>Share Link</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Create Another */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onCreateAnother}
      >
        <Text style={styles.secondaryButtonText}>Create another share</Text>
      </TouchableOpacity>

      {/* Done Button */}
      <TouchableOpacity style={styles.primaryButton} onPress={onDone}>
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
