import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import {
  buildAttributeSlug,
  ensureUniqueAttributeSlug,
  getFreshProductAttributes,
  revalidateProductAttributesCache,
  serializeProductAttribute,
} from "@/lib/productAttributesServer";

const COLLECTION = "product_attributes";

export async function GET(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const attributes = await getFreshProductAttributes();
    return NextResponse.json({ success: true, attributes });
  } catch (error) {
    console.error("GET /api/admin/product-attributes error:", error);
    return NextResponse.json({ error: "Failed to fetch attributes." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const body = await request.json();
    const name = String(body.name || "").trim();
    const nameBn = String(body.name_bn || name).trim();
    const slugInput = String(body.slug || "").trim();
    const placeholder = String(body.placeholder || "").trim();
    const sortOrder = Number(body.sort_order ?? 0);

    if (!name) {
      return NextResponse.json({ error: "Attribute name is required." }, { status: 400 });
    }

    const collection = await dbConnect(COLLECTION);
    const baseSlug = buildAttributeSlug(slugInput || name);
    if (!baseSlug) {
      return NextResponse.json({ error: "A valid slug could not be generated." }, { status: 400 });
    }

    const slug = await ensureUniqueAttributeSlug(collection, baseSlug);
    const now = new Date();

    const doc = {
      name,
      name_bn: nameBn,
      slug,
      placeholder,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);
    revalidateProductAttributesCache();

    return NextResponse.json(
      { success: true, attribute: serializeProductAttribute({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/product-attributes error:", error);
    return NextResponse.json({ error: error.message || "Failed to create attribute." }, { status: 500 });
  }
}
