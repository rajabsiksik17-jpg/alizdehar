import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function pick(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Supabase is not configured." },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const row = {
    id: 1,
    site_name: { en: String(body.site_name_en ?? ""), ar: String(body.site_name_ar ?? "") },
    tagline: { en: String(body.tagline_en ?? ""), ar: String(body.tagline_ar ?? "") },
    site_description: {
      en: String(body.site_description_en ?? ""),
      ar: String(body.site_description_ar ?? ""),
    },
    phone: pick(body.phone),
    email: pick(body.email),
    whatsapp: pick(body.whatsapp),
    address: { en: String(body.address_en ?? ""), ar: String(body.address_ar ?? "") },
    working_hours: {
      en: String(body.working_hours_en ?? ""),
      ar: String(body.working_hours_ar ?? ""),
    },
    ga_measurement_id: pick(body.ga_measurement_id),
    gtm_id: pick(body.gtm_id),
  };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("settings").upsert(row, { onConflict: "id" });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
