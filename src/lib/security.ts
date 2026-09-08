import "server-only";
import { createHash, randomBytes, randomInt } from "crypto";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

/* ── Hashing helpers (no plaintext secrets stored) ─────────── */

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Generate a random numeric OTP of `length` digits. */
export function generateOtp(length = 6): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(randomInt(min, max + 1));
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** Hash an email/signal for storage (lowercased + salt not required for lookup hashing). */
export function hashSignal(value: string): string {
  return sha256(value.trim().toLowerCase());
}

/* ── Rate limiting (persistent, multi-signal, escalating) ──── */

export interface RateLimitResult {
  allowed: boolean;
  blockedUntil?: string | null;
  retryAfterSeconds?: number;
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check + increment a rate limit.
 * - More than `limit` requests within an hour => block with escalating duration.
 * - strikes increment each time a throttle is triggered, increasing the block window.
 */
export async function checkRateLimit(input: {
  scope: string;
  signalKey: string;
  limit?: number;
}): Promise<RateLimitResult> {
  const limit = input.limit ?? 3;
  if (!isSupabaseConfigured()) return { allowed: true };

  try {
    const admin = createAdminClient();
    const key = hashSignal(`${input.scope}:${input.signalKey}`);
    const now = new Date();

    const { data } = await admin
      .from("rate_limits")
      .select("*")
      .eq("scope", input.scope)
      .eq("signal_key", key)
      .maybeSingle();

    const row = data as
      | { count: number; window_start: string; blocked_until: string | null; strikes: number; id: string }
      | null;

    // Currently blocked?
    if (row?.blocked_until && new Date(row.blocked_until) > now) {
      const remainingMs = new Date(row.blocked_until).getTime() - now.getTime();
      return {
        allowed: false,
        blockedUntil: row.blocked_until,
        retryAfterSeconds: Math.ceil(remainingMs / 1000),
      };
    }

    const windowStart = row ? new Date(row.window_start) : now;
    const inWindow = now.getTime() - windowStart.getTime() < WINDOW_MS;

    const count = (row && inWindow ? row.count : 0) + 1;
    const strikes = row?.strikes ?? 0;

    if (count > limit) {
      // Escalating block: 1h base, doubled per additional strike.
      const blockMs = WINDOW_MS * 2 ** strikes;
      const blockedUntil = new Date(now.getTime() + blockMs);
      await admin.from("rate_limits").upsert(
        {
          scope: input.scope,
          signal_key: key,
          count: 0,
          window_start: now.toISOString(),
          blocked_until: blockedUntil.toISOString(),
          strikes: strikes + 1,
        },
        { onConflict: "scope,signal_key" },
      );
      return {
        allowed: false,
        blockedUntil: blockedUntil.toISOString(),
        retryAfterSeconds: Math.ceil(blockMs / 1000),
      };
    }

    await admin.from("rate_limits").upsert(
      {
        scope: input.scope,
        signal_key: key,
        count,
        window_start: inWindow && row ? row.window_start : now.toISOString(),
        blocked_until: null,
        strikes,
      },
      { onConflict: "scope,signal_key" },
    );

    return { allowed: true };
  } catch {
    // Fail open on infrastructure errors so we never block a real user spuriously.
    return { allowed: true };
  }
}

/** Reset a rate limit (e.g. after successful OTP verification). */
export async function resetRateLimit(scope: string, signalKey: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    const key = hashSignal(`${scope}:${signalKey}`);
    await admin.from("rate_limits").delete().eq("scope", scope).eq("signal_key", key);
  } catch {
    // ignore
  }
}

/* ── Client fingerprint (privacy-respecting, server-side) ─── */

/**
 * Build a coarse device fingerprint from harmless signal values the client sends.
 * This is only used server-side to detect "new device" and reduce false positives
 * on shared networks — it never stores sensitive data.
 */
export function deviceFingerprint(input: {
  userAgent?: string;
  acceptLanguage?: string;
  platform?: string;
}): string {
  const ua = input.userAgent || "";
  const lang = input.acceptLanguage || "";
  // Strip version numbers to keep it coarse and stable.
  const coarse = ua
    .replace(/\d+(\.\d+)+/g, "v")
    .replace(/\s+/g, " ")
    .trim();
  return hashSignal(`${coarse}|${lang}|${input.platform || ""}`);
}

/** Extract safe client metadata from a request (IP, UA, language). */
export function clientInfo(request: Request): {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
} {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return {
    ip,
    userAgent: request.headers.get("user-agent") || "",
    acceptLanguage: request.headers.get("accept-language") || "",
  };
}

/** Parse a safe browser/os description from a user-agent string. */
export function describeUserAgent(userAgent: string): { browser: string; os: string } {
  const ua = userAgent || "";
  let browser = "Unknown browser";
  let os = "Unknown OS";

  if (/Edg\//.test(ua)) browser = "Microsoft Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";

  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, os };
}
