import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/icon";
import { SignOutButton } from "./sign-out-button";

const modules = [
  { key: "pages", label: "Pages", icon: "file-text", href: "/admin/pages" },
  { key: "services", label: "Services", icon: "ship", href: "/admin/services" },
  { key: "blog", label: "Blog", icon: "calendar", href: "/admin/blog" },
  { key: "careers", label: "Careers", icon: "briefcase", href: "/admin/careers" },
  { key: "leads", label: "Leads", icon: "mail", href: "/admin/leads" },
  { key: "media", label: "Media", icon: "package", href: "/admin/media" },
  { key: "testimonials", label: "Testimonials", icon: "quote", href: "/admin/testimonials" },
  { key: "clients", label: "Clients", icon: "handshake", href: "/admin/clients" },
  { key: "gallery", label: "Gallery", icon: "boxes", href: "/admin/gallery" },
  { key: "menus", label: "Menus", icon: "menu", href: "/admin/menus" },
  { key: "social", label: "Social Media", icon: "globe", href: "/admin/social" },
  { key: "seo", label: "SEO Manager", icon: "search", href: "/admin/seo" },
  { key: "settings", label: "Settings", icon: "sliders", href: "/admin/settings" },
];

export default async function AdminDashboard() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20">
        <div className="rounded-2xl border border-brand-100 bg-white p-10 text-center shadow-soft">
          <Icon name="sliders" className="mx-auto h-12 w-12 text-brand-300" />
          <h1 className="mt-4 text-2xl font-bold text-brand-900">Supabase not configured</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Set <code className="rounded bg-surface-muted px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-surface-muted px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
            <code className="rounded bg-surface-muted px-1">.env.local</code>, then run the schema in{" "}
            <code className="rounded bg-surface-muted px-1">supabase/schema.sql</code>.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <a
            key={m.key}
            href={m.href}
            className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon name={m.icon} className="h-5 w-5" />
            </span>
            <span className="font-semibold text-brand-900">{m.label}</span>
          </a>
        ))}
      </div>

      <p className="mt-8 rounded-xl bg-accent-50 px-5 py-4 text-sm text-accent-900">
        Content managers (Pages, Services, Blog, Leads, Media, Settings…) are being delivered in the
        next phase. The public site is already fully CMS-driven via Supabase — these modules expose
        the editing UI for each table.
      </p>
    </main>
  );
}
