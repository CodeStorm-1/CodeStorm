import { useDriverRouteStore } from "@/store/driverRoute-store";
import { useLocationStore } from "@/store/location-store";
import { useUserStore } from "@/store/user-store";
import Constants from "expo-constants";
const URL = Constants.expoConfig?.extra?.API_URL;

export async function getEmail(email: string) {
  console.log(email);
  const response = await fetch(`${URL}/users/email`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}

export async function getPhone(phone: string) {
  const response = await fetch(`${URL}/users/phone`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: phone,
    }),
  });

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}

export async function getOTP(phone: string) {
  const response = await fetch(`${URL}/auth/sent-otp`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: `+91${phone}`,
    }),
  });

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}

export async function verifyOTP(phone: string, code: string) {
  console.log(phone, code);
  const response = await fetch(`${URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: `+91${phone}`,
      code: code,
    }),
  });

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server error ${response.status}: ${response.statusText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error("Server did not return JSON (probably HTML error page)");
  }

  return data;
}

export async function signup(
  name: string,
  phone: string,
  email: string,
  password: string
) {
  const response = await fetch(`${URL}/auth/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      phone: `+91${phone}`,
      email: email,
      password: password,
    }),
  });

  if (!response.ok) {
    // Let’s see what the server actually sent
    const text = await response.text();
    console.error(
      "Server returned error:",
      response.status,
      text.slice(0, 500)
    );
    throw new Error(`Server error ${response.status}: ${response.statusText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    const text = await response.text();
    console.error("Not JSON! Server sent:", text.slice(0, 500));
    throw new Error("Server did not return JSON (probably HTML error page)");
  }

  return data;
}

export async function publish() {
  try {
    const ride = useLocationStore.getState();
    const route = useDriverRouteStore.getState();

    // Basic validation
    if (
      !ride.pickupInfo ||
      !ride.destInfo ||
      !ride.vehicle ||
      !ride.date ||
      !ride.time
    ) {
      console.error("Missing required ride info");
      return;
    }

    console.log(ride.id);
    // 1️⃣ Publish the ride
    const rideResponse = await fetch(`${URL}/rides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: ride.id,
        name: ride.name,
        phone: ride.phone,
        pickupInfo: ride.pickupInfo,
        destInfo: ride.destInfo,
        encodedPolyline: ride.encodedPolyline,
        vehicle: ride.vehicle,
        seats: ride.seats,
        date: ride.date,
        time: ride.time,
        pricingModel: ride.pricingModel,
        price: ride.price,
      }),
    });

    const rideData = await rideResponse.json();

    if (!rideResponse.ok) {
      console.error("Failed to publish ride:", rideData.message);
      return;
    }

    console.log("Ride published successfully:", rideData.ride);

    const userStore = useUserStore.getState();
    const driverId = userStore.id; // or userStore.userId

    console.log(route.points);
    // 2️⃣ Store the route (if route points exist)
    if (route.points.length > 0) {
      const routeResponse = await fetch(`${URL}/rides/store-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: driverId,
          date: ride.date,
          polylinePoints: route.points,
        }),
      });

      const routeData = await routeResponse.json();

      if (routeResponse.ok) {
        return { ok: true, message: "Published ride successfully" };
      }
    }

    // Clear Zustand stores after successful publish
    useLocationStore.getState().clearAll();
    useDriverRouteStore.getState().clear();
  } catch (error) {
    console.error("Error publishing ride:", error);
  }
}

// src/api/apiService.ts (or a new file like dataProcessor.ts)

// You would need to handle the MAPS_API_KEY similar to how you get the URL
const MAPS_API_KEY = "AIzaSyBvjcPaK4ZXgLeLjKNZN6i2NamuiHuhDdU";

// --- Types (must match your database structure) ---
interface LocationInfo {
  latitude: number;
  longitude: number;
  _id?: string;
}

interface BackendRide {
  _id: string;
  pickupInfo: LocationInfo;
  destInfo: LocationInfo;
  encodedPolyline: string;
  vehicle: string;
  seats: number;
  date: string;
  price: number;
  status: "booked" | "completed" | "cancelled";
}

// --- The output type (with addresses converted) ---
export interface ProcessedRide extends BackendRide {
  pickupAddress: string; // The new human-readable address field
  dropAddress: string; // The new human-readable address field
}

const userId_ = useUserStore.getState().id;

/**
 * 1. Fetches the raw ride data for the authenticated user.
 * 2. Reverse geocodes the pickup and drop coordinates into human-readable addresses.
 * * @param token The user's authentication token (e.g., JWT).
 * @returns A promise resolving to an array of ProcessedRide objects.
 * @throws An error if the initial ride fetch fails.
 */
export async function fetchAndGeocodeRides() {
  console.log("Starting ride fetch and geocoding process...");

  // 1. Fetch Raw Rides Data
  const FETCH_URL = `${URL}/rides`; // Assumed endpoint
  let rawRides: BackendRide[];

  try {
    const response = await fetch(FETCH_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch booked rides (Status: ${response.status}). Details: ${errorText.slice(0, 100)}`
      );
    }

    const data = await response.json();
    // Adjust this line based on how your API returns the array (direct array or wrapped)

    rawRides = Array.isArray(data) ? data : data?.rides || [];
  } catch (error) {
    console.error("Critical error during ride fetch:", error);
    throw error; // Re-throw the error to be handled by the calling component
  }

  if (rawRides.length === 0) {
    return []; // Return an empty array if no rides were found
  }

  // 2. Reverse Geocoding and Data Processing
  const geocodePromises = rawRides.map(async (ride) => {
    // Create an array of promises for concurrent geocoding
    const [pickup, drop] = await Promise.all([
      reverseGeocodeSingle(ride.pickupInfo),
      reverseGeocodeSingle(ride.destInfo),
    ]);

    // Return the original ride data combined with the new addresses
    return {
      ...ride,
      pickupAddress: pickup,
      dropAddress: drop,
    } as ProcessedRide;
  });

  // Wait for all geocoding promises to resolve
  const processedRides = await Promise.all(geocodePromises);

  return processedRides;
}

/**
 * Internal utility function for a single geocoding call.
 */
async function reverseGeocodeSingle(location: LocationInfo): Promise<string> {
  const latlng = `${location.latitude},${location.longitude}`;
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${MAPS_API_KEY}`;

  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      // Fallback for API status not OK or no results
      return `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
    }
  } catch (error) {
    // Fallback for network error
    return `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
  }
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  const response = await fetch(`${URL}/auth/change-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      oldPassword,
      newPassword,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to change password");
  }

  return await response.json();
}
