import { ObjectId } from "mongodb";

export function parseObjectId(id) {
  try {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function ensureUniqueSlug(collection, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const filter = { slug };
    if (excludeId) {
      filter._id = { $ne: new ObjectId(excludeId) };
    }

    const existing = await collection.findOne(filter);
    if (!existing) return slug;

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
