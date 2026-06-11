import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import {
  DELIVERY_OPTIONS,
  isValidBdPhone,
  normalizePhone,
  validateCustomerDetails,
  validateDeliveryMethod,
  validateOrderItems,
} from "@/lib/orderValidation";
import { getProductVariantConfig } from "@/lib/productVariants";
import { parseObjectId } from "@/lib/mongodbHelpers";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `NEXA-${date}-${random}`;
}

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
  };
}

function normalizeOrderQuery(value) {
  return String(value || "")
    .trim()
    .replace(/^#/, "")
    .toUpperCase();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = normalizePhone(searchParams.get("phone"));
    const orderNumber = normalizeOrderQuery(searchParams.get("order") || searchParams.get("search"));

    const ordersCol = dbConnect(ORDERS_COLLECTION);

    if (phone) {
      if (!isValidBdPhone(phone)) {
        return NextResponse.json(
          { error: "সঠিক বাংলাদেশি মোবাইল নাম্বার দিন (01XXXXXXXXX)" },
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
          { error: "এই নম্বরে কোনো অর্ডার পাওয়া যায়নি" },
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
        { error: "ফোন নাম্বার বা অর্ডার নম্বর দিন" },
        { status: 400 }
      );
    }

    const order = await ordersCol.findOne({
      order_number: { $regex: new RegExp(`^${orderNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (!order) {
      return NextResponse.json({ error: "কোনো অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: serializeOrder(order),
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "অর্ডার খুঁজে পাওয়া যায়নি" },
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

    const deliveryResult = validateDeliveryMethod(delivery);
    if (!deliveryResult.ok) {
      return NextResponse.json({ error: deliveryResult.error }, { status: 400 });
    }

    const itemsResult = validateOrderItems(items);
    if (!itemsResult.ok) {
      return NextResponse.json({ error: itemsResult.error }, { status: 400 });
    }

    const productsCol = dbConnect(PRODUCTS_COLLECTION);
    const orderLines = [];
    const stockUpdates = new Map();

    for (const cartItem of items) {
      const objectId = parseObjectId(cartItem._id);
      if (!objectId) {
        return NextResponse.json({ error: "অবৈধ পণ্য আইডি" }, { status: 400 });
      }

      const product = await productsCol.findOne({ _id: objectId });
      if (!product) {
        return NextResponse.json(
          { error: `"${cartItem.title || "পণ্য"}" আর উপলব্ধ নেই` },
          { status: 400 }
        );
      }

      const variantConfig = getProductVariantConfig(product);
      const selectedVariant = String(cartItem.selected_variant || "").trim();

      if (variantConfig.required && !selectedVariant) {
        return NextResponse.json(
          { error: `"${product.title_bn || product.title_en}" — ${variantConfig.label} বেছে নিন` },
          { status: 400 }
        );
      }

      if (selectedVariant && variantConfig.options.length && !variantConfig.options.includes(selectedVariant)) {
        return NextResponse.json(
          { error: `"${product.title_bn || product.title_en}" — অবৈধ ${variantConfig.label}` },
          { status: 400 }
        );
      }

      const stockStatus = product.inventory?.stock_status;
      if (stockStatus === "out_of_stock") {
        return NextResponse.json(
          { error: `"${product.title_bn || product.title_en}" স্টকে নেই` },
          { status: 400 }
        );
      }

      const quantity = Math.floor(Number(cartItem.quantity));
      const maxStock = typeof product.inventory?.quantity === "number" ? product.inventory.quantity : 99;

      const prevQty = stockUpdates.get(cartItem._id) || 0;
      const totalRequested = prevQty + quantity;

      if (totalRequested > maxStock) {
        return NextResponse.json(
          {
            error: `"${product.title_bn || product.title_en}" — সর্বোচ্চ ${maxStock}টি অর্ডার করা যাবে`,
          },
          { status: 400 }
        );
      }

      stockUpdates.set(cartItem._id, totalRequested);

      const salePrice = product.pricing?.sale_price ?? 0;
      const regularPrice = product.pricing?.regular_price ?? salePrice;

      orderLines.push({
        product_id: cartItem._id,
        slug: product.slug,
        title: product.title_bn || product.title_en,
        title_en: product.title_en,
        image: product.images?.[0]?.url || cartItem.image || "",
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
    const deliveryInfo = DELIVERY_OPTIONS[delivery];
    const deliveryCharge = deliveryInfo.charge;
    const total = subtotal + deliveryCharge;

    const now = new Date();
    const orderDoc = {
      order_number: generateOrderNumber(),
      customer: customerResult.values,
      items: orderLines,
      delivery: {
        method: delivery,
        label: deliveryInfo.label,
        charge: deliveryCharge,
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

    const ordersCol = dbConnect(ORDERS_COLLECTION);
    const result = await ordersCol.insertOne(orderDoc);

    for (const [productId, orderedQty] of stockUpdates.entries()) {
      const objectId = parseObjectId(productId);
      if (!objectId) continue;

      await productsCol.updateOne(
        { _id: objectId, "inventory.quantity": { $gte: orderedQty } },
        {
          $inc: { "inventory.quantity": -orderedQty },
          $set: { updatedAt: now },
        }
      );
    }

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
      { error: error.message || "অর্ডার সেভ করা যায়নি" },
      { status: 500 }
    );
  }
}
