"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Step =
  | { kind: "email" }
  | { kind: "password"; email: string }
  | { kind: "signup"; email: string }
  | { kind: "unverified"; email: string }
  | { kind: "verify-sent"; email: string };

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/access";
  const verified = params.get("verified") === "1";
  const verifyError = params.get("verify");
  const prefilledEmail = params.get("email") || "";

  const [step, setStep] = useState<Step>(
    verified && prefilledEmail
      ? { kind: "password", email: prefilledEmail }
      : { kind: "email" },
  );
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(
    verified ? "Email verified. Please log in." : null,
  );

  useEffect(() => {
    if (verifyError && verifyError !== "1") {
      const map: Record<string, string> = {
        invalid: "That verification link is invalid.",
        expired: "That verification link has expired. Please sign up again.",
        error: "Something went wrong while verifying. Please try again.",
      };
      setError(map[verifyError] ?? "Verification failed.");
    }
  }, [verifyError]);

  const signupReady = useMemo(
    () =>
      step.kind === "signup" &&
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      password !== "" &&
      confirmPassword !== "",
    [step.kind, firstName, lastName, password, confirmPassword],
  );

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBanner(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed.");
      if (data.exists && data.verified) {
        setStep({ kind: "password", email });
      } else if (data.exists && !data.verified) {
        setStep({ kind: "unverified", email });
      } else {
        setStep({ kind: "signup", email });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login failed.");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Signup failed.");
      setStep({ kind: "verify-sent", email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendVerification() {
    setSubmitting(true);
    setError(null);
    try {
      // Trigger an idempotent resend via the signup pathway is tricky;
      // call the dedicated check-email which does nothing destructive,
      // then go through verify-sent UX again — for now just re-show the message.
      // (Resend is wired through Convex action; expose via /api/auth/resend if needed.)
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep({ kind: "verify-sent", email });
    } catch {
      setError("Could not resend verification email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.18em] text-blue-700"
          >
            Denver Insights
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {step.kind === "email" && (
            <form onSubmit={submitEmail} className="flex flex-col gap-5">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  Sign in or create an account
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                  Enter your email to continue.
                </p>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
              {banner && (
                <p className="text-sm text-emerald-700">{banner}</p>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-lg bg-blue-700 px-5 text-base font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                {submitting ? "Checking…" : "Continue"}
              </button>
            </form>
          )}

          {step.kind === "password" && (
            <form onSubmit={submitPassword} className="flex flex-col gap-5">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                  Logging in as <span className="font-medium">{step.email}</span>.{" "}
                  <button
                    type="button"
                    onClick={() => setStep({ kind: "email" })}
                    className="text-blue-700 hover:underline"
                  >
                    Use a different email
                  </button>
                </p>
              </div>
              {banner && <p className="text-sm text-emerald-700">{banner}</p>}
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-lg bg-blue-700 px-5 text-base font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}

          {step.kind === "signup" && (
            <form onSubmit={submitSignup} className="flex flex-col gap-5">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  Create your account
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                  Creating account for{" "}
                  <span className="font-medium">{step.email}</span>.{" "}
                  <button
                    type="button"
                    onClick={() => setStep({ kind: "email" })}
                    className="text-blue-700 hover:underline"
                  >
                    Use a different email
                  </button>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (8+ characters)"
                className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !signupReady}
                className="h-12 rounded-lg bg-blue-700 px-5 text-base font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Submit"}
              </button>
            </form>
          )}

          {step.kind === "unverified" && (
            <div className="flex flex-col gap-5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Verify your email
              </h1>
              <p className="text-sm text-zinc-600">
                We sent a verification link to{" "}
                <span className="font-medium">{step.email}</span>. Click it to
                activate your account.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={resendVerification}
                disabled={submitting}
                className="h-11 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:border-zinc-300 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Resend verification email"}
              </button>
              <button
                onClick={() => setStep({ kind: "email" })}
                className="text-xs text-zinc-500 hover:text-zinc-700"
              >
                Use a different email
              </button>
            </div>
          )}

          {step.kind === "verify-sent" && (
            <div className="flex flex-col gap-5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Verify your email
              </h1>
              <p className="text-sm text-zinc-600">
                We sent a verification link to{" "}
                <span className="font-medium">{step.email}</span>. Click it to
                activate your account, then come back here to log in.
              </p>
              <button
                onClick={() => setStep({ kind: "email" })}
                className="text-xs text-zinc-500 hover:text-zinc-700"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 bg-zinc-50" />}>
      <LoginPageInner />
    </Suspense>
  );
}
