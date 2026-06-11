import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { DEFAULT_SETTINGS, normalizeSettings, SETTINGS_ID } from "@/lib/siteSettings";

const COLLECTION = "site_settings";

async function getSettingsDocument() {
  const collection = dbConnect(COLLECTION);
  const doc = await collection.findOne({ _id: SETTINGS_ID });
  return normalizeSettings(doc || DEFAULT_SETTINGS);
}

export async function GET() {
  try {
    const settings = await getSettingsDocument();

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
