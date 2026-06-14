import { parseObjectId } from "@/lib/mongodbHelpers";
import { getVariantStockList } from "@/lib/variantStock";

export function getOrderStockKey(productId, selectedVariant = "") {
  return `${productId}::${selectedVariant || ""}`;
}

export function parseOrderStockKey(key) {
  const [productId, ...variantParts] = String(key).split("::");
  return {
    productId,
    selectedVariant: variantParts.join("::"),
  };
}

export async function applyProductStockChange(productsCol, productId, selectedVariant, delta) {
  const objectId = parseObjectId(productId);
  if (!objectId || !delta) return { ok: true, skipped: true };

  const product = await productsCol.findOne({ _id: objectId });
  if (!product) return { ok: false, reason: "not_found" };

  const variantStock = getVariantStockList(product);
  const hasVariantStock = variantStock.length > 0 && selectedVariant;

  if (hasVariantStock) {
    const entry = product.inventory?.variant_stock?.find((item) => item.option === selectedVariant);

    if (!entry || entry.stock_status !== "stock") {
      return { ok: true, skipped: true };
    }

    if (delta < 0) {
      const requiredQty = Math.abs(delta);
      const result = await productsCol.updateOne(
        {
          _id: objectId,
          "inventory.variant_stock": {
            $elemMatch: {
              option: selectedVariant,
              stock_status: "stock",
              quantity: { $gte: requiredQty },
            },
          },
        },
        {
          $inc: {
            "inventory.variant_stock.$[variant].quantity": delta,
            "inventory.quantity": delta,
          },
          $set: { updatedAt: new Date() },
        },
        {
          arrayFilters: [{ "variant.option": selectedVariant, "variant.stock_status": "stock" }],
        }
      );

      if (result.modifiedCount === 0) {
        return { ok: false, reason: "insufficient_stock" };
      }

      return { ok: true };
    }

    await productsCol.updateOne(
      { _id: objectId },
      {
        $inc: {
          "inventory.variant_stock.$[variant].quantity": delta,
          "inventory.quantity": delta,
        },
        $set: { updatedAt: new Date() },
      },
      {
        arrayFilters: [{ "variant.option": selectedVariant, "variant.stock_status": "stock" }],
      }
    );

    return { ok: true };
  }

  const inventory = product.inventory || {};
  if (inventory.stock_status !== "stock") {
    return { ok: true, skipped: true };
  }

  if (delta < 0) {
    const requiredQty = Math.abs(delta);
    const result = await productsCol.updateOne(
      { _id: objectId, "inventory.quantity": { $gte: requiredQty } },
      {
        $inc: { "inventory.quantity": delta },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      return { ok: false, reason: "insufficient_stock" };
    }

    return { ok: true };
  }

  await productsCol.updateOne(
    { _id: objectId },
    {
      $inc: { "inventory.quantity": delta },
      $set: { updatedAt: new Date() },
    }
  );

  return { ok: true };
}

export { getProductMaxStock as getAvailableStockForOrder } from "@/lib/variantStock";
