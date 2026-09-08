import { requireAdmin } from "@/lib/admin-auth";
import { permissionsFor } from "@/lib/admin-permissions";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin/shell";
import { AdminLangProvider } from "@/components/admin/lang";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  let unreadNotifications = 0;
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const [leads, sec] = await Promise.all([
        admin.from("leads").select("id", { count: "exact", head: true }).eq("is_read", false),
        admin.from("security_events").select("id", { count: "exact", head: true }).eq("is_read", false),
      ]);
      unreadNotifications = (leads.count ?? 0) + (sec.count ?? 0);
    } catch {
      // ignore
    }
  }

  return (
    <AdminLangProvider>
      <AdminShell
        email={session.email}
        role={session.role}
        permissions={permissionsFor(session.role)}
        unreadNotifications={unreadNotifications}
      >
        {children}
      </AdminShell>
    </AdminLangProvider>
  );
}
