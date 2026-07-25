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

const FALLBACK_LABELS = {
  size: { bn: "Size", en: "Size", placeholder: "S, M, L, XL" },
  weight: { bn: "Weight", en: "Weight", placeholder: "500g, 1kg, 2kg" },
  color: { bn: "Color", en: "Color", placeholder: "Red, Blue, Green" },
};

export function getVariantTypeLabel(productOrAttrs, locale = "en") {
  const attrs = typeof productOrAttrs === "object" ? productOrAttrs?.attributes || productOrAttrs : null;
  const type = attrs?.variant_type || (typeof productOrAttrs === "string" ? productOrAttrs : "");

  if (locale === "bn" && attrs?.variant_label_bn) return attrs.variant_label_bn;
  if (attrs?.variant_label) return attrs.variant_label;

  const fallback = FALLBACK_LABELS[type];
  if (fallback) return locale === "bn" ? fallback.bn : fallback.en;

  if (!type) return "";
  return type.charAt(0).toUpperCase() + type.slice(1);
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
  const fallback = FALLBACK_LABELS[type] || {};
  const labelBn = attrs.variant_label_bn || fallback.bn || getVariantTypeLabel(attrs, "bn");
  const labelEn = attrs.variant_label || fallback.en || getVariantTypeLabel(attrs, "en");

  return {
    type,
    options,
    required,
    label: labelEn || labelBn,
    labelEn,
    placeholder: attrs.variant_placeholder || fallback.placeholder || "Option 1, Option 2",
  };
}

export function getDefaultProductVariant(product) {
  const config = getProductVariantConfig(product);
  return config.options[0] || "";
}

export function resolveProductVariant(product, selectedVariant) {
  const config = getProductVariantConfig(product);

  if (!config.required) {
    return "";
  }

  if (selectedVariant) {
    return selectedVariant;
  }

  return getDefaultProductVariant(product);
}

export function formatVariantLabel(productOrType, value) {
  if (!value) return "";
  const label = getVariantTypeLabel(productOrType, "en");
  return `${label}: ${value}`;
}

export function findProductAttribute(attributes = [], slug = "") {
  return attributes.find((entry) => entry.slug === slug) || null;
}
