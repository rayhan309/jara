import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { normalizeSettings, SETTINGS_ID } from "@/lib/siteSettings";
import { getSiteSettings } from "@/lib/siteSettingsServer";

const COLLECTION = "site_settings";

export async function GET() {
  try {
    const settings = await getSiteSettings();

    return NextResponse.json({
      success: true,
      settings,
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
    const body = await request.json();
    const settings = normalizeSettings({
      primaryColor: body.primaryColor,
      heroBanners: body.heroBanners,
      socialLinks: body.socialLinks,
    });

    const collection = dbConnect(COLLECTION);
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
      settings,
    });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings." },
      { status: 500 }
    );
  }
}
