import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import {
  calculateAdminOrderPricing,
  computeStockAdjustments,
  validateAdminOrderItems,
} from "@/lib/adminOrderHelpers";
import { ALL_VALID_ORDER_STATUSES } from "@/lib/orderHelpers";
import { validateCustomerDetails } from "@/lib/orderValidation";
import { getDeliveryAreas } from "@/lib/shipping";
import { getFreshSiteSettings } from "@/lib/siteSettingsServer";
import { parseObjectId } from "@/lib/mongodbHelpers";
import { applyProductStockChange, parseOrderStockKey } from "@/lib/productInventoryServer";
import { revalidateAdminOrdersCache } from "@/lib/adminOrdersServer";
import { getProductMaxStock } from "@/lib/variantStock";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
  };
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ORDERS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const ordersCol = await dbConnect(ORDERS_COLLECTION);
    const order = await ordersCol.findOne({ _id: objectId });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: serializeOrder(order) });
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ORDERS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const body = await request.json();
    const { status, customer, delivery, items, pricing } = body;

    const ordersCol = await dbConnect(ORDERS_COLLECTION);
    const productsCol = await dbConnect(PRODUCTS_COLLECTION);
    const existing = await ordersCol.findOne({ _id: objectId });

    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updates = { updatedAt: new Date() };

    if (status !== undefined) {
      if (!ALL_VALID_ORDER_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
      }
      updates.status = status;
    }

    if (customer) {
      const customerResult = validateCustomerDetails(customer);
      if (!customerResult.ok) {
        const firstError = Object.values(customerResult.errors)[0];
        return NextResponse.json({ error: firstError }, { status: 400 });
      }

      updates.customer = {
        ...customerResult.values,
        delivery_area: String(customer.delivery_area || existing.customer?.delivery_area || "").trim(),
      };
    }

    let nextItems = existing.items || [];
    let nextPricing = existing.pricing || {};

    if (Array.isArray(items)) {
      const itemsResult = validateAdminOrderItems(items);
      if (!itemsResult.ok) {
        return NextResponse.json({ error: itemsResult.error }, { status: 400 });
      }

      const shippingFee =
        delivery?.charge ??
        pricing?.delivery_charge ??
        existing.pricing?.delivery_charge ??
        existing.delivery?.charge ??
        0;
      const orderDiscount =
        pricing?.discount ?? existing.pricing?.discount ?? 0;

      const calculated = calculateAdminOrderPricing(items, shippingFee, orderDiscount);
      nextItems = calculated.items;

      const stockAdjustments = computeStockAdjustments(existing.items || [], nextItems);

      for (const [stockKey, quantityChange] of stockAdjustments.entries()) {
        const { productId, selectedVariant } = parseOrderStockKey(stockKey);
        const productObjectId = parseObjectId(productId);
        if (!productObjectId || quantityChange === 0) continue;

        if (quantityChange < 0) {
          const requiredQty = Math.abs(quantityChange);
          const product = await productsCol.findOne({ _id: productObjectId });
          const available = getProductMaxStock(product, selectedVariant);

          if (available < requiredQty) {
            return NextResponse.json(
              {
                error: `Not enough stock for "${product?.title_bn || product?.title_en || "product"}${selectedVariant ? ` (${selectedVariant})` : ""}". Available: ${available}`,
              },
              { status: 400 }
            );
          }
        }

        const result = await applyProductStockChange(
          productsCol,
          productId,
          selectedVariant,
          quantityChange
        );

        if (!result.ok && result.reason === "insufficient_stock") {
          return NextResponse.json({ error: "Insufficient stock for one or more items." }, { status: 400 });
        }
      }

      updates.items = nextItems;
      nextPricing = {
        ...existing.pricing,
        subtotal: calculated.subtotal,
        discount: calculated.discount,
        delivery_charge: calculated.shipping,
        total: calculated.total,
        currency: existing.pricing?.currency || "BDT",
      };
      updates.pricing = nextPricing;
    }

    if (delivery) {
      const settings = await getFreshSiteSettings();
      const deliveryAreas = getDeliveryAreas(settings);
      const deliveryInfo = delivery.method
        ? deliveryAreas.find((area) => area.id === delivery.method)
        : null;
      const deliveryCharge =
        delivery.charge ??
        pricing?.delivery_charge ??
        nextPricing.delivery_charge ??
        existing.delivery?.charge ??
        0;

      updates.delivery = {
        method: delivery.method || existing.delivery?.method || "outside_dhaka",
        label: deliveryInfo?.label || existing.delivery?.label || "Delivery",
        charge: Number(deliveryCharge) || 0,
        area: String(delivery.area || deliveryInfo?.label || existing.delivery?.area || "").trim(),
      };

      if (!Array.isArray(items)) {
        const subtotal = nextPricing.subtotal ?? 0;
        const discount = nextPricing.discount ?? 0;
        updates.pricing = {
          ...nextPricing,
          delivery_charge: Number(deliveryCharge) || 0,
          total: Math.max(0, subtotal - discount + Number(deliveryCharge || 0)),
        };
      }
    }

    if (pricing && !Array.isArray(items)) {
      const subtotal = nextPricing.subtotal ?? 0;
      const deliveryCharge = pricing.delivery_charge ?? nextPricing.delivery_charge ?? 0;
      const discount = pricing.discount ?? 0;
      const total = pricing.total ?? Math.max(0, subtotal - discount + deliveryCharge);

      updates.pricing = {
        ...nextPricing,
        subtotal: pricing.subtotal ?? subtotal,
        discount,
        delivery_charge: deliveryCharge,
        total,
        currency: nextPricing.currency || "BDT",
      };
    }

    await ordersCol.updateOne({ _id: objectId }, { $set: updates });
    const order = await ordersCol.findOne({ _id: objectId });

    revalidateAdminOrdersCache();

    return NextResponse.json({ success: true, order: serializeOrder(order) });
  } catch (error) {
    console.error("PUT /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ORDERS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const ordersCol = await dbConnect(ORDERS_COLLECTION);
    const productsCol = await dbConnect(PRODUCTS_COLLECTION);
    const order = await ordersCol.findOne({ _id: objectId });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    for (const item of order.items || []) {
      const productId = parseObjectId(item.product_id);
      if (!productId) continue;

      await applyProductStockChange(
        productsCol,
        productId.toString(),
        item.selected_variant || "",
        item.quantity
      );
    }

    await ordersCol.deleteOne({ _id: objectId });

    revalidateAdminOrdersCache();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete order." }, { status: 500 });
  }
}
