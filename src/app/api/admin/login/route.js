import { NextResponse } from "next/server";
import {
  authenticateAdminUser,
  createAdminSession,
  serializeAdminUser,
  setAdminSessionCookie,
} from "@/lib/adminAuthServer";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const user = await authenticateAdminUser(username, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const { token } = await createAdminSession(user);
    const payload = serializeAdminUser(user);

    const response = NextResponse.json({
      success: true,
      ...payload,
    });

    setAdminSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
