import { Icon } from "@/components/icon";

export default async function AdminPlaceholderPage({
  params,
}: {
  params: Promise<{ module: string[] }>;
}) {
  const { module } = await params;
  const title = module
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .join(" / ");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white p-12 text-center">
        <Icon name="sliders" className="mx-auto h-10 w-10 text-brand-200" />
        <p className="mt-3 font-semibold text-brand-900">This module is being built</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          The <span className="font-semibold">{title}</span> manager is scaffolded and the data
          layer is ready. The editing UI will be delivered in the next phase.
        </p>
      </div>
    </div>
  );
}
