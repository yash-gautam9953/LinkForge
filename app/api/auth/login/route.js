import { NextResponse } from "next/server";
import { createSession, findOrCreateUser } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = body?.name;
  const password = body?.password;

  const result = await findOrCreateUser({ name, password });
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message || "Login failed" },
      { status: 400 },
    );
  }

  await createSession(result.user._id);

  return NextResponse.json({
    success: true,
    created: result.created,
    user: { name: result.user.name },
    message: result.created ? "Account created & logged in." : "Logged in.",
  });
}
