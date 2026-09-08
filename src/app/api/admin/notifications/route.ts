import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const denied = await requireApiPermission("leads");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return NextResponse.json({ unread: 0, recent: [], security: [] });

  const admin = createAdminClient();
  const [unreadLeads, recentLeads, unreadSec, recentSec] = await Promise.all([
    admin.from("leads").select("id", { count: "exact", head: true }).eq("is_read", false),
    admin
      .from("leads")
      .select("*")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10),
    admin.from("security_events").select("id", { count: "exact", head: true }).eq("is_read", false),
    admin
      .from("security_events")
      .select("*")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    unread: (unreadLeads.count ?? 0) + (unreadSec.count ?? 0),
    recent: recentLeads.data ?? [],
    security: recentSec.data ?? [],
  });
}

export async function POST(req: Request) {
  const denied = await requireApiPermission("leads");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();

  let body: { ids?: string[]; kind?: "leads" | "security" } = {};
  try {
    body = await req.json();
  } catch {
    // mark all
  }

  const admin = createAdminClient();
  const kind = body.kind ?? "leads";

  if (kind === "security") {
    const q = admin.from("security_events").update({ is_read: true }).eq("is_read", false);
    const { error } = await q;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  let q = admin.from("leads").update({ is_read: true }).eq("is_read", false);
  if (Array.isArray(body.ids) && body.ids.length) {
    q = admin.from("leads").update({ is_read: true }).in("id", body.ids);
  }
  const { error } = await q;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
