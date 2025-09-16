import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import {
  SchoolIcon,
  HomeIcon,
  LocalHospitalIcon,
  SettingsIcon,
} from "../Common";
import { useShareStyles } from "./useShareStyles";

const sharePresets = [
  {
    id: "education",
    label: "Education",
    IconComponent: SchoolIcon,
    categories: ["goals", "strengths", "challenges", "education", "behaviors"],
    description: "Educational needs & classroom support",
  },
  {
    id: "support",
    label: "Support",
    IconComponent: HomeIcon,
    categories: ["quick-info", "behaviors", "tips-tricks", "daily-care"],
    description: "Care instructions & helpful tips",
  },
  {
    id: "medical",
    label: "Medical",
    IconComponent: LocalHospitalIcon,
    categories: [
      "quick-info",
      "medical",
      "therapies",
      "behaviors",
      "challenges",
    ],
    description: "Health information & medical history",
  },
  {
    id: "custom",
    label: "Custom",
    IconComponent: SettingsIcon,
    categories: [],
    description: "Choose exactly what to share",
  },
];

export const ShareDialogRecipient = ({ selectedPreset, onPresetChange }) => {
  const { colors } = useTheme();
  const styles = useShareStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Who are you sharing with?</Text>
      <View style={styles.presetGrid}>
        {sharePresets.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetCard,
              selectedPreset === preset.id && styles.presetCardSelected,
            ]}
            onPress={() => onPresetChange(preset.id)}
          >
            {preset.IconComponent ? (
              <preset.IconComponent
                size={24}
                color={colors.text?.primary || "#333"}
              />
            ) : (
              <SettingsIcon
                size={24}
                color={colors.text?.primary || "#333"}
              />
            )}
            <Text
              style={[
                styles.presetLabel,
                selectedPreset === preset.id && styles.presetLabelSelected,
              ]}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!selectedPreset && (
        <Text style={styles.presetDescription}>
          {sharePresets.find((p) => p.id === selectedPreset)?.description}
        </Text>
      )}
    </View>
  );
};

// Export sharePresets for use in other components
export { sharePresets };