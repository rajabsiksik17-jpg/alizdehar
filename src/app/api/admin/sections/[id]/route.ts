import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const row: Record<string, unknown> = {};
  if (body.title !== undefined) row.title = body.title;
  if (body.subtitle !== undefined) row.subtitle = body.subtitle;
  if (body.body !== undefined) row.body = body.body;
  if (body.image !== undefined) row.image = body.image;
  if (body.items !== undefined) row.items = body.items;
  if (body.settings !== undefined) row.settings = body.settings;
  if (body.hidden !== undefined) row.hidden = Boolean(body.hidden);
  if (body.sort_order !== undefined) row.sort_order = Number(body.sort_order);

  const admin = createAdminClient();
  const { error } = await admin.from("page_sections").update(row).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();
  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("page_sections").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
