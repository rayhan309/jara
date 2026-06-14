import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { slugify } from "@/lib/slugify";

const COLLECTION = "product_attributes";
const CACHE_TAG = "product-attributes";

const DEFAULT_ATTRIBUTES = [
  {
    name: "Size",
    name_bn: "সাইজ",
    slug: "size",
    placeholder: "S, M, L, XL",
    sort_order: 0,
    active: true,
  },
  {
    name: "Weight",
    name_bn: "ওজন",
    slug: "weight",
    placeholder: "500g, 1kg, 2kg",
    sort_order: 1,
    active: true,
  },
  {
    name: "Color",
    name_bn: "রং",
    slug: "color",
    placeholder: "Red, Blue, Green",
    sort_order: 2,
    active: true,
  },
];

export function serializeProductAttribute(doc) {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    name_bn: doc.name_bn || doc.name,
    slug: doc.slug,
    placeholder: doc.placeholder || "",
    sort_order: doc.sort_order ?? 0,
    active: doc.active !== false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function ensureDefaultAttributes(collection) {
  const count = await collection.countDocuments();
  if (count > 0) return;

  const now = new Date();
  await collection.insertMany(
    DEFAULT_ATTRIBUTES.map((entry) => ({
      ...entry,
      createdAt: now,
      updatedAt: now,
    }))
  );
}

async function readProductAttributesFromDb() {
  const collection = await dbConnect(COLLECTION);
  await ensureDefaultAttributes(collection);

  const list = await collection.find({ active: { $ne: false } }).sort({ sort_order: 1, name: 1 }).toArray();
  return list.map(serializeProductAttribute);
}

const getCachedProductAttributes = unstable_cache(
  readProductAttributesFromDb,
  ["product-attributes-global"],
  { revalidate: 60, tags: [CACHE_TAG] }
);

export const getProductAttributes = cache(async () => {
  try {
    return await getCachedProductAttributes();
  } catch (error) {
    console.error("getProductAttributes error:", error);
    return DEFAULT_ATTRIBUTES.map((entry, index) => ({
      _id: `default-${entry.slug}`,
      ...entry,
    }));
  }
});

export async function getFreshProductAttributes() {
  try {
    return await readProductAttributesFromDb();
  } catch (error) {
    console.error("getFreshProductAttributes error:", error);
    return [];
  }
}

export function revalidateProductAttributesCache() {
  revalidateTag(CACHE_TAG);
}

export async function ensureUniqueAttributeSlug(collection, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const query = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
    const existing = await collection.findOne(query);
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export function buildAttributeSlug(name) {
  return slugify(name);
}
