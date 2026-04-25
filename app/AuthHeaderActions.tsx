import { cookies } from "next/headers";
import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import LogoutButton from "./LogoutButton";

const COOKIE_NAME = "denver_session";

export default async function AuthHeaderActions() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  let user: { firstName: string } | null = null;
  if (token && process.env.NEXT_PUBLIC_CONVEX_URL) {
    try {
      const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
      user = await client.query(api.users.bySessionToken, { token });
    } catch {
      user = null;
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-zinc-600 sm:inline">
          Hi, {user.firstName}
        </span>
        <Link
          href="/access"
          className="inline-flex h-10 items-center rounded-lg bg-blue-700 px-5 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Access Denver
        </Link>
        <LogoutButton />
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex h-10 items-center rounded-lg bg-blue-700 px-5 text-sm font-medium text-white transition hover:bg-blue-800"
    >
      Signup/Login
    </Link>
  );
}
