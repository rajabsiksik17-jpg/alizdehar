import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceBySlug } from "@/lib/content";
import { ServiceEditor } from "@/components/admin/service-editor";

export default async function ServiceEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const isNew = slug === "new";

  let initial = null;
  if (!isNew) {
    const svc = await getServiceBySlug(slug);
    if (!svc) notFound();
    initial = {
      name: svc.name,
      slug: svc.slug,
      short_description: svc.short_description,
      content: svc.content,
      icon: svc.icon ?? "ship",
      status: svc.status,
      sort_order: svc.sort_order,
      what_we_offer: svc.what_we_offer.map((o) => ({ icon: o.icon, title: o.title, description: o.description })),
      how_it_works: svc.how_it_works.map((s) => ({ icon: s.icon, title: s.title, description: s.description })),
      features: svc.features.map((f) => ({ icon: f.icon, title: f.title, description: f.description })),
      faq: svc.faq.map((f) => ({ question: f.question, answer: f.answer })),
      seo: {
        seo_title: svc.seo?.seo_title ?? { en: "", ar: "" },
        seo_description: svc.seo?.seo_description ?? { en: "", ar: "" },
        focus_keyword: svc.seo?.focus_keyword ?? { en: "", ar: "" },
      },
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">
        {isNew ? "Add Service" : "Edit Service"}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Manage the service details, sections, FAQ and SEO.
      </p>
      <div className="mt-6">
        <ServiceEditor initial={initial} isNew={isNew} />
      </div>
    </div>
  );
}
