import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { getDashboardSummary } from "@/lib/dashboardSummaryServer";

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.OVERVIEW);
    if (auth.error) return auth.error;

    const summary = await getDashboardSummary();

    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error("GET /api/admin/dashboard/summary error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard summary." }, { status: 500 });
  }
}
