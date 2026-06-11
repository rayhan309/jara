export function sortCategoriesList(list = []) {
  return [...list].sort((a, b) => {
    const aOrder = typeof a.sort_order === "number" ? a.sort_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.sort_order === "number" ? b.sort_order : Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;

    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

export function serializeCategory(category) {
  return {
    ...category,
    _id: category._id.toString(),
  };
}
