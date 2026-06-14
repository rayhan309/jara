import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import { parseObjectId } from "@/lib/mongodbHelpers";
import {
  buildAttributeSlug,
  ensureUniqueAttributeSlug,
  revalidateProductAttributesCache,
  serializeProductAttribute,
} from "@/lib/productAttributesServer";

const COLLECTION = "product_attributes";

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid attribute id." }, { status: 400 });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const nameBn = String(body.name_bn || name).trim();
    const slugInput = String(body.slug || "").trim();
    const placeholder = String(body.placeholder || "").trim();
    const sortOrder = Number(body.sort_order ?? 0);
    const active = body.active !== false;

    if (!name) {
      return NextResponse.json({ error: "Attribute name is required." }, { status: 400 });
    }

    const collection = await dbConnect(COLLECTION);
    const existing = await collection.findOne({ _id: objectId });
    if (!existing) {
      return NextResponse.json({ error: "Attribute not found." }, { status: 404 });
    }

    const baseSlug = buildAttributeSlug(slugInput || name);
    const slug = await ensureUniqueAttributeSlug(collection, baseSlug, objectId);
    const updatedAt = new Date();

    const updateDoc = {
      name,
      name_bn: nameBn,
      slug,
      placeholder,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      active,
      updatedAt,
    };

    await collection.updateOne({ _id: objectId }, { $set: updateDoc });
    revalidateProductAttributesCache();

    return NextResponse.json({
      success: true,
      attribute: serializeProductAttribute({ ...existing, ...updateDoc, _id: objectId }),
    });
  } catch (error) {
    console.error("PUT /api/admin/product-attributes/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update attribute." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid attribute id." }, { status: 400 });
    }

    const collection = await dbConnect(COLLECTION);
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Attribute not found." }, { status: 404 });
    }

    revalidateProductAttributesCache();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/admin/product-attributes/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete attribute." }, { status: 500 });
  }
}
