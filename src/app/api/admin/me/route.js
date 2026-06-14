import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/adminPassword";
import {
  requireAdminPermission,
  serializeAdminUser,
  USERS_COLLECTION,
} from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ACCOUNT);
    if (auth.error) return auth.error;

    return NextResponse.json({
      success: true,
      user: serializeAdminUser(auth.session.user),
    });
  } catch (error) {
    console.error("GET /api/admin/me error:", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.ACCOUNT);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;
    const collection = await dbConnect(USERS_COLLECTION);
    const user = auth.session.user;
    const updates = { updatedAt: new Date() };

    if (name !== undefined) {
      updates.name = String(name || user.username).trim();
    }

    if (newPassword) {
      if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash)) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      if (String(newPassword).length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters." },
          { status: 400 }
        );
      }
      updates.passwordHash = hashPassword(newPassword);
    }

    await collection.updateOne({ _id: user._id }, { $set: updates });
    const updated = await collection.findOne({ _id: user._id });

    return NextResponse.json({
      success: true,
      user: serializeAdminUser(updated),
    });
  } catch (error) {
    console.error("PUT /api/admin/me error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile." }, { status: 500 });
  }
}
