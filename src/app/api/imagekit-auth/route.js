import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import imagekit from "@/lib/imagekit";

export async function GET(request) {
  const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
  if (auth.error) return auth.error;

  if (
    !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  ) {
    return NextResponse.json(
      { error: "ImageKit credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const authenticationParameters = imagekit.getAuthenticationParameters();
  return NextResponse.json(authenticationParameters);
}
