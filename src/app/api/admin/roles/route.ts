import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { BUILTIN_ROLES, BUILTIN_ROLE_KEYS } from "@/lib/admin-permissions";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function normalizePermissions(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const [mod, actions] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(actions)) {
      const filtered = actions.filter((a): a is string => typeof a === "string");
      if (filtered.length) out[mod] = filtered;
    }
  }
  return out;
}

export async function GET() {
  const session = await getAdminUser();
  if (!session || !session.isSuper) return unauthorized();

  const builtin = BUILTIN_ROLE_KEYS.map((key) => ({
    slug: key,
    name: BUILTIN_ROLES[key].label,
    is_builtin: true,
    permissions: BUILTIN_ROLES[key].grants,
  }));

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ roles: builtin });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("roles").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const custom = (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? null,
    is_builtin: false,
    permissions: normalizePermissions(r.permissions),
  }));

  return NextResponse.json({ roles: [...builtin, ...custom] });
}

export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session || !session.isSuper) return unauthorized();
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let body: { id?: string; slug?: string; name?: { en: string; ar: string }; description?: { en: string; ar: string }; permissions?: Record<string, string[]> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  if (!slug || BUILTIN_ROLE_KEYS.includes(slug as never)) {
    return NextResponse.json({ error: "Invalid or reserved role name." }, { status: 422 });
  }
  if (!body.name?.en && !body.name?.ar) {
    return NextResponse.json({ error: "Role name is required." }, { status: 422 });
  }

  const admin = createAdminClient();
  const row = {
    slug,
    name: { en: body.name?.en ?? "", ar: body.name?.ar ?? "" },
    description: body.description ?? null,
    permissions: normalizePermissions(body.permissions),
  };

  if (body.id) {
    const { error } = await admin.from("roles").update(row).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.from("roles").insert(row);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getAdminUser();
  if (!session || !session.isSuper) return unauthorized();
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("roles").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
