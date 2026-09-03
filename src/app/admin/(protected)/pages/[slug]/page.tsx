import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getPage } from "@/lib/content";
import { PageEditor } from "@/components/admin/page-editor";

export default async function PageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin("content");
  const { slug } = await params;

  // Verify the page exists (seed fallback) before rendering the editor.
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Edit Page</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Manage the sections of <span className="font-semibold">/{slug}</span>.
      </p>
      <div className="mt-6">
        <PageEditor pageSlug={slug} />
      </div>
    </div>
  );
}
