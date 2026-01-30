import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "url-shortner-db");

  const urls = await db
    .collection("urls")
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return NextResponse.json({
    success: true,
    urls: urls.map((u) => ({
      id: String(u._id),
      url: u.url,
      shortUrl: u.shortUrl,
      createdAt: u.createdAt || null,
    })),
  });
}
