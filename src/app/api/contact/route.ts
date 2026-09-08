import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { clientInfo, checkRateLimit, hashSignal } from "@/lib/security";
import { sendContactConfirmation, sendAdminLeadNotification } from "@/lib/email";
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

  // Honeypot — bots fill the hidden "website" field.
  if (payload.website) {
    return NextResponse.json({ success: true });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const locale: Locale = isLocale(String(payload.locale ?? "")) ? (String(payload.locale) as Locale) : "en";

  if (!name || !validEmail(email) || !message) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 422 });
  }
  // Basic spam heuristics (server-side). Message with excessive URLs is suspicious.
  if ((message.match(/https?:\/\//g) || []).length > 5 || (message.match(/<[a-z]+/i) || []).length > 0) {
    return NextResponse.json({ success: false, error: "Message looks like spam" }, { status: 422 });
  }

  // Rate limiting (multi-signal): email + device fingerprint + network (coarse).
  const info = clientInfo(request);
  const fp = hashSignal(`fp:${info.userAgent}`);
  const signals = [email, fp, info.ip];
  const scope = "form:contact";
  const firstBlock = await Promise.all(
    signals.map((s) => checkRateLimit({ scope, signalKey: s })),
  );
  const blocked = firstBlock.find((r) => !r.allowed);
  if (blocked) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again later.",
        retryAfterSeconds: blocked.retryAfterSeconds,
      },
      { status: 429 },
    );
  }

  const lead = {
    type: "contact",
    name,
    email,
    phone: String(payload.phone ?? ""),
    phone_country: String(payload.phone_country ?? ""),
    phone_dial_code: String(payload.phone_dial_code ?? ""),
    phone_e164: String(payload.phone_e164 ?? ""),
    company: "",
    service: String(payload.subject ?? ""),
    message,
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

  // Confirmation email to the customer + admin notification (non-blocking).
  await Promise.allSettled([
    sendContactConfirmation({ locale, to: email, name, message }),
    sendAdminLeadNotification({
      locale,
      type: "contact",
      name,
      email,
      phone: String(payload.phone_e164 ?? ""),
      service: String(payload.subject ?? ""),
      message,
    }),
  ]);

  return NextResponse.json({ success: true });
}
