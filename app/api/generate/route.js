import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { success: false, error: true, message: "Unauthorized" },
      { status: 401 },
    );
  }
  const body = await request.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "url-shortner-db");
  const collection = db.collection("urls");

  if (!body?.url || !body?.shortUrl) {
    return Response.json(
      { success: false, error: true, message: "Missing url or shortUrl" },
      { status: 400 },
    );
  }

  const docs = await collection.findOne({ shortUrl: body.shortUrl });

  if (docs) {
    return Response.json(
      { success: false, error: true, message: "URL already exists" },
      { status: 409 },
    );
  }

  await collection.insertOne({
    userId: user.id,
    url: body.url,
    shortUrl: body.shortUrl,
    createdAt: new Date(),
  });

  return Response.json({
    success: true,
    error: false,
    message: "Request Finished Successfully",
  });
}
