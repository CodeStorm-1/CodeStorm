// models/DriverRoutePoint.js
import mongoose from "mongoose";

const DriverRouteSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  date: { type: String, required: true }, // stored as 'YYYY-MM-DD'
  routePoints: [
    {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number, Number], // [lng, lat]
        required: true,
      },
    },
  ],
});

// IMPORTANT: 2dsphere index on the array of GeoJSON points
DriverRouteSchema.index({ routePoints: "2dsphere" });

export default mongoose.models.DriverRoutePoint ||
  mongoose.model("DriverRoutePoint", DriverRouteSchema);
