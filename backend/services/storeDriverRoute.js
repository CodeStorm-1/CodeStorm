import DriverRoutePoint from "../models/DriverRoutePoint.js";

export async function storeRiderRoute(riderId, polylinePoints, date) {
  if (!date) {
    throw new Error("Date is required");
  }

  // Filter out invalid coordinates
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

  // Convert to [lng, lat]
  const lineStringPoints = validPoints.map((p) => [p.longitude, p.latitude]);

  await DriverRoutePoint.create({
    riderId,
    date, // 🔥 storing date here
    route: {
      type: "LineString",
      coordinates: lineStringPoints,
    },
  });

  return true;
}
