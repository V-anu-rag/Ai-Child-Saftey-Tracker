const { validationResult } = require("express-validator");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");

/**
 * POST /api/auth/signup
 */
exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { name, email, password, role, fcmToken } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError("An account with this email already exists.", 409));
    }

    const user = await User.create({ name, email, password, role: role || "parent", fcmTokens: fcmToken ? [fcmToken] : [] });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { email, password, fcmToken } = req.body;

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Invalid credentials.", 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials.", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated.", 403));
    }

    // Update lastSeen and FCM token
    user.lastSeen = new Date();
    if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      if (user.fcmTokens.length > 5) {
        user.fcmTokens = user.fcmTokens.slice(-5);
      }
    }
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    const { fcmToken, webPushSubscription } = req.body;
    if (req.user) {
      const updates = {};
      if (fcmToken) updates.$pull = { fcmTokens: fcmToken };
      if (webPushSubscription) {
        updates.$pull = updates.$pull || {};
        // Use the endpoint string to uniquely identify the subscription for removal
        updates.$pull.webPushSubscriptions = { endpoint: webPushSubscription.endpoint };
      }
      
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(req.user._id, updates);
        console.log(`[DEBUG PUSH TOKEN] Removed token/subscription on logout for user ${req.user._id}`);
      }
    }
    res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    res.json({ success: true, message: "Logged out (token cleanup failed)." });
  }
};

/**
 * PATCH /api/auth/update-me
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/fcm-token
 */
exports.registerFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return next(new AppError("FCM Token is required", 400));

    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("User not found", 404));

    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      if (user.fcmTokens.length > 5) {
        user.fcmTokens = user.fcmTokens.slice(-5);
      }
      await user.save({ validateBeforeSave: false });
    }

    res.json({ success: true, message: "FCM Token registered" });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/web-push-subscribe
 */
exports.registerWebPushSubscription = async (req, res, next) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return next(new AppError("Invalid subscription object", 400));
    }

    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("User not found", 404));

    // Check if subscription already exists (by endpoint)
    const exists = user.webPushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      user.webPushSubscriptions.push(subscription);
      if (user.webPushSubscriptions.length > 5) {
        user.webPushSubscriptions = user.webPushSubscriptions.slice(-5);
      }
      await user.save({ validateBeforeSave: false });
      console.log(`[DEBUG PUSH TOKEN] Web Push Subscription saved for user ${user._id}`);
    }

    res.json({ success: true, message: "Web Push Subscription registered" });
  } catch (err) {
    next(err);
  }
};
