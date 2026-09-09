import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { permissionsFor } from "@/lib/admin-permissions";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { getTrustToken, isDeviceTrusted, isOtpApplicable } from "@/lib/auth-security";
import { AdminShell } from "@/components/admin/shell";
import { AdminLangProvider } from "@/components/admin/lang";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  // Server-side enforcement: a session that has not completed the OTP challenge
  // (untrusted device) must not reach the dashboard. Redirect back to login.
  const trustToken = await getTrustToken();
  const trusted = await isDeviceTrusted(session.id, trustToken ?? "");
  if (!trusted && (await isOtpApplicable())) {
    redirect("/admin/login");
  }

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
