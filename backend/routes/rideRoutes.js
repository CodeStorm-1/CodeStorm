// routes/rides.js   ← Save this exact file

import express from "express";
import {
  createRide,
  getRide,
  getAllRides,
  updateRide,
  deleteRide,
} from "../controllers/riderController.js";

import {
  storeRouteController,
  findNearbyDriversController,
} from "../controllers/riderRouteController.js";

const router = express.Router();

// VERY IMPORTANT: Specific routes MUST come BEFORE parameterized routes

// 1. Store driver route (200+ points)
router.post("/store-route", storeRouteController);

// 2. Find nearby drivers
router.post("/find", findNearbyDriversController);

// 3. Create a new ride offer
router.post("/", createRide);

// 4. Get all rides (for browsing)
router.get("/", getAllRides);

// 5. These come LAST — :id routes
router.get("/:id", getRide);
router.put("/:id", updateRide);
router.delete("/:id", deleteRide);

// Optional: Add this for debugging (remove in production)
router.use((req, res, next) => {
  console.log(`Rides Router → ${req.method} ${req.originalUrl}`);
  next();
});

export default router;
