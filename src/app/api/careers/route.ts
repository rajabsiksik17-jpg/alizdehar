import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { clientInfo, checkRateLimit, hashSignal } from "@/lib/security";
import { sendCareerConfirmation, sendAdminLeadNotification } from "@/lib/email";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const position = String(form.get("position") ?? "").trim();
  const locale: Locale = isLocale(String(form.get("locale") ?? "")) ? (String(form.get("locale")) as Locale) : "en";

  if (form.get("website")) {
    return NextResponse.json({ success: true });
  }
  if (!name || !validEmail(email) || !position) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 422 });
  }

  // Rate limiting
  const info = clientInfo(request);
  const fp = hashSignal(`fp:${info.userAgent}`);
  const signals = [email, fp, info.ip];
  const firstBlock = await Promise.all(
    signals.map((s) => checkRateLimit({ scope: "form:career", signalKey: s })),
  );
  const blocked = firstBlock.find((r) => !r.allowed);
  if (blocked) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later.", retryAfterSeconds: blocked.retryAfterSeconds },
      { status: 429 },
    );
  }

  const file = form.get("cv");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Please attach your CV." }, { status: 422 });
  }
  if (!ALLOWED.includes(file.type) || file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, error: "Unsupported file." }, { status: 422 });
  }

  let cvPath: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const ext = file.name.split(".").pop() || "pdf";
      const key = `${Date.now()}-${sanitizeName(name)}.${ext}`;
      const { error: uploadError } = await admin.storage
        .from("applications")
        .upload(key, file, { contentType: file.type, upsert: false });
      if (!uploadError) cvPath = key;

      const lead = {
        type: "career",
        name,
        email,
        phone: String(form.get("phone") ?? ""),
        phone_country: String(form.get("phone_country") ?? ""),
        phone_dial_code: String(form.get("phone_dial_code") ?? ""),
        phone_e164: String(form.get("phone_e164") ?? ""),
        company: "",
        service: position,
        message: String(form.get("message") ?? ""),
        locale,
        payload: {
          cv_path: cvPath,
          country: String(form.get("country") ?? ""),
          linkedin: String(form.get("linkedin") ?? ""),
          experience: String(form.get("experience") ?? ""),
          ip: info.ip,
        },
        status: "new",
        is_read: false,
      };
      const { error: insertErr } = await admin.from("leads").insert(lead);
      if (insertErr) throw insertErr;
    } catch (e) {
      return NextResponse.json(
        { success: false, error: e instanceof Error ? e.message : "Failed to save" },
        { status: 500 },
      );
    }
  }

  await Promise.allSettled([
    sendCareerConfirmation({ locale, to: email, name, position }),
    sendAdminLeadNotification({
      locale,
      type: "career",
      name,
      email,
      phone: String(form.get("phone_e164") ?? ""),
      service: position,
      message: String(form.get("message") ?? ""),
      meta: [
        { label: locale === "ar" ? "الدولة" : "Country", value: String(form.get("country") ?? "") },
        { label: locale === "ar" ? "سنوات الخبرة" : "Experience", value: String(form.get("experience") ?? "") },
      ].filter((m) => m.value),
    }),
  ]);

  return NextResponse.json({ success: true });
}
