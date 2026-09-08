import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { parsePhone } from "@/lib/phone";
import { clientInfo, checkRateLimit, hashSignal } from "@/lib/security";
import { sendQuoteConfirmation, sendAdminLeadNotification } from "@/lib/email";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const locale: Locale = isLocale(String(payload.locale ?? "")) ? (String(payload.locale) as Locale) : "en";

  if (payload.website) {
    return NextResponse.json({ success: true });
  }
  if (!name || !validEmail(email)) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 422 });
  }

  // Rate limiting
  const info = clientInfo(request);
  const fp = hashSignal(`fp:${info.userAgent}`);
  const signals = [email, fp, info.ip];
  const firstBlock = await Promise.all(
    signals.map((s) => checkRateLimit({ scope: "form:quote", signalKey: s })),
  );
  const blocked = firstBlock.find((r) => !r.allowed);
  if (blocked) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later.", retryAfterSeconds: blocked.retryAfterSeconds },
      { status: 429 },
    );
  }

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
    pickup_location: String(payload.pickup_location ?? ""),
    shipping_address: String(payload.shipping_address ?? ""),
    weight: payload.weight ? Number(payload.weight) : null,
    weight_unit: String(payload.weight_unit ?? ""),
    dimensions: payload.dimensions ?? null,
    shipping_date: String(payload.shipping_date ?? "") || null,
    message: String(payload.message ?? ""),
    locale,
    source_page: String(payload.source_page ?? ""),
    payload: { ...payload, ip: info.ip },
    status: "new",
    is_read: false,
  };

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("leads").insert(lead);
      if (error) throw error;
    } catch (e) {
      return NextResponse.json(
        { success: false, error: e instanceof Error ? e.message : "Failed to save" },
        { status: 500 },
      );
    }
  }

  const dims = payload.dimensions as { area?: string; length?: string; width?: string; height?: string; unit?: string } | null;
  const meta: { label: string; value: string }[] = [];
  const rtl = locale === "ar";
  const L = (en: string, ar: string) => (rtl ? ar : en);
  if (payload.cargo_type) meta.push({ label: L("Cargo type", "نوع البضاعة"), value: String(payload.cargo_type) });
  if (payload.shipment_size) meta.push({ label: L("Shipment size", "حجم الشحنة"), value: String(payload.shipment_size) });
  if (payload.pickup_location) meta.push({ label: L("Pick up location", "موقع الاستلام"), value: String(payload.pickup_location) });
  if (dims?.area) meta.push({ label: L("Area", "المساحة"), value: `${dims.area} ${dims.unit || "m²"}` });
  if (payload.weight) meta.push({ label: L("Weight", "الوزن"), value: `${payload.weight} ${payload.weight_unit || "kg"}` });

  await Promise.allSettled([
    sendQuoteConfirmation({ locale, to: email, name, service: String(payload.service ?? "") }),
    sendAdminLeadNotification({
      locale,
      type: "quote",
      name,
      email,
      phone: finalE164 || String(payload.phone ?? ""),
      service: String(payload.service ?? ""),
      message: String(payload.message ?? ""),
      meta,
    }),
  ]);

  return NextResponse.json({ success: true });
}
