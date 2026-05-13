const admin = require("firebase-admin");
const path = require("path");

// To use FCM, you must provide a service account key
// Download from Firebase Console -> Project Settings -> Service Accounts
let firebaseInitialized = false;

try {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // 1. Try loading from environment variable (Best for Production)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // 2. Try loading from local file (Best for Development)
    serviceAccount = require("../config/firebase-service-account.json");
  }

  // Basic validation of the service account object
  if (serviceAccount && serviceAccount.project_id && !serviceAccount.project_id.includes("YOUR_PROJECT_ID")) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin Initialized");
    firebaseInitialized = true;
  } else {
    throw new Error("Placeholder detected");
  }
} catch (err) {
  console.warn("⚠️ Firebase Admin could not be initialized. FCM push notifications will be disabled.");
  console.warn("Reason:", err.message === "Placeholder detected" ? "firebase-service-account.json contains placeholders." : err.message);
  console.log("👉 ACTION REQUIRED: Download your service account key from Firebase Console and paste it into backend/src/config/firebase-service-account.json");
}

/**
 * Send a push notification to a specific user via their saved tokens (FCM or Expo)
 * @param {string} userId - The parent user ID
 * @param {object} notification - { title, body }
 * @param {object} data - Extra data payload
 */
exports.sendPushNotification = async (userId, notification, data = {}) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(userId);
    
    // Check if user has registered tokens
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`ℹ️ No push tokens found for user ${userId}. Skipping push.`);
      return;
    }

    const expoTokens = [];
    const fcmTokens = [];

    // Separate Expo push tokens from FCM tokens
    user.fcmTokens.forEach(token => {
      if (token.startsWith("ExponentPushToken") || token.startsWith("ExpoPushToken")) {
        expoTokens.push(token);
      } else {
        fcmTokens.push(token);
      }
    });

    // 1. Deliver to Expo tokens via native fetch
    if (expoTokens.length > 0) {
      const messages = expoTokens.map(token => ({
        to: token,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: data,
        priority: "high",
        channelId: "emergency-alerts",
      }));

      try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messages),
        });
        const resData = await response.json();
        console.log(`✅ Expo push notifications dispatched:`, JSON.stringify(resData));
      } catch (expoErr) {
        console.error("❌ Expo Push API dispatch error:", expoErr.message);
      }
    }

    // 2. Deliver to FCM tokens (if Firebase is initialized)
    if (firebaseInitialized && fcmTokens.length > 0) {
      const message = {
        notification,
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`✅ FCM Push sent: ${response.successCount} successful, ${response.failureCount} failed.`);
    } else if (fcmTokens.length > 0) {
      console.log(`ℹ️ Skip FCM dispatch for ${fcmTokens.length} tokens (Firebase not initialized)`);
    }
  } catch (err) {
    console.error("❌ Send Push Notification error:", err.message);
  }
};
