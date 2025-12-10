import mongoose from "mongoose";

const DriverRoutePointSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
    index: true,
  },

  routePoint: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
});

// Create 2dsphere index
DriverRoutePointSchema.index({ routePoint: "2dsphere" });

export default mongoose.models.DriverRoutePoint ||
  mongoose.model("DriverRoutePoint", DriverRoutePointSchema);
