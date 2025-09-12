import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@context/ThemeContext";
import { View, Text } from "react-native";
import platform from "../utils/platform";
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import stack navigators (to be created)
// import HomeStackNavigator from './stacks/HomeStackNavigator';
// import EntriesStackNavigator from './stacks/EntriesStackNavigator';
// import SettingsStackNavigator from './stacks/SettingsStackNavigator';
// import ShareStackNavigator from './stacks/ShareStackNavigator';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.paper,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: platform.isIOS ? 20 : 8,
          paddingTop: 8,
          height: platform.isIOS ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: "Home",
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="home" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Entries"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: "Entries",
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="folder" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: "Add",
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="plus-circle" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Share"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: "Share",
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="share-variant" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: "Settings",
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="cog" color={color} size={size} />
          // ),
        }}
      />
    </Tab.Navigator>
  );
};

// Temporary placeholder screen
const PlaceholderScreen = ({ route }) => {
  const { colors } = useTheme();
  const screenName = route?.name || "Screen";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.default,
      }}
    >
      <Text style={{ color: colors.text.primary, fontSize: 18 }}>
        {screenName} Screen
      </Text>
      <Text
        style={{ color: colors.text.secondary, fontSize: 14, marginTop: 8 }}
      >
        Coming soon...
      </Text>
    </View>
  );
};

export default MainTabNavigator;
