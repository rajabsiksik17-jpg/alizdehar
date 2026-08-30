import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();

  // Honeypot + basic validation
  if (payload.website) {
    return NextResponse.json({ success: true });
  }
  if (!name || !validEmail(email)) {
    return NextResponse.json({ success: false }, { status: 422 });
  }

  const lead = {
    type: "quote",
    name,
    email,
    phone: String(payload.phone ?? ""),
    company: String(payload.company ?? ""),
    service: String(payload.service ?? ""),
    message: String(payload.message ?? ""),
    payload,
    status: "new",
  };

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      await admin.from("leads").insert(lead);
    } catch {
      // Fail open in dev — do not block the user's submission.
    }
  }

  return NextResponse.json({ success: true });
}
