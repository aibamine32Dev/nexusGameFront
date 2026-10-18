// =========================================================
// CLIENT AUTH API
// =========================================================
//
// USE_MOCK = false -> uses the Django backend (default).
//
// USE_MOCK = true  -> accounts are stored in this browser only
//                     (localStorage). Only useful to test the UI
//                     without the backend. NOT for production.
//
// Django endpoints used:
//
//   POST  /api/auth/register/   { name, email, phone, password }
//   POST  /api/auth/login/      { email, password }
//   GET   /api/auth/me/         (Authorization header)
//   POST  /api/auth/logout/     (Authorization header)
//
//   register + login must answer:  { token: "...", user: { id, name, email, phone } }
//   errors must answer:            { detail: "message" }  (or { email: ["..."] })
//
// =========================================================

export const API_URL = "https://amineaibeche8.pythonanywhere.com/api";

export const USE_MOCK = false;

// Django REST Framework TokenAuthentication -> "Token"
// If you use JWT (simplejwt) change it to "Bearer".
const AUTH_SCHEME = "Token";

const USERS_KEY = "nexusClientUsers"; // mock only


// ---------------------------------------------------------
// helpers
// ---------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readError(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;

  // DRF field errors: { email: ["already used"] }
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === "string") return first;

  return fallback;
}

async function request(path, options = {}, token) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `${AUTH_SCHEME} ${token}` } : {}),
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty body */
  }

  if (!response.ok) {
    const error = new Error(readError(data, "Something went wrong."));
    error.status = response.status;
    throw error;
  }

  return data;
}

export const normalizeEmail = (email) => email.trim().toLowerCase();

export const normalizePhone = (phone) =>
  phone.trim().replace(/[\s.-]/g, "");


// ---------------------------------------------------------
// mock backend (browser only)
// ---------------------------------------------------------

const getMockUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

const publicUser = ({ id, name, email, phone,points }) => ({
  id,
  name,
  email,
  phone,
  points,
});

const mockRegister = async ({ name, email, phone, points ,password }) => {
  await sleep(500);

  const users = getMockUsers();

  if (users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  if (users.some((u) => u.phone === phone)) {
    throw new Error("An account with this phone number already exists.");
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    points,
    passwordHash: await sha256(password),
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));

  return { token: `mock-${user.id}`, user: publicUser(user) };
};

const mockLogin = async ({ email, password }) => {
  await sleep(500);

  const user = getMockUsers().find((u) => u.email === email);

  if (!user || user.passwordHash !== (await sha256(password))) {
    throw new Error("Wrong email or password.");
  }

  return { token: `mock-${user.id}`, user: publicUser(user) };
};

const mockMe = async (token) => {
  const id = token.replace("mock-", "");
  const user = getMockUsers().find((u) => u.id === id);

  if (!user) {
    const error = new Error("Session expired.");
    error.status = 401;
    throw error;
  }

  return publicUser(user);
};


// ---------------------------------------------------------
// public API
// ---------------------------------------------------------

export const registerClient = (payload) =>
  USE_MOCK
    ? mockRegister(payload)
    : request("/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

export const loginClient = (payload) =>
  USE_MOCK
    ? mockLogin(payload)
    : request("/auth/login/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

export const fetchCurrentClient = (token) =>
  USE_MOCK ? mockMe(token) : request("/auth/me/", {}, token);

// Best effort: the client is logged out in the browser anyway.
// keepalive lets the request finish even if the page redirects.
export const logoutClientOnServer = (token) => {
  if (USE_MOCK) return;

  fetch(`${API_URL}/auth/logout/`, {
    method: "POST",
    keepalive: true,
    headers: { Authorization: `${AUTH_SCHEME} ${token}` },
  }).catch(() => {});
};
