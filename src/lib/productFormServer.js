import { calculateDiscountPercentage, parseNumber } from "@/lib/productHelpers";
import { parseVariantOptions } from "@/lib/productVariants";
import {
  buildSummaryPricingFromVariants,
  PRODUCT_TYPES,
  validateVariantPricingEntry,
} from "@/lib/productPricing";
import { buildProductInventory, parseVariantStockPayload } from "@/lib/variantStock";

function parseTags(raw) {
  if (!raw) return [];

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry).trim()).filter(Boolean);
    }
  } catch {
    // fall through to comma split
  }

  return String(raw)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseProductFormData(formData) {
  const productType = String(formData.get("product_type") || PRODUCT_TYPES.REGULAR).trim();
  const variantStockPayload = parseVariantStockPayload(formData.get("variant_stock"));
  const attributeVariantType =
    productType === PRODUCT_TYPES.VARIABLE
      ? String(formData.get("variant_type") || "").trim()
      : "";
  const attributeVariantOptions =
    productType === PRODUCT_TYPES.VARIABLE
      ? String(formData.get("variant_options") || "").trim()
      : "";

  return {
    titleBn: String(formData.get("title_bn") || "").trim(),
    titleEn: String(formData.get("title_en") || "").trim(),
    slugInput: String(formData.get("slug") || "").trim(),
    brandOrVendor: String(formData.get("brand_or_vendor") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    categoryId: String(formData.get("category_id") || "").trim(),
    categorySlug: String(formData.get("category_slug") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    currency: String(formData.get("currency") || "BDT").trim(),
    productType,
    regularPrice: parseNumber(formData.get("regular_price")),
    salePrice: parseNumber(formData.get("sale_price")),
    quantity: parseNumber(formData.get("quantity")),
    stockStatus: String(formData.get("stock_status") || "in_stock").trim(),
    attributeVariantType,
    attributeVariantOptions,
    variantLabel: String(formData.get("variant_label") || "").trim(),
    variantLabelBn: String(formData.get("variant_label_bn") || "").trim(),
    variantPlaceholder: String(formData.get("variant_placeholder") || "").trim(),
    tags: parseTags(formData.get("tags")),
    averageRating: parseNumber(formData.get("average_rating")),
    totalReviews: parseNumber(formData.get("total_reviews")),
    variantStockPayload,
  };
}

export function validateProductFormPayload(payload) {
  if (!payload.titleBn) return "পণ্যের নাম প্রয়োজন।";
  if (!payload.titleEn) return "English title is required.";
  if (!payload.category) return "Category is required.";

  if (payload.productType === PRODUCT_TYPES.VARIABLE) {
    if (!payload.attributeVariantType) return "Variant type is required for variable products.";
    if (!parseVariantOptions(payload.attributeVariantOptions).length) {
      return "Add at least one variant option (comma separated).";
    }
    if (!payload.variantStockPayload.length) {
      return "Configure pricing and stock for each variant.";
    }

    for (const entry of payload.variantStockPayload) {
      const priceError = validateVariantPricingEntry(entry);
      if (priceError) return `${entry.option}: ${priceError}`;
    }

    return null;
  }

  if (payload.regularPrice <= 0) return "Regular price must be greater than 0.";
  if (payload.salePrice <= 0 || payload.salePrice > payload.regularPrice) {
    return "Sale price must be greater than 0 and less than or equal to regular price.";
  }

  return null;
}

export function buildProductDocumentFields(payload) {
  const isVariable = payload.productType === PRODUCT_TYPES.VARIABLE;
  const pricing = isVariable
    ? buildSummaryPricingFromVariants(payload.variantStockPayload, payload.currency)
    : {
        currency: payload.currency,
        regular_price: payload.regularPrice,
        sale_price: payload.salePrice,
        discount_percentage: calculateDiscountPercentage(payload.regularPrice, payload.salePrice),
      };

  return {
    description: payload.description,
    tags: payload.tags,
    pricing,
    inventory: buildProductInventory({
      quantity: payload.quantity,
      stockStatus: payload.stockStatus,
      variantType: payload.attributeVariantType,
      variantOptions: payload.attributeVariantOptions,
      variantStockPayload: isVariable ? payload.variantStockPayload : [],
    }),
    attributes: {
      product_type: payload.productType,
      variant_type: payload.attributeVariantType,
      variant_options: payload.attributeVariantOptions,
      variant_label: payload.variantLabel,
      variant_label_bn: payload.variantLabelBn,
      variant_placeholder: payload.variantPlaceholder,
      size: payload.attributeVariantType === "size" ? payload.attributeVariantOptions : "",
    },
    ratings: {
      average_rating: payload.averageRating,
      total_reviews: payload.totalReviews,
    },
  };
}
