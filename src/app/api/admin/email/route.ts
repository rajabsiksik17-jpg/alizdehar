import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ data: null });

  const admin = createAdminClient();
  const { data } = await admin.from("email_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return NextResponse.json({ data: null });

  const { smtp_pass, imap_pass, ...rest } = data as Record<string, unknown>;
  return NextResponse.json({
    data: { ...rest, smtp_pass_set: !!smtp_pass, imap_pass_set: !!imap_pass },
  });
}

export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const row: Record<string, unknown> = { id: 1 };
  for (const f of ["smtp_host", "smtp_user", "from_name", "from_email", "reply_to", "imap_host", "imap_user"]) {
    if (body[f] !== undefined) row[f] = body[f] ? String(body[f]) : null;
  }
  for (const f of ["smtp_port", "imap_port"]) {
    if (body[f] !== undefined) row[f] = body[f] ? Number(body[f]) : null;
  }
  for (const f of ["smtp_secure", "imap_secure", "notify_quote", "notify_contact", "notify_application", "auto_reply"]) {
    if (body[f] !== undefined) row[f] = Boolean(body[f]);
  }
  // Passwords: only overwrite when a non-empty value is provided (never sent back to client).
  if (typeof body.smtp_pass === "string" && body.smtp_pass) row.smtp_pass = body.smtp_pass;
  if (typeof body.imap_pass === "string" && body.imap_pass) row.imap_pass = body.imap_pass;

  const admin = createAdminClient();
  const { error } = await admin.from("email_settings").upsert(row, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
