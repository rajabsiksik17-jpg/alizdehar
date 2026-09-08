import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { clientInfo, describeUserAgent, deviceFingerprint } from "@/lib/security";
import {
  getTrustToken,
  isDeviceTrusted,
  issueLoginOtp,
} from "@/lib/auth-security";

/**
 * After a successful password sign-in, the client calls this to decide whether
 * an OTP challenge is required (new/untrusted device) and, if so, to trigger
 * the OTP email.
 */
export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getTrustToken();
  const trusted = await isDeviceTrusted(session.id, token ?? "");
  if (trusted) {
    return NextResponse.json({ needsOtp: false });
  }

  const info = clientInfo(req);
  const { browser, os } = describeUserAgent(info.userAgent);
  const fingerprint = deviceFingerprint({ userAgent: info.userAgent, acceptLanguage: info.acceptLanguage });

  const issued = await issueLoginOtp({
    userId: session.id,
    email: session.email,
    locale: (await import("@/lib/i18n/config")).defaultLocale === "ar" ? "ar" : "en",
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

  return NextResponse.json({ needsOtp: true, fingerprint });
}
