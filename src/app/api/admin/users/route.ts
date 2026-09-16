import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function normalizePermissions(raw: unknown): Record<string, string[]> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
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
      active: profile?.active === undefined ? true : Boolean(profile.active),
      permissions: (profile?.permissions as Record<string, unknown>) ?? null,
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
    };
  });

  return NextResponse.json({ data: users });
}

export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session || !session.isSuper) return unauthorized();
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let body: { full_name?: string; email?: string; password?: string; role?: string; permissions?: Record<string, string[]> | null; active?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "editor");
  const fullName = String(body.full_name ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 422 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 422 });
  }

  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message || "Failed to create user" }, { status: 500 });
  }

  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: created.user.id,
      email,
      full_name: fullName || null,
      role,
      permissions: normalizePermissions(body.permissions),
      active: body.active === undefined ? true : Boolean(body.active),
    },
    { onConflict: "id" },
  );
  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: created.user.id });
}

export async function PATCH(req: Request) {
  const session = await getAdminUser();
  if (!session || !session.isSuper) return unauthorized();
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let body: { id?: string; full_name?: string; role?: string; permissions?: Record<string, string[]> | null; active?: boolean; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // A super admin cannot change their own role (prevent self-demotion/lockout).
  if (body.id === session.id && body.role !== undefined && body.role !== session.role) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 403 });
  }

  const admin = createAdminClient();

  if (body.role !== undefined && !isValidRole(body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 422 });
  }

  const profileUpdates: Record<string, unknown> = {};
  if (body.role !== undefined) profileUpdates.role = body.role;
  if (body.full_name !== undefined) profileUpdates.full_name = body.full_name || null;
  if (body.permissions !== undefined) profileUpdates.permissions = normalizePermissions(body.permissions);
  if (body.active !== undefined) profileUpdates.active = Boolean(body.active);

  if (Object.keys(profileUpdates).length) {
    const { error } = await admin.from("profiles").upsert(
      { id: body.id, ...profileUpdates },
      { onConflict: "id" },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.password && body.password.length >= 8) {
    const { error } = await admin.auth.admin.updateUserById(body.id, { password: body.password });
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
  if (body.id === session.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

function isValidRole(role: string): boolean {
  return role.length > 0 && role.length <= 100;
}
