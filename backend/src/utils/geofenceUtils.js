/**
 * Haversine formula — calculates distance between two lat/lng points in meters
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Check all active geofences for a child and trigger alerts if needed.
 * Called after every location update.
 *
 * @param {string} childId
 * @param {string} parentId
 * @param {number} lat
 * @param {number} lng
 */
const checkGeofences = async (childId, parentId, lat, lng) => {
  const Geofence = require("../models/Geofence");
  const Alert = require("../models/Alert");
  const Child = require("../models/Child");
  const { getIO } = require("../socket/socketHandler");

  // Load active geofences for this parent (global or child-specific)
  const geofences = await Geofence.find({
    parentId,
    isActive: true,
    $or: [{ childId: null }, { childId }],
  });

  if (!geofences.length) return;

  const child = await Child.findById(childId).select("name safeStatus");
  if (!child) return;

  const io = getIO();
  const nowWindow = new Date(Date.now() - 5 * 60 * 1000); // 5 min debounce window

  for (const zone of geofences) {
    const distance = haversineDistance(lat, lng, zone.center.lat, zone.center.lng);
    const isInside = distance <= zone.radius;
    const wasInside = child._geofenceState?.[zone._id.toString()] ?? null;

    // Track per-zone state (in-memory; good enough for MVP)
    if (!child._geofenceState) child._geofenceState = {};
    child._geofenceState[zone._id.toString()] = isInside;

    let shouldAlert = false;
    let alertType = null;
    let severity = "high";
    let title = "";
    let message = "";

    if (wasInside === true && !isInside && zone.alertOnExit) {
      // Exited zone
      shouldAlert = true;
      alertType = "geofence_exit";
      title = `${child.name} left ${zone.name}`;
      message = `${child.name} has left the "${zone.name}" safe zone.`;
    } else if (wasInside === false && isInside && zone.alertOnEnter) {
      // Entered zone
      shouldAlert = true;
      alertType = "geofence_enter";
      severity = "low";
      title = `${child.name} arrived at ${zone.name}`;
      message = `${child.name} has arrived at the "${zone.name}" zone.`;
    }

    if (!shouldAlert) continue;

    // Debounce: skip if identical alert within 5 min
    const dedupeKey = `${childId}-${zone._id}-${alertType}-${Math.floor(Date.now() / (5 * 60 * 1000))}`;

    try {
      const alert = await Alert.create({
        childId,
        parentId,
        type: alertType,
        severity,
        title,
        message,
        location: { lat, lng },
        geofenceId: zone._id,
        dedupeKey,
      });

      // Update child safe status
      const newStatus = alertType === "geofence_exit" ? "warning" : "safe";
      await Child.findByIdAndUpdate(childId, { safeStatus: newStatus });

      // Emit to parent's socket room
      if (io) {
        io.to(`parent:${parentId}`).emit("alert-received", {
          ...alert.toObject(),
          childName: child.name,
          zoneName: zone.name,
        });
      }
    } catch (err) {
      // Ignore duplicate key error (deduplication working as expected)
      if (err.code !== 11000) console.error("Geofence alert error:", err.message);
    }
  }
};

module.exports = { haversineDistance, checkGeofences };
