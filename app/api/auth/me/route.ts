import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const COOKIE_NAME = "denver_session";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const user = await client.query(api.users.bySessionToken, { token });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
