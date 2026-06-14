import { calculateDiscountPercentage } from "@/lib/productHelpers";
import { parseVariantOptions } from "@/lib/productVariants";

export const PRODUCT_TYPES = {
  REGULAR: "regular",
  VARIABLE: "variable",
};

export function inferProductType(product) {
  const explicit = product?.attributes?.product_type;
  if (explicit === PRODUCT_TYPES.VARIABLE || explicit === PRODUCT_TYPES.REGULAR) {
    return explicit;
  }

  const variantType = product?.attributes?.variant_type;
  const options = parseVariantOptions(
    product?.attributes?.variant_options || product?.attributes?.size || ""
  );

  return variantType && options.length > 0 ? PRODUCT_TYPES.VARIABLE : PRODUCT_TYPES.REGULAR;
}

export function isVariableProduct(product) {
  return inferProductType(product) === PRODUCT_TYPES.VARIABLE;
}

export function getVariantPricingFromStock(product, selectedVariant = "") {
  const list = product?.inventory?.variant_stock;
  if (!Array.isArray(list) || !selectedVariant) return null;

  const match = list.find((entry) => entry.option === selectedVariant);
  if (!match || !(Number(match.sale_price) > 0)) return null;

  const regularPrice = Number(match.regular_price) || Number(match.sale_price);
  const salePrice = Number(match.sale_price);

  return {
    currency: product?.pricing?.currency || "BDT",
    regular_price: regularPrice,
    sale_price: salePrice,
    discount_percentage: calculateDiscountPercentage(regularPrice, salePrice),
  };
}

export function resolveProductPricing(product, selectedVariant = "") {
  const variantPricing = getVariantPricingFromStock(product, selectedVariant);
  if (variantPricing) return variantPricing;

  const pricing = product?.pricing || {};
  return {
    currency: pricing.currency || "BDT",
    regular_price: Number(pricing.regular_price) || 0,
    sale_price: Number(pricing.sale_price) || 0,
    discount_percentage: Number(pricing.discount_percentage) || 0,
  };
}

export function buildSummaryPricingFromVariants(variantStock = [], currency = "BDT") {
  const priced = variantStock.filter(
    (entry) => Number(entry.sale_price) > 0 && Number(entry.regular_price) > 0
  );

  if (!priced.length) {
    return {
      currency,
      regular_price: 0,
      sale_price: 0,
      discount_percentage: 0,
    };
  }

  const anchor = priced.reduce((min, entry) =>
    Number(entry.sale_price) < Number(min.sale_price) ? entry : min
  );

  const regularPrice = Number(anchor.regular_price);
  const salePrice = Number(anchor.sale_price);

  return {
    currency,
    regular_price: regularPrice,
    sale_price: salePrice,
    discount_percentage: calculateDiscountPercentage(regularPrice, salePrice),
  };
}

export function validateVariantPricingEntry(entry) {
  const regular = Number(entry.regular_price);
  const sale = Number(entry.sale_price);

  if (!(regular > 0)) return "Regular price must be greater than 0.";
  if (!(sale > 0)) return "Sale price must be greater than 0.";
  if (sale > regular) return "Sale price cannot exceed regular price.";
  return null;
}
