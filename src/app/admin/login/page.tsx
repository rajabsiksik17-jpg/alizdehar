import { LoginForm } from "../login-form";
import { LogoImage } from "@/components/layout/logo";
import { getSettings } from "@/lib/content";

export default async function LoginPage() {
  const settings = await getSettings();
  const siteName = settings.site_name.en;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <LogoImage
            src={settings.logo}
            alt={siteName}
            className="h-16 w-16 object-contain"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-ink-muted">{siteName}</p>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
