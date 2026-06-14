import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { parseObjectId } from "@/lib/mongodbHelpers";

const PRODUCTS_COLLECTION = "products";
const CATEGORIES_COLLECTION = "categories";
const CACHE_TAG = "products";

const ADMIN_LIST_PROJECTION = {
  title_en: 1,
  title_bn: 1,
  slug: 1,
  brand_or_vendor: 1,
  category: 1,
  category_id: 1,
  category_slug: 1,
  pricing: 1,
  inventory: 1,
  attributes: 1,
  images: { $slice: 1 },
  ratings: 1,
  createdAt: 1,
  updatedAt: 1,
};

const PICKER_PROJECTION = {
  title_en: 1,
  title_bn: 1,
  slug: 1,
  pricing: 1,
  inventory: 1,
  attributes: 1,
  images: { $slice: 1 },
};

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function serializeProduct(product) {
  return {
    ...product,
    _id: product._id.toString(),
  };
}

export async function buildProductFilter(search = "", categoryId = "all") {
  const conditions = [];

  if (categoryId && categoryId !== "all") {
    const categoryConditions = [{ category_id: categoryId }];
    const objectId = parseObjectId(categoryId);

    if (objectId) {
      const categories = await dbConnect(CATEGORIES_COLLECTION);
      const category = await categories.findOne({ _id: objectId });

      if (category?.name) {
        categoryConditions.push({ category: category.name });
      }

      if (category?.slug) {
        categoryConditions.push({ category_slug: category.slug });
      }
    }

    conditions.push({ $or: categoryConditions });
  }

  const term = String(search || "").trim();
  if (term) {
    const regex = new RegExp(escapeRegex(term), "i");
    conditions.push({
      $or: [
        { title_en: regex },
        { title_bn: regex },
        { brand_or_vendor: regex },
        { slug: regex },
        { category: regex },
      ],
    });
  }

  if (!conditions.length) return {};
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
}

async function readProductsFromDb(filters = {}, projection = null) {
  const { search = "", category = "all" } = filters;
  const filter = await buildProductFilter(search, category);
  const products = await dbConnect(PRODUCTS_COLLECTION);
  let cursor = products.find(filter).sort({ createdAt: -1 });

  if (projection) {
    cursor = cursor.project(projection);
  }

  const list = await cursor.toArray();
  return list.map(serializeProduct);
}

export async function getProducts(filters = {}) {
  const search = String(filters.search || "").trim();
  const category = String(filters.category || "all");
  const isDefaultList = !search && category === "all";

  if (isDefaultList) {
    return getDefaultProducts();
  }

  try {
    return await readProductsFromDb({ search, category }, ADMIN_LIST_PROJECTION);
  } catch (error) {
    console.error("getProducts error:", error);
    return [];
  }
}

const getCachedDefaultProducts = unstable_cache(
  () => readProductsFromDb({ search: "", category: "all" }, ADMIN_LIST_PROJECTION),
  ["products-list-default"],
  { revalidate: 60, tags: [CACHE_TAG] }
);

export const getDefaultProducts = cache(async () => {
  try {
    return await getCachedDefaultProducts();
  } catch (error) {
    console.error("getDefaultProducts error:", error);
    return [];
  }
});

export async function getFreshProducts(filters = {}) {
  try {
    return await readProductsFromDb(filters);
  } catch (error) {
    console.error("getFreshProducts error:", error);
    return [];
  }
}

export function revalidateProductsCache() {
  revalidateTag(CACHE_TAG);
  revalidateTag("dashboard-summary");
}

export async function searchProductsForPicker(search = "", limit = 30) {
  const term = String(search || "").trim();
  const filter = term ? await buildProductFilter(term, "all") : {};
  const products = await dbConnect(PRODUCTS_COLLECTION);

  const list = await products
    .find(filter)
    .project(PICKER_PROJECTION)
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 50))
    .toArray();

  return list.map(serializeProduct);
}

export async function getProductByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;

  try {
    const products = await dbConnect(PRODUCTS_COLLECTION);
    const objectId = parseObjectId(idOrSlug);
    const query = objectId
      ? { $or: [{ _id: objectId }, { slug: String(idOrSlug) }] }
      : { slug: String(idOrSlug) };

    const product = await products.findOne(query);
    return product ? serializeProduct(product) : null;
  } catch (error) {
    console.error("getProductByIdOrSlug error:", error);
    return null;
  }
}

export async function getRelatedProducts(product, limit = 8) {
  if (!product) return [];

  try {
    const products = await dbConnect(PRODUCTS_COLLECTION);
    const productObjectId = parseObjectId(product._id);
    const conditions = [];

    if (product.category) conditions.push({ category: product.category });
    if (product.category_slug) conditions.push({ category_slug: product.category_slug });

    if (!conditions.length) return [];

    const filter = {
      ...(productObjectId ? { _id: { $ne: productObjectId } } : {}),
      $or: conditions,
    };

    const list = await products.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
    return list.map(serializeProduct);
  } catch (error) {
    console.error("getRelatedProducts error:", error);
    return [];
  }
}
