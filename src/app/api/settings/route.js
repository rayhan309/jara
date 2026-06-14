import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import { normalizeSettings, sanitizePublicSettings, SETTINGS_ID } from "@/lib/siteSettings";
import { getSiteSettings } from "@/lib/siteSettingsServer";

const COLLECTION = "site_settings";

export async function GET() {
  try {
    const settings = await getSiteSettings();

    return NextResponse.json({
      success: true,
      settings: sanitizePublicSettings(settings),
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.SETTINGS);
    if (auth.error) return auth.error;

    const body = await request.json();
    const collection = await dbConnect(COLLECTION);
    const existing = await collection.findOne({ _id: SETTINGS_ID });
    const steadfastSecretKey = String(body.steadfastSecretKey || "").trim()
      ? String(body.steadfastSecretKey).trim()
      : String(existing?.steadfastSecretKey || "").trim();
    const steadfastApiKey = String(body.steadfastApiKey ?? existing?.steadfastApiKey ?? "").trim();
    const steadfastBaseUrl = body.steadfastBaseUrl ?? existing?.steadfastBaseUrl;
    const steadfastEnabled =
      body.steadfastEnabled !== undefined
        ? body.steadfastEnabled
        : existing?.steadfastEnabled;

    const settings = normalizeSettings({
      primaryColor: body.primaryColor,
      metaPixelId: body.metaPixelId,
      metaPixelEnabled: body.metaPixelEnabled,
      steadfastBaseUrl,
      steadfastApiKey,
      steadfastSecretKey,
      steadfastEnabled,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      contactAddress: body.contactAddress,
      heroBanners: body.heroBanners,
      socialLinks: body.socialLinks,
    });

    const now = new Date();

    await collection.updateOne(
      { _id: SETTINGS_ID },
      {
        $set: {
          ...settings,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    revalidateTag("site-settings");

    return NextResponse.json({
      success: true,
      settings: sanitizePublicSettings(settings),
    });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings." },
      { status: 500 }
    );
  }
}
