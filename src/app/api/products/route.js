import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import imagekit from "@/lib/imagekit";
import { calculateDiscountPercentage, parseNumber } from "@/lib/productHelpers";
import { slugify } from "@/lib/slugify";
import { buildProductInventory, parseVariantStockPayload } from "@/lib/variantStock";
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
    const variantStockPayload = parseVariantStockPayload(formData.get("variant_stock"));
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

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one product image is required." }, { status: 400 });
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

    const products = await dbConnect(COLLECTION);
    const slug = await ensureUniqueSlug(products, baseSlug);
    const uploadedImages = await uploadProductImages(imageFiles, slug);
    const now = new Date();

    const doc = {
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
      inventory: buildProductInventory({
        quantity,
        stockStatus,
        variantType: attributeVariantType,
        variantOptions: attributeVariantOptions,
        variantStockPayload,
      }),
      images: uploadedImages,
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
