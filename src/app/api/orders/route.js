import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import {
  isValidBdPhone,
  normalizePhone,
  validateCustomerDetails,
  validateDeliveryMethod,
  validateOrderItems,
} from "@/lib/orderValidation";
import { buildDeliveryOptions } from "@/lib/shipping";
import { getFreshSiteSettings } from "@/lib/siteSettingsServer";
import { revalidateAdminOrdersCache } from "@/lib/adminOrdersServer";
import { getProductVariantConfig } from "@/lib/productVariants";
import { applyProductStockChange, getOrderStockKey } from "@/lib/productInventoryServer";
import { getProductMaxStock, isVariantOutOfStock } from "@/lib/variantStock";
import { resolveProductPricing } from "@/lib/productPricing";
import { parseObjectId } from "@/lib/mongodbHelpers";
import { buildOrderNumberLookupFilter } from "@/lib/orderHelpers";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

async function generateOrderNumber(ordersCol) {
  const [latest] = await ordersCol
    .find({ order_number: { $regex: /^NX-\d+$/i } })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  let nextSerial = 1;
  if (latest) {
    const match = String(latest.order_number).match(/^NX-(\d+)$/i);
    if (match) nextSerial = parseInt(match[1], 10) + 1;
  } else {
    const count = await ordersCol.countDocuments({});
    nextSerial = count + 1;
  }

  for (let offset = 0; offset < 100; offset += 1) {
    const candidate = `NX-${nextSerial + offset}`;
    const exists = await ordersCol.findOne({ order_number: candidate });
    if (!exists) return candidate;
  }

  return `NX-${Date.now().toString().slice(-6)}`;
}

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = normalizePhone(searchParams.get("phone"));
    const orderNumber = String(searchParams.get("order") || searchParams.get("search") || "").trim();

    const ordersCol = await dbConnect(ORDERS_COLLECTION);

    if (phone) {
      if (!isValidBdPhone(phone)) {
        return NextResponse.json(
          { error: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)" },
          { status: 400 }
        );
      }

      const list = await ordersCol
        .find({ "customer.phone": phone })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      if (!list.length) {
        return NextResponse.json(
          { error: "No orders found for this number" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        orders: list.map(serializeOrder),
      });
    }

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Please provide a phone number or order number" },
        { status: 400 }
      );
    }

    const order = await ordersCol.findOne(buildOrderNumberLookupFilter(orderNumber));

    if (!order) {
      return NextResponse.json({ error: "No order found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: serializeOrder(order),
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Could not find order" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, delivery, items } = body;

    const customerResult = validateCustomerDetails({ name, phone, address });
    if (!customerResult.ok) {
      const firstError = Object.values(customerResult.errors)[0];
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const settings = await getFreshSiteSettings();
    const deliveryResult = validateDeliveryMethod(delivery, settings);
    if (!deliveryResult.ok) {
      return NextResponse.json({ error: deliveryResult.error }, { status: 400 });
    }

    const itemsResult = validateOrderItems(items);
    if (!itemsResult.ok) {
      return NextResponse.json({ error: itemsResult.error }, { status: 400 });
    }

    const productsCol = await dbConnect(PRODUCTS_COLLECTION);
    const orderLines = [];
    const stockUpdates = new Map();

    for (const cartItem of items) {
      const objectId = parseObjectId(cartItem._id);
      if (!objectId) {
        return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
      }

      const product = await productsCol.findOne({ _id: objectId });
      if (!product) {
        return NextResponse.json(
          { error: `"${cartItem.title || "Product"}" is no longer available` },
          { status: 400 }
        );
      }

      const variantConfig = getProductVariantConfig(product);
      const selectedVariant = String(cartItem.selected_variant || "").trim();

      if (variantConfig.required && !selectedVariant) {
        return NextResponse.json(
          { error: `"${product.title_bn || product.title_en}" — please select ${variantConfig.label}` },
          { status: 400 }
        );
      }

      if (selectedVariant && variantConfig.options.length && !variantConfig.options.includes(selectedVariant)) {
        return NextResponse.json(
          { error: `"${product.title_bn || product.title_en}" — invalid ${variantConfig.label}` },
          { status: 400 }
        );
      }

      const maxStock = getProductMaxStock(product, selectedVariant);

      if (isVariantOutOfStock(product, selectedVariant)) {
        return NextResponse.json(
          {
            error: selectedVariant
              ? `"${product.title_bn || product.title_en}" (${selectedVariant}) is out of stock`
              : `"${product.title_bn || product.title_en}" is out of stock`,
          },
          { status: 400 }
        );
      }

      const quantity = Math.floor(Number(cartItem.quantity));

      const stockKey = getOrderStockKey(cartItem._id, selectedVariant);
      const prevQty = stockUpdates.get(stockKey) || 0;
      const totalRequested = prevQty + quantity;

      if (totalRequested > maxStock) {
        return NextResponse.json(
          {
            error: `"${product.title_bn || product.title_en}"${selectedVariant ? ` (${selectedVariant})` : ""} — maximum ${maxStock} can be ordered`,
          },
          { status: 400 }
        );
      }

      stockUpdates.set(stockKey, totalRequested);

      const pricing = resolveProductPricing(product, selectedVariant);
      const salePrice = pricing.sale_price ?? 0;
      const regularPrice = pricing.regular_price ?? salePrice;

      orderLines.push({
        product_id: cartItem._id,
        slug: product.slug,
        title: product.title_bn || product.title_en,
        title_en: product.title_en,
        image: product.images?.[0]?.url || cartItem.image || "",
        shipping_class: product.attributes?.shipping_class || "",
        price: salePrice,
        regular_price: regularPrice,
        quantity,
        selected_variant: selectedVariant,
        variant_type: variantConfig.type || "",
        line_total: salePrice * quantity,
      });
    }

    const subtotal = orderLines.reduce((sum, line) => sum + line.line_total, 0);
    const discount = orderLines.reduce(
      (sum, line) => sum + Math.max(0, (line.regular_price - line.price) * line.quantity),
      0
    );
    const deliveryOptions = buildDeliveryOptions(orderLines, settings);
    const selectedDelivery = deliveryOptions.find((option) => option.id === delivery);
    if (!selectedDelivery) {
      return NextResponse.json({ error: "Please select a delivery method" }, { status: 400 });
    }
    const deliveryCharge = selectedDelivery.charge ?? 0;
    const total = subtotal + deliveryCharge;

    const now = new Date();
    const ordersCol = await dbConnect(ORDERS_COLLECTION);
    const orderDoc = {
      order_number: await generateOrderNumber(ordersCol),
      customer: customerResult.values,
      items: orderLines,
      delivery: {
        method: delivery,
        label: deliveryResult.area?.label || selectedDelivery?.label || "Delivery",
        charge: deliveryCharge,
        area: deliveryResult.area?.label || "",
      },
      payment: {
        method: "cod",
        label: "Cash On Delivery",
      },
      pricing: {
        subtotal,
        discount,
        delivery_charge: deliveryCharge,
        total,
        currency: "BDT",
      },
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    const result = await ordersCol.insertOne(orderDoc);

    for (const [stockKey, orderedQty] of stockUpdates.entries()) {
      const [productId, ...variantParts] = stockKey.split("::");
      const selectedVariant = variantParts.join("::");
      const result = await applyProductStockChange(
        productsCol,
        productId,
        selectedVariant,
        -orderedQty
      );

      if (!result.ok && result.reason === "insufficient_stock") {
        return NextResponse.json(
          { error: "Could not update stock for one or more products" },
          { status: 400 }
        );
      }
    }

    revalidateAdminOrdersCache();

    return NextResponse.json(
      {
        success: true,
        order: serializeOrder({ ...orderDoc, _id: result.insertedId }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Could not save order" },
      { status: 500 }
    );
  }
}
