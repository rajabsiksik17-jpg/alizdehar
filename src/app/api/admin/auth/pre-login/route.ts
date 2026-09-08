import { NextResponse } from "next/server";
import { clientInfo, checkRateLimit, hashSignal } from "@/lib/security";

/**
 * Pre-login rate limiting gate (brute-force protection).
 * The client calls this before attempting password sign-in; if blocked,
 * it shows a lockout message and does not hit Supabase Auth.
 */
export async function POST(req: Request) {
  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const info = clientInfo(req);
  const email = String(body.email ?? "").trim();
  const signals = [
    email ? hashSignal(email) : null,
    hashSignal(`fp:${info.userAgent}`),
    info.ip,
  ].filter(Boolean) as string[];

  const scope = "auth:login";
  const results = await Promise.all(
    signals.map((s) => checkRateLimit({ scope, signalKey: s, limit: 5 })),
  );
  const blocked = results.find((r) => !r.allowed);

  if (blocked) {
    return NextResponse.json(
      { allowed: false, retryAfterSeconds: blocked.retryAfterSeconds },
      { status: 429 },
    );
  }

  return NextResponse.json({ allowed: true });
}
