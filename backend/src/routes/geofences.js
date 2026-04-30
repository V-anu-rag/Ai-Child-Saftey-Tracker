const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const {
  getGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  toggleGeofence,
} = require("../controllers/geofenceController");

const router = express.Router();

router.use(protect);
router.use(restrictTo("parent"));

router.get("/", getGeofences);
router.post("/", createGeofence);
router.put("/:id", updateGeofence);
router.patch("/:id/toggle", toggleGeofence);
router.delete("/:id", deleteGeofence);

module.exports = router;
