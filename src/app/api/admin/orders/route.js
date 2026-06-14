import { NextResponse } from "next/server";
import { getAdminOrders } from "@/lib/adminOrdersServer";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ORDERS);
    if (auth.error) return auth.error;

    const orders = await getAdminOrders();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
