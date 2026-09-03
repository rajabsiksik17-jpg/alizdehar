import { NextResponse } from "next/server";
import { getAdminUser, requireApiPermission } from "@/lib/admin-auth";
import { permissionForTable } from "@/lib/admin-permissions";
import { getEntity, adminEntityTableSet } from "@/lib/admin-registry";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  const { table } = await params;
  if (!adminEntityTableSet.has(table)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  }
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();

  const entity = getEntity(table)!;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from(table)
    .select("*")
    .order(entity.orderBy, { ascending: entity.orderAsc ?? true })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  const { table } = await params;
  if (!adminEntityTableSet.has(table)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  }
  const denied = await requireApiPermission(permissionForTable(table));
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const entity = getEntity(table)!;
  const row: Record<string, unknown> = {};
  for (const f of entity.fields) {
    const v = body[f.name];
    if (f.required && (v === undefined || v === null || v === "")) {
      return NextResponse.json({ error: `${f.name} is required` }, { status: 422 });
    }
    if (v !== undefined) row[f.name] = v;
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from(table).insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  const { table } = await params;
  if (!adminEntityTableSet.has(table)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  }
  const denied = await requireApiPermission(permissionForTable(table));
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const id = body.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const entity = getEntity(table)!;
  const row: Record<string, unknown> = {};
  for (const f of entity.fields) {
    if (body[f.name] !== undefined) row[f.name] = body[f.name];
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from(table).update(row).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  const { table } = await params;
  if (!adminEntityTableSet.has(table)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  }
  const denied = await requireApiPermission(permissionForTable(table));
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const id = body.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
