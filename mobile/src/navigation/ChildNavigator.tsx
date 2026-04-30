import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TrackingScreen from "../screens/child/TrackingScreen";

const Stack = createStackNavigator();

export default function ChildNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tracking" component={TrackingScreen} />
    </Stack.Navigator>
  );
}
