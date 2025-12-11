import mongoose from "mongoose";

// Define a simple coordinates schema
const CoOrdsSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const RideSchema = new mongoose.Schema(
  {
    pickupInfo: { type: CoOrdsSchema, default: null },
    destInfo: { type: CoOrdsSchema, default: null },

    encodedPolyline: { type: String, default: null },

    vehicle: { type: String, default: null }, // e.g., "Car", "Bike"
    seats: { type: Number, default: null },

    date: { type: Date, default: null },
    time: { type: String, default: null }, // Could also use Date if combined with date

    pricingModel: {
      type: String,
      enum: ["per_km"],
      default: null,
    },
    price: { type: Number, default: null }, // For per km or fixed price
  },
  { timestamps: true }
);

export default mongoose.models.Ride || mongoose.model("Ride", RideSchema);
