import React from "react";
import { View, Text } from "react-native";
import { usePrintStyles } from "./usePrintStyles";

export const PrintPreviewQuickInfo = ({ colors, visible }) => {
  const styles = usePrintStyles(colors);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Info</Text>
      <View style={styles.quickInfoItems}>
        <Text style={styles.quickInfoItem}>
          <Text style={styles.bold}>Communication:</Text> Uses 2-3
          word phrases. Understands more than she can express.
        </Text>
        <Text style={styles.quickInfoItem}>
          <Text style={styles.bold}>Sensory:</Text> Sensitive to loud
          noises and bright lights. Loves soft textures.
        </Text>
        <Text style={styles.quickInfoItem}>
          <Text style={styles.bold}>Medical:</Text> No allergies.
          Takes melatonin for sleep (prescribed).
        </Text>
        <Text style={styles.quickInfoItem}>
          <Text style={styles.bold}>Dietary:</Text> Gluten-free diet.
          Prefers crunchy foods. No nuts.
        </Text>
        <Text style={styles.quickInfoItem}>
          <Text style={styles.bold}>Emergency Contact:</Text> Mom:
          555-0123, Dad: 555-0124
        </Text>
      </View>
    </View>
  );
};