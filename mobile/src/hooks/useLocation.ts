import { useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useSocket } from "../context/SocketContext";
import { LOCATION_TASK } from "../tasks/locationTask";

const LOCATION_INTERVAL = 60000; // 1 minute
const MIN_UPDATE_INTERVAL = 30000; // 30 seconds safety throttle

// GLOBAL STATE: Persists for the entire app lifecycle to prevent log spam
let globalTaskManagerAvailable: boolean | null = null;

interface UseLocationOptions {
  childId: string;
  enabled?: boolean;
  batteryLevel?: number;
  onLocationUpdate?: (coords: Location.LocationObjectCoords) => void;
}

export const useLocation = ({
  childId,
  enabled = false,
  batteryLevel,
  onLocationUpdate,
}: UseLocationOptions) => {
  const { emit } = useSocket();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTrackingRef = useRef(false);
  const lastSentRef = useRef<number>(0);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== "granted") return false;

    if (Platform.OS === "android") {
      await Notifications.requestPermissionsAsync();
    }

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    return bg === "granted";
  }, []);

  const sendLocation = useCallback(
    async (coords?: Location.LocationObjectCoords) => {
      const now = Date.now();
      if (now - lastSentRef.current < MIN_UPDATE_INTERVAL) {
        console.log("[useLocation] Throttling update — too soon since last send");
        return;
      }

      let resolvedCoords = coords;
      if (!resolvedCoords) {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          resolvedCoords = loc.coords;
        } catch (e) { return; }
      }

      const payload = {
        childId,
        latitude: resolvedCoords.latitude,
        longitude: resolvedCoords.longitude,
        accuracy: resolvedCoords.accuracy,
        batteryLevel,
        timestamp: new Date().toISOString(),
      };

      emit("send-location", payload);
      lastSentRef.current = now;
      onLocationUpdate?.(resolvedCoords);
    },
    [childId, batteryLevel, emit, onLocationUpdate]
  );

  const startTracking = useCallback(async () => {
    if (isTrackingRef.current) return;

    // PERFORM GLOBAL CHECK ONCE
    if (globalTaskManagerAvailable === null) {
      try {
        const TM = require("expo-task-manager");
        globalTaskManagerAvailable = await TM.isAvailableAsync();
      } catch {
        globalTaskManagerAvailable = false;
      }
      if (!globalTaskManagerAvailable) {
        console.warn("⚠️ TaskManager unavailable. Using foreground-only tracking mode.");
      }
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert("Permission Required", "Please set location permission to 'Allow all the time' in system settings.");
      return;
    }

    isTrackingRef.current = true;
    await SecureStore.setItemAsync("tracking_child_id", childId);

    await sendLocation();
    intervalRef.current = setInterval(sendLocation, LOCATION_INTERVAL);

    if (globalTaskManagerAvailable) {
      try {
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000,
          distanceInterval: 50,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "SafeTrack Tracking Active",
            notificationBody: "Protecting your safety in the background",
            notificationColor: "#D64550",
          },
        });
      } catch (err) {
        // Silent failure
      }
    }
  }, [childId, requestPermissions, sendLocation]);

  const stopTracking = useCallback(async () => {
    isTrackingRef.current = false;
    await SecureStore.deleteItemAsync("tracking_child_id");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      if (globalTaskManagerAvailable) {
        const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
        if (isRegistered) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => {
      stopTracking();
    };
  }, [enabled, startTracking, stopTracking]);

  return { startTracking, stopTracking };
};
