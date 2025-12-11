import { useDriverRouteStore } from "@/store/driverRoute-store";
import { useLocationStore } from "@/store/location-store";
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

    // 2️⃣ Store the route (if route points exist)
    if (route.points.length > 0) {
      const routeResponse = await fetch(`${URL}/rides/store-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: rideData.ride._id, // Use the ride's DB ID
          polylinePoints: route.points,
        }),
      });

      const routeData = await routeResponse.json();

      if (routeResponse.ok) {
        return { ok: true, message: "Published ride successfully" };
      } else {
        console.error("Failed to store route:", routeData.message);
      }
    }

    // Clear Zustand stores after successful publish
    useLocationStore.getState().clearAll();
    useDriverRouteStore.getState().clear();
  } catch (error) {
    console.error("Error publishing ride:", error);
  }
}
