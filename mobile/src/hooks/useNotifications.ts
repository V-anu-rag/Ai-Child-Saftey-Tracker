import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { authAPI } from "../api/client";
import { navigate } from "../utils/navigationRef";
import NotificationService from "../services/NotificationService";

// Configure how foreground notifications are shown when the app is active
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as Notifications.NotificationBehavior;
  },
});

export const useNotifications = (userId: string | undefined, userRole: string | undefined) => {
  const responseListenerRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;

    // Initialize Max Priority Android Channel for Critical Safety Alerts
    NotificationService.setupChannels();

    const registerForPushNotifications = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.warn("[useNotifications] Permission for push notifications not granted.");
          return;
        }

        // Fetch EAS Project ID directly from app config
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.warn("[useNotifications] EAS Project ID is missing from configuration.");
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        const token = tokenData.data;
        console.log("[useNotifications] Generated Expo Push Token:", token);

        // Register push token with the backend database
        await authAPI.registerFcmToken(token);
        console.log("[useNotifications] Push token registered on server successfully.");
      } catch (err: any) {
        console.error("[useNotifications] Registration failed:", err.message);
      }
    };

    registerForPushNotifications();

    // Listener for when a user taps/interacts with a notification (Foreground, Background, or Killed State)
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data;
        console.log("[useNotifications] Notification tapped with payload data:", data);

        if (userRole === "parent") {
          if (data && data.latitude && data.longitude) {
            // Automatically open live map at precise coordinates!
            navigate("Map", {
              childId: data.childId as string,
              latitude: parseFloat(String(data.latitude)),
              longitude: parseFloat(String(data.longitude)),
              childName: (data.childName as string) || "Child",
            });
          } else if (data && data.location && (data.location as any).lat) {
            // Fallback for location object
            const loc = data.location as any;
            navigate("Map", {
              childId: data.childId as string,
              latitude: parseFloat(String(loc.lat)),
              longitude: parseFloat(String(loc.lng)),
              childName: (data.childName as string) || "Child",
            });
          } else {
            // Fallback: Navigate straight to emergency alert dashboard feed
            navigate("Alerts");
          }
        }
      } catch (err: any) {
        console.error("[useNotifications] Click listener error:", err.message);
      }
    });

    return () => {
      if (responseListenerRef.current) {
        responseListenerRef.current.remove();
      }
    };
  }, [userId, userRole]);
};
export default useNotifications;
