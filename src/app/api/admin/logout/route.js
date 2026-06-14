import { NextResponse } from "next/server";
import {
  clearAdminSessionCookie,
  deleteAdminSession,
  getAdminSessionFromRequest,
} from "@/lib/adminAuthServer";

export async function POST(request) {
  try {
    const session = await getAdminSessionFromRequest(request);
    if (session?.token) {
      await deleteAdminSession(session.token);
    }

    const response = NextResponse.json({ success: true });
    clearAdminSessionCookie(response);
    return response;
  } catch (error) {
    console.error("POST /api/admin/logout error:", error);
    const response = NextResponse.json({ success: true });
    clearAdminSessionCookie(response);
    return response;
  }
}
