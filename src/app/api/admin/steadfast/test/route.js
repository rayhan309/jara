import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import { SETTINGS_ID } from "@/lib/siteSettings";
import { testSteadfastConnection } from "@/lib/steadfastCourier";

const COLLECTION = "site_settings";

export async function POST(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.SETTINGS);
    if (auth.error) return auth.error;

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const apiKey = String(body.apiKey || "").trim();
    const secretKeyInput = String(body.secretKey || "").trim();
    const baseUrl = String(body.baseUrl || "").trim();

    let configOverride = null;

    if (apiKey) {
      const collection = await dbConnect(COLLECTION);
      const existing = await collection.findOne({ _id: SETTINGS_ID });
      const existingApiKey = String(existing?.steadfastApiKey || "").trim();
      let secretKey = secretKeyInput;

      if (!secretKey) {
        if (existingApiKey && existingApiKey !== apiKey) {
          return NextResponse.json(
            { error: "নতুন API Key টেস্ট করতে Secret Key দিন।" },
            { status: 400 }
          );
        }
        secretKey = String(existing?.steadfastSecretKey || "").trim();
      }

      if (!secretKey) {
        return NextResponse.json(
          { error: "Secret Key দিন অথবা আগে Save করুন।" },
          { status: 400 }
        );
      }

      configOverride = { baseUrl, apiKey, secretKey };
    }

    const data = await testSteadfastConnection(configOverride);
    const balance = data?.current_balance ?? data?.balance ?? data?.data?.current_balance;

    return NextResponse.json({
      success: true,
      message: balance != null ? `Connection OK — Balance: ৳${balance}` : "Connection OK",
      balance,
    });
  } catch (error) {
    console.error("POST /api/admin/steadfast/test error:", error);
    return NextResponse.json(
      { error: error.message || "Steadfast connection failed." },
      { status: 500 }
    );
  }
}
