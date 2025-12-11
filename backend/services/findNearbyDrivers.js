import DriverRoutePoint from "../models/DriverRoutePoint.js";

export async function findNearbyDrivers(lat, lng, radiusMeters) {
  const results = await DriverRoutePoint.find({
    routeLine: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  });

  return results.map((r) => r.driverId);
}
