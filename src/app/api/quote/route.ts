import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { parsePhone } from "@/lib/phone";

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

  // Phone: prefer the client-computed E.164, re-validate server-side.
  const phoneCountry = String(payload.phone_country ?? "");
  const phoneE164 = String(payload.phone_e164 ?? "");
  const parsedPhone = phoneE164
    ? parsePhone(phoneE164)
    : parsePhone(String(payload.phone ?? ""), phoneCountry || undefined);
  const finalE164 = parsedPhone.e164 || phoneE164 || null;

  const lead = {
    type: "quote",
    name,
    email,
    phone: String(payload.phone ?? ""),
    phone_country: phoneCountry || parsedPhone.country || null,
    phone_dial_code: String(payload.phone_dial_code ?? parsedPhone.dialCode ?? ""),
    phone_e164: finalE164,
    company: "",
    service: String(payload.service ?? ""),
    service_slug: String(payload.service_slug ?? ""),
    cargo_type: String(payload.cargo_type ?? ""),
    cargo_description: String(payload.cargo_description ?? ""),
    shipment_size: String(payload.shipment_size ?? ""),
    urgency: String(payload.urgency ?? ""),
    origin: String(payload.origin ?? ""),
    destination: String(payload.destination ?? ""),
    weight: payload.weight ? Number(payload.weight) : null,
    weight_unit: String(payload.weight_unit ?? ""),
    dimensions: payload.dimensions ?? null,
    shipping_date: String(payload.shipping_date ?? "") || null,
    message: String(payload.message ?? ""),
    locale: String(payload.locale ?? ""),
    source_page: String(payload.source_page ?? ""),
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
