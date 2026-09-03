import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { Icon } from "@/components/icon";
import type { Lead } from "@/types";

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const settings = await getSettings();

  let stats = {
    services: 0,
    pages: 0,
    posts: 0,
    quotes: 0,
    contacts: 0,
    applications: 0,
    unread: 0,
  };
  let recentLeads: Lead[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const [services, pages, posts, quotes, contacts, applications, unread, recent] =
        await Promise.all([
          admin.from("services").select("id", { count: "exact", head: true }),
          admin.from("pages").select("id", { count: "exact", head: true }),
          admin.from("blog_posts").select("id", { count: "exact", head: true }),
          admin.from("leads").select("id", { count: "exact", head: true }).eq("type", "quote"),
          admin.from("leads").select("id", { count: "exact", head: true }).eq("type", "contact"),
          admin.from("leads").select("id", { count: "exact", head: true }).eq("type", "career"),
          admin.from("leads").select("id", { count: "exact", head: true }).eq("is_read", false),
          admin.from("leads").select("*").order("created_at", { ascending: false }).limit(6),
        ]);
      stats = {
        services: services.count ?? 0,
        pages: pages.count ?? 0,
        posts: posts.count ?? 0,
        quotes: quotes.count ?? 0,
        contacts: contacts.count ?? 0,
        applications: applications.count ?? 0,
        unread: unread.count ?? 0,
      };
      recentLeads = (recent.data ?? []) as Lead[];
    } catch {
      // Ignore — dashboard still renders.
    }
  } else {
    stats = { services: 5, pages: 2, posts: 0, quotes: 0, contacts: 0, applications: 0, unread: 0 };
  }

  const cards = [
    { label: "Services", ar: "الخدمات", value: stats.services, href: "/admin/services", icon: "ship" },
    { label: "Pages", ar: "الصفحات", value: stats.pages, href: "/admin/pages", icon: "file-text" },
    { label: "Blog posts", ar: "المقالات", value: stats.posts, href: "/admin/blog", icon: "calendar" },
    { label: "Quote Requests", ar: "طلبات عرض السعر", value: stats.quotes, href: "/admin/leads?type=quote", icon: "mail" },
    { label: "Contact Messages", ar: "رسائل التواصل", value: stats.contacts, href: "/admin/leads?type=contact", icon: "message-square" },
    { label: "Applications", ar: "طلبات الوظائف", value: stats.applications, href: "/admin/leads?type=career", icon: "briefcase" },
    { label: "Unread", ar: "غير مقروء", value: stats.unread, href: "/admin/leads", icon: "bell" },
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

      {recentLeads.length ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-900">Recent requests</h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-brand-700 hover:text-accent-600">
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
            <ul className="divide-y divide-brand-50">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-brand-900">{lead.name}</p>
                    <p className="truncate text-xs text-ink-muted">{lead.service || lead.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {lead.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

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
