import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";

export default async function Page({ params }) {
  const { shortUrl } = await params;

  const client = await clientPromise;
  const db = client.db("url-shortner-db");
  const collection = db.collection("urls");

  const docs = await collection.findOne({ shortUrl });

  if (docs?.url) {
    redirect(docs.url);
  }

  // If the slug doesn't exist, go back home instead of redirecting to an env var
  // (which can be undefined and cause /undefined redirect loops).
  redirect("/");
  return <div>My Post: {shortUrl}</div>;
}
