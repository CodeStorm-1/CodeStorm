import { storeRiderRoute } from "../services/storeDriverRoute.js";
import { findNearbyDrivers } from "../services/findNearbyDrivers.js";

/**
 * Store rider's route in the database
 * POST /rides/store-route
 */
export const storeRouteController = async (req, res) => {
  try {
    const { riderId, polylinePoints, date } = req.body;

    if (!riderId || !polylinePoints || !Array.isArray(polylinePoints)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid riderId or polylinePoints" });
    }

    await storeRiderRoute(riderId, polylinePoints, date);

    res.status(200).json({ success: true, message: "Rider route stored" });
  } catch (error) {
    console.error("Error storing rider route:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Find nearby drivers for a given location
 * POST /rides/find
 */
export const findNearbyDriversController = async (req, res) => {
  try {
    const { lat, lng, radiusMeters, date } = req.body;

    if (lat == null || lng == null || radiusMeters == null) {
      return res.status(400).json({
        success: false,
        message: "lat, lng and radiusMeters are required",
      });
    }

    const drivers = await findNearbyDrivers(lat, lng, radiusMeters, date);

    res.status(200).json({ success: true, drivers });
  } catch (error) {
    console.error("Error finding nearby drivers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
