import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import {
  CLIENT_REVIEWS_COLLECTION,
  getFreshClientReviews,
  revalidateClientReviewsCache,
  serializeClientReview,
} from "@/lib/clientReviewsServer";

function normalizePayload(body) {
  const name = String(body.name || "").trim();
  const location = String(body.location || "").trim();
  const quote = String(body.quote || "").trim();
  const rating = Number(body.rating ?? 5);
  const sortOrder = Number(body.sort_order ?? 0);
  const active = body.active !== false && body.active !== "false";

  return {
    name,
    location,
    quote,
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active,
  };
}

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.SETTINGS);
    if (auth.error) return auth.error;

    const reviews = await getFreshClientReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.SETTINGS);
    if (auth.error) return auth.error;

    const body = await request.json();
    const payload = normalizePayload(body);

    if (!payload.name) {
      return NextResponse.json({ error: "Client name is required." }, { status: 400 });
    }
    if (!payload.quote) {
      return NextResponse.json({ error: "Review text is required." }, { status: 400 });
    }

    const collection = await dbConnect(CLIENT_REVIEWS_COLLECTION);
    const now = new Date();
    const doc = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);
    revalidateClientReviewsCache();

    return NextResponse.json(
      { success: true, review: serializeClientReview({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/reviews error:", error);
    return NextResponse.json({ error: error.message || "Failed to create review." }, { status: 500 });
  }
}
