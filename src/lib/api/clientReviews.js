import { adminFetch } from "@/lib/adminFetch";

export const clientReviewKeys = {
  all: ["client-reviews"],
  admin: () => [...clientReviewKeys.all, "admin"],
  public: () => [...clientReviewKeys.all, "public"],
};

export async function fetchPublicClientReviews() {
  const response = await fetch("/api/reviews", { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch reviews.");
  }

  return data.reviews || [];
}

export async function fetchAdminClientReviews() {
  const response = await adminFetch("/api/admin/reviews");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch reviews.");
  }

  return data.reviews || [];
}

export async function createClientReview(payload) {
  const response = await adminFetch("/api/admin/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create review.");
  }

  return data.review;
}

export async function updateClientReview(id, payload) {
  const response = await adminFetch(`/api/admin/reviews/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update review.");
  }

  return data.review;
}

export async function deleteClientReview(id) {
  const response = await adminFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete review.");
  }

  return id;
}
