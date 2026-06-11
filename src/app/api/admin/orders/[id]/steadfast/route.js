import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { parseObjectId } from "@/lib/mongodbHelpers";
import { createSteadfastOrder } from "@/lib/steadfastCourier";

const ORDERS_COLLECTION = "orders";

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
  };
}

export async function POST(_request, { params }) {
  try {
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

    if (order.steadfast?.tracking_code || order.steadfast?.consignment_id) {
      return NextResponse.json(
        {
          error: "Order already sent to Steadfast.",
          order: serializeOrder(order),
        },
        { status: 409 }
      );
    }

    const result = await createSteadfastOrder({ ...order, _id: order._id.toString() });
    const now = new Date();

    const steadfast = {
      ...result.consignment,
      sent_at: now,
    };

    await ordersCol.updateOne(
      { _id: objectId },
      {
        $set: {
          status: "steadfast_entered",
          steadfast,
          updatedAt: now,
        },
      }
    );

    const updated = await ordersCol.findOne({ _id: objectId });

    return NextResponse.json({
      success: true,
      message: "Order sent to Steadfast successfully.",
      steadfast: result.consignment,
      order: serializeOrder(updated),
    });
  } catch (error) {
    console.error("POST /api/admin/orders/[id]/steadfast error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send order to Steadfast." },
      { status: 500 }
    );
  }
}
