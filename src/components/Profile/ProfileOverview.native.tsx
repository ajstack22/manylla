import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChildProfile } from '../../types/ChildProfile';

interface ProfileOverviewProps {
  profile: ChildProfile | null;
  onUpdateProfile?: (updates: Partial<ChildProfile>) => void;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile, onUpdateProfile }) => {
  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profile loaded</Text>
      </View>
    );
  }
  const renderCategory = (title: string, entries: any[], color: string) => {
    if (!entries || entries.length === 0) return null;
    
    return (
      <View style={styles.categorySection} key={title}>
        <View style={[styles.categoryHeader, { backgroundColor: color }]}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryCount}>{entries.length} items</Text>
        </View>
        <View style={styles.categoryContent}>
          {entries.map((entry, index) => (
            <View key={index} style={styles.entryItem}>
              <Text style={styles.entryTitle}>{entry.title || entry.name}</Text>
              {entry.description && (
                <Text style={styles.entryDescription} numberOfLines={2}>
                  {entry.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const categories = [
    { key: 'medical', title: 'Medical Information', color: '#E57373' },
    { key: 'behavior', title: 'Behavior & Triggers', color: '#FF8A65' },
    { key: 'sensory', title: 'Sensory Needs', color: '#FFB74D' },
    { key: 'dietary', title: 'Dietary Restrictions', color: '#FFD54F' },
    { key: 'communication', title: 'Communication', color: '#81C784' },
    { key: 'daily', title: 'Daily Living', color: '#4FC3F7' },
    { key: 'education', title: 'Education', color: '#9575CD' },
    { key: 'emergency', title: 'Emergency', color: '#F06292' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{profile.preferredName || profile.name}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {profile.diagnosis && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Diagnosis</Text>
            <Text style={styles.infoValue}>{profile.diagnosis}</Text>
          </View>
        )}
        
        {profile.quickInfo && profile.quickInfo.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Quick Info</Text>
            {profile.quickInfo.map((info, index) => (
              <Text key={index} style={styles.quickInfoItem}>• {info}</Text>
            ))}
          </View>
        )}

        <View style={styles.categoriesContainer}>
          {categories.map(cat => 
            renderCategory(
              cat.title, 
              profile[cat.key as keyof ChildProfile] as any[], 
              cat.color
            )
          )}
          
          {profile.customCategories?.map((customCat, index) =>
            renderCategory(
              customCat.name,
              customCat.entries || [],
              '#B0BEC5'
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#8B7355',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  quickInfoItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCount: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  categoryContent: {
    padding: 12,
  },
  entryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ProfileOverview;