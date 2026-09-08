import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { clientInfo, checkRateLimit, hashSignal } from "@/lib/security";

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: { email?: string; locale?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ success: true });

  const email = (body.email ?? "").trim();
  if (!validEmail(email)) {
    return NextResponse.json({ success: false }, { status: 422 });
  }

  const info = clientInfo(request);
  const signals = [email, hashSignal(`fp:${info.userAgent}`), info.ip];
  const results = await Promise.all(
    signals.map((s) => checkRateLimit({ scope: "form:newsletter", signalKey: s, limit: 5 })),
  );
  if (results.some((r) => !r.allowed)) {
    return NextResponse.json({ success: false, error: "Too many requests." }, { status: 429 });
  }

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      await admin.from("newsletter_subscribers").upsert(
        { email, locale: body.locale || "en" },
        { onConflict: "email" },
      );
    } catch {
      return NextResponse.json({ success: false, error: "Failed to subscribe" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
