import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import imagekit, { getImageKitConfigError } from "@/lib/imagekit";

const ALLOWED_TYPES = new Set(["logo", "favicon"]);

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
    const assetType = String(formData.get("type") || "logo").trim().toLowerCase();

    if (!ALLOWED_TYPES.has(assetType)) {
      return NextResponse.json({ error: "Invalid asset type." }, { status: 400 });
    }

    if (!image || typeof image === "string") {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!image.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name || `${assetType}-${Date.now()}.png`,
      folder: `/raisas_glam_nest/brand/${assetType}`,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      success: true,
      asset: {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        name: uploadResponse.name,
      },
    });
  } catch (error) {
    console.error("POST /api/settings/brand-assets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload brand asset." },
      { status: 500 }
    );
  }
}
