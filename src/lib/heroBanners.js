import { getOptimizedImageUrl } from "@/lib/imageUrl";

/** Upload / design target for homepage hero slides (object-fit: cover). */
export const HERO_BANNER_IMAGE_SPEC = {
  width: 1920,
  height: 800,
  aspectRatio: "12:5",
  maxFileSize: "400 KB (JPEG/WebP recommended)",
};

export const FALLBACK_HERO_BANNERS = [
  {
    id: "fallback-1",
    image: { url: "/images/banner-1.jpg" },
    alt: "Raisa's Glam Nest banner",
    href: "/products",
    enabled: true,
  },
];

export function normalizeHeroBanner(banner, index = 0) {
  const url = String(banner?.image?.url || banner?.url || "").trim();

  return {
    id: String(banner?.id || `hero-${index}`),
    image: {
      url,
      fileId: banner?.image?.fileId || "",
      name: banner?.image?.name || "",
    },
    alt: String(banner?.alt || "Home banner").trim(),
    href: String(banner?.href || "/products").trim() || "/products",
    enabled: banner?.enabled !== false,
  };
}

export function normalizeHeroBanners(banners) {
  if (!Array.isArray(banners)) return [];

  return banners
    .map((banner, index) => normalizeHeroBanner(banner, index))
    .filter((banner) => banner.image.url);
}

export function getActiveHeroBanners(banners) {
  const normalized = normalizeHeroBanners(banners).filter((banner) => banner.enabled);
  return normalized.length > 0 ? normalized : FALLBACK_HERO_BANNERS;
}

export function getHeroBannerPreloadUrls(banners, limit = 2) {
  return getActiveHeroBanners(banners)
    .slice(0, limit)
    .map((banner) =>
      getOptimizedImageUrl(banner.image.url, {
        width: HERO_BANNER_IMAGE_SPEC.width,
        height: HERO_BANNER_IMAGE_SPEC.height,
        quality: 90,
      })
    )
    .filter(Boolean);
}

export function createHeroBanner(image, overrides = {}) {
  return normalizeHeroBanner({
    id: `hero-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    image,
    alt: overrides.alt || "Home banner",
    href: overrides.href || "/products",
    enabled: true,
  });
}
