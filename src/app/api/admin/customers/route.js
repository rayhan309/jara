import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { getAdminCustomers } from "@/lib/customersServer";

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.CUSTOMERS);
    if (auth.error) return auth.error;

    const data = await getAdminCustomers();

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers." }, { status: 500 });
  }
}
