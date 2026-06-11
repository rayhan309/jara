import { dbConnect } from "@/lib/dbConnect";
import { parseObjectId } from "@/lib/mongodbHelpers";

const COLLECTION = "products";

function serializeProduct(product) {
  return {
    ...product,
    _id: product._id.toString(),
  };
}

export async function getProductBySlug(slug) {
  const products = await dbConnect(COLLECTION);
  const product = await products.findOne({ slug });
  return product ? serializeProduct(product) : null;
}

export async function getProductByIdOrSlug(idOrSlug) {
  const products = await dbConnect(COLLECTION);
  const objectId = parseObjectId(idOrSlug);

  const product = objectId
    ? await products.findOne({ _id: objectId })
    : await products.findOne({ slug: idOrSlug });

  return product ? serializeProduct(product) : null;
}

export async function getRelatedProducts(product, limit = 8) {
  const products = await dbConnect(COLLECTION);
  const excludeId = parseObjectId(product._id);

  if (!excludeId) return [];

  const filter = { _id: { $ne: excludeId } };
  const categoryFilters = [];

  if (product.category_slug) {
    categoryFilters.push({ category_slug: product.category_slug });
  }
  if (product.category_id) {
    categoryFilters.push({ category_id: product.category_id });
  }
  if (product.category) {
    categoryFilters.push({ category: product.category });
  }

  if (categoryFilters.length === 0) return [];

  filter.$or = categoryFilters;

  const list = await products.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  return list.map(serializeProduct);
}
