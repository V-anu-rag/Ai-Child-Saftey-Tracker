const express = require("express");
const { protect } = require("../middleware/auth");
const {
  updateLocation,
  getLastLocation,
  getHistory,
  deleteHistory,
} = require("../controllers/locationController");

const router = express.Router();

router.use(protect);

router.post("/update", updateLocation);
router.get("/last/:childId", getLastLocation);
router.get("/history/:childId", getHistory);
router.delete("/history/:childId", deleteHistory);

module.exports = router;
