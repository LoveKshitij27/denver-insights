import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const checkEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
      .first();
    if (!user) return { exists: false as const };
    return { exists: true as const, verified: user.verifiedAt !== null };
  },
});

export const bySessionToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      verified: user.verifiedAt !== null,
    };
  },
});

export const internal_getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
      .first();
  },
});

export const internal_create = internalMutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      throw new Error("An account with this email already exists.");
    }
    const userId = await ctx.db.insert("users", {
      email,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      passwordHash: args.passwordHash,
      verifiedAt: null,
      createdAt: Date.now(),
    });
    return userId;
  },
});

export const internal_createVerificationToken = internalMutation({
  args: { userId: v.id("users"), token: v.string() },
  handler: async (ctx, { userId, token }) => {
    // Wipe any existing token for this user before creating a new one.
    const existing = await ctx.db
      .query("verificationTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const t of existing) await ctx.db.delete(t._id);
    await ctx.db.insert("verificationTokens", {
      userId,
      token,
      expiresAt: Date.now() + VERIFICATION_TTL_MS,
    });
  },
});

export const verifyEmail = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const t = await ctx.db
      .query("verificationTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!t) return { ok: false as const, reason: "invalid" as const };
    if (t.expiresAt < Date.now()) {
      await ctx.db.delete(t._id);
      return { ok: false as const, reason: "expired" as const };
    }
    const user = await ctx.db.get(t.userId);
    if (!user) {
      await ctx.db.delete(t._id);
      return { ok: false as const, reason: "invalid" as const };
    }
    if (user.verifiedAt === null) {
      await ctx.db.patch(user._id, { verifiedAt: Date.now() });
    }
    await ctx.db.delete(t._id);
    return { ok: true as const, email: user.email };
  },
});

export const internal_createSession = internalMutation({
  args: { userId: v.id("users"), token: v.string() },
  handler: async (ctx, { userId, token }) => {
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
  },
});

export const deleteSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});
