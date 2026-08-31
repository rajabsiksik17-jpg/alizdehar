import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/content";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-900">General Settings</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Company information, contact details and analytics configuration.
      </p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
