const { validationResult } = require("express-validator");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");

/**
 * POST /api/auth/signup
 */
exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError("An account with this email already exists.", 409));
    }

    const user = await User.create({ name, email, password, role: role || "parent" });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Invalid credentials.", 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials.", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated.", 403));
    }

    // Update lastSeen
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
};

/**
 * PATCH /api/auth/update-me
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};
