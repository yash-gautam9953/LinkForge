import crypto from "crypto";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const SESSION_TTL_DAYS = 30;
const DB_NAME = process.env.MONGODB_DB || "url-shortner-db";

function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

export async function hashPassword(password) {
  const safe = String(password || "");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(safe, salt);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(String(password || ""), String(passwordHash || ""));
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection("sessions").insertOne({
    token,
    userId,
    createdAt: new Date(),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions());

  return { token, expiresAt };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection("sessions").deleteOne({ token });
  }

  cookieStore.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const session = await db.collection("sessions").findOne({ token });
  if (!session) return null;

  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    await db.collection("sessions").deleteOne({ token });
    return null;
  }

  const user = await db.collection("users").findOne({ _id: session.userId });
  if (!user) return null;

  return { id: String(user._id), name: user.name };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return user;
}

export async function findOrCreateUser({ name, password }) {
  const normalized = normalizeName(name);
  if (!normalized) {
    return { ok: false, message: "Name is required" };
  }
  if (!password || String(password).length < 4) {
    return { ok: false, message: "Password must be at least 4 characters" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const users = db.collection("users");
  const existing = await users.findOne({ name: normalized });

  if (!existing) {
    const passwordHash = await hashPassword(password);
    const created = await users.insertOne({
      name: normalized,
      passwordHash,
      createdAt: new Date(),
    });
    return {
      ok: true,
      user: { _id: created.insertedId, name: normalized },
      created: true,
    };
  }

  const ok = await verifyPassword(password, existing.passwordHash);
  if (!ok) {
    return { ok: false, message: "Invalid name or password" };
  }

  return {
    ok: true,
    user: { _id: existing._id, name: existing.name },
    created: false,
  };
}
