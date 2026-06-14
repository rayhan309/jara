import { parseVariantOptions, getProductVariantConfig } from "@/lib/productVariants";

export const UNTRACKED_STOCK_LIMIT = 99;

export const VARIANT_STOCK_OPTIONS = [
  { value: "in_stock", label: "In Stock" },
  { value: "stock", label: "Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export function normalizeStockStatus(status) {
  const value = String(status || "in_stock").trim();
  if (value === "low_stock") return "stock";
  if (value === "stock" || value === "out_of_stock" || value === "in_stock") return value;
  return "in_stock";
}

export function normalizeVariantStockEntry(entry = {}) {
  const stockStatus = normalizeStockStatus(entry.stock_status);
  let quantity = Math.max(0, Math.floor(Number(entry.quantity) || 0));

  if (stockStatus !== "stock") {
    quantity = 0;
  }

  const normalized = { stock_status: stockStatus, quantity };

  if (entry.regular_price != null && entry.regular_price !== "") {
    normalized.regular_price = Math.max(0, Number(entry.regular_price) || 0);
  }

  if (entry.sale_price != null && entry.sale_price !== "") {
    normalized.sale_price = Math.max(0, Number(entry.sale_price) || 0);
  }

  return normalized;
}

export function getVariantStockList(product) {
  const list = product?.inventory?.variant_stock;
  return Array.isArray(list) ? list.map((entry) => normalizeVariantStockEntry(entry)) : [];
}

export function getVariantStockEntry(product, selectedVariant = "") {
  const inventory = product?.inventory || {};
  const variantStock = inventory.variant_stock;

  if (Array.isArray(variantStock) && variantStock.length > 0) {
    if (!selectedVariant) return null;

    const match = variantStock.find((entry) => entry.option === selectedVariant);
    if (match) {
      return { option: match.option, ...normalizeVariantStockEntry(match) };
    }

    return { option: selectedVariant, stock_status: "out_of_stock", quantity: 0 };
  }

  return {
    stock_status: normalizeStockStatus(inventory.stock_status),
    quantity: Math.max(0, Math.floor(Number(inventory.quantity) || 0)),
  };
}

export function getProductMaxStock(product, selectedVariant = "") {
  const entry = getVariantStockEntry(product, selectedVariant);
  if (!entry) return 0;

  if (entry.stock_status === "out_of_stock") return 0;
  if (entry.stock_status === "in_stock") return UNTRACKED_STOCK_LIMIT;

  const quantity = Number(entry.quantity);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

export function isProductFullyOutOfStock(product) {
  const config = getProductVariantConfig(product);

  if (config.required) {
    return config.options.every((option) => getProductMaxStock(product, option) <= 0);
  }

  return getProductMaxStock(product) <= 0;
}

export function isVariantOutOfStock(product, selectedVariant = "") {
  return getProductMaxStock(product, selectedVariant) <= 0;
}

export function mergeVariantStockWithOptions(options = [], existingList = [], fallbackInventory = {}) {
  const existingMap = new Map(
    (existingList || []).map((entry) => [entry.option, normalizeVariantStockEntry(entry)])
  );

  const fallbackStatus = normalizeStockStatus(fallbackInventory.stock_status);
  const fallbackQty = Math.max(0, Math.floor(Number(fallbackInventory.quantity) || 0));
  const defaultStatus =
    fallbackStatus === "out_of_stock"
      ? "out_of_stock"
      : fallbackStatus === "stock" || fallbackQty > 0
        ? "stock"
        : "in_stock";

  const pricingTemplate = (existingList || []).find(
    (entry) =>
      (entry.regular_price != null && entry.regular_price !== "") ||
      (entry.sale_price != null && entry.sale_price !== "")
  );

  const defaultRegular =
    pricingTemplate?.regular_price != null && pricingTemplate.regular_price !== ""
      ? pricingTemplate.regular_price
      : fallbackInventory.regular_price != null && fallbackInventory.regular_price !== ""
        ? fallbackInventory.regular_price
        : "";

  const defaultSale =
    pricingTemplate?.sale_price != null && pricingTemplate.sale_price !== ""
      ? pricingTemplate.sale_price
      : fallbackInventory.sale_price != null && fallbackInventory.sale_price !== ""
        ? fallbackInventory.sale_price
        : "";

  return options.map((option) => {
    const existing = existingMap.get(option);
    if (existing) {
      const row = { option, ...existing };
      if (
        (row.regular_price == null || row.regular_price === "") &&
        defaultRegular !== ""
      ) {
        row.regular_price = defaultRegular;
      }
      if ((row.sale_price == null || row.sale_price === "") && defaultSale !== "") {
        row.sale_price = defaultSale;
      }
      return row;
    }

    return {
      option,
      regular_price: defaultRegular,
      sale_price: defaultSale,
      stock_status: defaultStatus,
      quantity: defaultStatus === "stock" ? fallbackQty : 0,
    };
  });
}

export function parseVariantStockPayload(raw) {
  if (!raw) return [];

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        const normalized = normalizeVariantStockEntry(entry);
        const result = {
          option: String(entry.option || "").trim(),
          ...normalized,
        };

        if (entry.regular_price != null && entry.regular_price !== "") {
          result.regular_price = Math.max(0, Number(entry.regular_price) || 0);
        }

        if (entry.sale_price != null && entry.sale_price !== "") {
          result.sale_price = Math.max(0, Number(entry.sale_price) || 0);
        }

        return result;
      })
      .filter((entry) => entry.option);
  } catch {
    return [];
  }
}

export function summarizeInventoryFromVariantStock(variantStock = []) {
  const tracked = variantStock.filter((entry) => entry.stock_status === "stock");
  const totalQty = tracked.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
  const allOut = variantStock.length > 0 && variantStock.every((entry) => entry.stock_status === "out_of_stock");

  let stockStatus = "in_stock";
  if (allOut) {
    stockStatus = "out_of_stock";
  } else if (tracked.length > 0 && totalQty <= 5) {
    stockStatus = "low_stock";
  }

  return {
    stock_status: stockStatus,
    quantity: totalQty,
    variant_stock: variantStock,
  };
}

export function buildProductInventory({
  quantity = 0,
  stockStatus = "in_stock",
  variantType = "",
  variantOptions = "",
  variantStockPayload = [],
}) {
  const options = parseVariantOptions(variantOptions);

  if (variantType && options.length > 0) {
    const merged = mergeVariantStockWithOptions(options, variantStockPayload);
    return summarizeInventoryFromVariantStock(merged);
  }

  const normalizedStatus = normalizeStockStatus(stockStatus);
  const normalizedQty =
    normalizedStatus === "stock" ? Math.max(0, Math.floor(Number(quantity) || 0)) : 0;

  return {
    stock_status: normalizedStatus,
    quantity: normalizedQty,
    variant_stock: [],
  };
}

export function getProductStockSummary(product) {
  const config = getProductVariantConfig(product);
  const inventory = product?.inventory || {};

  if (config.required && Array.isArray(inventory.variant_stock) && inventory.variant_stock.length > 0) {
    const trackedTotal = inventory.variant_stock
      .filter((entry) => normalizeStockStatus(entry.stock_status) === "stock")
      .reduce((sum, entry) => sum + (Number(entry.quantity) || 0), 0);

    const inStockCount = inventory.variant_stock.filter(
      (entry) => getProductMaxStock(product, entry.option) > 0
    ).length;

    return {
      quantity: trackedTotal,
      label: `${inStockCount}/${inventory.variant_stock.length} variants`,
      hasVariants: true,
    };
  }

  const entry = getVariantStockEntry(product);
  if (entry.stock_status === "in_stock") {
    return { quantity: "∞", label: "In Stock", hasVariants: false };
  }

  return {
    quantity: entry.quantity,
    label: entry.stock_status === "out_of_stock" ? "Out of Stock" : `${entry.quantity}`,
    hasVariants: false,
  };
}
