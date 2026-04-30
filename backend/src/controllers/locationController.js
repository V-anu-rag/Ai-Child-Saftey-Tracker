const Location = require("../models/Location");
const Child = require("../models/Child");
const { AppError } = require("../middleware/errorHandler");
const { checkGeofences } = require("../utils/geofenceUtils");

/**
 * POST /api/location/update
 * Child device sends current location (also via socket, but HTTP fallback)
 */
exports.updateLocation = async (req, res, next) => {
  try {
    const { childId, latitude, longitude, accuracy, altitude, speed, batteryLevel } = req.body;

    // Verify this child belongs to the calling user's parent
    const child = await Child.findById(childId);
    if (!child) return next(new AppError("Child not found.", 404));

    // Deduplication check: Ignore if coordinates are identical to last update and received < 10s ago
    const lastLocation = await Location.findOne({ childId }).sort({ createdAt: -1 });
    if (lastLocation) {
      const timeDiff = (new Date() - new Date(lastLocation.createdAt)) / 1000;
      const isSameCoords = lastLocation.latitude === latitude && lastLocation.longitude === longitude;
      if (isSameCoords && timeDiff < 10) {
        return res.status(200).json({ success: true, message: "Duplicate update ignored", location: lastLocation });
      }
    }

    // Store location
    const location = await Location.create({
      childId,
      parentId: child.parentId,
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      batteryLevel,
    });

    // Update child's lastLocation
    await Child.findByIdAndUpdate(childId, {
      lastLocation: { lat: latitude, lng: longitude, timestamp: new Date() },
      batteryLevel,
      isOnline: true,
    });

    // Check geofences (async, don't block response)
    checkGeofences(childId, child.parentId, latitude, longitude).catch(console.error);

    res.status(201).json({ success: true, location });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/location/:childId
 * Get most recent location for a child
 */
exports.getLastLocation = async (req, res, next) => {
  try {
    const location = await Location.findOne({ childId: req.params.childId })
      .sort({ createdAt: -1 })
      .lean();

    if (!location) return next(new AppError("No location data found.", 404));
    res.json({ success: true, location });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/location/history/:childId?limit=50&page=1
 */
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const filter = req.params.childId === "all" 
      ? { parentId: req.user._id }
      : { childId: req.params.childId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const [locations, total] = await Promise.all([
      Location.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("childId", "name")
        .lean(),
      Location.countDocuments(filter),
    ]);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      locations,
    });
  } catch (err) {
    next(err);
  }
};
