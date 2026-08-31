import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "seo_manager"
  | "content_manager";

export interface AdminSession {
  id: string;
  email: string;
  role: AdminRole;
}

/**
 * Returns the signed-in admin user + role, or null.
 * Requires Supabase to be configured and a `profiles` row for the user.
 */
export async function getAdminUser(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let role: AdminRole = "editor";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role) role = profile.role as AdminRole;
  } catch {
    // Default to editor if the profiles table/row is missing.
  }

  return { id: user.id, email: user.email ?? "", role };
}

/** Protect an admin route — redirects to /admin/login when unauthenticated. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session) redirect("/admin/login");
  return session;
}

export function canManage(session: AdminSession): boolean {
  return session.role === "super_admin" || session.role === "admin";
}
