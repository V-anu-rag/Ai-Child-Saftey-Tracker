import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/parent/DashboardScreen";
import MapScreen from "../screens/parent/MapScreen";
import AlertsScreen from "../screens/parent/AlertsScreen";
import HistoryScreen from "../screens/parent/HistoryScreen";
import ChildDetailsScreen from "../screens/parent/ChildDetailsScreen";
import AddChildScreen from "../screens/parent/AddChildScreen";
import GeofencingScreen from "../screens/parent/GeofencingScreen";
import AddGeofenceScreen from "../screens/parent/AddGeofenceScreen";
import SettingsScreen from "../screens/parent/SettingsScreen";
import { COLORS } from "../constants/theme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="ChildDetails" component={ChildDetailsScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function GeofencingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GeofencingMain" component={GeofencingScreen} />
      <Stack.Screen name="AddGeofence" component={AddGeofenceScreen} />
    </Stack.Navigator>
  );
}

export default function ParentNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8),
          shadowColor: COLORS.jet,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, string> = {
            Dashboard: focused ? "home" : "home-outline",
            Map: focused ? "map" : "map-outline",
            Geofencing: focused ? "shield" : "shield-outline",
            Alerts: focused ? "notifications" : "notifications-outline",
            History: focused ? "time" : "time-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Geofencing" component={GeofencingStack} />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarBadge: undefined }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
