const Geofence = require("../models/Geofence");
const { AppError } = require("../middleware/errorHandler");

/**
 * GET /api/geofences
 */
exports.getGeofences = async (req, res, next) => {
  try {
    const filter = { parentId: req.user._id };
    
    if (req.query.childId) {
      filter.$or = [
        { childId: req.query.childId },
        { childId: null }
      ];
    }
    
    if (req.query.active === "true") filter.isActive = true;

    const geofences = await Geofence.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: geofences.length, geofences });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/geofences
 */
exports.createGeofence = async (req, res, next) => {
  try {
    const { name, type, center, radius, childId, alertOnEnter, alertOnExit, color } = req.body;

    if (!center?.lat || !center?.lng) {
      return next(new AppError("Center coordinates (lat, lng) are required.", 400));
    }

    if (radius && radius < 10) {
      return next(new AppError("Minimum geofence radius is 10 meters.", 400));
    }

    const geofence = await Geofence.create({
      parentId: req.user._id,
      childId: childId || null,
      name,
      type: type || "custom",
      center,
      radius: radius || 200,
      alertOnEnter: alertOnEnter !== false,
      alertOnExit: alertOnExit !== false,
      color: color || "#EA9E8D",
    });

    res.status(201).json({ success: true, geofence });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/geofences/:id
 */
exports.updateGeofence = async (req, res, next) => {
  try {
    if (req.body.radius && req.body.radius < 10) {
      return next(new AppError("Minimum geofence radius is 10 meters.", 400));
    }

    const geofence = await Geofence.findOneAndUpdate(
      { _id: req.params.id, parentId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!geofence) return next(new AppError("Geofence not found.", 404));
    res.json({ success: true, geofence });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/geofences/:id
 */
exports.deleteGeofence = async (req, res, next) => {
  try {
    const geofence = await Geofence.findOneAndDelete({ _id: req.params.id, parentId: req.user._id });
    if (!geofence) return next(new AppError("Geofence not found.", 404));
    res.json({ success: true, message: "Geofence deleted." });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/geofences/:id/toggle
 */
exports.toggleGeofence = async (req, res, next) => {
  try {
    const geofence = await Geofence.findOne({ _id: req.params.id, parentId: req.user._id });
    if (!geofence) return next(new AppError("Geofence not found.", 404));

    geofence.isActive = !geofence.isActive;
    await geofence.save();

    res.json({ success: true, geofence });
  } catch (err) {
    next(err);
  }
};
