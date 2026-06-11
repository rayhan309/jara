import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { DELIVERY_OPTIONS, validateCustomerDetails } from "@/lib/orderValidation";
import { parseObjectId } from "@/lib/mongodbHelpers";
import { ALL_VALID_ORDER_STATUSES } from "@/lib/orderHelpers";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
  };
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const ordersCol = dbConnect(ORDERS_COLLECTION);
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
    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const body = await request.json();
    const { status, customer, delivery } = body;

    const ordersCol = dbConnect(ORDERS_COLLECTION);
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
      updates.customer = customerResult.values;
    }

    if (delivery?.method) {
      const deliveryInfo = DELIVERY_OPTIONS[delivery.method];
      if (!deliveryInfo) {
        return NextResponse.json({ error: "Invalid delivery method." }, { status: 400 });
      }

      const subtotal = existing.pricing?.subtotal ?? 0;
      updates.delivery = {
        method: delivery.method,
        label: deliveryInfo.label,
        charge: deliveryInfo.charge,
      };
      updates.pricing = {
        ...existing.pricing,
        delivery_charge: deliveryInfo.charge,
        total: subtotal + deliveryInfo.charge,
      };
    }

    await ordersCol.updateOne({ _id: objectId }, { $set: updates });
    const order = await ordersCol.findOne({ _id: objectId });

    return NextResponse.json({ success: true, order: serializeOrder(order) });
  } catch (error) {
    console.error("PUT /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const ordersCol = dbConnect(ORDERS_COLLECTION);
    const productsCol = dbConnect(PRODUCTS_COLLECTION);
    const order = await ordersCol.findOne({ _id: objectId });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    for (const item of order.items || []) {
      const productId = parseObjectId(item.product_id);
      if (!productId) continue;

      await productsCol.updateOne(
        { _id: productId },
        {
          $inc: { "inventory.quantity": item.quantity },
          $set: { updatedAt: new Date() },
        }
      );
    }

    await ordersCol.deleteOne({ _id: objectId });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete order." }, { status: 500 });
  }
}
