import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";

const COLLECTION = "client_reviews";
const CACHE_TAG = "client-reviews";

export function serializeClientReview(doc) {
  return {
    _id: doc._id.toString(),
    name: doc.name || "",
    location: doc.location || "",
    quote: doc.quote || "",
    rating: Math.min(5, Math.max(1, Number(doc.rating) || 5)),
    sort_order: doc.sort_order ?? 0,
    active: doc.active !== false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function readActiveReviewsFromDb() {
  const collection = await dbConnect(COLLECTION);
  const list = await collection
    .find({ active: { $ne: false } })
    .sort({ sort_order: 1, createdAt: -1 })
    .toArray();
  return list.map(serializeClientReview);
}

async function readAllReviewsFromDb() {
  const collection = await dbConnect(COLLECTION);
  const list = await collection.find({}).sort({ sort_order: 1, createdAt: -1 }).toArray();
  return list.map(serializeClientReview);
}

const getCachedActiveReviews = unstable_cache(readActiveReviewsFromDb, ["client-reviews-active"], {
  revalidate: 60,
  tags: [CACHE_TAG],
});

export const getActiveClientReviews = cache(async () => {
  try {
    return await getCachedActiveReviews();
  } catch (error) {
    console.error("getActiveClientReviews error:", error);
    return [];
  }
});

export async function getFreshClientReviews() {
  try {
    return await readAllReviewsFromDb();
  } catch (error) {
    console.error("getFreshClientReviews error:", error);
    return [];
  }
}

export function revalidateClientReviewsCache() {
  revalidateTag(CACHE_TAG);
}

export { COLLECTION as CLIENT_REVIEWS_COLLECTION };
