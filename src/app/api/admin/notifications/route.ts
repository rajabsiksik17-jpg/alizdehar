import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const denied = await requireApiPermission("leads");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return NextResponse.json({ unread: 0, recent: [] });

  const admin = createAdminClient();
  const [unread, recent] = await Promise.all([
    admin.from("leads").select("id", { count: "exact", head: true }).eq("is_read", false),
    admin
      .from("leads")
      .select("*")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    unread: unread.count ?? 0,
    recent: recent.data ?? [],
  });
}

export async function POST(req: Request) {
  const denied = await requireApiPermission("leads");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();

  let body: { ids?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    // Mark all as read by default.
  }

  const admin = createAdminClient();
  let q = admin.from("leads").update({ is_read: true }).eq("is_read", false);
  if (Array.isArray(body.ids) && body.ids.length) {
    q = admin.from("leads").update({ is_read: true }).in("id", body.ids);
  }
  const { error } = await q;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
