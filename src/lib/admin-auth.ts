import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  resolveGrants,
  hasAction,
  hasGroupAccess,
  isSuperAdminRole,
  type PermissionGrants,
  type Module,
  type Action,
  type Permission,
} from "@/lib/admin-permissions";

export type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "seo_manager"
  | "content_manager";

export interface AdminSession {
  id: string;
  email: string;
  role: string;
  grants: PermissionGrants;
  active: boolean;
  isSuper: boolean;
}

interface ProfileRow {
  role?: string;
  permissions?: Record<string, string[] | null> | null;
  active?: boolean;
}

/**
 * Returns the signed-in admin user with resolved granular permissions, or null.
 */
export async function getAdminUser(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let role = "editor";
  let active = true;
  let profilePermissions: PermissionGrants | null = null;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,permissions,active")
      .eq("id", user.id)
      .maybeSingle();
    const p = profile as ProfileRow | null;
    if (p?.role) role = p.role;
    if (typeof p?.active === "boolean") active = p.active;
    if (p?.permissions && typeof p.permissions === "object") {
      profilePermissions = normalizePermissions(p.permissions);
    }
  } catch {
    // Default to editor if the profiles table/row is missing.
  }

  // Resolve custom-role grants from the roles table when the role is not built-in.
  let customRoleGrants: PermissionGrants | null = null;
  try {
    const admin = createAdminClient();
    const { data: roleRow } = await admin
      .from("roles")
      .select("permissions")
      .eq("slug", role)
      .maybeSingle();
    if (roleRow?.permissions && typeof roleRow.permissions === "object") {
      customRoleGrants = normalizePermissions(roleRow.permissions as Record<string, unknown>);
    }
  } catch {
    // ignore
  }

  const grants = resolveGrants({ role, customRoleGrants, profilePermissions });

  return {
    id: user.id,
    email: user.email ?? "",
    role,
    grants,
    active,
    isSuper: isSuperAdminRole(role),
  };
}

function normalizePermissions(raw: Record<string, unknown>): PermissionGrants {
  const out: PermissionGrants = {};
  for (const [mod, actions] of Object.entries(raw)) {
    if (Array.isArray(actions)) {
      out[mod] = actions.filter((a): a is Action => typeof a === "string");
    }
  }
  return out;
}

/** Protect an admin route — redirects when unauthenticated, inactive, or unauthorized. */
export async function requireAdmin(scope?: Module | Permission, action?: Action): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session) redirect("/admin/login");
  if (!session.active) redirect("/admin/login");
  if (scope && !canAccess(session, scope, action ?? "view")) redirect("/admin");
  return session;
}

/** API guard — 401/403 when not authorized; null otherwise. */
export async function requireApiPermission(
  scope: Module | Permission,
  action: Action = "manage",
): Promise<NextResponse | null> {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.active) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!canAccess(session, scope, action)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Decide whether a session can act on a scope, which may be a granular module
 * key or a coarse permission group (legacy).
 */
function canAccess(session: AdminSession, scope: string, action: Action): boolean {
  if (session.isSuper) return true;
  const mod = scope as Module;
  const group = scope as Permission;

  // Granular module check first.
  if (MODULE_KEYS.has(mod)) {
    return hasAction(session.grants, mod, action);
  }
  // Coarse group check (view-level access).
  return hasGroupAccess(session.grants, group);
}

const MODULE_KEYS = new Set<string>([
  "dashboard",
  "pages",
  "services",
  "blog",
  "media",
  "forms",
  "quotes",
  "contacts",
  "careers",
  "applications",
  "menus",
  "social",
  "seo",
  "email",
  "settings",
  "users",
  "notifications",
  "audit",
]);

export function canManage(session: AdminSession): boolean {
  return session.isSuper || session.role === "admin";
}
