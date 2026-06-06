const ADMIN_AUTH_KEY = "nexa_admin_session";

export function setAdminAuth(username) {
  localStorage.setItem(
    ADMIN_AUTH_KEY,
    JSON.stringify({
      role: "admin",
      authenticated: true,
      username,
      loggedInAt: Date.now(),
    })
  );
}

export function getAdminAuth() {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(ADMIN_AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function isAdminAuthenticated() {
  const auth = getAdminAuth();
  return auth?.authenticated === true && auth?.role === "admin";
}
