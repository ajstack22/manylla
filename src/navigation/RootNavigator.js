import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import MainTabNavigator from "./MainTabNavigator";
import ProfileStorageService from "@services/storage/ProfileStorageService";
import { ActivityIndicator, View, Text } from "react-native";
import { useTheme } from "@context/ThemeContext";
import OnboardingScreen from "@screens/Onboarding/OnboardingScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      // Check if user has a profile
      const profileExists = await ProfileStorageService.hasProfile();
      setHasProfile(profileExists);

      // TODOheck if biometric auth is enabled and required
      // const authRequired = await checkAuthRequired();
      // setNeedsAuth(authRequired);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.default,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {needsAuth ? (
          // Show auth screen if biometric auth is required
          <Stack.Screen
            name="Auth"
            component={PlaceholderScreen}
            options={{ animation: "fade" }}
          />
        ) : !hasProfile ? (
          // Show onboarding if no profile exists
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animation: "fade" }}
          />
        ) : (
          // Show main app
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ animation: "fade" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Temporary placeholder screen
const PlaceholderScreen = ({ route }) => {
  const { colors } = useTheme();
  const screenName = route?.name || "Unknown";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.default,
        padding: 0,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: colors.text.primary,
          marginBottom: 0,
        }}
      >
        Welcome to manylla
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: colors.text.secondary,
          textAlign: "center",
          marginBottom: 0,
        }}
      >
        {screenName === "Onboarding"
          ? "Create your first child profile to get started"
          : "Loading your profile..."}
      </Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default RootNavigator;
