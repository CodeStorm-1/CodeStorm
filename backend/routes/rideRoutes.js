import express from "express";
import {
  createRide,
  getRide,
  getAllRides,
  updateRide,
  deleteRide,
} from "../controllers/riderController.js";
import {
  findNearbyDriversController,
  storeRouteController,
} from "../controllers/riderRouteController.js";

const router = express.Router();

// Create a new ride
router.post("/", createRide);

router.post("/store-route", storeRouteController);
router.post("/find", findNearbyDriversController);

// Get a single ride by ID
router.get("/:id", getRide);

// Get all rides
router.get("/", getAllRides);

// Update a ride by ID
router.put("/:id", updateRide);

// Delete a ride by ID
router.delete("/:id", deleteRide);

export default router;
