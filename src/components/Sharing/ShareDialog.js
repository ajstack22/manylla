import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemedModal } from "../Common";
import { ShareDialogRecipient, sharePresets } from "./ShareDialogRecipient";
import { ShareDialogCategories } from "./ShareDialogCategories";
import { ShareDialogOptions } from "./ShareDialogOptions";
import { ShareDialogPreview } from "./ShareDialogPreview";
import { ShareDialogComplete } from "./ShareDialogComplete";
import { useShareActions } from "./useShareActions";
import { useShareStyles } from "./useShareStyles";

export const ShareDialog = ({ open, onClose, profile }) => {
  const { colors } = useTheme();
  const styles = useShareStyles(colors);
  const [step, setStep] = useState("configure");

  // Configuration state
  const [selectedPreset, setSelectedPreset] = useState("education");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expirationDays, setExpirationDays] = useState(7);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Share actions
  const {
    loading,
    generatedLink,
    copiedLink,
    handleGenerateLink,
    handleCopyLink,
    handleShareLink,
    resetShareState,
  } = useShareActions();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("configure");
      setSelectedPreset("education");
      const educationPreset = sharePresets.find((p) => p.id === "education");
      setSelectedCategories(educationPreset?.categories || []);
      setExpirationDays(7);
      setIncludePhoto(false);
      setShowPreview(false);
      resetShareState();
    }
  }, [open, resetShareState]);

  // Auto-select categories when preset changes
  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    const preset = sharePresets.find((p) => p.id === presetId);
    if (preset && presetId !== "custom") {
      setSelectedCategories(preset.categories);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const getSelectedEntriesCount = () => {
    return profile.entries.filter((entry) =>
      selectedCategories.includes(entry.category),
    ).length;
  };

  const handleGenerateLinkClick = async () => {
    const link = await handleGenerateLink({
      profile,
      selectedCategories,
      includePhoto,
      expirationDays,
      selectedPreset,
    });
    if (link) {
      setStep("complete");
    }
  };

  const handleCreateAnother = () => {
    setStep("configure");
    setSelectedPreset("education");
    const educationPreset = sharePresets.find((p) => p.id === "education");
    setSelectedCategories(educationPreset?.categories || []);
    setIncludePhoto(false);
    resetShareState();
  };

  const renderConfigureStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <ShareDialogRecipient
        selectedPreset={selectedPreset}
        onPresetChange={handlePresetChange}
      />

      <ShareDialogCategories
        profile={profile}
        selectedCategories={selectedCategories}
        includePhoto={includePhoto}
        onCategoryToggle={handleCategoryToggle}
        onPhotoToggle={() => setIncludePhoto(!includePhoto)}
        getSelectedEntriesCount={getSelectedEntriesCount}
      />

      <ShareDialogOptions
        expirationDays={expirationDays}
        onExpirationChange={setExpirationDays}
      />

      <ShareDialogPreview
        profile={profile}
        selectedCategories={selectedCategories}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        getSelectedEntriesCount={getSelectedEntriesCount}
      />

      {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (selectedCategories.length < 1 || loading) && styles.buttonDisabled,
        ]}
        onPress={handleGenerateLinkClick}
        disabled={selectedCategories.length < 1 || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={styles.primaryButtonText}>Generate Share Link</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCompleteStep = () => (
    <ShareDialogComplete
      profile={profile}
      expirationDays={expirationDays}
      generatedLink={generatedLink}
      copiedLink={copiedLink}
      onCopyLink={handleCopyLink}
      onShareLink={() => handleShareLink(profile, expirationDays)}
      onCreateAnother={handleCreateAnother}
      onDone={onClose}
    />
  );

  return (
    <ThemedModal
      visible={open}
      onClose={onClose}
      title={step === "configure" ? "Create Share Link" : "Share Created!"}
      headerStyle="primary"
      presentationStyle="pageSheet"
    >
      {step === "configure" ? renderConfigureStep() : renderCompleteStep()}
    </ThemedModal>
  );
};
