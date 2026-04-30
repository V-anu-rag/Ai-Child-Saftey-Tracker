const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      default: null, // meters
    },
    altitude: {
      type: Number,
      default: null,
    },
    speed: {
      type: Number,
      default: null, // m/s
    },
    address: {
      type: String,
      default: null,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: auto-delete location records older than 30 days
locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
locationSchema.index({ childId: 1, createdAt: -1 });

module.exports = mongoose.model("Location", locationSchema);
