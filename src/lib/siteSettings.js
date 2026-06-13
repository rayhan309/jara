import { normalizeHeroBanners } from "@/lib/heroBanners";

export const SETTINGS_ID = "global";

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
  primaryColor: "#4f46e5",
  metaPixelId: "",
  metaPixelEnabled: false,
  contactPhone: "+8801815131040",
  contactEmail: "support@nexa.com",
  contactAddress: "ঢাকা, বাংলাদেশ",
  heroBanners: [],
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

export function normalizeMetaPixelId(value) {
  return String(value || "").trim().replace(/\D/g, "");
}

/** Admin settings first; env fallback when dashboard-এ pixel configure করা নেই */
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

export function normalizeSettings(input = {}) {
  const primaryColor = normalizeHexColor(input.primaryColor);
  const theme = deriveThemeColors(primaryColor);
  const socialLinks = Array.isArray(input.socialLinks)
    ? input.socialLinks.map(normalizeSocialLink)
    : DEFAULT_SETTINGS.socialLinks;
  const metaPixelId = normalizeMetaPixelId(input.metaPixelId);
  const metaPixelEnabled = Boolean(input.metaPixelEnabled) && metaPixelId.length >= 10;
  const contactPhone = String(input.contactPhone || DEFAULT_SETTINGS.contactPhone || "").trim();
  const contactEmail = String(input.contactEmail || DEFAULT_SETTINGS.contactEmail || "").trim();
  const contactAddress = String(input.contactAddress || DEFAULT_SETTINGS.contactAddress || "").trim();

  return {
    primaryColor: theme.primaryColor,
    primaryColorHover: theme.primaryColorHover,
    primaryColorDark: theme.primaryColorDark,
    primaryColorSoft: theme.primaryColorSoft,
    primaryColorBorder: theme.primaryColorBorder,
    metaPixelId,
    metaPixelEnabled,
    contactPhone,
    contactEmail,
    contactAddress,
    heroBanners: normalizeHeroBanners(input.heroBanners),
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
