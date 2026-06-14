const ADMIN_AUTH_KEY = "nexa_admin_session";

export function setAdminAuth(user) {
  localStorage.setItem(
    ADMIN_AUTH_KEY,
    JSON.stringify({
      authenticated: true,
      userId: user.userId || user._id,
      username: user.username,
      name: user.name || user.username,
      role: user.role,
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
  return auth?.authenticated === true && Boolean(auth?.role);
}

export function updateAdminAuthProfile(user) {
  const current = getAdminAuth();
  if (!current) return;

  setAdminAuth({
    ...current,
    ...user,
    userId: user._id || user.userId || current.userId,
  });
}
