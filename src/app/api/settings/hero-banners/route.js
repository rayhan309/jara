import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import imagekit, { getImageKitConfigError } from "@/lib/imagekit";

export async function POST(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.SETTINGS);
    if (auth.error) return auth.error;

    const imageKitError = getImageKitConfigError();
    if (imageKitError) {
      return NextResponse.json({ error: imageKitError }, { status: 500 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return NextResponse.json({ error: "Banner image is required." }, { status: 400 });
    }

    if (!image.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name || `hero-banner-${Date.now()}.jpg`,
      folder: "/nexa/hero-banners",
      useUniqueFileName: true,
    });

    return NextResponse.json({
      success: true,
      image: {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        name: uploadResponse.name,
      },
    });
  } catch (error) {
    console.error("POST /api/settings/hero-banners error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload banner." },
      { status: 500 }
    );
  }
}
