import "server-only";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { generateOtp, generateToken, sha256 } from "@/lib/security";
import { sendOtpEmail, sendSecurityNotification, getEmailSettings, isSmtpConfigured } from "@/lib/email";

const OTP_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

export interface TrustedResult {
  trusted: boolean;
  needsOtp: boolean;
  reason?: string;
}

/** Get the current device token from a cookie. */
export async function getTrustToken(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    return store.get("izdehar_trust")?.value ?? null;
  } catch {
    return null;
  }
}

/** Is this device/session already trusted for this user? */
export async function isDeviceTrusted(userId: string, token: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  if (!token) return false;
  try {
    const admin = createAdminClient();
    const hash = sha256(token);
    const { data } = await admin
      .from("trusted_devices")
      .select("id")
      .eq("user_id", userId)
      .eq("token_hash", hash)
      .maybeSingle();
    if (data) {
      await admin.from("trusted_devices").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);
      return true;
    }
    return false;
  } catch {
    return true; // fail open on infra error
  }
}

/** Record a trusted device + return its opaque token. */
export async function trustDevice(userId: string, browser: string, os: string): Promise<string> {
  const token = generateToken();
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      await admin.from("trusted_devices").insert({
        user_id: userId,
        token_hash: sha256(token),
        browser,
        os,
      });
    } catch {
      // ignore
    }
  }
  return token;
}

/** Mark all sessions of a user as untrusted (revoke). */
export async function revokeTrustedDevices(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("trusted_devices").delete().eq("user_id", userId);
  } catch {
    // ignore
  }
}

/* ── OTP ─────────────────────────────────────────────────── */

export async function issueLoginOtp(opts: {
  userId: string;
  email: string;
  locale: "en" | "ar";
  browser: string;
  os: string;
}): Promise<{ sent: boolean; error?: string; waitSeconds?: number }> {
  const settings = await getEmailSettings();
  if (!isSmtpConfigured(settings)) {
    return { sent: false, error: "Email is not configured, so the OTP cannot be sent." };
  }

  // Rate-limit OTP issuance per user.
  const { checkRateLimit } = await import("@/lib/security");
  const rl = await checkRateLimit({ scope: "otp:issue", signalKey: opts.userId, limit: 3 });
  if (!rl.allowed) {
    return { sent: false, error: "Too many OTP requests.", waitSeconds: rl.retryAfterSeconds };
  }

  const code = generateOtp(6);
  const expiresAt = new Date(Date.now() + OTP_MINUTES * 60 * 1000);

  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    // Invalidate previous codes for this user.
    await admin.from("admin_otp").update({ attempts: OTP_MAX_ATTEMPTS + 1 }).eq("user_id", opts.userId).eq("purpose", "login");
    await admin.from("admin_otp").insert({
      user_id: opts.userId,
      code_hash: sha256(code),
      purpose: "login",
      expires_at: expiresAt.toISOString(),
    });
  }

  try {
    await sendOtpEmail({ locale: opts.locale, to: opts.email, code, expiresInMinutes: OTP_MINUTES });
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Failed to send OTP." };
  }
}

export async function verifyLoginOtp(opts: {
  userId: string;
  code: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }; // no email => can't have issued; but should already be blocked upstream
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("admin_otp")
      .select("*")
      .eq("user_id", opts.userId)
      .eq("purpose", "login")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { ok: false, error: "No verification code was issued. Please request a new code." };
    if (new Date(data.expires_at) < new Date()) return { ok: false, error: "This code has expired." };
    if (data.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, error: "Too many attempts. Please request a new code." };
    if (sha256(opts.code.trim()) !== data.code_hash) {
      await admin.from("admin_otp").update({ attempts: (data.attempts || 0) + 1 }).eq("id", data.id);
      return { ok: false, error: "Incorrect code." };
    }
    // Consume the code.
    await admin.from("admin_otp").update({ attempts: OTP_MAX_ATTEMPTS + 1 }).eq("id", data.id);
    return { ok: true };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

/* ── Security events ─────────────────────────────────────── */

export async function logSecurityEvent(input: {
  userId?: string;
  type: string;
  ip?: string;
  browser?: string;
  os?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("security_events").insert({
      user_id: input.userId ?? null,
      type: input.type,
      ip: input.ip ?? null,
      browser: input.browser ?? null,
      os: input.os ?? null,
      meta: input.meta ?? {},
    });
  } catch {
    // ignore
  }
}

export async function notifyNewDeviceLogin(opts: {
  userId: string;
  email: string;
  locale: "en" | "ar";
  browser: string;
  os: string;
}): Promise<void> {
  await logSecurityEvent({
    userId: opts.userId,
    type: "new_device_login",
    browser: opts.browser,
    os: opts.os,
    meta: { email: opts.email },
  });
  await sendSecurityNotification({
    locale: opts.locale,
    to: opts.email,
    time: new Date().toISOString(),
    browser: opts.browser,
    os: opts.os,
  });
}
