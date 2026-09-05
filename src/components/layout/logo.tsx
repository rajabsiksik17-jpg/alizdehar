import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { pick } from "@/lib/i18n/config";
import { LocaleLink } from "@/components/link";
import type { SiteSettings } from "@/types";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#0f2a48" />
      <path d="M11 20h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 13l7 7-7 7" stroke="#d98c1f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="29" cy="20" r="2.2" fill="#fff" />
    </svg>
  );
}

/** A single logo graphical mark: custom image when set, else the placeholder mark. */
export function LogoImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt || "Logo"}
        width={80}
        height={80}
        className={className ?? "h-10 w-10 shrink-0 object-contain"}
      />
    );
  }
  return <LogoMark className={className ?? "h-10 w-10 shrink-0"} />;
}

export function Logo({
  settings,
  locale,
  className,
}: {
  settings: SiteSettings;
  locale: Locale;
  className?: string;
}) {
  return (
    <LocaleLink
      locale={locale}
      href="/"
      className={`group flex items-center gap-3 ${className ?? ""}`}
      aria-label={pick(settings.site_name, locale)}
    >
      <LogoImage
        src={settings.logo}
        alt={pick(settings.site_name, locale)}
        className="h-10 w-10 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight text-brand-900">
          {pick(settings.site_name, locale)}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-600">
          {pick(settings.tagline, locale)}
        </span>
      </span>
    </LocaleLink>
  );
}
