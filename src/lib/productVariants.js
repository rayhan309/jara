export function parseVariantOptions(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  return String(value)
    .split(/[,|]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getProductVariantConfig(product) {
  const attrs = product?.attributes || {};
  let type = attrs.variant_type || "";
  let options = parseVariantOptions(attrs.variant_options);

  if (!type && attrs.size) {
    type = "size";
    options = parseVariantOptions(attrs.size);
  }

  const required = Boolean(type && options.length > 0);

  return {
    type,
    options,
    required,
    label: type === "weight" ? "ওজন" : type === "size" ? "সাইজ" : "",
    labelEn: type === "weight" ? "Weight" : "Size",
    placeholder:
      type === "weight"
        ? "500g, 1kg, 2kg"
        : type === "size"
          ? "S, M, L, XL"
          : "S, M, L or 500g, 1kg",
  };
}

export function formatVariantLabel(type, value) {
  if (!value) return "";
  const prefix = type === "weight" ? "ওজন" : "সাইজ";
  return `${prefix}: ${value}`;
}
