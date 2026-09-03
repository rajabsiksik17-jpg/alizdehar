import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { BlogEditor } from "@/components/admin/blog-editor";

export default async function BlogEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin("content");
  const { slug } = await params;
  const isNew = slug === "new";

  let initial: Record<string, unknown> | null = null;
  if (!isNew && isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
      initial = (data as Record<string, unknown>) ?? null;
    } catch {
      initial = null;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">{isNew ? "New Post" : "Edit Post"}</h1>
      <div className="mt-6">
        <BlogEditor initial={initial} isNew={isNew} />
      </div>
    </div>
  );
}
