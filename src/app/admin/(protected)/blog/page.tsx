import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { Icon } from "@/components/icon";

export default async function AdminBlogPage() {
  await requireAdmin("content");

  let posts: { slug: string; title: { en?: string }; status: string }[] = [];
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("blog_posts").select("slug,title,status").order("created_at", { ascending: false }).limit(500);
      posts = (data ?? []) as typeof posts;
    } catch {
      posts = [];
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Blog</h1>
          <p className="mt-1 text-sm text-ink-muted">{posts.length} post(s)</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Icon name="plus" className="h-4 w-4" />
          New post
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {posts.length ? (
          posts.map((p) => (
            <div key={p.slug} className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Icon name="calendar" className="h-5 w-5 text-brand-400" />
                <div>
                  <p className="font-semibold text-brand-900">{p.title?.en || p.slug}</p>
                  <p className="text-xs text-ink-muted">/blog/{p.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{p.status}</span>
                <Link href={`/admin/blog/${p.slug}`} className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-semibold text-brand-800 hover:bg-brand-50">
                  Edit
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-12 text-center">
            <Icon name="calendar" className="mx-auto h-10 w-10 text-brand-200" />
            <p className="mt-3 text-sm text-ink-muted">No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
