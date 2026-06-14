import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import { serializeCategory, sortCategoriesList } from "@/lib/categorySort";
import { parseObjectId } from "@/lib/mongodbHelpers";

const COLLECTION = "categories";

export async function PATCH(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const body = await request.json();
    const orderedIds = body?.orderedIds;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds array is required." }, { status: 400 });
    }

    const objectIds = orderedIds.map((id) => parseObjectId(id)).filter(Boolean);

    if (objectIds.length !== orderedIds.length) {
      return NextResponse.json({ error: "Invalid category id in order list." }, { status: 400 });
    }

    const categories = await dbConnect(COLLECTION);
    const now = new Date();

    const operations = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: parseObjectId(id) },
        update: { $set: { sort_order: index, updatedAt: now } },
      },
    }));

    await categories.bulkWrite(operations);

    const list = await categories.find({}).toArray();

    return NextResponse.json({
      success: true,
      categories: sortCategoriesList(list).map(serializeCategory),
    });
  } catch (error) {
    console.error("PATCH /api/categories/reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder categories." }, { status: 500 });
  }
}
