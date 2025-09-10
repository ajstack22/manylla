import React, { useEffect, useState } from "react";
import { 
  Platform, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet,
  Dimensions
} from "react-native";
import { useTheme as useAppTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get('window');

export const ThemedToast = ({
  open,
  message,
  onClose,
  duration = 3000,
  icon,
}) => {
  const { colors, themeMode } = useAppTheme();
  const [slideAnim] = useState(new Animated.Value(100));
  const [visible, setVisible] = useState(false);

  // Determine toast styling based on current theme
  const getToastStyles = () => {
    const isManyllaMode = themeMode === "manylla";
    const isDarkMode = themeMode === "dark";

    if (isManyllaMode) {
      return {
        backgroundColor: colors.background.paper + 'F0', // 95% opacity
        color: colors.text.primary,
        borderColor: colors.primary,
        shadowColor: 'rgba(196, 166, 107, 0.3)',
      };
    } else if (isDarkMode) {
      return {
        backgroundColor: colors.background.paper + 'FA', // 98% opacity
        color: colors.text.primary,
        borderColor: colors.primary,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
      };
    } else {
      return {
        backgroundColor: colors.background.paper,
        color: colors.text.primary,
        borderColor: colors.primary + '4D', // 30% opacity
        shadowColor: 'rgba(139, 111, 71, 0.15)',
      };
    }
  };

  const toastStyles = getToastStyles();

  useEffect(() => {
    if (open) {
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [open, duration]);

  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: 100,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start(() => {
      setVisible(false);
      if (onClose) onClose();
    });
  };

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: Platform.OS === 'web' ? 24 : 50,
      left: 20,
      right: 20,
      alignItems: 'center',
      zIndex: 1000,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      minWidth: 240,
      maxWidth: Math.min(360, width - 40),
      borderRadius: 16,
      borderWidth: 1,
      borderColor: toastStyles.borderColor,
      backgroundColor: toastStyles.backgroundColor,
      shadowColor: toastStyles.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 10,
    },
    iconContainer: {
      width: 24,
      height: 24,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 20,
      color: toastStyles.color,
      opacity: 0.9,
    },
    message: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      letterSpacing: 0.3,
      color: toastStyles.color,
    },
    closeButton: {
      width: 32,
      height: 32,
      marginLeft: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },
    closeIcon: {
      fontSize: 18,
      color: toastStyles.color,
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.toast,
          {
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <Text style={styles.message}>
          {message}
        </Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};