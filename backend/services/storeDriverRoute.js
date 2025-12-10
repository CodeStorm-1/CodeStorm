import DriverRoutePoint from "../models/DriverRoutePoint.js";

export async function storeDriverRoute(driverId, polylinePoints) {
  const bulk = [];

  polylinePoints.forEach((p, idx) => {
    bulk.push({
      insertOne: {
        document: {
          driverId,
          routePoint: {
            type: "Point",
            coordinates: [p.lng, p.lat],
          },
        },
      },
    });
  });

  await DriverRoutePoint.bulkWrite(bulk);
}
