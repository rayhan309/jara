import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { createAdminUser, listAdminUsers } from "@/lib/adminUsersServer";

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.USERS);
    if (auth.error) return auth.error;

    const users = await listAdminUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.USERS);
    if (auth.error) return auth.error;

    const body = await request.json();
    const user = await createAdminUser(body);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user." }, { status: 400 });
  }
}
