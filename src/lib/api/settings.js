import { adminFetch } from "@/lib/adminFetch";

export const settingsKeys = {
  all: ["settings"],
  detail: () => [...settingsKeys.all, "detail"],
};

export async function fetchSettings() {
  const response = await fetch("/api/settings", { cache: "no-store" });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch settings.");
  }

  const data = await response.json();
  return data.settings;
}

export async function uploadBrandAsset(file, type) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", type);

  const response = await adminFetch("/api/settings/brand-assets", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload brand asset.");
  }

  return data.asset;
}

export async function uploadHeroBanner(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await adminFetch("/api/settings/hero-banners", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload banner.");
  }

  return data.image;
}

export async function updateSettings(payload) {
  const response = await adminFetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update settings.");
  }

  return data.settings;
}
