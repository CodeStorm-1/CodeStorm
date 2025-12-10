export async function getEmail(email: string) {
  const response = await fetch("http://192.168.0.102:3000/api/users/email", {
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
  const response = await fetch("http://192.168.0.102:3000/api/users/phone", {
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
  const response = await fetch("http://192.168.0.102:3000/api/auth/sent-otp", {
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
  const response = await fetch(
    "http://192.168.0.102:3000/api/auth/verify-otp",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: `+91${phone}`,
        code: code,
      }),
    }
  );

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}

export async function login(phone: string, password: string) {
  const response = await fetch("http://192.168.0.102:3000/api/auth/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: `+91${phone}`,
      password: password,
    }),
  });

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}

export async function signup(
  name: string,
  phone: string,
  email: string,
  password: string
) {
  const response = await fetch("http://192.168.0.102:3000/api/auth/signup", {
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

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}
