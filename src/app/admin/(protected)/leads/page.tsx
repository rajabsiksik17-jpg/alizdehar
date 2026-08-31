import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { Icon } from "@/components/icon";
import type { Lead } from "@/types";

const statusColors: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  in_progress: "bg-violet-50 text-violet-700",
  quoted: "bg-brand-50 text-brand-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-red-50 text-red-700",
  archived: "bg-surface-muted text-ink-muted",
};

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
        <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-soft">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-start text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 text-start font-semibold">Date</th>
                <th className="px-4 py-3 text-start font-semibold">Name</th>
                <th className="px-4 py-3 text-start font-semibold">Email</th>
                <th className="px-4 py-3 text-start font-semibold">Phone</th>
                <th className="px-4 py-3 text-start font-semibold">Service</th>
                <th className="px-4 py-3 text-start font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-surface-muted/60">
                  <td className="px-4 py-3 text-ink-muted">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-900">{lead.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{lead.email}</td>
                  <td className="px-4 py-3 text-ink-muted" dir="ltr">
                    {lead.phone_e164 || lead.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{lead.service || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[lead.status] ?? statusColors.new}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
