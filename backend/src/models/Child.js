const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Optional link to the child's User account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Child name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
      max: [18, "Age must be at most 18"],
    },
    avatar: {
      type: String,
      default: null, // URL or base64
    },
    deviceName: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    lastLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: null },
      timestamp: { type: Date, default: null },
    },
    safeStatus: {
      type: String,
      enum: ["safe", "warning", "alert"],
      default: "safe",
    },
    school: { type: String, default: null },
    grade: { type: String, default: null },
    // Unique pairing code for QR scan
    pairingCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Persistent state for geofence transitions (ZoneID -> IsInside)
    geofenceState: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// parentId index is already declared inline with { index: true }
childSchema.index({ userId: 1 });

module.exports = mongoose.model("Child", childSchema);
