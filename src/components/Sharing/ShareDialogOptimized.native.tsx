import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  Platform,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { ChildProfile } from '../../types/ChildProfile';
import { API_ENDPOINTS } from '../../config/api';

interface ShareDialogOptimizedProps {
  open: boolean;
  onClose: () => void;
  profile: ChildProfile;
}

interface SharePreset {
  id: string;
  label: string;
  icon: string;
  categories: string[];
  description: string;
}

const sharePresets: SharePreset[] = [
  { 
    id: 'education', 
    label: 'Education', 
    icon: '🎓',
    categories: ['goals', 'strengths', 'challenges', 'education', 'behaviors'],
    description: 'Educational needs & classroom support'
  },
  { 
    id: 'support', 
    label: 'Support', 
    icon: '👶',
    categories: ['quick-info', 'behaviors', 'tips-tricks', 'daily-care'],
    description: 'Care instructions & helpful tips'
  },
  { 
    id: 'medical', 
    label: 'Medical', 
    icon: '🏥',
    categories: ['quick-info', 'medical', 'therapies', 'behaviors', 'challenges'],
    description: 'Health information & medical history'
  },
  { 
    id: 'custom', 
    label: 'Custom', 
    icon: '⚙️',
    categories: [],
    description: 'Choose exactly what to share'
  },
];

const expirationOptions = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
];

export const ShareDialogOptimized: React.FC<ShareDialogOptimizedProps> = ({
  open,
  onClose,
  profile,
}) => {
  const [step, setStep] = useState<'configure' | 'complete'>('configure');
  const [loading, setLoading] = useState(false);
  
  // Configuration state
  const [selectedPreset, setSelectedPreset] = useState<string>('education');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Complete state
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep('configure');
      setSelectedPreset('education');
      const educationPreset = sharePresets.find(p => p.id === 'education');
      setSelectedCategories(educationPreset?.categories || []);
      setExpirationDays(7);
      setIncludePhoto(false);
      setShowPreview(false);
      setGeneratedLink('');
      setCopiedLink(false);
    }
  }, [open]);

  // Auto-select categories when preset changes
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = sharePresets.find(p => p.id === presetId);
    if (preset && presetId !== 'custom') {
      setSelectedCategories(preset.categories);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      // Generate invite code in XXXX-XXXX format (matching StackMap)
      const { generateInviteCode } = require('../../utils/inviteCode');
      const token = generateInviteCode();
      
      // Generate 32-byte encryption key
      const shareKey = nacl.randomBytes(32);
      
      // Prepare share data
      const sharedProfile = {
        ...profile,
        entries: profile.entries.filter(entry => 
          selectedCategories.includes(entry.category)
        ),
        photo: includePhoto ? profile.photo : '',
        quickInfoPanels: []
      };
      
      const shareData = {
        profile: sharedProfile,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
        version: 2, // Version 2 indicates encrypted share
      };
      
      // Encrypt the share data
      const nonce = nacl.randomBytes(24);
      const messageBytes = util.decodeUTF8(JSON.stringify(shareData));
      const encrypted = nacl.secretbox(messageBytes, nonce, shareKey);
      
      // Combine nonce + ciphertext
      const encryptedBlob = util.encodeBase64(
        new Uint8Array([...nonce, ...encrypted])
      );
      
      // Phase 3: Store encrypted share in database via API
      const response = await fetch(API_ENDPOINTS.share.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: token,
          encrypted_data: encryptedBlob,
          recipient_type: selectedPreset,
          expiry_hours: expirationDays * 24
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[ShareDialog] Failed to create share:', error);
        Alert.alert('Error', 'Failed to create share link. Please try again.');
        return;
      }
      
      const result = await response.json();
      // // console.log('[ShareDialog] Share created successfully:', result);
      
      // Generate link with key in fragment
      const getShareDomain = () => {
        // In React Native, we'll use a configured domain
        return 'https://manylla.com/qual';
      };
      
      const shareDomain = getShareDomain();
      const keyBase64 = util.encodeBase64(shareKey);
      // Use path format for shares
      setGeneratedLink(`${shareDomain}/share/${token}#${keyBase64}`);
      setStep('complete');
    } catch (error) {
      console.error('[ShareDialog] Failed to create share:', error);
      Alert.alert('Error', 'Failed to create share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      const subject = `${profile.preferredName || profile.name}'s Information`;
      const expiration = expirationDays <= 30 
        ? `${expirationDays} ${expirationDays === 1 ? 'day' : 'days'}`
        : expirationDays === 90 
          ? '3 months'
          : '6 months';
      const message = `Here's a secure encrypted link to view ${profile.preferredName || profile.name}'s information:\n\n${generatedLink}\n\nThis link will expire in ${expiration}.\n\nNote: This link contains encrypted data. Please use the complete link exactly as provided.`;
      
      await Share.share({
        message,
        title: subject,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getSelectedEntriesCount = () => {
    return profile.entries.filter(entry => 
      selectedCategories.includes(entry.category)
    ).length;
  };

  const renderConfigureStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Preset Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Who are you sharing with?</Text>
        <View style={styles.presetGrid}>
          {sharePresets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetCard,
                selectedPreset === preset.id && styles.presetCardSelected
              ]}
              onPress={() => handlePresetChange(preset.id)}
            >
              <Text style={styles.presetIcon}>{preset.icon}</Text>
              <Text style={[
                styles.presetLabel,
                selectedPreset === preset.id && styles.presetLabelSelected
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedPreset && (
          <Text style={styles.presetDescription}>
            {sharePresets.find(p => p.id === selectedPreset)?.description}
          </Text>
        )}
      </View>

      {/* Categories Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Information to share</Text>
          {selectedCategories.length > 0 && (
            <Text style={styles.sectionCount}>
              {getSelectedEntriesCount()} entries{includePhoto ? ' + photo' : ''}
            </Text>
          )}
        </View>
        
        {/* Photo option */}
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              includePhoto && styles.categoryChipSelected
            ]}
            onPress={() => setIncludePhoto(!includePhoto)}
          >
            <Text style={[
              styles.categoryChipText,
              includePhoto && styles.categoryChipTextSelected
            ]}>
              👤 Photo
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Category options */}
        <View style={styles.categoryGrid}>
          {profile.categories.filter(cat => cat.isVisible).map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategories.includes(category.name) && styles.categoryChipSelected,
                category.isQuickInfo && styles.categoryChipQuickInfo
              ]}
              onPress={() => handleCategoryToggle(category.name)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategories.includes(category.name) && styles.categoryChipTextSelected
              ]}>
                {category.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Expiration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Access expires in</Text>
        <View style={styles.expirationGrid}>
          {expirationOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.expirationButton,
                expirationDays === option.value && styles.expirationButtonSelected
              ]}
              onPress={() => setExpirationDays(option.value)}
            >
              <Text style={[
                styles.expirationButtonText,
                expirationDays === option.value && styles.expirationButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview */}
      <TouchableOpacity
        style={styles.previewButton}
        onPress={() => setShowPreview(!showPreview)}
      >
        <Text style={styles.previewButtonText}>
          {showPreview ? 'Hide' : 'Show'} preview ({getSelectedEntriesCount()} entries)
        </Text>
      </TouchableOpacity>
      
      {showPreview && (
        <View style={styles.previewBox}>
          {profile.entries
            .filter(entry => selectedCategories.includes(entry.category))
            .slice(0, 5)
            .map(entry => (
              <View key={entry.id} style={styles.previewItem}>
                <Text style={styles.previewCategory}>
                  {profile.categories.find(c => c.name === entry.category)?.displayName}
                </Text>
                <Text style={styles.previewTitle}>{entry.title}</Text>
              </View>
            ))}
          {getSelectedEntriesCount() > 5 && (
            <Text style={styles.previewMore}>
              ...and {getSelectedEntriesCount() - 5} more entries
            </Text>
          )}
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (selectedCategories.length === 0 || loading) && styles.buttonDisabled
        ]}
        onPress={handleGenerateLink}
        disabled={selectedCategories.length === 0 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Generate Share Link</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCompleteStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.successAlert}>
        <Text style={styles.successAlertText}>
          ✓ Share link created successfully!
        </Text>
        <Text style={styles.successAlertSubtext}>
          This link will expire in {
            expirationDays <= 30 
              ? `${expirationDays} ${expirationDays === 1 ? 'day' : 'days'}`
              : expirationDays === 90 
                ? '3 months'
                : '6 months'
          }.
        </Text>
      </View>

      {/* Share Link */}
      <View style={styles.linkCard}>
        <Text style={styles.linkCardTitle}>Share Link</Text>
        <View style={styles.linkInputContainer}>
          <TextInput
            style={styles.linkInput}
            value={generatedLink}
            editable={false}
            multiline
          />
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyLink}
          >
            <Text style={styles.copyButtonText}>
              {copiedLink ? '✓' : '📋'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Info */}
      <View style={styles.securityCard}>
        <Text style={styles.securityCardTitle}>🔒 Secure Share</Text>
        <Text style={styles.securityCardText}>
          This link contains an encrypted version of the selected information. 
          The encryption key is included in the link and never sent to any server. 
          Only someone with this exact link can view the shared information.
        </Text>
      </View>

      {/* Share Options */}
      <View style={styles.shareOptions}>
        <Text style={styles.shareOptionsTitle}>Share via</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareLink}
        >
          <Text style={styles.shareButtonText}>📤 Share Link</Text>
        </TouchableOpacity>
      </View>

      {/* Create Another */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          setStep('configure');
          setSelectedPreset('education');
          const educationPreset = sharePresets.find(p => p.id === 'education');
          setSelectedCategories(educationPreset?.categories || []);
          setIncludePhoto(false);
        }}
      >
        <Text style={styles.secondaryButtonText}>Create another share</Text>
      </TouchableOpacity>

      {/* Done Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onClose}
      >
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'configure' ? 'Create Share Link' : 'Share Created!'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {step === 'configure' ? renderConfigureStep() : renderCompleteStep()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B7355',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionCount: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  presetCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  presetCardSelected: {
    borderColor: '#8B7355',
    backgroundColor: 'rgba(139, 115, 85, 0.08)',
  },
  presetIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  presetLabel: {
    fontSize: 14,
    color: '#333',
  },
  presetLabelSelected: {
    fontWeight: '600',
    color: '#8B7355',
  },
  presetDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  categoryRow: {
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#8B7355',
    borderColor: '#8B7355',
  },
  categoryChipQuickInfo: {
    borderWidth: 2,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  expirationGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  expirationButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  expirationButtonSelected: {
    backgroundColor: '#8B7355',
    borderColor: '#8B7355',
  },
  expirationButtonText: {
    fontSize: 14,
    color: '#333',
  },
  expirationButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  previewButton: {
    padding: 12,
    marginBottom: 16,
  },
  previewButtonText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  previewItem: {
    marginBottom: 12,
  },
  previewCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  previewTitle: {
    fontSize: 14,
    color: '#333',
  },
  previewMore: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: '#8B7355',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#8B7355',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  successAlert: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  successAlertText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  successAlertSubtext: {
    color: '#2E7D32',
    fontSize: 14,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  linkCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  linkInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  linkInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#333',
  },
  copyButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#8B7355',
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  securityCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  securityCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  securityCardText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  shareOptions: {
    marginBottom: 20,
  },
  shareOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B7355',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#8B7355',
    fontSize: 14,
    fontWeight: '600',
  },
});