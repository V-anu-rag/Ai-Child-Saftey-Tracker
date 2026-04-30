const express = require("express");
const { protect } = require("../middleware/auth");
const { getActivity } = require("../controllers/activityController");

const router = express.Router();

router.use(protect);

router.get("/:childId", getActivity);

module.exports = router;
