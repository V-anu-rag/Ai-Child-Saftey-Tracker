const Alert = require("../models/Alert");
const Location = require("../models/Location");
const Child = require("../models/Child");
const { AppError } = require("../middleware/errorHandler");

/**
 * GET /api/activity/:childId
 * Returns a combined timeline of alerts and location changes
 */
exports.getActivity = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    let filter = {};
    if (childId === "all") {
      const children = await Child.find({ parentId: req.user._id }).select("_id");
      const childIds = children.map(c => c._id);
      filter = { childId: { $in: childIds } };
    } else {
      // Verify child belongs to parent
      const child = await Child.findOne({ _id: childId, parentId: req.user._id });
      if (!child) return next(new AppError("Child not found or access denied", 404));
      filter = { childId };
    }

    // Fetch alerts and location history in parallel
    const [alerts, locations] = await Promise.all([
      Alert.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Location.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    // Format and combine
    const timeline = [
      ...alerts.map(a => ({
        id: a._id,
        type: "alert",
        alertType: a.type,
        title: a.title,
        message: a.message,
        timestamp: a.createdAt,
        severity: a.severity,
        location: a.location
      })),
      ...locations.map(l => ({
        id: l._id,
        type: "location",
        title: "Location Update",
        message: l.address || "Updated current position",
        timestamp: l.createdAt,
        coords: { lat: l.latitude, lng: l.longitude },
        batteryLevel: l.batteryLevel
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, limit);

    res.json({
      success: true,
      count: timeline.length,
      timeline
    });
  } catch (err) {
    next(err);
  }
};
