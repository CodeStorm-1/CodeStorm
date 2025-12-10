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
