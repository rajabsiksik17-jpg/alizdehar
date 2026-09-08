import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { clientInfo, describeUserAgent } from "@/lib/security";
import { verifyLoginOtp, trustDevice, notifyNewDeviceLogin } from "@/lib/auth-security";

/**
 * Verify an OTP for the current (already password-authenticated) session,
 * mark the device trusted, and issue a trust token cookie.
 */
export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { code?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim();
  if (!code) return NextResponse.json({ error: "Code is required." }, { status: 422 });

  const result = await verifyLoginOtp({ userId: session.id, code });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Verification failed." }, { status: 401 });
  }

  const info = clientInfo(req);
  const { browser, os } = describeUserAgent(info.userAgent);
  const token = await trustDevice(session.id, browser, os);

  const locale = body.locale === "ar" ? "ar" : "en";
  await notifyNewDeviceLogin({ userId: session.id, email: session.email, locale, browser, os });

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
