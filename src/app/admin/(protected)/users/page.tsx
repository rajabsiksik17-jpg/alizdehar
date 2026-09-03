import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { UsersClient } from "@/components/admin/users-client";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
  last_sign_in_at: string | null;
}

export default async function AdminUsersPage() {
  const session = await requireAdmin("users");

  let users: AdminUser[] = [];
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const [auth, profiles] = await Promise.all([
        admin.auth.admin.listUsers(),
        admin.from("profiles").select("*"),
      ]);
      const profileById = new Map<string, Record<string, unknown>>();
      for (const p of profiles.data ?? []) profileById.set(p.id as string, p);

      users = (auth.data?.users ?? []).map((u) => {
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
    } catch {
      users = [];
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Users &amp; Permissions</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Manage admin users and their roles. You cannot change your own role.
      </p>
      <div className="mt-6">
        <UsersClient users={users} currentId={session.id} />
      </div>
    </div>
  );
}
