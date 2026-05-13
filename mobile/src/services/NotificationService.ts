import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class NotificationService {
  /**
   * Initializes Android notification channels.
   * Required for proper display, vibration, and high-priority heads-up behavior.
   */
  static async setupChannels() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("emergency-sos", {
        name: "Emergency SOS",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500, 250, 500],
        lightColor: "#FF4D4D",
        sound: "default", // Or a custom sound if available
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Attempt to bypass Do Not Disturb for critical alerts
      });
      
      await Notifications.setNotificationChannelAsync("geofence-alerts", {
        name: "Geofence Alerts",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#635BFF",
      });

      await Notifications.setNotificationChannelAsync("general-alerts", {
        name: "General Alerts",
        importance: Notifications.AndroidImportance.DEFAULT,
      });

      console.log("[NotificationService] Android channels configured.");
    }
  }

  /**
   * Triggers a local SOS notification.
   * Useful when a socket event is received to guarantee the notification tray UI is shown
   * even if the push notification from the backend is delayed.
   */
  static async triggerLocalSOS(data: any) {
    const title = data.title || `🚨 Emergency SOS: ${data.childName || "Child"}`;
    const body = data.message || `${data.childName || "Your child"} has triggered an Emergency SOS! Tap to view live location.`;

    await Notifications.scheduleNotificationAsync({
      // Use the alert ID to prevent duplicate notifications if FCM push also arrives
      identifier: data.id || `sos-${Date.now()}`,
      content: {
        title,
        body,
        data: {
          ...data,
          type: "sos",
        },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.AndroidNotificationPriority.MAX,
        channelId: "emergency-sos"
      } as any,
    });
    console.log("[NotificationService] Local SOS notification triggered.");
  }
}

export default NotificationService;
