import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function pick(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET() {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: null, configured: false });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from("settings").select("*").eq("id", 1).single();
  if (error || !data) return NextResponse.json({ data: null });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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

  const row: Record<string, unknown> = { id: 1 };

  if (body.site_name_en !== undefined) {
    row.site_name = { en: String(body.site_name_en ?? ""), ar: String(body.site_name_ar ?? "") };
  }
  if (body.tagline_en !== undefined) {
    row.tagline = { en: String(body.tagline_en ?? ""), ar: String(body.tagline_ar ?? "") };
  }
  if (body.site_description_en !== undefined) {
    row.site_description = {
      en: String(body.site_description_en ?? ""),
      ar: String(body.site_description_ar ?? ""),
    };
  }
  if (body.phone !== undefined) row.phone = pick(body.phone);
  if (body.email !== undefined) row.email = pick(body.email);
  if (body.whatsapp !== undefined) row.whatsapp = pick(body.whatsapp);
  if (body.address_en !== undefined) {
    row.address = { en: String(body.address_en ?? ""), ar: String(body.address_ar ?? "") };
  }
  if (body.working_hours_en !== undefined) {
    row.working_hours = {
      en: String(body.working_hours_en ?? ""),
      ar: String(body.working_hours_ar ?? ""),
    };
  }
  if (body.ga_measurement_id !== undefined) row.ga_measurement_id = pick(body.ga_measurement_id);
  if (body.gtm_id !== undefined) row.gtm_id = pick(body.gtm_id);
  if (body.default_og_image !== undefined) row.default_og_image = pick(body.default_og_image);
  if (body.google_site_verification !== undefined)
    row.google_site_verification = pick(body.google_site_verification);
  if (body.bing_site_verification !== undefined)
    row.bing_site_verification = pick(body.bing_site_verification);
  if (body.maintenance_mode !== undefined) row.maintenance_mode = Boolean(body.maintenance_mode);

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
