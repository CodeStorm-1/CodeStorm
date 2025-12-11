import Rider from "../models/Rider.js"; // make sure the path is correct

// Create a new ride
export const createRide = async (req, res) => {
  try {
    const {
      id,
      name,
      phone,
      pickupInfo,
      destInfo,
      encodedPolyline,
      vehicle,
      seats,
      date,
      time,
      pricingModel,
      price,
    } = req.body;

    const newRide = new Rider({
      id,
      name,
      phone,
      pickupInfo,
      destInfo,
      encodedPolyline,
      vehicle,
      seats,
      date,
      time,
      pricingModel,
      price,
    });

    await newRide.save();

    res.status(201).json({ success: true, ride: newRide });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a single ride by ID
export const getRide = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await Rider.findById(id);
    if (!ride)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    res.json({ success: true, ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all rides
export const getAllRides = async (_req, res) => {
  try {
    const rides = await Rider.find().sort({ date: -1 });
    res.json({ success: true, rides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a ride by ID
export const updateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRide = await Rider.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedRide)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    res.json({ success: true, ride: updatedRide });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a ride by ID
export const deleteRide = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRide = await Rider.findByIdAndDelete(id);
    if (!deletedRide)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    res.json({ success: true, message: "Ride deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
