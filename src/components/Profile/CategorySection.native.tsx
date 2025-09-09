import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Entry } from "../../types/ChildProfile";
import { MarkdownRenderer } from "../Forms";

interface CategorySectionProps {
  title: string;
  entries: Entry[];
  color: string;
  icon?: React.ReactNode;
  onAddEntry?: () => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  entries,
  color,
  icon,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  const renderContent = (content: string) => {
    // Simple markdown/HTML stripping for now
    const stripped = content
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^#+\s/gm, "");
    return stripped;
  };

  return (
    <View style={styles.container}>
      {/* Category Header */}
      <View style={[styles.header, { borderBottomColor: color }]}>
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={{ color, fontSize: 20 }}>{icon}</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Entries */}
      <View style={styles.entriesContainer}>
        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No {title.toLowerCase()} added yet.
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View
              key={entry.id}
              style={[styles.card, { borderLeftColor: color }]}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>
                      {renderContent(entry.title)}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    {onEditEntry && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onEditEntry(entry)}
                      >
                        <Text style={styles.actionButtonText}>✏️</Text>
                      </TouchableOpacity>
                    )}
                    {onDeleteEntry && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => onDeleteEntry(entry.id)}
                      >
                        <Text style={styles.actionButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <MarkdownRenderer
                  content={entry.description}
                  style={styles.cardDescription}
                />

                <Text style={styles.cardDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Add Entry Button */}
        {onAddEntry && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: color }]}
            onPress={onAddEntry}
          >
            <Text style={styles.addButtonText}>+ Add {title}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  entriesContainer: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FFE6E6",
  },
  actionButtonText: {
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 12,
    color: "#999",
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CategorySection;
