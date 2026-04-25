import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const COOKIE_NAME = "denver_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as {
    email?: string;
    password?: string;
  };
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const { sessionToken } = await client.action(api.auth.login, { email, password });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  } catch (e) {
    const message =
      e instanceof Error ? e.message.replace(/^\[.*?\]\s*/, "") : "Login failed.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
