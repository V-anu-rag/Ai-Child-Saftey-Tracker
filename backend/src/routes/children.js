const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const {
  getChildren,
  getChild,
  addChild,
  updateChild,
  deleteChild,
  pairChild,
  unpairSelf,
  regeneratePairingCode,
} = require("../controllers/childController");

const router = express.Router();

// Public pairing route - child devices don't have a token yet
router.post("/pair", pairChild);

router.use(protect); // All routes BELOW this require a valid token

// Child self-removal (must be before /:id routes to avoid matching "unpair-self" as an id)
router.post("/unpair-self", restrictTo("child"), unpairSelf);

router.get("/", restrictTo("parent", "child"), getChildren);
router.post("/", restrictTo("parent"), addChild);
router.get("/:id", restrictTo("parent", "child"), getChild);
router.put("/:id", restrictTo("parent"), updateChild);
router.post("/:id/regenerate-code", restrictTo("parent"), regeneratePairingCode);
router.delete("/:id", restrictTo("parent"), deleteChild);

module.exports = router;
