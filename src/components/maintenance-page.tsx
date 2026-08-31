import type { Locale } from "@/lib/i18n/config";
import { pick } from "@/lib/i18n/config";
import type { SiteSettings } from "@/types";
import { LogoMark } from "@/components/layout/logo";
import { Icon } from "@/components/icon";

export function MaintenancePage({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-950 px-4 text-center text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.05]" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#fff" strokeWidth="1">
            <circle cx="600" cy="400" r="260" />
            <circle cx="600" cy="400" r="160" />
            <path d="M0 400H1200M600 0V800" />
          </g>
        </svg>
      </div>

      <div className="relative max-w-md">
        <LogoMark className="mx-auto h-16 w-16" />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight md:text-4xl">
          {pick(
            {
              en: "The website is currently undergoing maintenance.",
              ar: "الموقع يخضع حاليًا لأعمال تطوير وتحسين.",
            },
            locale,
          )}
        </h1>
        <p className="mt-4 text-white/70">
          {pick(
            { en: "We'll be back shortly.", ar: "سنعود قريبًا." },
            locale,
          )}
        </p>
        {settings.email ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
            <Icon name="mail" className="h-4 w-4 text-accent-400" />
            {settings.email}
          </p>
        ) : null}
      </div>
    </div>
  );
}
