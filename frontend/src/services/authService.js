import { mockDelay } from "./api";

const TOKEN_KEY = "talkiq_token";
const USER_KEY = "talkiq_user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(user) {
  localStorage.setItem(TOKEN_KEY, `mock-jwt-${Date.now()}`);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// TODO: swap the mock bodies below for real `api.post(...)` calls once
// the backend auth endpoints are ready. Signatures stay the same.

export async function signupUser({ name, email, password }) {
  await mockDelay();

  if (!name || !email || !password) {
    throw new Error("All fields are required.");
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
  };

  persistSession(user);
  return user;
}

export async function loginUser({ email, password }) {
  await mockDelay();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = {
    id: crypto.randomUUID(),
    name: email.split("@")[0],
    email,
  };

  persistSession(user);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}