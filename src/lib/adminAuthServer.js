import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { hasPermission } from "@/lib/adminRoles";
import { hashPassword, verifyPassword } from "@/lib/adminPassword";
import { parseObjectId } from "@/lib/mongodbHelpers";

export const ADMIN_SESSION_COOKIE = "nexa_admin_session";
export const USERS_COLLECTION = "admin_users";
export const SESSIONS_COLLECTION = "admin_sessions";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function serializeAdminUser(user) {
  return {
    _id: user._id.toString(),
    username: user.username,
    name: user.name || user.username,
    role: user.role,
    active: user.active !== false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}


export async function findAdminUserByUsername(username) {
  const collection = await dbConnect(USERS_COLLECTION);
  return collection.findOne({ username: String(username || "").trim().toLowerCase() });
}

export async function findAdminUserById(id) {
  const objectId = parseObjectId(id);
  if (!objectId) return null;
  const collection = await dbConnect(USERS_COLLECTION);
  return collection.findOne({ _id: objectId });
}

export async function ensureEnvSuperAdmin(username, password) {
  const envUsername = String(process.env.ADMINUSERNAME || "").trim().toLowerCase();
  const envPassword = String(process.env.ADMINPASS || "");

  if (!envUsername || !envPassword) return null;
  if (String(username).trim().toLowerCase() !== envUsername) return null;
  if (password !== envPassword) return null;

  const collection = await dbConnect(USERS_COLLECTION);
  const now = new Date();
  const existing = await collection.findOne({ username: envUsername });

  if (existing) {
    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          role: "super_admin",
          active: true,
          updatedAt: now,
        },
      }
    );
    return collection.findOne({ _id: existing._id });
  }

  const doc = {
    username: envUsername,
    name: "Super Admin",
    role: "super_admin",
    passwordHash: hashPassword(envPassword),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function authenticateAdminUser(username, password) {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  if (!normalizedUsername || !password) return null;

  let user = await findAdminUserByUsername(normalizedUsername);

  if (!user) {
    user = await ensureEnvSuperAdmin(normalizedUsername, password);
  }

  if (!user || user.active === false) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  return user;
}

export async function createAdminSession(user) {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  const collection = await dbConnect(SESSIONS_COLLECTION);
  await collection.insertOne({
    token,
    userId: user._id,
    role: user.role,
    username: user.username,
    expiresAt,
    createdAt: now,
  });

  return { token, expiresAt };
}

export async function deleteAdminSession(token) {
  if (!token) return;
  const collection = await dbConnect(SESSIONS_COLLECTION);
  await collection.deleteOne({ token });
}

async function resolveAdminSession(token) {
  if (!token) return null;

  const sessionsCol = await dbConnect(SESSIONS_COLLECTION);
  const session = await sessionsCol.findOne({ token });
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await sessionsCol.deleteOne({ token });
    return null;
  }

  const user = await findAdminUserById(session.userId);
  if (!user || user.active === false) {
    await sessionsCol.deleteOne({ token });
    return null;
  }

  return {
    token,
    userId: user._id.toString(),
    username: user.username,
    name: user.name || user.username,
    role: user.role,
    user,
  };
}

export async function getAdminSessionFromRequest(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return resolveAdminSession(token);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return resolveAdminSession(token);
}

export function setAdminSessionCookie(response, token) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearAdminSessionCookie(response) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAdminPermission(request, permission) {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (permission && !hasPermission(session.role, permission)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}
