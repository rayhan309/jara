import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import { parseObjectId } from "@/lib/mongodbHelpers";
import {
  CLIENT_REVIEWS_COLLECTION,
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

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.SETTINGS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid review id." }, { status: 400 });
    }

    const body = await request.json();
    const payload = normalizePayload(body);

    if (!payload.name) {
      return NextResponse.json({ error: "Client name is required." }, { status: 400 });
    }
    if (!payload.quote) {
      return NextResponse.json({ error: "Review text is required." }, { status: 400 });
    }

    const collection = await dbConnect(CLIENT_REVIEWS_COLLECTION);
    const existing = await collection.findOne({ _id: objectId });
    if (!existing) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    const updatedAt = new Date();
    const updateDoc = { ...payload, updatedAt };
    await collection.updateOne({ _id: objectId }, { $set: updateDoc });
    revalidateClientReviewsCache();

    return NextResponse.json({
      success: true,
      review: serializeClientReview({ ...existing, ...updateDoc, _id: objectId }),
    });
  } catch (error) {
    console.error("PUT /api/admin/reviews/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update review." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.SETTINGS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid review id." }, { status: 400 });
    }

    const collection = await dbConnect(CLIENT_REVIEWS_COLLECTION);
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    revalidateClientReviewsCache();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete review." }, { status: 500 });
  }
}
