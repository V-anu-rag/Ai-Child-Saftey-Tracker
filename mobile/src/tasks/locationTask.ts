/**
 * Background Location Task
 * 
 * This file MUST be imported at the top of App.tsx so that the task
 * is registered in the global scope. The OS invokes this task even
 * when the app is killed, so it cannot live inside a React hook.
 * 
 * Uses dynamic require() to avoid crashes in Expo Go where the
 * native TaskManager module doesn't exist.
 */
import * as SecureStore from "expo-secure-store";
import * as Battery from "expo-battery";
import { locationAPI } from "../api/client";

export const LOCATION_TASK = "background-location-task";

// Guard: Only register if TaskManager native module is available
try {
  const TaskManager = require("expo-task-manager");

  TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: any) => {
    if (error) {
      console.error("[BG Location] Task error:", error.message);
      return;
    }

    if (!data?.locations?.length) return;

    const loc = data.locations[0].coords;

    try {
      const childId = await SecureStore.getItemAsync("tracking_child_id");
      if (!childId) return;

      const batteryLvl = await Battery.getBatteryLevelAsync();
      const battery = Math.round(batteryLvl * 100);

      await locationAPI.update({
        childId,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        speed: loc.speed,
        batteryLevel: battery,
        timestamp: new Date().toISOString(),
        isBackground: true,
      });

      console.log("[BG Location] Sent update successfully");
    } catch (err) {
      // Silent background failure — don't crash the task
    }
  });
} catch (e) {
  console.warn("[BG Location] TaskManager not available (Expo Go?). Background tracking disabled.");
}
