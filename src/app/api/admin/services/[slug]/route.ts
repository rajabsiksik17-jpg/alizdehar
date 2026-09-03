import { NextResponse } from "next/server";
import { getAdminUser, requireApiPermission } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();
  const { slug } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ data: null });
  return NextResponse.json({ data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();
  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("services").update(body).eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();
  const { slug } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("services").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
