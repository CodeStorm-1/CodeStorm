import DriverRoutePoint from "../models/DriverRoutePoint.js";

export async function storeRiderRoute(riderId, polylinePoints) {
  // Filter out points with null/undefined latitude or longitude
  const validPoints = polylinePoints.filter(
    (p) =>
      p &&
      typeof p.latitude === "number" &&
      !isNaN(p.latitude) &&
      typeof p.longitude === "number" &&
      !isNaN(p.longitude)
  );

  if (validPoints.length === 0) {
    throw new Error("No valid coordinates to store");
  }

  // Map to GeoJSON [lng, lat] format
  const lineStringPoints = validPoints.map((p) => [p.longitude, p.latitude]);

  await DriverRoutePoint.create({
    riderId,
    route: {
      type: "LineString",
      coordinates: lineStringPoints,
    },
  });

  return true;
}
