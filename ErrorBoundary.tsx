import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong!</Text>
          <ScrollView style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {this.state.error && this.state.error.toString()}
            </Text>
            <Text style={styles.stackText}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d32f2f',
  },
  errorContainer: {
    maxHeight: 400,
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  stackText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ErrorBoundary;