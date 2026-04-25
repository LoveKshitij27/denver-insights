import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  };
  const { email, firstName, lastName, password } = body;
  if (
    typeof email !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    await client.action(api.auth.signup, { email, firstName, lastName, password });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message =
      e instanceof Error ? e.message.replace(/^\[.*?\]\s*/, "") : "Signup failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
