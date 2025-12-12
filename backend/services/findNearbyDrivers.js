// services/findNearbyDrivers.js
import DriverRoutePoint from "../models/DriverRoutePoint.js";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function findNearbyDrivers(lat, lng, radiusMeters = 5000, date) {
  const formattedDate = new Date(date).toISOString().split("T")[0];

  const allDriversToday = await DriverRoutePoint.find({
    date: formattedDate,
  }).lean();

  const nearbyDriverIds = new Set();

  for (const driver of allDriversToday) {
    for (const point of driver.routePoints) {
      const [pointLng, pointLat] = point.coordinates;

      const distance = getDistance(lat, lng, pointLat, pointLng);

      if (distance <= radiusMeters) {
        nearbyDriverIds.add(driver.driverId);
        break;
      }
    }
  }

  return Array.from(nearbyDriverIds);
}
