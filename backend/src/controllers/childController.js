const crypto = require("crypto");
const Child = require("../models/Child");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");

/**
 * GET /api/children
 * Returns all children for the logged-in parent
 */
exports.getChildren = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.user.role === "parent") {
      query.parentId = req.user._id;
    } else {
      // If child, they can only see their own profile linked to their userId
      query.userId = req.user._id;
    }

    const children = await Child.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: children.length, children });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/children/:id
 */
exports.getChild = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    
    // If parent, ensure it's their child. If child, ensure it's themselves.
    if (req.user.role === "parent") {
      query.parentId = req.user._id;
    } else {
      query.userId = req.user._id;
    }

    const child = await Child.findOne(query);
    if (!child) return next(new AppError("Child profile not found or access denied.", 404));
    
    res.json({ success: true, child });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/children
 * Add a new child profile
 */
exports.addChild = async (req, res, next) => {
  try {
    const { name, age, school, grade } = req.body;
    
    console.log(`👶 Creating child profile: ${name}, age: ${age} for parent: ${req.user._id}`);

    if (!name || !age) {
      return next(new AppError("Name and Age are required to generate a pairing code.", 400));
    }

    // Generate unique 6-char pairing code
    const pairingCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const child = await Child.create({
      parentId: req.user._id,
      name,
      age: parseInt(age),
      school: school || "",
      grade: grade || "",
      pairingCode,
    });

    console.log(`✅ Child created! Pairing code: ${pairingCode}`);
    res.status(201).json({ success: true, child });
  } catch (err) {
    console.error("❌ Failed to create child:", err.message);
    next(err);
  }
};

/**
 * PUT /api/children/:id
 */
exports.updateChild = async (req, res, next) => {
  try {
    const { name, age, school, grade, deviceName } = req.body;

    const child = await Child.findOneAndUpdate(
      { _id: req.params.id, parentId: req.user._id },
      { name, age, school, grade, deviceName },
      { new: true, runValidators: true }
    );

    if (!child) return next(new AppError("Child not found.", 404));
    res.json({ success: true, child });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/children/:id/regenerate-code
 * Generate a new pairing code for an existing child so they can re-pair.
 * Also clears the old device link (userId) and deletes the old virtual user.
 */
exports.regeneratePairingCode = async (req, res, next) => {
  try {
    const child = await Child.findOne({ _id: req.params.id, parentId: req.user._id });
    if (!child) return next(new AppError("Child not found.", 404));

    // Delete the old virtual child User account if it exists
    if (child.userId) {
      await User.deleteOne({ _id: child.userId });
    }

    // Generate a new 6-character pairing code
    const pairingCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Reset device-related fields so the child can re-pair
    child.pairingCode = pairingCode;
    child.userId = null;
    child.isOnline = false;
    child.deviceName = null;
    await child.save();

    console.log(`🔄 Regenerated pairing code for ${child.name}: ${pairingCode}`);

    res.json({ success: true, pairingCode, child });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/children/:id
 */
exports.deleteChild = async (req, res, next) => {
  try {
    const child = await Child.findOne({ _id: req.params.id, parentId: req.user._id });
    if (!child) return next(new AppError("Child not found.", 404));

    // Notify the child device to logout immediately
    const io = require("../socket/socketHandler").getIO();
    if (io) {
      io.to(`child:${child._id}`).emit("child-unpaired", { message: "Your device has been unpaired by your parent." });
    }

    // Perform cascade delete to remove all associated records from the database
    const Alert = require("../models/Alert");
    const Location = require("../models/Location");
    const Geofence = require("../models/Geofence");

    // 1. Delete the virtual child User account
    if (child.userId) {
      await User.deleteOne({ _id: child.userId });
    }

    // 2. Delete all related tracking data
    await Promise.all([
      Alert.deleteMany({ childId: child._id }),
      Location.deleteMany({ childId: child._id }),
      Geofence.deleteMany({ childId: child._id })
    ]);

    // 3. Finally, delete the child profile
    await child.deleteOne();
    
    res.json({ success: true, message: "Child and all associated data removed completely." });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/children/pair
 * Child device calls this to pair itself with a parent
 */
exports.pairChild = async (req, res, next) => {
  try {
    const { pairingCode, deviceName } = req.body;
    const normalizedCode = pairingCode?.trim().toUpperCase();

    console.log(`🔑 Attempting pairing with code: [${normalizedCode}]`);

    // 1. Find the child profile by pairing code
    const child = await Child.findOne({ pairingCode: normalizedCode });
    
    if (!child) {
      console.error(`❌ Pairing failed: Code [${normalizedCode}] not found in database.`);
      return next(new AppError("Invalid pairing code. Please check the code on the dashboard.", 404));
    }

    let user;

    // 2. If child profile has no linked User, create one automatically
    if (!child.userId) {
      // Create a "virtual" child user
      // We use a dummy email based on the pairing code
      const dummyEmail = `child_${pairingCode.toLowerCase()}@safetrack.internal`;
      
      user = await User.create({
        name: child.name,
        email: dummyEmail,
        password: crypto.randomBytes(16).toString("hex"), // Random password
        role: "child",
        parentId: child.parentId,
      });

      child.userId = user._id;
    } else {
      user = await User.findById(child.userId);
    }

    // 3. Link the device info
    child.deviceName = deviceName || "Child Device";
    child.pairingCode = undefined; // Consume the code
    child.isOnline = true;
    await child.save();

    // 4. Generate token for the child app
    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
      child
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/children/unpair-self
 * Called by the child device when the child logs out.
 * Removes the child profile, user account, and all associated data from the DB.
 * Also notifies the parent dashboard in real-time.
 */
exports.unpairSelf = async (req, res, next) => {
  try {
    // Only child users can call this endpoint
    if (req.user.role !== "child") {
      return next(new AppError("Only child devices can unpair themselves.", 403));
    }

    // Find the child profile linked to this user account
    const child = await Child.findOne({ userId: req.user._id });
    if (!child) {
      return next(new AppError("No child profile found for this account.", 404));
    }

    const Alert = require("../models/Alert");
    const Location = require("../models/Location");
    const Geofence = require("../models/Geofence");

    // Notify the parent dashboard in real-time
    const io = require("../socket/socketHandler").getIO();
    if (io) {
      io.to(`parent:${child.parentId}`).emit("child-removed", {
        childId: child._id,
        childName: child.name,
        message: `${child.name}'s device has been disconnected.`,
      });
    }

    // Cascade delete all associated data
    await Promise.all([
      Alert.deleteMany({ childId: child._id }),
      Location.deleteMany({ childId: child._id }),
      Geofence.deleteMany({ childId: child._id }),
    ]);

    // Delete the child profile
    await child.deleteOne();

    // Delete the child's user account
    await User.deleteOne({ _id: req.user._id });

    res.json({ success: true, message: "Device unpaired and all data removed." });
  } catch (err) {
    next(err);
  }
};
