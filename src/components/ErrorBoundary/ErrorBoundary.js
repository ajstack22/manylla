import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // In production, send to error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optionally reload the page for a fresh start
    if (!this.props.fallback) {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: "#F5F5F5",
        },
        card: {
          backgroundColor: "#FFFFFF",
          borderRadius: 8,
          padding: 24,
          maxWidth: 500,
          width: "100%",
          alignItems: "center",
          ...Platform.select({
            web: {
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
            default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            },
          }),
        },
        icon: {
          fontSize: 64,
          marginBottom: 16,
        },
        title: {
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 12,
          textAlign: "center",
        },
        message: {
          fontSize: 14,
          color: "#666666",
          textAlign: "center",
          marginBottom: 24,
          lineHeight: 20,
        },
        errorBox: {
          backgroundColor: "#F0F0F0",
          borderRadius: 4,
          padding: 12,
          marginBottom: 24,
          maxHeight: 200,
          width: "100%",
        },
        errorText: {
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
          fontSize: 12,
          color: "#333333",
        },
        button: {
          backgroundColor: "#A08670",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 4,
        },
        buttonText: {
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: "500",
        },
      });

      const isDevelopment =
        (typeof global !== "undefined" &&
          typeof global.__DEV__ !== "undefined" &&
          global.__DEV__) ||
        (Platform.OS === "web" && process?.env?.NODE_ENV === "development");

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Your data is safe in your
              browser's storage.
            </Text>
            {isDevelopment && this.state.error && (
              <ScrollView style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </Text>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
