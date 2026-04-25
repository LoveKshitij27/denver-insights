"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

function newToken() {
  return randomBytes(32).toString("hex");
}

function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

async function sendVerificationEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  const link = `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Denver Insights <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email to access Denver Insights",
      html: `<p>Hi,</p><p>Kindly click on below link to verify your account</p><p><a href="${link}">${link}</a></p>`,
      text: `Hi,\n\nKindly click on below link to verify your account\n\n${link}`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send verification email: ${res.status} ${body}`);
  }
}

export const signup = action({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    if (!args.firstName.trim() || !args.lastName.trim()) {
      throw new Error("First and last name are required.");
    }
    const passwordHash = await bcrypt.hash(args.password, 10);
    const userId = await ctx.runMutation(internal.users.internal_create, {
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      passwordHash,
    });
    const token = newToken();
    await ctx.runMutation(internal.users.internal_createVerificationToken, {
      userId,
      token,
    });
    await sendVerificationEmail(email, token);
    return { ok: true as const };
  },
});

export const resendVerification = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.runQuery(internal.users.internal_getByEmail, { email });
    if (!user) return { ok: true as const }; // do not leak existence
    if (user.verifiedAt !== null) return { ok: true as const };
    const token = newToken();
    await ctx.runMutation(internal.users.internal_createVerificationToken, {
      userId: user._id,
      token,
    });
    await sendVerificationEmail(user.email, token);
    return { ok: true as const };
  },
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.runQuery(internal.users.internal_getByEmail, { email });
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new Error("Invalid email or password.");
    }
    if (user.verifiedAt === null) {
      throw new Error("Please verify your email before logging in.");
    }
    const token = newToken();
    await ctx.runMutation(internal.users.internal_createSession, {
      userId: user._id,
      token,
    });
    return { ok: true as const, sessionToken: token };
  },
});
