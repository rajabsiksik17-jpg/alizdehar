import { requireAdmin } from "@/lib/admin-auth";
import { getEntity, adminEntities } from "@/lib/admin-registry";
import { CrudManager } from "@/components/admin/crud-manager";
import { MediaLibrary } from "@/components/admin/media-library";
import { SeoSettings } from "@/components/admin/seo-settings";

const slugToTable: Record<string, string> = {
  social: "social_links",
  statistics: "statistics",
  "why-us": "why_us",
  why: "why_us",
  testimonials: "testimonials",
  clients: "clients",
  gallery: "gallery",
  redirects: "redirects",
  "cargo-types": "cargo_types",
  blog: "blog_posts",
  posts: "blog_posts",
  careers: "careers",
  jobs: "careers",
  menus: "menu_items",
  categories: "blog_categories",
};

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ module: string[] }>;
}) {
  await requireAdmin();
  const { module } = await params;
  const slug = module[0] ?? "";
  const table = slugToTable[slug];

  if (slug === "media") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Media Library</h1>
        <p className="mt-1 text-sm text-ink-muted">Upload, preview and manage images.</p>
        <div className="mt-6">
          <MediaLibrary />
        </div>
      </div>
    );
  }

  if (slug === "seo") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-900">SEO</h1>
        <p className="mt-1 text-sm text-ink-muted">Global search engine settings.</p>
        <div className="mt-6">
          <SeoSettings />
        </div>
      </div>
    );
  }

  if (table) {
    const entity = getEntity(table)!;
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-900">{entity.label}</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage {entity.label.toLowerCase()} content.</p>
        <div className="mt-6">
          <CrudManager entity={entity} />
        </div>
      </div>
    );
  }

  // Fallback: list available modules (no "under construction" text).
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Modules</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminEntities.map((e) => (
          <a
            key={e.table}
            href={`/admin/${slugToTableInv(e.table)}`}
            className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <p className="font-semibold text-brand-900">{e.label}</p>
            <p className="mt-1 text-sm text-ink-muted">{e.labelAr}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function slugToTableInv(table: string): string {
  for (const [slug, t] of Object.entries(slugToTable)) {
    if (t === table) return slug;
  }
  return table;
}
