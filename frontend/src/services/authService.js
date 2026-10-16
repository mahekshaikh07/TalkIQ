import api, { TOKEN_KEY, USER_KEY, toApiError } from "./api";

// A user only counts as logged in if both the token and the user are saved.
export function getStoredUser() {
  try {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loginUser({ email, password }, fallbackName) {
  try {
    const cleanEmail = email.trim();
    const { data } = await api.post("/login", { email: cleanEmail, password });
    // The backend sends { access_token, token_type, user: { name, email } }.
    const user = {
      name: data.user?.name || fallbackName || cleanEmail.split("@")[0],
      email: data.user?.email || cleanEmail,
    };
    saveSession(data.access_token, user);
    return user;
  } catch (err) {
    throw toApiError(err, "Invalid email or password.");
  }
}

export async function signupUser({ name, email, password }) {
  try {
    await api.post("/signup", { name: name.trim(), email: email.trim(), password });
  } catch (err) {
    throw toApiError(err, "Could not create your account.");
  }
  // /signup does not return a token, so log in right after it.
  return loginUser({ email, password }, name.trim());
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
