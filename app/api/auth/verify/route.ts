import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?verify=invalid", url.origin));
  }
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const result = await client.mutation(api.users.verifyEmail, { token });
    if (!result.ok) {
      return NextResponse.redirect(new URL(`/login?verify=${result.reason}`, url.origin));
    }
    const target = new URL("/login", url.origin);
    target.searchParams.set("verified", "1");
    target.searchParams.set("email", result.email);
    return NextResponse.redirect(target);
  } catch {
    return NextResponse.redirect(new URL("/login?verify=error", url.origin));
  }
}
