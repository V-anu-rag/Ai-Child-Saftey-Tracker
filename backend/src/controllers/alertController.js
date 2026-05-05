const Alert = require("../models/Alert");
const { AppError } = require("../middleware/errorHandler");
const { getIO } = require("../socket/socketHandler");
const { sendPushNotification } = require("../utils/fcm");

/**
 * GET /api/alerts?page=1&limit=20&unread=true&severity=critical
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = { parentId: req.user._id };
    if (req.query.unread === "true") filter.isRead = false;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.childId) filter.childId = req.query.childId;
    if (req.query.type) filter.type = req.query.type;

    const [alerts, total, unreadCount] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("childId", "name avatar")
        .lean(),
      Alert.countDocuments(filter),
      Alert.countDocuments({ parentId: req.user._id, isRead: false }),
    ]);

    // Normalize alerts for frontend (map createdAt -> timestamp, etc)
    const normalizedAlerts = alerts.map(a => ({
      ...a,
      id: a._id,
      timestamp: a.createdAt,
      childName: a.childId?.name || "Child",
    }));

    res.json({ success: true, page, totalPages: Math.ceil(total / limit), total, unreadCount, alerts: normalizedAlerts });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/alerts/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, parentId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!alert) return next(new AppError("Alert not found.", 404));
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/alerts/read-all
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Alert.updateMany({ parentId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: "All alerts marked as read." });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/alerts/sos
 * Called by child device when SOS button pressed
 */
exports.triggerSOS = async (req, res, next) => {
  try {
    const { childId, latitude, longitude, message } = req.body;

    const Child = require("../models/Child");
    const child = await Child.findById(childId);
    if (!child) return next(new AppError("Child not found.", 404));

    const address = latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Unknown location";

    const alert = await Alert.create({
      childId,
      parentId: child.parentId,
      type: "sos",
      severity: "critical",
      title: `🚨 SOS from ${child.name}`,
      message: message || `${child.name} has pressed the SOS button and needs immediate help.`,
      location: latitude ? { lat: latitude, lng: longitude, address } : undefined,
    });

    // Emit real-time alert to parent's room
    const io = getIO();
    if (io) {
      const parentRoom = `parent:${child.parentId.toString()}`;
      
      console.log(`🚨 SOS Triggered: Broadcasting to ${parentRoom}`);
      
      io.to(parentRoom).emit("alert-received", {
        ...alert.toObject(),
        id: alert._id,
        timestamp: alert.createdAt,
        childName: child.name,
      });
    }

    // Fallback to Push Notification if parent is offline OR always for SOS
    await sendPushNotification(
      child.parentId,
      {
        title: `🚨 EMERGENCY SOS: ${child.name}`,
        body: `${child.name} has triggered an SOS! Tap to view location.`,
      },
      {
        type: "sos",
        childId: childId.toString(),
        alertId: alert._id.toString(),
        latitude: latitude?.toString() || "",
        longitude: longitude?.toString() || "",
      }
    );

    res.status(201).json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/alerts/:id/resolve
 */
exports.resolveSOS = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, parentId: req.user._id, type: "sos" },
      { status: "resolved", isRead: true },
      { new: true }
    );
    if (!alert) return next(new AppError("SOS Alert not found.", 404));

    // Notify dashboard to hide modal on ALL tabs
    const io = getIO();
    if (io) {
      const parentRoom = `parent:${req.user._id}`;
      console.log(`✅ SOS Resolved: Notifying ${parentRoom}`);
      io.to(parentRoom).emit("alert-resolved", { alertId: alert._id });
    }

    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/alerts/:id
 */
exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, parentId: req.user._id });
    if (!alert) return next(new AppError("Alert not found.", 404));
    res.json({ success: true, message: "Alert deleted." });
  } catch (err) {
    next(err);
  }
};
