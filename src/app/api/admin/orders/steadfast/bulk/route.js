import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
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

export async function POST(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ORDERS);
    if (auth.error) return auth.error;

    const body = await request.json();
    const orderIds = Array.isArray(body?.orderIds) ? body.orderIds : [];

    if (!orderIds.length) {
      return NextResponse.json({ error: "No orders selected." }, { status: 400 });
    }

    const ordersCol = await dbConnect(ORDERS_COLLECTION);
    const results = [];

    for (const rawId of orderIds) {
      const objectId = parseObjectId(rawId);

      if (!objectId) {
        results.push({ id: rawId, success: false, error: "Invalid order id." });
        continue;
      }

      const order = await ordersCol.findOne({ _id: objectId });

      if (!order) {
        results.push({ id: rawId, success: false, error: "Order not found." });
        continue;
      }

      if (order.steadfast?.tracking_code || order.steadfast?.consignment_id) {
        results.push({
          id: rawId,
          success: false,
          error: "Already sent to Steadfast.",
          order: serializeOrder(order),
        });
        continue;
      }

      try {
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

        results.push({
          id: rawId,
          success: true,
          steadfast: result.consignment,
          order: serializeOrder(updated),
        });
      } catch (error) {
        results.push({
          id: rawId,
          success: false,
          error: error.message || "Failed to send order.",
        });
      }
    }

    const successCount = results.filter((entry) => entry.success).length;
    const failedCount = results.length - successCount;

    return NextResponse.json({
      success: failedCount === 0,
      successCount,
      failedCount,
      results,
    });
  } catch (error) {
    console.error("POST /api/admin/orders/steadfast/bulk error:", error);
    return NextResponse.json(
      { error: error.message || "Bulk Steadfast request failed." },
      { status: 500 }
    );
  }
}
