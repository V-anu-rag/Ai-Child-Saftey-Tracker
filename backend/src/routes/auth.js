const express = require("express");
const { body } = require("express-validator");
const { signup, login, getMe, logout, updateMe, registerFcmToken } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("role").optional().isIn(["parent", "child"]).withMessage("Role must be parent or child"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.patch("/update-me", protect, updateMe);
router.patch("/fcm-token", protect, registerFcmToken);

module.exports = router;
