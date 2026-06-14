import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { deleteAdminUser, updateAdminUser } from "@/lib/adminUsersServer";

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.USERS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const user = await updateAdminUser(id, body, auth.session);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.USERS);
    if (auth.error) return auth.error;

    const { id } = await params;
    await deleteAdminUser(id, auth.session);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user." }, { status: 400 });
  }
}
