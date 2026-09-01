import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { Icon } from "@/components/icon";
import { LeadsClient } from "@/components/admin/leads-client";
import type { Lead } from "@/types";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const type = sp.type;

  let leads: Lead[] = [];
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      let q = admin.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
      if (type) q = q.eq("type", type);
      const { data } = await q;
      leads = (data ?? []) as Lead[];
    } catch {
      leads = [];
    }
  }

  const title =
    type === "quote"
      ? "Quote Requests"
      : type === "contact"
        ? "Contact Requests"
        : type === "career"
          ? "Career Applications"
          : "All Leads";

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-muted">{leads.length} submission(s)</p>

      {leads.length ? (
        <div className="mt-6">
          <LeadsClient leads={leads} />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white p-12 text-center">
          <Icon name="mail" className="mx-auto h-10 w-10 text-brand-200" />
          <p className="mt-3 text-sm text-ink-muted">No submissions yet.</p>
        </div>
      )}
    </div>
  );
}
