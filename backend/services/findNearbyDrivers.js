import DriverRoutePoint from "../models/DriverRoutePoint.js";

export async function findNearbyDrivers(passengerLat, passengerLng, radiusKm) {
  const results = await DriverRoutePoint.find({
    routePoint: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [passengerLng, passengerLat],
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  }).limit(500); // limit to avoid huge results

  // Extract unique driverIds
  const driverSet = new Set();
  results.forEach((d) => driverSet.add(d.driverId));

  return [...driverSet];
}
