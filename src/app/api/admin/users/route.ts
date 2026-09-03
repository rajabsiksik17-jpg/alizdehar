import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { hasPermission, ALL_ROLES } from "@/lib/admin-permissions";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminUser();
  if (!session || !hasPermission(session.role, "users")) return unauthorized();
  if (!isSupabaseConfigured()) return NextResponse.json({ data: [] });

  const admin = createAdminClient();
  const [auth, profiles] = await Promise.all([
    admin.auth.admin.listUsers(),
    admin.from("profiles").select("*"),
  ]);

  const profileById = new Map<string, Record<string, unknown>>();
  for (const p of profiles.data ?? []) profileById.set(p.id as string, p);

  const users = (auth.data?.users ?? []).map((u) => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      full_name: (profile?.full_name as string) ?? null,
      role: (profile?.role as string) ?? "editor",
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
    };
  });

  return NextResponse.json({ data: users });
}

export async function PATCH(req: Request) {
  const session = await getAdminUser();
  if (!session || !hasPermission(session.role, "users")) return unauthorized();
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let body: { id?: string; role?: string; full_name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.id || !body.role || !ALL_ROLES.includes(body.role as (typeof ALL_ROLES)[number])) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const admin = createAdminClient();
  const updates: Record<string, unknown> = { role: body.role };
  if (body.full_name !== undefined) updates.full_name = body.full_name;

  const { error } = await admin.from("profiles").upsert({ id: body.id, ...updates }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
