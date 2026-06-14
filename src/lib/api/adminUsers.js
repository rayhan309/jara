import { adminFetch } from "@/lib/adminFetch";

export const adminUserKeys = {
  all: ["admin-users"],
  list: () => [...adminUserKeys.all, "list"],
};

export async function fetchAdminUsers() {
  const response = await adminFetch("/api/admin/users");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch users.");
  }

  return data.users || [];
}

export async function createAdminUser(payload) {
  const response = await adminFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create user.");
  }

  return data.user;
}

export async function updateAdminUser(id, payload) {
  const response = await adminFetch(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update user.");
  }

  return data.user;
}

export async function deleteAdminUser(id) {
  const response = await adminFetch(`/api/admin/users/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete user.");
  }

  return id;
}

export async function fetchAdminProfile() {
  const response = await adminFetch("/api/admin/me");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch profile.");
  }

  return data.user;
}

export async function updateAdminProfile(payload) {
  const response = await adminFetch("/api/admin/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update profile.");
  }

  return data.user;
}

export async function logoutAdmin() {
  await adminFetch("/api/admin/logout", { method: "POST" });
}
