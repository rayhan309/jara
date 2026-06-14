import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";

const ORDERS_COLLECTION = "orders";

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
  };
}

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ORDERS);
    if (auth.error) return auth.error;

    const ordersCol = await dbConnect(ORDERS_COLLECTION);
    const list = await ordersCol.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      orders: list.map(serializeOrder),
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
