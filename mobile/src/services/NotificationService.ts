import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class NotificationService {
  /**
   * Initializes Android notification channels.
   * Required for proper display, vibration, and high-priority heads-up behavior.
   */
  static async setupChannels() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("emergency-alerts", {
        name: "Emergency Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: "#FF0000",
        sound: "default",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Attempt to bypass Do Not Disturb for critical alerts
      });
      console.log("[NotificationService] Android emergency channel configured.");
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
      trigger: null, // show immediately
    });
    console.log("[NotificationService] Local SOS notification triggered.");
  }
}

export default NotificationService;
