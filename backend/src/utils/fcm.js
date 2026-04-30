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
  console.warn("⚠️ Firebase Admin could not be initialized. Push notifications will be disabled.");
  console.warn("Reason:", err.message === "Placeholder detected" ? "firebase-service-account.json contains placeholders." : err.message);
  console.log("👉 ACTION REQUIRED: Download your service account key from Firebase Console and paste it into backend/src/config/firebase-service-account.json");
}

/**
 * Send a push notification to a specific user via their saved FCM tokens
 * @param {string} userId - The parent user ID
 * @param {object} notification - { title, body }
 * @param {object} data - Extra data payload
 */
exports.sendPushNotification = async (userId, notification, data = {}) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(userId);
    
    // Check if user has registered FCM tokens
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`ℹ️ No FCM tokens found for user ${userId}. Skipping push.`);
      return;
    }

    const message = {
      notification,
      data: {
        ...data,
        click_action: "FLUTTER_NOTIFICATION_CLICK", // Standard for many libraries
      },
      tokens: user.fcmTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Push notification sent: ${response.successCount} successful, ${response.failureCount} failed.`);
    
    // Cleanup invalid tokens if necessary (optional)
    if (response.failureCount > 0) {
      // Logic to remove expired tokens could go here
    }
  } catch (err) {
    console.error("❌ FCM Error:", err.message);
  }
};
