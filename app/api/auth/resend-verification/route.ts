import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    await client.action(api.auth.resendVerification, { email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message =
      e instanceof Error ? e.message.replace(/^\[.*?\]\s*/, "") : "Failed to resend.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
