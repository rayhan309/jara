import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import imagekit from "@/lib/imagekit";
import { ensureUniqueSlug, parseObjectId } from "@/lib/mongodbHelpers";
import { slugify } from "@/lib/slugify";
import {
  buildProductDocumentFields,
  parseProductFormData,
  validateProductFormPayload,
} from "@/lib/productFormServer";
import { revalidateProductsCache, serializeProduct } from "@/lib/productsServer";

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

async function uploadProductImages(imageFiles, slug) {
  const uploads = [];

  for (const image of imageFiles) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name || `${slug}-${uploads.length + 1}.jpg`,
      folder: "/raisas_glam_nest/products",
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

function parseExistingImages(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const products = await dbConnect(COLLECTION);
    const objectId = parseObjectId(decodedId);

    const product = objectId
      ? await products.findOne({ _id: objectId })
      : await products.findOne({ slug: decodedId });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: serializeProduct(product),
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const objectId = parseObjectId(decodedId);

    if (!objectId) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const products = await dbConnect(COLLECTION);
    const existing = await products.findOne({ _id: objectId });

    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const payload = parseProductFormData(formData);
    const keptImages = parseExistingImages(formData.get("existing_images"));
    const imageFiles = formData.getAll("images").filter((file) => typeof file !== "string");

    const validationError = validateProductFormPayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
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

    const slug = await ensureUniqueSlug(products, baseSlug, id);
    let finalImages = keptImages;

    if (imageFiles.length > 0) {
      const imageKitError = getImageKitConfigError();
      if (imageKitError) {
        return NextResponse.json({ error: imageKitError }, { status: 500 });
      }

      const uploadedImages = await uploadProductImages(imageFiles, slug);
      finalImages = [...keptImages, ...uploadedImages];
    }

    if (finalImages.length === 0) {
      return NextResponse.json({ error: "At least one product image is required." }, { status: 400 });
    }

    const updatedAt = new Date();
    const sharedFields = buildProductDocumentFields(payload);
    const { attributes: nextAttributes, ...restSharedFields } = sharedFields;
    const updateDoc = {
      title_en: payload.titleEn,
      title_bn: payload.titleBn,
      slug,
      brand_or_vendor: payload.brandOrVendor,
      category: payload.category,
      category_id: payload.categoryId,
      category_slug: payload.categorySlug,
      ...restSharedFields,
      attributes: {
        ...existing.attributes,
        ...nextAttributes,
      },
      images: finalImages,
      updatedAt,
    };

    await products.updateOne({ _id: objectId }, { $set: updateDoc });

    revalidateProductsCache();

    return NextResponse.json({
      success: true,
      product: serializeProduct({ ...existing, ...updateDoc, _id: objectId }),
    });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);

    if (!objectId) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const products = await dbConnect(COLLECTION);
    const result = await products.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    revalidateProductsCache();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product." },
      { status: 500 }
    );
  }
}
