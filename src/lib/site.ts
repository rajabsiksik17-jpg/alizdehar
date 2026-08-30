import type { Locale } from "@/lib/i18n/config";

/** Build a locale-prefixed href from a locale-agnostic path. */
export function href(locale: Locale, path: string): string {
  if (!path) return `/${locale}`;
  if (/^(https?:\/\/|mailto:|tel:|#)/.test(path)) return path;
  const [p, q] = path.split("?");
  const base = p.startsWith("/") ? p : `/${p}`;
  const normalized = base === "/" ? `/${locale}` : `/${locale}${base}`;
  return q ? `${normalized}?${q}` : normalized;
}

/** Swap the locale segment of a full pathname (e.g. /en/about -> /ar/about). */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && (segments[0] === "en" || segments[0] === "ar")) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  return `/${segments.join("/")}`;
}
