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

  if (payload.website) {
    return NextResponse.json({ success: true });
  }
  if (!name || !validEmail(email)) {
    return NextResponse.json({ success: false }, { status: 422 });
  }

  const lead = {
    type: "contact",
    name,
    email,
    phone: String(payload.phone ?? ""),
    company: "",
    service: String(payload.subject ?? ""),
    message: String(payload.message ?? ""),
    payload,
    status: "new",
  };

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      await admin.from("leads").insert(lead);
    } catch {
      // Fail open in dev.
    }
  }

  return NextResponse.json({ success: true });
}
