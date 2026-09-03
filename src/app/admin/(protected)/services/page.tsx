import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getServices } from "@/lib/content";
import { pick } from "@/lib/i18n/config";
import { Icon } from "@/components/icon";

export default async function AdminServicesPage() {
  await requireAdmin("content");
  const services = await getServices();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Services</h1>
          <p className="mt-1 text-sm text-ink-muted">{services.length} service(s)</p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Icon name="plus" className="h-4 w-4" />
          New service
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-brand-900">{pick(s.name, "en")}</p>
                <p className="text-xs text-ink-muted">/services/{s.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {s.status}
              </span>
              <Link
                href={`/admin/services/${s.slug}`}
                className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
