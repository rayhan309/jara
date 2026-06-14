import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import imagekit from "@/lib/imagekit";
import { slugify } from "@/lib/slugify";
import {
  buildProductDocumentFields,
  parseProductFormData,
  validateProductFormPayload,
} from "@/lib/productFormServer";
import { getProducts, revalidateProductsCache, serializeProduct } from "@/lib/productsServer";

const COLLECTION = "products";

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

async function ensureUniqueSlug(products, baseSlug) {
  let slug = baseSlug;
  let suffix = 1;

  while (await products.findOne({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function uploadProductImages(imageFiles, slug) {
  const uploads = [];

  for (const image of imageFiles) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name || `${slug}-${uploads.length + 1}.jpg`,
      folder: "/nexa/products",
      useUniqueFileName: true,
    });

    uploads.push({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
      name: uploadResponse.name,
    });
  }

  return uploads;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const products = await getProducts({ search, category });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
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
    const payload = parseProductFormData(formData);
    const imageFiles = formData.getAll("images").filter((file) => typeof file !== "string");

    const validationError = validateProductFormPayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one product image is required." }, { status: 400 });
    }

    for (const image of imageFiles) {
      if (!image.type?.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
      }
    }

    const baseSlug = slugify(payload.slugInput || payload.titleEn);
    if (!baseSlug) {
      return NextResponse.json({ error: "A valid slug could not be generated." }, { status: 400 });
    }

    const products = await dbConnect(COLLECTION);
    const slug = await ensureUniqueSlug(products, baseSlug);
    const uploadedImages = await uploadProductImages(imageFiles, slug);
    const now = new Date();
    const sharedFields = buildProductDocumentFields(payload);

    const doc = {
      title_en: payload.titleEn,
      title_bn: payload.titleBn,
      slug,
      brand_or_vendor: payload.brandOrVendor,
      category: payload.category,
      category_id: payload.categoryId,
      category_slug: payload.categorySlug,
      ...sharedFields,
      images: uploadedImages,
      createdAt: now,
      updatedAt: now,
    };

    const result = await products.insertOne(doc);

    revalidateProductsCache();

    return NextResponse.json(
      {
        success: true,
        product: serializeProduct({ ...doc, _id: result.insertedId }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product." },
      { status: 500 }
    );
  }
}
