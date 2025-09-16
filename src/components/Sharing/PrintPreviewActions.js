import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { InsertDriveFileIcon, PrintIcon } from "../Common";
import { isWeb } from "../../utils/platform";
import { usePrintStyles } from "./usePrintStyles";

export const PrintPreviewActions = ({
  colors,
  onClose,
  onDownloadPDF,
  onPrint,
}) => {
  const styles = usePrintStyles(colors);

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={onClose}
      >
        <Text style={styles.cancelButtonText}>Close</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.downloadButton]}
        onPress={onDownloadPDF}
      >
        <InsertDriveFileIcon
          size={18}
          color={colors.primary}
          style={{ marginRight: 5 }}
        />
        <Text style={styles.downloadButtonText}>Share as Text</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.printButton]}
        onPress={onPrint}
      >
        <PrintIcon
          size={20}
          color={colors.background.paper}
          style={{ marginRight: 5 }}
        />
        <Text style={styles.printButtonText}>{isWeb ? "Print" : "Share"}</Text>
      </TouchableOpacity>
    </View>
  );
};
