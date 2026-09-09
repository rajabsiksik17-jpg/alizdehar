import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { clientInfo, describeUserAgent, deviceFingerprint } from "@/lib/security";
import {
  getTrustToken,
  isDeviceTrusted,
  issueLoginOtp,
  OTP_CHALLENGE_COOKIE_NAME,
} from "@/lib/auth-security";
import { isLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

function resolveLocale(input: string | undefined): Locale {
  return isLocale(input) ? input : "en";
}

/**
 * After a successful password sign-in, the client calls this to decide whether
 * an OTP challenge is required (new/untrusted device) and, if so, to trigger
 * the OTP email and store the challenge id in an HttpOnly cookie.
 */
export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getTrustToken();
  const trusted = await isDeviceTrusted(session.id, token ?? "");
  if (trusted) {
    return NextResponse.json({ needsOtp: false });
  }

  let body: { locale?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const info = clientInfo(req);
  const { browser, os } = describeUserAgent(info.userAgent);
  const fingerprint = deviceFingerprint({ userAgent: info.userAgent, acceptLanguage: info.acceptLanguage });

  const issued = await issueLoginOtp({
    userId: session.id,
    email: session.email,
    locale: resolveLocale(body.locale),
    browser,
    os,
  });

  if (!issued.sent) {
    return NextResponse.json(
      {
        needsOtp: true,
        error: issued.error || "Could not send the verification code.",
        waitSeconds: issued.waitSeconds,
      },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ needsOtp: true, fingerprint });
  response.cookies.set(OTP_CHALLENGE_COOKIE_NAME, issued.challengeId!, {
    path: "/",
    maxAge: 60 * 10,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
