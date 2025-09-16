import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Share,
  Dimensions,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

// Icon fallback - using text instead of vector icons
// QRCode fallback - will show URL text if QRCode library is missing
let QRCode;
try {
  QRCode = require("react-native-qrcode-svg").default;
} catch (e) {
  QRCode = null;
}

export const QRCodeModal = ({
  visible,
  onClose,
  url,
  title = "Share QR Code",
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const qrCodeRef = React.useRef(null);

  const downloadQRCode = async () => {
    try {
      // Without react-native-view-shot, just share the URL directly
      await Share.share({
        message: `Manylla Share Link: ${url}

Scan the QR code or use this link to access shared information.`,
        url: url,
        title: "Manylla Share QR Code",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share QR code. Please try again.");
    }
  };

  const shareUrl = async () => {
    try {
      await Share.share({
        url: url,
        title: "Shared Information Link",
        message: "Access shared information via this secure link",
      });
    } catch (error) {
      // Silent failure for Share.share() - this is expected on some platforms/devices
      // User can still manually save/copy the QR code URL
      // Security: Only logging error.message to avoid exposing sensitive QR code data
      if (process.env.NODE_ENV === 'development') {
        console.warn('Native share failed for QR code URL:', error.message);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* QR Code Container */}
            <View style={styles.qrContainer} ref={qrCodeRef}>
              <View style={styles.qrBackground}>
                {QRCode ? (
                  <QRCode
                    value={url}
                    size={200}
                    color={colors.primary}
                    backgroundColor={colors.background.paper}
                    logoSize={30}
                    logoBackgroundColor="transparent"
                  />
                ) : (
                  <View style={styles.qrFallback}>
                    <Text style={styles.qrFallbackText}>QR Code</Text>
                    <Text style={styles.qrFallbackUrl} numberOfLines={3}>
                      {url}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.description}>
              Recipients can scan this QR code to access the shared information
            </Text>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={shareUrl}
              >
                <Text style={styles.buttonIcon}>📤</Text>
                <Text style={styles.shareButtonText}>Share Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.downloadButton]}
                onPress={downloadQRCode}
              >
                <Text style={styles.downloadButtonIcon}>💾</Text>
                <Text style={styles.downloadButtonText}>Save QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const getStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: colors.background.default,
      borderRadius: 16,
      marginHorizontal: 20,
      minWidth: 320,
      maxWidth: width - 40,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    closeButton: {
      padding: 4,
    },
    closeButtonIcon: {
      fontSize: 18,
      color: colors.text.primary,
    },
    content: {
      padding: 24,
      alignItems: "center",
    },
    qrContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    qrBackground: {
      backgroundColor: colors.background.paper,
      padding: 20,
      borderRadius: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    description: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    actions: {
      width: "100%",
      gap: 12,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 8,
      gap: 8,
    },
    shareButton: {
      backgroundColor: colors.primary,
    },
    shareButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background.paper,
    },
    buttonIcon: {
      fontSize: 16,
      color: colors.background.paper,
      marginRight: 8,
    },
    downloadButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    downloadButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    downloadButtonIcon: {
      fontSize: 16,
      color: colors.primary,
      marginRight: 8,
    },
    qrFallback: {
      width: 200,
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background.paper,
      padding: 20,
    },
    qrFallbackText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 10,
    },
    qrFallbackUrl: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: "center",
    },
  });
