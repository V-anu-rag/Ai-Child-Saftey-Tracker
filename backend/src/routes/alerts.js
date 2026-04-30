const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getAlerts,
  markAsRead,
  markAllAsRead,
  triggerSOS,
  resolveSOS,
  deleteAlert,
} = require("../controllers/alertController");

const router = express.Router();

router.use(protect);

router.get("/", getAlerts);
router.post("/sos", triggerSOS);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.patch("/:id/resolve", resolveSOS);
router.delete("/:id", deleteAlert);

module.exports = router;
