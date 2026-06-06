export function calculateDiscountPercentage(regularPrice, salePrice) {
  const regular = Number(regularPrice);
  const sale = Number(salePrice);

  if (!regular || regular <= 0 || sale >= regular) return 0;
  return Math.round(((regular - sale) / regular) * 100);
}

export function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
