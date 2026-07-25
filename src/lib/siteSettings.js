import { normalizeHeroBanners } from "@/lib/heroBanners";
import { slugify } from "@/lib/slugify";

export const SETTINGS_ID = "global";

/** Default store logo & favicon (public path). */
export const DEFAULT_BRAND_LOGO_PATH = "/images/brand-logo.png";

export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "Twitter / X" },
  { id: "youtube", label: "YouTube" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
];

export const DEFAULT_SETTINGS = {
  shopShortDescription: "Your trusted online shopping destination. Quality products, fast delivery, and easy order tracking.",
  shopTagline: "Built for modern e-commerce",
  copyrightText: "© {year} Raisa's Glam Nest. All rights reserved.",
  shopLogo: null,
  favicon: null,
  primaryColor: "#4f46e5",
  metaPixelId: "",
  metaPixelEnabled: false,
  steadfastBaseUrl: "https://portal.packzy.com/api/v1",
  steadfastApiKey: "",
  steadfastSecretKey: "",
  steadfastEnabled: false,
  contactPhone: "+8801815131040",
  contactEmail: "support@raisasglamnest.com",
  contactAddress: "Dhaka, Bangladesh",
  heroBanners: [],
  deliveryAreas: [
    { id: "inside_dhaka", label: "Inside Dhaka" },
    { id: "outside_dhaka", label: "Outside Dhaka" },
  ],
  shippingClasses: [
    {
      id: "standard",
      name: "Standard",
      description: "Default shipping class",
      freeDelivery: false,
      charges: { inside_dhaka: 60, outside_dhaka: 120 },
    },
  ],
  socialLinks: [
    { id: "facebook", platform: "facebook", label: "Facebook", url: "", enabled: false },
    { id: "instagram", platform: "instagram", label: "Instagram", url: "", enabled: false },
    { id: "twitter", platform: "twitter", label: "Twitter", url: "", enabled: false },
  ],
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex) {
  const normalized = String(hex || "")
    .trim()
    .replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function normalizeHexColor(value, fallback = DEFAULT_SETTINGS.primaryColor) {
  const rgb = hexToRgb(value);
  return rgb ? rgbToHex(rgb) : fallback;
}

export function deriveThemeColors(primaryColor) {
  const rgb = hexToRgb(primaryColor);

  if (!rgb) {
    return deriveThemeColors(DEFAULT_SETTINGS.primaryColor);
  }

  const hover = {
    r: rgb.r * 0.86,
    g: rgb.g * 0.86,
    b: rgb.b * 0.86,
  };

  const dark = {
    r: rgb.r * 0.72,
    g: rgb.g * 0.72,
    b: rgb.b * 0.72,
  };

  const soft = {
    r: rgb.r + (255 - rgb.r) * 0.92,
    g: rgb.g + (255 - rgb.g) * 0.92,
    b: rgb.b + (255 - rgb.b) * 0.92,
  };

  const border = {
    r: rgb.r + (255 - rgb.r) * 0.75,
    g: rgb.g + (255 - rgb.g) * 0.75,
    b: rgb.b + (255 - rgb.b) * 0.75,
  };

  return {
    primaryColor: rgbToHex(rgb),
    primaryColorHover: rgbToHex(hover),
    primaryColorDark: rgbToHex(dark),
    primaryColorSoft: rgbToHex(soft),
    primaryColorBorder: rgbToHex(border),
  };
}

function normalizeBrandAsset(asset) {
  const url = String(asset?.url || "").trim();
  if (!url) return null;

  return {
    url,
    fileId: String(asset?.fileId || "").trim(),
    name: String(asset?.name || "").trim(),
  };
}

export function getShopLogoUrl(settings) {
  return settings?.shopLogo?.url || DEFAULT_BRAND_LOGO_PATH;
}

export function getFaviconUrl(settings) {
  return settings?.favicon?.url || DEFAULT_BRAND_LOGO_PATH;
}

function normalizeSocialLink(link, index) {
  const platform =
    SOCIAL_PLATFORMS.find((item) => item.id === link?.platform)?.id ||
    SOCIAL_PLATFORMS[0].id;
  const platformMeta = SOCIAL_PLATFORMS.find((item) => item.id === platform);
  const url = String(link?.url || "").trim();

  return {
    id: String(link?.id || `${platform}-${index}`),
    platform,
    label: String(link?.label || platformMeta?.label || platform).trim(),
    url,
    enabled: Boolean(link?.enabled) && Boolean(url),
  };
}

function normalizeDeliveryArea(area, index) {
  const label = String(area?.label || "").trim();
  const fallbackId = `area-${index + 1}`;
  const id = String(area?.id || slugify(label) || fallbackId).trim() || fallbackId;

  return {
    id,
    label: label || `Area ${index + 1}`,
  };
}

function normalizeShippingClass(shippingClass, index, deliveryAreas) {
  const name = String(shippingClass?.name || "").trim();
  const fallbackId = `shipping-${index + 1}`;
  const id = String(shippingClass?.id || slugify(name) || fallbackId).trim() || fallbackId;
  const description = String(shippingClass?.description || "").trim();
  const freeDelivery = Boolean(shippingClass?.freeDelivery);
  const charges = deliveryAreas.reduce((acc, area) => {
    const rawCharge = shippingClass?.charges?.[area.id];
    const chargeValue = Math.max(0, Number(rawCharge) || 0);
    acc[area.id] = chargeValue;
    return acc;
  }, {});

  return {
    id,
    name: name || `Shipping ${index + 1}`,
    description,
    freeDelivery,
    charges,
  };
}

export function normalizeMetaPixelId(value) {
  return String(value || "").trim().replace(/\D/g, "");
}

/** Admin settings first; env fallback when dashboard pixel is not configured */
export function getMetaPixelIdFromSettings(settings, envFallback = "") {
  if (settings?.metaPixelEnabled && settings?.metaPixelId) {
    return settings.metaPixelId;
  }

  if (settings?.metaPixelEnabled === false) {
    return "";
  }

  if (settings?.metaPixelId) {
    return "";
  }

  return String(envFallback || "").trim().replace(/\D/g, "");
}

const DEFAULT_STEADFAST_BASE_URL = "https://portal.packzy.com/api/v1";

export function normalizeSteadfastBaseUrl(value) {
  const url = String(value || DEFAULT_STEADFAST_BASE_URL).trim();
  return url.replace(/\/$/, "") || DEFAULT_STEADFAST_BASE_URL;
}

/** Admin settings first; env fallback when dashboard is not configured */
export function getSteadfastConfigFromSettings(settings, options = {}) {
  const { requireEnabled = true } = options;
  const envFallback = {
    baseUrl: normalizeSteadfastBaseUrl(process.env.STEADFAST_BASE_URL),
    apiKey: String(process.env.STEADFAST_API_KEY || "").trim(),
    secretKey: String(process.env.STEADFAST_SECRET_KEY || "").trim(),
  };

  const hasAdminKeys = Boolean(settings?.steadfastApiKey && settings?.steadfastSecretKey);

  if (hasAdminKeys) {
    if (requireEnabled && !settings?.steadfastEnabled) {
      return null;
    }

    return {
      baseUrl: normalizeSteadfastBaseUrl(settings.steadfastBaseUrl),
      apiKey: settings.steadfastApiKey,
      secretKey: settings.steadfastSecretKey,
    };
  }

  if (settings?.steadfastApiKey || settings?.steadfastSecretKey) {
    return null;
  }

  if (envFallback.apiKey && envFallback.secretKey) {
    return envFallback;
  }

  return null;
}

/** Strip secret keys before sending settings to the browser */
export function sanitizePublicSettings(settings) {
  if (!settings) return settings;

  return {
    ...settings,
    steadfastSecretKey: "",
    steadfastSecretKeySet: Boolean(settings.steadfastSecretKey),
  };
}

export function normalizeSettings(input = {}) {
  const shopShortDescription = String(
    input.shopShortDescription || DEFAULT_SETTINGS.shopShortDescription || ""
  ).trim();
  const shopTagline = String(input.shopTagline || DEFAULT_SETTINGS.shopTagline || "").trim();
  const copyrightText = String(
    input.copyrightText || DEFAULT_SETTINGS.copyrightText || ""
  ).trim();
  const primaryColor = normalizeHexColor(input.primaryColor);
  const theme = deriveThemeColors(primaryColor);
  const socialLinks = Array.isArray(input.socialLinks)
    ? input.socialLinks.map(normalizeSocialLink)
    : DEFAULT_SETTINGS.socialLinks;
  const deliveryAreas = Array.isArray(input.deliveryAreas) && input.deliveryAreas.length > 0
    ? input.deliveryAreas.map(normalizeDeliveryArea)
    : DEFAULT_SETTINGS.deliveryAreas;
  const shippingClasses = Array.isArray(input.shippingClasses) && input.shippingClasses.length > 0
    ? input.shippingClasses.map((item, index) =>
        normalizeShippingClass(item, index, deliveryAreas)
      )
    : DEFAULT_SETTINGS.shippingClasses.map((item, index) =>
        normalizeShippingClass(item, index, deliveryAreas)
      );
  const metaPixelId = normalizeMetaPixelId(input.metaPixelId);
  const metaPixelEnabled = Boolean(input.metaPixelEnabled) && metaPixelId.length >= 10;
  const contactPhone = String(input.contactPhone || DEFAULT_SETTINGS.contactPhone || "").trim();
  const contactEmail = String(input.contactEmail || DEFAULT_SETTINGS.contactEmail || "").trim();
  const contactAddress = String(input.contactAddress || DEFAULT_SETTINGS.contactAddress || "").trim();
  const steadfastBaseUrl = normalizeSteadfastBaseUrl(input.steadfastBaseUrl);
  const steadfastApiKey = String(input.steadfastApiKey || "").trim();
  const steadfastSecretKey = String(input.steadfastSecretKey || "").trim();
  const steadfastEnabled =
    Boolean(input.steadfastEnabled) &&
    Boolean(steadfastApiKey) &&
    Boolean(steadfastSecretKey);

  return {
    primaryColor: theme.primaryColor,
    primaryColorHover: theme.primaryColorHover,
    primaryColorDark: theme.primaryColorDark,
    primaryColorSoft: theme.primaryColorSoft,
    primaryColorBorder: theme.primaryColorBorder,
    shopShortDescription,
    shopTagline,
    copyrightText,
    shopLogo: normalizeBrandAsset(input.shopLogo),
    favicon: normalizeBrandAsset(input.favicon),
    metaPixelId,
    metaPixelEnabled,
    steadfastBaseUrl,
    steadfastApiKey,
    steadfastSecretKey,
    steadfastEnabled,
    contactPhone,
    contactEmail,
    contactAddress,
    heroBanners: normalizeHeroBanners(input.heroBanners),
    deliveryAreas,
    shippingClasses,
    socialLinks,
  };
}

export function getThemeCssProperties(settings) {
  if (!settings) return {};

  return {
    "--store-primary": settings.primaryColor,
    "--store-primary-hover": settings.primaryColorHover,
    "--store-primary-dark": settings.primaryColorDark,
    "--store-primary-soft": settings.primaryColorSoft,
    "--store-primary-border": settings.primaryColorBorder,
    "--color-indigo-50": settings.primaryColorSoft,
    "--color-indigo-100": settings.primaryColorSoft,
    "--color-indigo-200": settings.primaryColorBorder,
    "--color-indigo-300": `color-mix(in srgb, ${settings.primaryColor} 55%, white)`,
    "--color-indigo-400": `color-mix(in srgb, ${settings.primaryColor} 72%, white)`,
    "--color-indigo-500": `color-mix(in srgb, ${settings.primaryColor} 86%, white)`,
    "--color-indigo-600": settings.primaryColor,
    "--color-indigo-700": settings.primaryColorHover,
    "--color-indigo-800": settings.primaryColorDark,
  };
}

export function applyThemeToDocument(settings) {
  if (typeof document === "undefined" || !settings) return;

  const root = document.documentElement;
  const vars = getThemeCssProperties(settings);

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function getThemeInlineCss(settings) {
  const vars = getThemeCssProperties(settings);
  if (!vars || Object.keys(vars).length === 0) return "";

  const declarations = Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");

  return `:root,html{${declarations}}`;
}
