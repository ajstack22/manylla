import React from "react";
import { View, Text } from "react-native";
import { usePrintStyles } from "./usePrintStyles";

export const PrintPreviewHeader = ({ colors, childName, recipientName }) => {
  const styles = usePrintStyles(colors);

  return (
    <View style={styles.documentHeader}>
      <Text style={styles.documentTitle}>
        {childName} - Information Summary
      </Text>
      <Text style={styles.documentSubtitle}>
        Prepared on {new Date().toLocaleDateString()}
        {recipientName ? ` for ${recipientName}` : ""}
      </Text>
    </View>
  );
};
