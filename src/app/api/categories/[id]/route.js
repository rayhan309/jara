import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/adminAuthServer";
import { PERMISSIONS } from "@/lib/adminRoles";
import { dbConnect } from "@/lib/dbConnect";
import imagekit from "@/lib/imagekit";
import { ensureUniqueSlug, parseObjectId } from "@/lib/mongodbHelpers";
import { slugify } from "@/lib/slugify";

const COLLECTION = "categories";

function getImageKitConfigError() {
  if (
    !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  ) {
    return "ImageKit credentials are not configured on the server.";
  }
  return null;
}

function serializeCategory(category) {
  return {
    ...category,
    _id: category._id.toString(),
  };
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);

    if (!objectId) {
      return NextResponse.json({ error: "Invalid category id." }, { status: 400 });
    }

    const categories = await dbConnect(COLLECTION);
    const existing = await categories.findOne({ _id: objectId });

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const image = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const baseSlug = slugify(slugInput || name);
    if (!baseSlug) {
      return NextResponse.json({ error: "A valid slug could not be generated." }, { status: 400 });
    }

    let imageData = existing.image;

    if (image && typeof image !== "string") {
      if (!image.type?.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
      }

      const imageKitError = getImageKitConfigError();
      if (imageKitError) {
        return NextResponse.json({ error: imageKitError }, { status: 500 });
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: image.name || `${baseSlug}.jpg`,
        folder: "/nexa/categories",
        useUniqueFileName: true,
      });

      imageData = {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        name: uploadResponse.name,
      };
    }

    const slug = await ensureUniqueSlug(categories, baseSlug, id);
    const updatedAt = new Date();

    await categories.updateOne(
      { _id: objectId },
      {
        $set: {
          name,
          slug,
          description,
          image: imageData,
          updatedAt,
        },
      }
    );

    const updated = await categories.findOne({ _id: objectId });

    return NextResponse.json({
      success: true,
      category: serializeCategory(updated),
    });
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminPermission(request, PERMISSIONS.PRODUCTS);
    if (auth.error) return auth.error;

    const { id } = await params;
    const objectId = parseObjectId(id);

    if (!objectId) {
      return NextResponse.json({ error: "Invalid category id." }, { status: 400 });
    }

    const categories = await dbConnect(COLLECTION);
    const result = await categories.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category." },
      { status: 500 }
    );
  }
}
