const IMAGEKIT_HOST = "ik.imagekit.io";

export function getOptimizedImageUrl(
  url,
  { width = 800, height = 800, quality = 92, format = "auto" } = {}
) {
  if (!url || typeof url !== "string") return url;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (!parsed.hostname.includes(IMAGEKIT_HOST)) {
    return url;
  }

  const transform = `tr:w-${width},h-${height},c-at_max,q-${quality},f-${format}`;
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return url;

  const transformIndex = segments.findIndex((segment) => segment.startsWith("tr:"));

  if (transformIndex !== -1) {
    segments[transformIndex] = transform;
  } else {
    segments.splice(1, 0, transform);
  }

  parsed.pathname = `/${segments.join("/")}`;
  return parsed.toString();
}

export function getProductCardImageUrl(url) {
  return getOptimizedImageUrl(url, {
    width: 800,
    height: 800,
    quality: 92,
  });
}

export function getProductDetailImageUrl(url) {
  return getOptimizedImageUrl(url, {
    width: 1200,
    height: 1200,
    quality: 93,
  });
}
