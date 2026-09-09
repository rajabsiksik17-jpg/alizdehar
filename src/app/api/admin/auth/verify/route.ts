import { NextResponse } from "next/server";
import { clientInfo, describeUserAgent } from "@/lib/security";
import {
  verifyLoginOtp,
  trustDevice,
  notifyNewDeviceLogin,
  clearOtpChallenge,
  OTP_CHALLENGE_COOKIE_NAME,
} from "@/lib/auth-security";
import { cookies } from "next/headers";

async function getChallengeCookie(): Promise<string | null> {
  try {
    const store = await cookies();
    return store.get(OTP_CHALLENGE_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Verify an OTP against the current login challenge (cookie), mark the device
 * trusted, and issue a trust token cookie. The OTP is bound to the exact
 * sign-in attempt via the challenge id.
 */
export async function POST(req: Request) {
  let body: { code?: string; locale?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim();
  if (!code) return NextResponse.json({ error: "Code is required." }, { status: 422 });

  const challengeId = await getChallengeCookie();
  if (!challengeId) {
    return NextResponse.json(
      { error: "No verification code was issued. Please request a new code." },
      { status: 401 },
    );
  }

  const result = await verifyLoginOtp({ challengeId, code });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Verification failed.", expired: result.expired },
      { status: result.expired || result.attemptsExceeded ? 410 : 401 },
    );
  }

  const userId = result.userId!;
  const info = clientInfo(req);
  const { browser, os } = describeUserAgent(info.userAgent);
  const token = await trustDevice(userId, browser, os);

  const locale = body.locale === "ar" ? "ar" : "en";
  // Resolve the admin email for the security notification.
  let email = "";
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data?.user?.email ?? "";
  } catch {
    // ignore — notification is best-effort
  }
  await notifyNewDeviceLogin({ userId, email, locale, browser, os });

  await clearOtpChallenge();

  const response = NextResponse.json({ success: true });
  response.cookies.set("izdehar_trust", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
