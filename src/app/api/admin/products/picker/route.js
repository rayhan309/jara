import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { searchProductsForPicker } from "@/lib/productsServer";

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ORDERS);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 30);
    const products = await searchProductsForPicker(search, limit);

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/admin/products/picker error:", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}
