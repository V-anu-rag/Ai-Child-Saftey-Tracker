import "react-native-gesture-handler";
import "./src/tasks/locationTask";
import React, { useState } from "react";
import { LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SocketProvider } from "./src/context/SocketContext";
import AppNavigator from "./src/navigation/AppNavigator";
import SplashScreen from "./src/components/SplashScreen";

LogBox.ignoreLogs(["InteractionManager has been deprecated"]);

function RootApp() {
  const [splashDone, setSplashDone] = useState(false);
  const { isLoading, user } = useAuth();

  if (!splashDone || isLoading) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <SocketProvider>
      <AppNavigator />
    </SocketProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SocketProvider>
            <StatusBar style="auto" />
            <RootApp />
            
          </SocketProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}