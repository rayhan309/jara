import { NextResponse } from "next/server";
import { ADMIN_ROLES } from "@/lib/adminRoles";
import { hashPassword } from "@/lib/adminPassword";
import {
  findAdminUserByUsername,
  serializeAdminUser,
  USERS_COLLECTION,
} from "@/lib/adminAuthServer";
import { dbConnect } from "@/lib/dbConnect";
import { parseObjectId } from "@/lib/mongodbHelpers";

export async function listAdminUsers() {
  const collection = await dbConnect(USERS_COLLECTION);
  const users = await collection.find({}).sort({ createdAt: 1 }).toArray();
  return users.map(serializeAdminUser);
}

export async function createAdminUser({ username, password, name, role }) {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  const cleanedName = String(name || normalizedUsername).trim();
  const cleanedRole = String(role || "").trim();

  if (!normalizedUsername || !password) {
    throw new Error("Username and password are required.");
  }

  if (!Object.values(ADMIN_ROLES).includes(cleanedRole)) {
    throw new Error("Invalid role.");
  }

  if (String(password).length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const existing = await findAdminUserByUsername(normalizedUsername);
  if (existing) {
    throw new Error("Username already exists.");
  }

  const now = new Date();
  const collection = await dbConnect(USERS_COLLECTION);
  const doc = {
    username: normalizedUsername,
    name: cleanedName,
    role: cleanedRole,
    passwordHash: hashPassword(password),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return serializeAdminUser({ ...doc, _id: result.insertedId });
}

export async function updateAdminUser(id, updates, actor) {
  const objectId = parseObjectId(id);
  if (!objectId) throw new Error("Invalid user id.");

  const collection = await dbConnect(USERS_COLLECTION);
  const user = await collection.findOne({ _id: objectId });
  if (!user) throw new Error("User not found.");

  const next = {};
  if (updates.name !== undefined) next.name = String(updates.name || user.username).trim();
  if (updates.role !== undefined) {
    if (!Object.values(ADMIN_ROLES).includes(updates.role)) {
      throw new Error("Invalid role.");
    }
    next.role = updates.role;
  }
  if (updates.active !== undefined) next.active = Boolean(updates.active);
  if (updates.password) {
    if (String(updates.password).length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    next.passwordHash = hashPassword(updates.password);
  }

  if (user.role === ADMIN_ROLES.SUPER_ADMIN && next.active === false) {
    const superAdminCount = await collection.countDocuments({
      role: ADMIN_ROLES.SUPER_ADMIN,
      active: { $ne: false },
    });
    if (superAdminCount <= 1) {
      throw new Error("At least one active super admin is required.");
    }
  }

  if (user.role === ADMIN_ROLES.SUPER_ADMIN && next.role && next.role !== ADMIN_ROLES.SUPER_ADMIN) {
    const superAdminCount = await collection.countDocuments({
      role: ADMIN_ROLES.SUPER_ADMIN,
      active: { $ne: false },
    });
    if (superAdminCount <= 1) {
      throw new Error("Cannot change role of the only super admin.");
    }
  }

  if (actor?.userId === user._id.toString() && next.active === false) {
    throw new Error("You cannot deactivate your own account.");
  }

  next.updatedAt = new Date();
  await collection.updateOne({ _id: objectId }, { $set: next });
  const updated = await collection.findOne({ _id: objectId });
  return serializeAdminUser(updated);
}

export async function deleteAdminUser(id, actor) {
  const objectId = parseObjectId(id);
  if (!objectId) throw new Error("Invalid user id.");

  const collection = await dbConnect(USERS_COLLECTION);
  const user = await collection.findOne({ _id: objectId });
  if (!user) throw new Error("User not found.");

  if (actor?.userId === user._id.toString()) {
    throw new Error("You cannot delete your own account.");
  }

  if (user.role === ADMIN_ROLES.SUPER_ADMIN) {
    const superAdminCount = await collection.countDocuments({
      role: ADMIN_ROLES.SUPER_ADMIN,
      active: { $ne: false },
    });
    if (superAdminCount <= 1) {
      throw new Error("Cannot delete the only super admin.");
    }
  }

  await collection.deleteOne({ _id: objectId });
  return user._id.toString();
}
