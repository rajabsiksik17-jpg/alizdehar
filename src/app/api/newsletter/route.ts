import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

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

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      await admin.from("newsletter_subscribers").upsert(
        { email, locale: body.locale || "en" },
        { onConflict: "email" },
      );
    } catch {
      // Fail open in dev.
    }
  }

  return NextResponse.json({ success: true });
}
