export function getBestSellingProducts(products = [], limit = 8) {
  return [...products]
    .sort((a, b) => {
      const reviewsA = a.ratings?.total_reviews || 0;
      const reviewsB = b.ratings?.total_reviews || 0;
      if (reviewsB !== reviewsA) return reviewsB - reviewsA;

      const ratingA = a.ratings?.average_rating || 0;
      const ratingB = b.ratings?.average_rating || 0;
      if (ratingB !== ratingA) return ratingB - ratingA;

      return (b.pricing?.discount_percentage || 0) - (a.pricing?.discount_percentage || 0);
    })
    .slice(0, limit);
}

export function getNewArrivalProducts(products = [], limit = 8) {
  return [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    .slice(0, limit);
}

export function getBrandList(products = [], limit = 8) {
  const brands = new Map();

  products.forEach((product) => {
    const name = product.brand_or_vendor?.trim();
    if (!name || brands.has(name.toLowerCase())) return;

    brands.set(name.toLowerCase(), {
      name,
      image: product.images?.[0]?.url || null,
    });
  });

  return Array.from(brands.values()).slice(0, limit);
}
