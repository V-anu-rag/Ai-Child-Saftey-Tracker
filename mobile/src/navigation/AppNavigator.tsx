import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import RoleSelectionScreen from "../screens/auth/RoleSelectionScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ChildPairingScreen from "../screens/child/PairingScreen";
import ParentNavigator from "./ParentNavigator";
import ChildNavigator from "./ChildNavigator";
import { navigationRef } from "../utils/navigationRef";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const auth = useAuth();

  if (!auth) {
    return null;
  }

  const { isAuthenticated, isLoading, user, unauthRole } = auth;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1C2826" }}>
        <ActivityIndicator size="small" color="#D64550" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Unauthenticated flow
          <>
            {!unauthRole ? (
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            ) : unauthRole === "parent" ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              <Stack.Screen name="ChildPairing" component={ChildPairingScreen} />
            )}
          </>
        ) : user?.role === "parent" ? (
          <Stack.Screen name="Parent" component={ParentNavigator} />
        ) : (
          <Stack.Screen name="Child" component={ChildNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
