import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { Icon } from "@/components/icon";

const seedPages = [
  { slug: "home", title: "Home", status: "published" },
  { slug: "about", title: "About Us", status: "published" },
  { slug: "services", title: "Services", status: "published" },
  { slug: "careers", title: "Careers", status: "published" },
  { slug: "contact", title: "Contact", status: "published" },
  { slug: "quote", title: "Request a Quote", status: "published" },
  { slug: "blog", title: "Blog", status: "published" },
  { slug: "privacy", title: "Privacy Policy", status: "published" },
  { slug: "terms", title: "Terms & Conditions", status: "published" },
];

export default async function AdminPagesPage() {
  await requireAdmin();

  let pages: { slug: string; title: string; status: string }[] = [];
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("pages").select("slug,title,status").order("slug");
      pages = (data ?? []).map((p: { slug: string; title: { en: string }; status: string }) => ({
        slug: p.slug,
        title: p.title?.en ?? p.slug,
        status: p.status,
      }));
    } catch {
      pages = [];
    }
  }
  if (!pages.length) pages = seedPages;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Pages</h1>
          <p className="mt-1 text-sm text-ink-muted">{pages.length} page(s)</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Icon name="plus" className="h-4 w-4" />
          New page
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
        <ul className="divide-y divide-brand-50">
          {pages.map((p) => (
            <li key={p.slug} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Icon name="file-text" className="h-4 w-4 text-brand-400" />
                <span className="font-medium text-brand-900">{p.title}</span>
                <span className="text-xs text-ink-muted">/{p.slug}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  {p.status}
                </span>
                <Link
                  href={`/admin/pages/${p.slug}`}
                  className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
