const mongoose = require("mongoose");

const geofenceSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Null means applies to all children of this parent
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Zone name is required"],
      trim: true,
      maxlength: [80, "Zone name cannot exceed 80 characters"],
    },
    type: {
      type: String,
      enum: ["home", "school", "custom"],
      default: "custom",
    },
    center: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
    radius: {
      type: Number,
      required: true,
      min: 10,   // minimum 10 meters
      max: 50000, // maximum 50 km
      default: 200,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    alertOnEnter: {
      type: Boolean,
      default: true,
    },
    alertOnExit: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: "#EA9E8D",
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"],
    },
  },
  {
    timestamps: true,
  }
);

geofenceSchema.index({ parentId: 1, isActive: 1 });

module.exports = mongoose.model("Geofence", geofenceSchema);
