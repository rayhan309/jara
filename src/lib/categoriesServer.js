import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { serializeCategory, sortCategoriesList } from "@/lib/categorySort";

const COLLECTION = "categories";
const CACHE_TAG = "categories";

async function readCategoriesFromDb() {
  const collection = await dbConnect(COLLECTION);
  const list = await collection.find({}).toArray();
  return sortCategoriesList(list).map(serializeCategory);
}

const getCachedCategories = unstable_cache(
  readCategoriesFromDb,
  ["categories-global"],
  { revalidate: 60, tags: [CACHE_TAG] }
);

export const getCategories = cache(async () => {
  try {
    return await getCachedCategories();
  } catch (error) {
    console.error("getCategories error:", error);
    return [];
  }
});

/** Bypass cache — use after category mutations */
export async function getFreshCategories() {
  try {
    return await readCategoriesFromDb();
  } catch (error) {
    console.error("getFreshCategories error:", error);
    return [];
  }
}

export function revalidateCategoriesCache() {
  revalidateTag(CACHE_TAG);
}
