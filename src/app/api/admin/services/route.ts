import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const slug = String(body.slug ?? "").trim();
  const name = body.name as { en?: string; ar?: string } | undefined;
  if (!slug || !name?.en) {
    return NextResponse.json({ error: "slug and name.en are required" }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("services").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
