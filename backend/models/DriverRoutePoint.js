import mongoose from "mongoose";

const DriverRouteSchema = new mongoose.Schema({
  driverId: String,

  route: {
    type: {
      type: String,
      enum: ["LineString"],
      default: "LineString",
    },
    coordinates: {
      type: [[Number]], // array -> [ [lng,lat], [lng,lat] ]
      required: true,
    },
  },
});

DriverRouteSchema.index({ route: "2dsphere" });

export default mongoose.models.DriverRoutePoint ||
  mongoose.model("DriverRoutePoint", DriverRouteSchema);
