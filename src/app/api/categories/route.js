import { NextResponse } from "next/server";
import { getCategories, revalidateCategoriesCache } from "@/lib/categoriesServer";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import imagekit from "@/lib/imagekit";
import { slugify } from "@/lib/slugify";

const COLLECTION = "categories";

function getImageKitConfigError() {
  if (
    !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  ) {
    return "ImageKit credentials are not configured on the server.";
  }
  return null;
}

async function ensureUniqueSlug(categories, baseSlug) {
  let slug = baseSlug;
  let suffix = 1;

  while (await categories.findOne({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const imageKitError = getImageKitConfigError();
    if (imageKitError) {
      return NextResponse.json({ error: imageKitError }, { status: 500 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const image = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    if (!image || typeof image === "string") {
      return NextResponse.json({ error: "Category image is required." }, { status: 400 });
    }

    if (!image.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const baseSlug = slugify(slugInput || name);
    if (!baseSlug) {
      return NextResponse.json({ error: "A valid slug could not be generated." }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name || `${baseSlug}.jpg`,
      folder: "/nexa/categories",
      useUniqueFileName: true,
    });

    const categories = await dbConnect(COLLECTION);
    const slug = await ensureUniqueSlug(categories, baseSlug);
    const now = new Date();
    const [maxOrderResult] = await categories
      .aggregate([{ $group: { _id: null, maxOrder: { $max: "$sort_order" } } }])
      .toArray();
    const sort_order = (maxOrderResult?.maxOrder ?? -1) + 1;

    const doc = {
      name,
      slug,
      description,
      sort_order,
      image: {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        name: uploadResponse.name,
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = await categories.insertOne(doc);

    revalidateCategoriesCache();

    return NextResponse.json(
      {
        success: true,
        category: {
          ...doc,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category." },
      { status: 500 }
    );
  }
}
