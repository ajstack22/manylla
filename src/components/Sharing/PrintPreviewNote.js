import React from "react";
import { View, Text } from "react-native";
import { usePrintStyles } from "./usePrintStyles";

export const PrintPreviewNote = ({ colors, note }) => {
  const styles = usePrintStyles(colors);

  if (!note) {
    return null;
  }

  return (
    <View style={styles.localNoteSection}>
      <Text style={styles.localNoteText}>{note}</Text>
    </View>
  );
};
