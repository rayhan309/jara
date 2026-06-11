import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import imagekit from "@/lib/imagekit";
import { calculateDiscountPercentage, parseNumber } from "@/lib/productHelpers";
import { ensureUniqueSlug, parseObjectId } from "@/lib/mongodbHelpers";
import { slugify } from "@/lib/slugify";

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

function serializeProduct(product) {
  return {
    ...product,
    _id: product._id.toString(),
  };
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
    const products = dbConnect(COLLECTION);
    const objectId = parseObjectId(id);

    const product = objectId
      ? await products.findOne({ _id: objectId })
      : await products.findOne({ slug: id });

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
    const { id } = await params;
    const objectId = parseObjectId(id);

    if (!objectId) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const products = dbConnect(COLLECTION);
    const existing = await products.findOne({ _id: objectId });

    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const titleBn = String(formData.get("title_bn") || "").trim();
    const titleEn = String(formData.get("title_en") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const brandOrVendor = String(formData.get("brand_or_vendor") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const categoryId = String(formData.get("category_id") || "").trim();
    const categorySlug = String(formData.get("category_slug") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const currency = String(formData.get("currency") || "BDT").trim();
    const regularPrice = parseNumber(formData.get("regular_price"));
    const salePrice = parseNumber(formData.get("sale_price"));
    const quantity = parseNumber(formData.get("quantity"));
    const stockStatus = String(formData.get("stock_status") || "in_stock").trim();
    const attributeVariantType = String(formData.get("variant_type") || "").trim();
    const attributeVariantOptions = String(formData.get("variant_options") || "").trim();
    const attributeMaterial = String(formData.get("attribute_material") || "").trim();
    const averageRating = parseNumber(formData.get("average_rating"));
    const totalReviews = parseNumber(formData.get("total_reviews"));
    const keptImages = parseExistingImages(formData.get("existing_images"));
    const imageFiles = formData.getAll("images").filter((file) => typeof file !== "string");

    if (!titleBn) {
      return NextResponse.json({ error: "পণ্যের নাম প্রয়োজন।" }, { status: 400 });
    }

    if (!titleEn) {
      return NextResponse.json({ error: "English title is required." }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }

    if (regularPrice <= 0) {
      return NextResponse.json({ error: "Regular price must be greater than 0." }, { status: 400 });
    }

    if (salePrice <= 0 || salePrice > regularPrice) {
      return NextResponse.json(
        { error: "Sale price must be greater than 0 and less than or equal to regular price." },
        { status: 400 }
      );
    }

    for (const image of imageFiles) {
      if (!image.type?.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
      }
    }

    const baseSlug = slugify(slugInput || titleEn);
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
    const updateDoc = {
      title_en: titleEn,
      title_bn: titleBn,
      slug,
      brand_or_vendor: brandOrVendor,
      category,
      category_id: categoryId,
      category_slug: categorySlug,
      description,
      pricing: {
        currency,
        regular_price: regularPrice,
        sale_price: salePrice,
        discount_percentage: calculateDiscountPercentage(regularPrice, salePrice),
      },
      inventory: {
        stock_status: stockStatus,
        quantity,
      },
      images: finalImages,
      attributes: {
        variant_type: attributeVariantType,
        variant_options: attributeVariantOptions,
        material: attributeMaterial,
        size: attributeVariantType === "size" ? attributeVariantOptions : "",
      },
      ratings: {
        average_rating: averageRating,
        total_reviews: totalReviews,
      },
      updatedAt,
    };

    await products.updateOne({ _id: objectId }, { $set: updateDoc });

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

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const objectId = parseObjectId(id);

    if (!objectId) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const products = dbConnect(COLLECTION);
    const result = await products.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product." },
      { status: 500 }
    );
  }
}
