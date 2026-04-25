"use client";

import { useMutation } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "@/convex/_generated/api";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; alreadyJoined: boolean }
  | { kind: "error"; message: string };

export default function WaitlistForm() {
  const join = useMutation(api.waitlist.join);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status.kind === "submitting") return;
    setStatus({ kind: "submitting" });
    try {
      const result = await join({ email });
      setStatus({ kind: "success", alreadyJoined: result.alreadyJoined });
      setEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : "Something went wrong.";
      setStatus({ kind: "error", message });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-blue-900">
          {status.alreadyJoined
            ? "You're already on the list. We'll be in touch."
            : "You're in. We'll email you when Denver Insights is ready."}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="h-12 flex-1 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
          disabled={status.kind === "submitting"}
        />
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="h-12 rounded-lg bg-blue-700 px-6 text-base font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
        >
          {status.kind === "submitting" ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {status.kind === "error" && (
        <p className="mt-3 text-sm text-red-600">{status.message}</p>
      )}
    </form>
  );
}
