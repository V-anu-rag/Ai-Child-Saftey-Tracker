const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["sos", "geofence_exit", "geofence_enter", "low_battery", "device_offline", "app_usage"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: null },
    },
    // For geofence alerts: which zone triggered it
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Geofence",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Prevent duplicate alerts (debounce)
    dedupeKey: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ parentId: 1, createdAt: -1 });
alertSchema.index({ childId: 1, createdAt: -1 });
// dedupeKey unique index is already declared inline with { unique: true, sparse: true }

module.exports = mongoose.model("Alert", alertSchema);
