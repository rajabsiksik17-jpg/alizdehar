import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/shell";
import { AdminLangProvider } from "@/components/admin/lang";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminLangProvider>
      <AdminShell email={session.email} role={session.role}>
        {children}
      </AdminShell>
    </AdminLangProvider>
  );
}
