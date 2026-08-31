import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { Icon } from "@/components/icon";

export default async function AdminDashboard() {
  const session = await requireAdmin();

  let stats = {
    services: 0,
    pages: 0,
    leads: 0,
    posts: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const [services, pages, leads, posts] = await Promise.all([
        admin.from("services").select("id", { count: "exact", head: true }),
        admin.from("pages").select("id", { count: "exact", head: true }),
        admin.from("leads").select("id", { count: "exact", head: true }),
        admin.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      stats = {
        services: services.count ?? 0,
        pages: pages.count ?? 0,
        leads: leads.count ?? 0,
        posts: posts.count ?? 0,
      };
    } catch {
      // Ignore — dashboard still renders.
    }
  } else {
    stats = { services: 5, pages: 2, leads: 0, posts: 0 };
  }

  const settings = await getSettings();
  const cards = [
    { label: "Services", value: stats.services, href: "/admin/services", icon: "ship" },
    { label: "Pages", value: stats.pages, href: "/admin/pages", icon: "file-text" },
    { label: "Leads", value: stats.leads, href: "/admin/leads", icon: "mail" },
    { label: "Blog posts", value: stats.posts, href: "/admin/blog", icon: "calendar" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Welcome back{settings.site_name ? `, ${settings.site_name.en}` : ""}. Signed in as {session.email}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <span className="text-3xl font-extrabold text-brand-900">{c.value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-900">{c.label}</p>
          </Link>
        ))}
      </div>

      {!isSupabaseConfigured() ? (
        <div className="mt-6 rounded-xl border border-accent-200 bg-accent-50 p-5 text-sm text-accent-900">
          Supabase is not configured yet. The site is rendering from bundled seed content. Connect
          Supabase (see <code className="rounded bg-white px-1">supabase/schema.sql</code>) to enable
          the CMS and admin data.
        </div>
      ) : null}
    </div>
  );
}
